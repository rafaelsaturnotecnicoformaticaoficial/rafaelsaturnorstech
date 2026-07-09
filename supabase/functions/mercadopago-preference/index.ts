import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface Body {
  title: string;
  amount_cents: number;
  external_reference?: string;
  payer?: { name?: string; email?: string; phone?: { number?: string } };
  back_url?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const token = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'MERCADOPAGO_ACCESS_TOKEN não configurado.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const body = (await req.json()) as Body;
    const title = (body.title || '').trim();
    const cents = Number(body.amount_cents);
    if (!title || !Number.isFinite(cents) || cents < 100) {
      return new Response(
        JSON.stringify({ error: 'Informe title e amount_cents (>= 100).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const preference: Record<string, unknown> = {
      items: [{
        title: title.slice(0, 250),
        quantity: 1,
        unit_price: Number((cents / 100).toFixed(2)),
        currency_id: 'BRL',
      }],
      statement_descriptor: 'RSTECH',
    };

    if (body.external_reference) preference.external_reference = String(body.external_reference);
    if (body.payer) preference.payer = body.payer;
    if (body.back_url) {
      preference.back_urls = { success: body.back_url, failure: body.back_url, pending: body.back_url };
      preference.auto_return = 'approved';
    }

    const resp = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    const text = await resp.text();
    if (!resp.ok) {
      console.error('MP error', resp.status, text);
      return new Response(
        JSON.stringify({ error: 'Falha ao criar preferência no Mercado Pago', detail: text }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = JSON.parse(text);
    return new Response(
      JSON.stringify({
        init_point: data.init_point,
        sandbox_init_point: data.sandbox_init_point,
        id: data.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
