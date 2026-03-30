import { ShoppingBag, ArrowRight } from "lucide-react";

const produtos = [
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
];

const FeaturedProducts = () => {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
            <ShoppingBag size={16} />
            Magazine Rafael Saturno
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Produtos em <span className="text-primary">Destaque</span>
          </h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Confira as melhores ofertas em tecnologia na nossa loja parceira
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {produtos.map((produto) => (
            <a
              key={produto.nome}
              href="/loja"
              className="group bg-background rounded-xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-lg transition-all"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={produto.imagem}
                  alt={produto.nome}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-3 md:p-4">
                <h3 className="font-display font-bold text-foreground text-sm md:text-base">
                  {produto.nome}
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm mt-1">
                  {produto.descricao}
                </p>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center">
          <a
            href="/loja"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-bold transition-colors"
          >
            Ver todas as ofertas
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
