export type PriceVariant = { id: string; name: string; price_cents: number };
export type VariantDraft = { id: string; name: string; price: string };

export function parseVariants(drafts: VariantDraft[]): PriceVariant[] {
  const variants = drafts.map(v => {
    const price = Number(v.price.replace(',', '.'));
    if (!v.name.trim() || v.name.trim().length > 120 || !v.price.trim() || !Number.isFinite(price) || price < 0) throw new Error('Informe nome e preço válido para cada variação.');
    return { id: v.id, name: v.name.trim(), price_cents: Math.round(price * 100) };
  });
  if (new Set(variants.map(v => v.name)).size !== variants.length) throw new Error('Cada variação deve ter um nome diferente.');
  return variants;
}

export function selectedPrice(base: number, variants: PriceVariant[], id: string): number | null {
  return variants.length ? variants.find(v => v.id === id)?.price_cents ?? null : base;
}