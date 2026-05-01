// Shopee Affiliate Open API - GraphQL endpoint
// Docs: https://open-api.affiliate.shopee.com.br/
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ENDPOINT = "https://open-api.affiliate.shopee.com.br/graphql";

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const APP_ID = Deno.env.get("SHOPEE_APP_ID");
    const APP_SECRET = Deno.env.get("SHOPEE_APP_SECRET");
    if (!APP_ID || !APP_SECRET) throw new Error("SHOPEE_APP_ID/SHOPEE_APP_SECRET not configured");

    const url = new URL(req.url);
    const keyword = url.searchParams.get("keyword") ?? "";
    const limit = Number(url.searchParams.get("limit") ?? "20");
    const page = Number(url.searchParams.get("page") ?? "1");
    // listType: 0=popular, 2=trending; sortType: 2=relevance/sales
    const args = keyword
      ? `keyword:"${keyword.replace(/"/g, '\\"')}", sortType:2, page:${page}, limit:${limit}`
      : `listType:0, sortType:2, page:${page}, limit:${limit}`;

    const query = `{productOfferV2(${args}){nodes{itemId productName imageUrl price priceMin priceMax sales shopName ratingStar offerLink productLink commissionRate}}}`;

    const payload = JSON.stringify({ query });
    const timestamp = Math.floor(Date.now() / 1000);
    // Shopee signature: SHA256(AppId + Timestamp + Payload + AppSecret)
    const signature = await sha256Hex(`${APP_ID}${timestamp}${payload}${APP_SECRET}`);
    const authHeader = `SHA256 Credential=${APP_ID}, Timestamp=${timestamp}, Signature=${signature}`;

    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeader },
      body: payload,
    });
    const data = await r.json();
    if (!r.ok || data.errors) {
      return new Response(JSON.stringify({ error: data.errors ?? "Shopee error", raw: data }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const nodes = data?.data?.productOfferV2?.nodes ?? [];
    return new Response(JSON.stringify({ products: nodes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
