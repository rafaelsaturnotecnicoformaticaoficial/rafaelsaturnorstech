import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, ExternalLink } from "lucide-react";

const AffiliateProducts = () => {
  const { data: products } = useQuery({
    queryKey: ["affiliate_products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliate_products")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
            <ShoppingCart size={16} />
            Ofertas Especiais
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Produtos <span className="text-primary">Recomendados</span>
          </h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Confira produtos selecionados com links exclusivos
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <a
              key={product.id}
              href={product.affiliate_link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-lg transition-all"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-3 md:p-4">
                <h3 className="font-display font-bold text-foreground text-sm md:text-base line-clamp-2">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-muted-foreground text-xs md:text-sm mt-1 line-clamp-2">
                    {product.description}
                  </p>
                )}
                <span className="inline-flex items-center gap-1 text-primary text-xs font-semibold mt-2">
                  Ver oferta <ExternalLink size={12} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AffiliateProducts;
