import { MessageCircle, Menu, X, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import logo from "@/assets/logo.png";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lojaOpen, setLojaOpen] = useState(false);
  const [contatoOpen, setContatoOpen] = useState(false);
  const lojaRef = useRef<HTMLDivElement>(null);
  const contatoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (lojaRef.current && !lojaRef.current.contains(e.target as Node)) {
        setLojaOpen(false);
      }
      if (contatoRef.current && !contatoRef.current.contains(e.target as Node)) {
        setContatoOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          {/* Contato com dropdown */}
          <div className="relative" ref={contatoRef}>
            <button
              onClick={() => setContatoOpen(!contatoOpen)}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              Contato <ChevronDown size={14} className={`transition-transform ${contatoOpen ? "rotate-180" : ""}`} />
            </button>
            {contatoOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 bg-dark-surface border border-primary/20 rounded-lg shadow-lg py-2 z-50">
                <a
                  href="#contato"
                  className="block px-4 py-2 text-dark-surface-foreground/80 hover:text-primary hover:bg-primary/10 transition-colors"
                  onClick={() => setContatoOpen(false)}
                >
                  📞 Fale Conosco
                </a>
                <a
                  href="https://whatsapp.com/channel/0029Va53o6XAInPjFxf1g106"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 text-dark-surface-foreground/80 hover:text-primary hover:bg-primary/10 transition-colors"
                  onClick={() => setContatoOpen(false)}
                >
                  📢 Canal RS Tech
                </a>
              </div>
            )}
          </div>

          {/* Loja com dropdown */}
          <div className="relative" ref={lojaRef}>
            <button
              onClick={() => setLojaOpen(!lojaOpen)}
              className="flex items-center gap-1 hover:text-secondary transition-colors font-semibold"
            >
              🛒 Loja <ChevronDown size={14} className={`transition-transform ${lojaOpen ? "rotate-180" : ""}`} />
            </button>
            {lojaOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-dark-surface border border-primary/20 rounded-lg shadow-lg py-2 z-50">
                <a
                  href="https://abre.bio/magazinerafaelsaturnooficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 text-dark-surface-foreground/80 hover:text-secondary hover:bg-primary/10 transition-colors"
                  onClick={() => setLojaOpen(false)}
                >
                  🛒 Magazine Rafael Saturno
                </a>
                <a
                  href="https://abre.bio/whatsappmagazinerafaelsaturno"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 text-dark-surface-foreground/80 hover:text-primary hover:bg-primary/10 transition-colors"
                  onClick={() => setLojaOpen(false)}
                >
                  📢 Canal Magazine Rafael Saturno
                </a>
              </div>
            )}
          </div>
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
          <p className="text-primary font-semibold text-sm pt-2">Contato</p>
          <a href="#contato" onClick={() => setMenuOpen(false)} className="block pl-4 text-dark-surface-foreground/80 hover:text-primary">📞 Fale Conosco</a>
          <a href="https://whatsapp.com/channel/0029Va53o6XAInPjFxf1g106" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="block pl-4 text-dark-surface-foreground/80 hover:text-primary">📢 Canal RS Tech</a>
          <p className="text-secondary font-semibold text-sm pt-2">🛒 Loja</p>
          <a href="https://abre.bio/magazinerafaelsaturnooficial" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="block pl-4 text-dark-surface-foreground/80 hover:text-secondary">🛒 Magazine Rafael Saturno</a>
          <a href="https://abre.bio/whatsappmagazinerafaelsaturno" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="block pl-4 text-dark-surface-foreground/80 hover:text-primary">📢 Canal Magazine Rafael Saturno</a>
        </div>
      )}
    </header>
  );
};

export default Header;
