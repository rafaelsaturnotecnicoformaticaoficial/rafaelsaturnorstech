import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Handshake, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const PartnersCarousel = () => {
  const [currentPartner, setCurrentPartner] = useState(0);
  const [currentSupporter, setCurrentSupporter] = useState(0);

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

  const { data: supporters } = useQuery({
    queryKey: ["supporters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supporters")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const totalPartners = partners?.length ?? 0;
  const totalSupporters = supporters?.length ?? 0;

  const goNextPartner = useCallback(() => {
    if (totalPartners > 0) setCurrentPartner((p) => (p + 1) % totalPartners);
  }, [totalPartners]);
  const goPrevPartner = useCallback(() => {
    if (totalPartners > 0) setCurrentPartner((p) => (p - 1 + totalPartners) % totalPartners);
  }, [totalPartners]);

  const goNextSupporter = useCallback(() => {
    if (totalSupporters > 0) setCurrentSupporter((p) => (p + 1) % totalSupporters);
  }, [totalSupporters]);
  const goPrevSupporter = useCallback(() => {
    if (totalSupporters > 0) setCurrentSupporter((p) => (p - 1 + totalSupporters) % totalSupporters);
  }, [totalSupporters]);

  useEffect(() => {
    if (totalPartners <= 1) return;
    const interval = setInterval(goNextPartner, 20000);
    return () => clearInterval(interval);
  }, [totalPartners, goNextPartner]);

  useEffect(() => {
    if (totalSupporters <= 1) return;
    const interval = setInterval(goNextSupporter, 20000);
    return () => clearInterval(interval);
  }, [totalSupporters, goNextSupporter]);

  return (
    <section className="py-10 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Parceiros e Patrocinadores */}
          <CarouselBlock
            title="Parceiros e Patrocinadores"
            icon={<Handshake size={16} />}
            items={partners}
            current={currentPartner}
            total={totalPartners}
            onNext={goNextPartner}
            onPrev={goPrevPartner}
            onSelect={setCurrentPartner}
            emptyText="Nenhum parceiro cadastrado."
          />

          {/* Apoio e Social */}
          <CarouselBlock
            title="Apoio e Social"
            icon={<Heart size={16} />}
            items={supporters}
            current={currentSupporter}
            total={totalSupporters}
            onNext={goNextSupporter}
            onPrev={goPrevSupporter}
            onSelect={setCurrentSupporter}
            emptyText="Nenhum apoiador cadastrado."
          />
        </div>
      </div>
    </section>
  );
};

interface CarouselBlockProps {
  title: string;
  icon: React.ReactNode;
  items: { id: string; name: string; logo_url: string; website_url: string }[] | undefined;
  current: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  onSelect: (i: number) => void;
  emptyText: string;
}

const CarouselBlock = ({ title, icon, items, current, total, onNext, onPrev, onSelect, emptyText }: CarouselBlockProps) => {
  const item = items?.[current];

  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
        {icon}
        {title}
      </div>
      {total > 0 && item ? (
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center gap-4">
            <button
              onClick={onPrev}
              className="p-2 rounded-full bg-background border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft size={20} className="text-foreground" />
            </button>

            {item.website_url ? (
              <a href={item.website_url} target="_blank" rel="noopener noreferrer" title={item.name} className="block">
                <BannerImage src={item.logo_url} alt={item.name} />
              </a>
            ) : (
              <BannerImage src={item.logo_url} alt={item.name} />
            )}

            <button
              onClick={onNext}
              className="p-2 rounded-full bg-background border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
              aria-label="Próximo"
            >
              <ChevronRight size={20} className="text-foreground" />
            </button>
          </div>

          <p className="text-sm font-medium text-foreground">{item.name}</p>

          {total > 1 && (
            <div className="flex gap-2">
              {items!.map((_, i) => (
                <button
                  key={i}
                  onClick={() => onSelect(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === current ? "bg-primary" : "bg-border hover:bg-primary/40"
                  }`}
                  aria-label={`Item ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">{emptyText}</p>
      )}
    </div>
  );
};

const BannerImage = ({ src, alt }: { src: string; alt: string }) => (
  <div className="w-[250px] h-[250px] bg-background rounded-xl border border-border hover:border-primary/40 hover:shadow-lg transition-all flex items-center justify-center p-6">
    <img
      src={src}
      alt={alt}
      className="max-w-full max-h-full object-contain hover:scale-110 transition-transform duration-300"
      loading="lazy"
    />
  </div>
);

export default PartnersCarousel;
