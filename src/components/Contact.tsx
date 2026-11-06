import { Instagram, Facebook, Youtube } from "lucide-react";

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

        <div className="text-center">
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
