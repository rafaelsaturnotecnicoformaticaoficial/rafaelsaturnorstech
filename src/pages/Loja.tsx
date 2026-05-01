import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShopeeProducts from "@/components/ShopeeProducts";
import { ShoppingBag, ExternalLink, ArrowRight } from "lucide-react";

const categorias = [
  {
    nome: "Notebooks",
    imagem: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
    descricao: "As melhores marcas com preço especial",
  },
  {
    nome: "Smartphones",
    imagem: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
    descricao: "Celulares com garantia e qualidade",
  },
  {
    nome: "Periféricos",
    imagem: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop",
    descricao: "Teclados, mouses e acessórios",
  },
  {
    nome: "Impressoras",
    imagem: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&h=300&fit=crop",
    descricao: "Impressoras e suprimentos",
  },
  {
    nome: "TVs e Smart TVs",
    imagem: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop",
    descricao: "As melhores telas para sua casa",
  },
  {
    nome: "Eletroportáteis",
    imagem: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    descricao: "Praticidade para o dia a dia",
  },
];

const LOJA_URL = "https://www.magazinevoce.com.br/magazinerafaelsaturno/";

const Loja = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero da loja */}
        <div className="bg-primary py-12 text-center">
          <div className="container mx-auto px-4">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <ShoppingBag size={16} />
              Loja Oficial
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-3">
              Magazine Rafael Saturno
            </h1>
            <p className="text-primary-foreground/70 max-w-lg mx-auto mb-6">
              Confira as melhores ofertas em tecnologia, eletrônicos e muito mais com preços especiais
            </p>
            <a
              href={LOJA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-4 rounded-lg text-lg font-bold transition-colors shadow-lg"
            >
              Acessar a Loja
              <ExternalLink size={20} />
            </a>
          </div>
        </div>

        {/* Categorias */}
        <section className="py-14 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
              Categorias em <span className="text-primary">Destaque</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10">
              {categorias.map((cat) => (
                <a
                  key={cat.nome}
                  href={LOJA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-lg transition-all"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={cat.imagem}
                      alt={cat.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-bold text-foreground">{cat.nome}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{cat.descricao}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="text-center">
              <a
                href={LOJA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-bold transition-colors"
              >
                Ver todas as ofertas
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </section>

        <ShopeeProducts keyword="informatica" title="Ofertas" />
      </main>
      <Footer />
    </div>
  );
};

export default Loja;
