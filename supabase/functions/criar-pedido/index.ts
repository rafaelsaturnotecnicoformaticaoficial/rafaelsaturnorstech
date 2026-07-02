import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

interface CartItem { product_id: string; quantity: number }
interface Body {
  customer: {
    name: string; email: string; whatsapp: string;
    cep: string; address: string; number?: string; complement?: string;
    neighborhood?: string; city?: string; state?: string;
  };
  items: CartItem[];
  shipping: { service: string; price_cents: number; deadline_days: number };
  notes?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    const c = body.customer;
    if (!c?.name || !c?.email || !c?.whatsapp || !c?.cep || !c?.address) {
      return new Response(JSON.stringify({ error: 'Dados do cliente incompletos.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return new Response(JSON.stringify({ error: 'Carrinho vazio.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Busca produtos reais no banco para revalidar preços
    const ids = body.items.map((i) => i.product_id);
    const { data: products, error: prodErr } = await supabase
      .from('shop_products')
      .select('id, name, price_cents, stock, active')
      .in('id', ids);
    if (prodErr) throw prodErr;

    const byId = new Map((products ?? []).map((p) => [p.id, p]));
    let subtotal = 0;
    const itemsToInsert: any[] = [];

    for (const it of body.items) {
      const p = byId.get(it.product_id);
      if (!p || !p.active) {
        return new Response(JSON.stringify({ error: `Produto indisponível: ${it.product_id}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const qty = Math.max(1, it.quantity | 0);
      if (p.stock !== null && p.stock < qty) {
        return new Response(JSON.stringify({ error: `Estoque insuficiente para ${p.name}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      subtotal += p.price_cents * qty;
      itemsToInsert.push({
        product_id: p.id,
        product_name: p.name,
        unit_price_cents: p.price_cents,
        quantity: qty,
      });
    }

    const shippingCents = Math.max(0, body.shipping?.price_cents || 0);
    const total = subtotal + shippingCents;

    // Cria pedido
    const { data: order, error: orderErr } = await supabase
      .from('shop_orders')
      .insert({
        customer_name: c.name,
        customer_email: c.email,
        customer_whatsapp: c.whatsapp,
        cep: c.cep,
        address: c.address,
        address_number: c.number ?? null,
        address_complement: c.complement ?? null,
        neighborhood: c.neighborhood ?? null,
        city: c.city ?? null,
        state: c.state ?? null,
        subtotal_cents: subtotal,
        shipping_cents: shippingCents,
        total_cents: total,
        shipping_service: body.shipping?.service ?? null,
        shipping_deadline_days: body.shipping?.deadline_days ?? null,
        notes: body.notes ?? null,
        status: 'pendente',
      })
      .select()
      .single();
    if (orderErr) throw orderErr;

    const { error: itemsErr } = await supabase
      .from('shop_order_items')
      .insert(itemsToInsert.map((i) => ({ ...i, order_id: order.id })));
    if (itemsErr) throw itemsErr;

    return new Response(JSON.stringify({ order_id: order.id, total_cents: total }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
