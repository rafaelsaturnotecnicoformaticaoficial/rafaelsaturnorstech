import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Handshake } from "lucide-react";

const PartnersCarousel = () => {
  const { data: partners } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  if (!partners || partners.length === 0) return null;

  // Duplicate for infinite scroll effect
  const duplicated = [...partners, ...partners];

  return (
    <section className="py-10 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 mb-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
            <Handshake size={16} />
            Nossos Parceiros
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Parceiros & <span className="text-primary">Patrocinadores</span>
          </h2>
        </div>
      </div>
      <div className="relative">
        <div className="flex animate-scroll gap-8 w-max">
          {duplicated.map((partner, i) => (
            <a
              key={`${partner.id}-${i}`}
              href={partner.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 group"
              title={partner.name}
            >
              <div className="w-40 h-24 md:w-48 md:h-28 bg-background rounded-xl border border-border hover:border-primary/40 hover:shadow-lg transition-all flex items-center justify-center p-4">
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersCarousel;
