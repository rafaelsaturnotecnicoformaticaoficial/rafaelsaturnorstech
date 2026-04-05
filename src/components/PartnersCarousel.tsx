import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Handshake, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/rstecnicoinformaticaoficial/", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg> },
  { label: "Facebook", href: "https://www.facebook.com/rstecnicoinformaticaoficial", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
  { label: "YouTube", href: "https://www.youtube.com/@rafaelsaturnooficial", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg> },
  { label: "TikTok", href: "https://www.tiktok.com/@rafaelsaturnooficial", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg> },
  { label: "WhatsApp", href: "https://wa.me/5535998793630", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg> },
];

const PartnersCarousel = () => {
  const [current, setCurrent] = useState(0);

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

  const total = partners?.length ?? 0;

  const goNext = useCallback(() => {
    if (total > 0) setCurrent((p) => (p + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    if (total > 0) setCurrent((p) => (p - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1) return;
    const interval = setInterval(goNext, 20000);
    return () => clearInterval(interval);
  }, [total, goNext]);

  return (
    <section className="py-10 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Partners */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <Handshake size={16} />
              Parceiros e Patrocinadores
            </div>
            {total > 0 ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative flex items-center justify-center gap-4">
                  <button
                    onClick={goPrev}
                    className="p-2 rounded-full bg-background border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    aria-label="Anterior"
                  >
                    <ChevronLeft size={20} className="text-foreground" />
                  </button>

                  <a
                    href={partners![current].website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={partners![current].name}
                    className="block"
                  >
                    <div className="w-[250px] h-[250px] bg-background rounded-xl border border-border hover:border-primary/40 hover:shadow-lg transition-all flex items-center justify-center p-6">
                      <img
                        src={partners![current].logo_url}
                        alt={partners![current].name}
                        className="max-w-full max-h-full object-contain hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  </a>

                  <button
                    onClick={goNext}
                    className="p-2 rounded-full bg-background border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    aria-label="Próximo"
                  >
                    <ChevronRight size={20} className="text-foreground" />
                  </button>
                </div>

                <p className="text-sm font-medium text-foreground">{partners![current].name}</p>

                {/* Indicators */}
                {total > 1 && (
                  <div className="flex gap-2">
                    {partners!.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          i === current ? "bg-primary" : "bg-border hover:bg-primary/40"
                        }`}
                        aria-label={`Parceiro ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Nenhum parceiro cadastrado.</p>
            )}
          </div>

          {/* Nos Apoie e Social */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <Heart size={16} />
              Nos Apoie e Social
            </div>
            <p className="text-muted-foreground text-sm mb-5">
              Siga-nos nas redes sociais e ajude a divulgar nosso trabalho!
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-background border border-border hover:border-primary/40 hover:shadow-md transition-all text-muted-foreground hover:text-primary"
                >
                  {link.icon}
                  <span className="text-sm font-medium">{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersCarousel;
