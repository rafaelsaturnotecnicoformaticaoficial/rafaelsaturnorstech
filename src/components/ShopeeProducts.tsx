import { useInfiniteQuery } from "@tanstack/react-query";
import { ExternalLink, Star, Loader2 } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const PAGE_SIZE = 20;

interface ShopeeProduct {
  itemId: string;
  productName: string;
  imageUrl: string;
  price: string;
  priceMin: string;
  priceMax: string;
  sales: number;
  shopName: string;
  ratingStar: string;
  offerLink: string;
  productLink: string;
}

interface ShopeeProductsProps {
  keyword?: string;
  title?: string;
}

const ShopeeProducts = ({ keyword = "informatica", title = "Ofertas Shopee" }: ShopeeProductsProps) => {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["shopee-products", keyword],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/shopee-products?keyword=${encodeURIComponent(keyword)}&limit=${PAGE_SIZE}&page=${pageParam}`,
      );
      if (!res.ok) throw new Error("Erro ao carregar produtos");
      const json = await res.json();
      return { products: (json.products ?? []) as ShopeeProduct[], page: pageParam as number };
    },
    getNextPageParam: (lastPage) =>
      lastPage.products.length === PAGE_SIZE ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 30,
  });

  if (isLoading) {
    return (
      <section className="py-14 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-muted-foreground">Carregando ofertas Shopee...</div>
      </section>
    );
  }

  const products = data?.pages.flatMap((p) => p.products) ?? [];
  if (error || products.length === 0) return null;

  const formatPrice = (p: string) => {
    const n = Number(p);
    if (!n) return p;
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <section className="py-14 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
          {title} <span className="text-primary">Shopee</span>
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          {products.length} produtos encontrados
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <a
              key={p.itemId}
              href={p.offerLink || p.productLink}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-lg transition-all flex flex-col"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={p.imageUrl}
                  alt={p.productName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2">{p.productName}</h3>
                <div className="mt-auto">
                  <p className="text-primary font-bold text-lg">{formatPrice(p.priceMin || p.price)}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Star size={12} className="fill-secondary text-secondary" />
                      {Number(p.ratingStar).toFixed(1)}
                    </span>
                    <span>{p.sales} vendidos</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-primary font-semibold mt-2">
                    Ver na Shopee <ExternalLink size={12} />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {hasNextPage && (
          <div className="text-center mt-10">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground px-8 py-3 rounded-lg font-bold transition-colors"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Carregando...
                </>
              ) : (
                "Carregar mais produtos"
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopeeProducts;
