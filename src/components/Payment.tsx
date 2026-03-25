import { CreditCard, Smartphone, Banknote } from "lucide-react";

const methods = [
  { icon: Banknote, label: "Débito" },
  { icon: CreditCard, label: "Crédito" },
  { icon: Smartphone, label: "Pix" },
];

const Payment = () => {
  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">
          Formas de <span className="text-gradient">Pagamento</span>
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {methods.map((m) => (
            <div
              key={m.label}
              className="flex items-center gap-3 bg-card border border-border rounded-xl px-6 py-4 shadow-sm"
            >
              <m.icon size={24} className="text-primary" />
              <span className="font-semibold text-card-foreground">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Payment;
