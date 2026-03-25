import { Zap, DollarSign, ShieldCheck, HeadphonesIcon } from "lucide-react";

const advantages = [
  { icon: Zap, title: "Atendimento rápido", desc: "Resolução ágil para o seu problema" },
  { icon: DollarSign, title: "Preço justo", desc: "O melhor custo-benefício da região" },
  { icon: ShieldCheck, title: "Qualidade garantida", desc: "Serviço com garantia e excelência" },
  { icon: HeadphonesIcon, title: "Suporte confiável", desc: "Acompanhamento pós-serviço" },
];

const Advantages = () => {
  return (
    <section id="vantagens" className="py-20 bg-dark-surface">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-dark-surface-foreground mb-12">
          Por que escolher a <span className="text-gradient">RS Tech</span>?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((a) => (
            <div
              key={a.title}
              className="text-center p-6 rounded-xl border border-primary/20 bg-dark-surface hover:border-primary/50 transition-all group"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <a.icon size={28} className="text-primary" />
              </div>
              <h3 className="font-display font-bold text-dark-surface-foreground mb-2">{a.title}</h3>
              <p className="text-sm text-muted-foreground">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Advantages;
