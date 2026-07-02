import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const CEP_ORIGEM = '37855000';

interface ItemInput {
  weight_g: number;
  width_cm: number;
  height_cm: number;
  length_cm: number;
  quantity: number;
}

interface Body {
  cep_destino: string;
  items: ItemInput[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const token = Deno.env.get('SUPERFRETE_TOKEN');
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'SUPERFRETE_TOKEN não configurado. Adicione o secret para habilitar o cálculo de frete.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const body = (await req.json()) as Body;

    if (!body?.cep_destino || !Array.isArray(body.items) || body.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Informe cep_destino e items.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const cepDestino = body.cep_destino.replace(/\D/g, '');
    if (cepDestino.length !== 8) {
      return new Response(
        JSON.stringify({ error: 'CEP de destino inválido.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Agrega peso total e usa maior dimensão para caixa consolidada
    let totalWeightKg = 0;
    let maxW = 11, maxH = 2, maxL = 16; // mínimos SuperFrete
    for (const it of body.items) {
      const qty = Math.max(1, it.quantity | 0);
      totalWeightKg += ((it.weight_g || 300) * qty) / 1000;
      maxW = Math.max(maxW, it.width_cm || 11);
      maxH = Math.max(maxH, it.height_cm || 2);
      maxL = Math.max(maxL, it.length_cm || 16);
    }

    const payload = {
      from: { postal_code: CEP_ORIGEM },
      to: { postal_code: cepDestino },
      services: '1,2,17', // PAC, SEDEX, Mini Envios
      options: { own_hand: false, receipt: false, insurance_value: 0, use_insurance_value: false },
      package: {
        weight: Number(totalWeightKg.toFixed(3)),
        width: maxW,
        height: maxH,
        length: maxL,
      },
    };

    const resp = await fetch('https://api.superfrete.com/api/v0/calculator', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'RSTech Loja (contato@rstech.com.br)',
      },
      body: JSON.stringify(payload),
    });

    const text = await resp.text();
    if (!resp.ok) {
      console.error('SuperFrete error', resp.status, text);
      return new Response(
        JSON.stringify({ error: 'Falha ao consultar SuperFrete', detail: text }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = JSON.parse(text);
    const services = Array.isArray(data) ? data : (data.services ?? []);

    const options = services
      .filter((s: any) => !s.error && s.price)
      .map((s: any) => ({
        id: String(s.id ?? s.service ?? s.name),
        name: s.name ?? s.company?.name ?? 'Envio',
        company: s.company?.name ?? 'SuperFrete',
        price_cents: Math.round(Number(s.price) * 100),
        delivery_days: Number(s.delivery_time ?? s.delivery_range?.max ?? 0),
      }));

    return new Response(JSON.stringify({ options }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
