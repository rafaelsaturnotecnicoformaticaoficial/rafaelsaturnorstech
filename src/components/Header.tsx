import { Menu, X } from "lucide-react";
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-primary/20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <img src={logo} alt="RS Tech Logo" className="h-12 w-12 object-contain" />
          <div className="hidden sm:block">
            <p className="font-display text-sm font-bold text-black">Rafael Saturno</p>
            <p className="text-xs text-black/60">Técnico em Informática | RS Tech</p>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-black">
          <a href="/produtos" className="hover:text-primary transition-colors">Produtos e Serviços</a>
          <a href="/carrinho" className="hover:text-primary transition-colors">Carrinho</a>
          <a href="/entrar" className="hover:text-primary transition-colors">Minha Conta</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-black"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-primary/20 px-4 py-4 space-y-3">
          <a href="/produtos" onClick={() => setMenuOpen(false)} className="block text-black font-bold hover:text-primary">Produtos e Serviços</a>
          <a href="/carrinho" onClick={() => setMenuOpen(false)} className="block text-black font-bold hover:text-primary">Carrinho</a>
          <a href="/entrar" onClick={() => setMenuOpen(false)} className="block text-black font-bold hover:text-primary">Minha Conta</a>
        </div>
      )}
    </header>
  );
};

export default Header;
