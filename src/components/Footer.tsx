import { MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-primary/20 py-8">
      <div className="container mx-auto px-4 text-center space-y-4">
        <p className="font-display font-bold text-black">
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
        <div className="flex justify-center gap-3">
          <a href="https://www.instagram.com/rstecnicoinformaticaoficial/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg></a>
          <a href="https://www.facebook.com/rstecnicoinformaticaoficial" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
          <a href="https://www.youtube.com/@rafaelsaturnooficial" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-muted-foreground hover:text-primary transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg></a>
          <a href="https://www.tiktok.com/@rafaelsaturnooficial" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-muted-foreground hover:text-primary transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg></a>
        </div>
        <p className="text-secondary font-semibold text-sm">
          Entre em contato e faça seu orçamento agora!
        </p>
        <div className="flex justify-center gap-4 text-xs">
          <Link to="/politica-privacidade" className="text-muted-foreground hover:text-primary underline">Política de Privacidade</Link>
          <Link to="/termos-de-uso" className="text-muted-foreground hover:text-primary underline">Termos de Uso</Link>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2013–{new Date().getFullYear()} Rafael Saturno Técnico Informática ® RS Tech. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
