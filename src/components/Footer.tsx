import { MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-dark-surface border-t border-primary/20 py-8">
      <div className="container mx-auto px-4 text-center space-y-4">
        <p className="font-display font-bold text-dark-surface-foreground">
          Rafael Saturno – Técnico em Informática | RS Tech
        </p>
        <a
          href="https://wa.me/5535998793630"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors font-medium"
        >
          <MessageCircle size={18} />
          (35) 99879-3630
        </a>
        <p className="text-secondary font-semibold text-sm">
          Entre em contato e faça seu orçamento agora!
        </p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} RS Tech. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
