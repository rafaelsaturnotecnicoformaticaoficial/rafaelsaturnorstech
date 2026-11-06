import { Instagram, Facebook, Youtube } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/rstecnicoinformaticaoficial/", label: "Instagram" },
  { icon: Facebook, href: "https://www.facebook.com/rstecnicoinformaticaoficial", label: "Facebook" },
  { icon: Youtube, href: "https://www.youtube.com/@rafaelsaturnooficial", label: "YouTube" },
];

const TikTokIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const Contato = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-12">
              Fale com a <span className="text-gradient">gente</span>
            </h1>
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
                <TikTokIcon />
              </a>
            </div>
            <div className="mt-12"><ContactForm /></div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contato;
