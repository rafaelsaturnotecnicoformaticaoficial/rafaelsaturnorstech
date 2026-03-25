import { MessageCircle, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-dark-surface/95 backdrop-blur-md border-b border-primary/20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="RS Tech Logo" className="h-12 w-12 object-contain" />
          <div className="hidden sm:block">
            <p className="font-display text-sm font-bold text-dark-surface-foreground">Rafael Saturno</p>
            <p className="text-xs text-muted-foreground">Técnico em Informática | RS Tech</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-dark-surface-foreground/80">
          <a href="#servicos" className="hover:text-primary transition-colors">Serviços</a>
          <a href="#vantagens" className="hover:text-primary transition-colors">Vantagens</a>
          <a href="#contato" className="hover:text-primary transition-colors">Contato</a>
          <a href="https://abre.bio/magazinerafaelsaturnooficial" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors font-semibold">🛒 Loja</a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/5535998793630"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-dark-surface-foreground px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <MessageCircle size={18} />
            <span className="hidden sm:inline">Chamar no WhatsApp</span>
          </a>
          <button
            className="md:hidden text-dark-surface-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-dark-surface border-t border-primary/20 px-4 py-4 space-y-3">
          <a href="#servicos" onClick={() => setMenuOpen(false)} className="block text-dark-surface-foreground/80 hover:text-primary">Serviços</a>
          <a href="#vantagens" onClick={() => setMenuOpen(false)} className="block text-dark-surface-foreground/80 hover:text-primary">Vantagens</a>
          <a href="#contato" onClick={() => setMenuOpen(false)} className="block text-dark-surface-foreground/80 hover:text-primary">Contato</a>
          <a href="https://abre.bio/magazinerafaelsaturnooficial" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="block text-secondary font-semibold hover:text-secondary/80">🛒 Loja</a>
        </div>
      )}
    </header>
  );
};

export default Header;
