import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShopeeProducts from "@/components/ShopeeProducts";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";

const Shopee = () => {
  const [keyword, setKeyword] = useState("informatica");
  const [input, setInput] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(input.trim() || "informatica");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-primary py-12 text-center">
          <div className="container mx-auto px-4">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <ShoppingBag size={16} />
              Ofertas Shopee
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-3">
              Shopee Rafael Saturno
            </h1>
            <p className="text-primary-foreground/70 max-w-lg mx-auto mb-6">
              Produtos selecionados de tecnologia e informática direto da Shopee, com links de afiliado oficiais.
            </p>
            <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Buscar produtos..."
                className="flex-1 px-4 py-3 rounded-lg text-foreground bg-background border border-border focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <button
                type="submit"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-3 rounded-lg font-bold transition-colors"
              >
                Buscar
              </button>
            </form>
          </div>
        </div>

        <ShopeeProducts keyword={keyword} title={`Resultados para "${keyword}"`} />
      </main>
      <Footer />
    </div>
  );
};

export default Shopee;
