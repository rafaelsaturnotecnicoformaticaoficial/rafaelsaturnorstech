import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['resumo', 'recomendados', 'solicitacao'],
  properties: {
    resumo: { type: 'string' },
    recomendados: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false, required: ['id', 'motivo'],
        properties: { id: { type: 'string' }, motivo: { type: 'string' } },
      },
    },
    solicitacao: { type: 'string' },
  },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { descricao } = await req.json().catch(() => ({}));
    if (typeof descricao !== 'string' || descricao.trim().length < 5 || descricao.length > 2000)
      return json({ error: 'Descreva o que você precisa (5 a 2000 caracteres).' }, 400);

    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: items } = await sb.from('catalog_items')
      .select('id, name, description, kind, deadline_type, deadline_days, schedulable').eq('active', true);
    const catalog = (items ?? []).map((i) =>
      `- id=${i.id} | ${i.name} (${i.kind}) | ${i.description ?? ''} | prazo=${i.deadline_type}${i.schedulable ? ' | agendável' : ''}`).join('\n');

    const r = await fetch('https://ai.gateway.lovable.dev/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Lovable-API-Key': Deno.env.get('LOVABLE_API_KEY')!,
        'X-Lovable-AIG-SDK': 'fetch',
      },
      body: JSON.stringify({
        model: 'openai/gpt-6-astra',
        stream: true,
        store: false,
        reasoning: { effort: 'low' },
        instructions:
          'Você é o assistente da RS Tech (Rafael Saturno Técnico em Informática, São Pedro da União - MG). ' +
          'Com base na descrição do cliente, recomende de 1 a 4 itens do catálogo abaixo (use somente ids existentes) explicando o motivo em uma frase. ' +
          'Depois escreva uma solicitação de orçamento curta, educada, em português, em primeira pessoa do cliente, pronta para enviar pelo WhatsApp, citando o problema e os serviços sugeridos. Não invente preços.\n\nCATÁLOGO:\n' + catalog,
        input: descricao.trim(),
        text: { format: { type: 'json_schema', name: 'recomendacao', strict: true, schema } },
      }),
    });

    if (!r.ok) {
      const status = r.status;
      console.error('AI gateway', status, await r.text());
      if (status === 429) return json({ error: 'Muitas solicitações. Tente novamente em instantes.' }, 429);
      if (status === 402 || status === 403) return json({ error: 'Assistente indisponível no momento. Fale conosco pelo WhatsApp.' }, status);
      return json({ error: 'Não foi possível gerar a recomendação.' }, 502);
    }

    // consome o stream SSE e acumula o texto
    const reader = r.body!.getReader();
    const dec = new TextDecoder();
    let buf = '', text = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n'); buf = lines.pop() ?? '';
      for (const l of lines) {
        if (!l.startsWith('data:')) continue;
        const d = l.slice(5).trim();
        if (!d || d === '[DONE]') continue;
        try {
          const ev = JSON.parse(d);
          if (ev.type === 'response.output_text.delta') text += ev.delta ?? '';
        } catch { /* ignore */ }
      }
    }
    let out;
    try { out = JSON.parse(text); } catch { return json({ error: 'Resposta inválida do assistente.' }, 502); }
    const valid = new Set((items ?? []).map((i) => i.id));
    out.recomendados = (out.recomendados ?? []).filter((x: any) => valid.has(x.id)).slice(0, 4);
    return json(out);
  } catch (e) {
    console.error(e);
    return json({ error: 'Erro interno.' }, 500);
  }
});
