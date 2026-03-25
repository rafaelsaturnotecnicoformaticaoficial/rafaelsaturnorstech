import { MessageCircle, MapPin, Clock, Instagram, Facebook, Youtube } from "lucide-react";

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/rstecnicoinformaticaoficial/", label: "Instagram" },
  { icon: Facebook, href: "https://www.facebook.com/rstecnicoinformaticaoficial", label: "Facebook" },
  { icon: Youtube, href: "https://www.youtube.com/@rafaelsaturnooficial", label: "YouTube" },
];

const TikTokIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const Contact = () => {
  return (
    <section id="contato" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
          Entre em <span className="text-gradient">Contato</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 rounded-xl bg-card border border-border">
            <MessageCircle size={32} className="text-green-600 mx-auto mb-3" />
            <h3 className="font-display font-bold mb-2 text-card-foreground">WhatsApp</h3>
            <a href="https://wa.me/5535998793630" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              (35) 99879-3630
            </a>
          </div>

          <div className="text-center p-6 rounded-xl bg-card border border-border">
            <MapPin size={32} className="text-secondary mx-auto mb-3" />
            <h3 className="font-display font-bold mb-2 text-card-foreground">Endereço</h3>
            <p className="text-sm text-muted-foreground">
              Rua Vereador Jorge Florêncio Nº 269<br />São Pedro da União - MG
            </p>
          </div>

          <div className="text-center p-6 rounded-xl bg-card border border-border">
            <Clock size={32} className="text-primary mx-auto mb-3" />
            <h3 className="font-display font-bold mb-2 text-card-foreground">Horário</h3>
            <p className="text-sm text-muted-foreground">
              Seg a Sex: 09:00–11:00 | 13:00–16:00<br />Sáb e Dom: Fechado
            </p>
          </div>
        </div>

        {/* Redes Sociais */}
        <div className="mt-12 text-center">
          <h3 className="font-display text-xl font-bold mb-6 text-foreground">Siga nossas redes</h3>
          <div className="flex justify-center gap-4">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
              >
                <s.icon size={22} />
              </a>
            ))}
            <a
              href="https://www.tiktok.com/@rafaelsaturnooficial"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
            >
              <TikTokIcon size={22} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
