import { MessageCircle } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <img
        src={heroBg}
        alt="Fundo tecnológico"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-dark-surface/80" />

      <div className="relative z-10 container mx-auto px-4 text-center py-20">
        <h1 className="font-display text-4xl md:text-6xl font-bold text-dark-surface-foreground mb-4 leading-tight">
          Assistência Técnica e{" "}
          <span className="text-gradient">Serviços de Impressão</span>
        </h1>
        <p className="text-lg md:text-xl text-dark-surface-foreground/70 mb-8 max-w-2xl mx-auto">
          Qualidade, rapidez e confiança para você
        </p>
        <a
          href="https://wa.me/5535998793630?text=Olá! Gostaria de solicitar um orçamento."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-4 rounded-lg text-lg font-bold transition-colors shadow-lg shadow-secondary/30"
        >
          <MessageCircle size={22} />
          Solicitar orçamento
        </a>
      </div>
    </section>
  );
};

export default Hero;
