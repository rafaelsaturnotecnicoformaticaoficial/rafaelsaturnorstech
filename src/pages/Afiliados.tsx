import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Wrench, Printer, Users, Award, CheckCircle2, MessageCircle, AlertTriangle, Banknote } from "lucide-react";

const Afiliados = () => {

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h1 className="font-display text-3xl md:text-5xl font-extrabold mb-4">
              Programa Fidelidade e Indicação — RS TECH
            </h1>
            <p className="text-base md:text-lg opacity-95">
              Serviços de Informática · Impressões e Xerox. Indique clientes, fidelize-se e ganhe comissões e descontos exclusivos.
            </p>
          </div>
        </section>

        {/* Comissão por Indicação */}
        <section className="py-14">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
              Comissão por <span className="text-primary">Indicação</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors">
                <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-3">
                  <Wrench size={28} />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">Serviços de Informática</h3>
                <p className="text-3xl font-extrabold text-primary mb-1">10%</p>
                <p className="text-sm text-muted-foreground">de comissão por indicação</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors">
                <div className="inline-flex p-3 rounded-full bg-secondary/10 text-secondary mb-3">
                  <Printer size={28} />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">Impressões e Xerox</h3>
                <p className="text-3xl font-extrabold text-secondary mb-1">5%</p>
                <p className="text-sm text-muted-foreground">de comissão por indicação</p>
              </div>
            </div>
          </div>
        </section>

        {/* Programa Fidelidade */}
        <section className="py-14 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
              Programa <span className="text-primary">Fidelidade</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <Award className="text-primary mx-auto mb-3" size={32} />
                <p className="font-bold text-foreground mb-2">A cada 5 serviços</p>
                <p className="text-sm text-muted-foreground"><strong>5% de desconto</strong> no próximo serviço</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <Award className="text-secondary mx-auto mb-3" size={32} />
                <p className="font-bold text-foreground mb-2">A cada 10 serviços</p>
                <p className="text-sm text-muted-foreground"><strong>10% de desconto</strong> especial</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <Users className="text-primary mx-auto mb-3" size={32} />
                <p className="font-bold text-foreground mb-2">Clientes frequentes</p>
                <p className="text-sm text-muted-foreground">Recebem <strong>promoções exclusivas</strong></p>
              </div>
            </div>
          </div>
        </section>

        {/* Como funciona + Pagamento */}
        <section className="py-14">
          <div className="container mx-auto px-4 max-w-5xl grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Como funciona</h2>
              <ul className="space-y-3">
                {[
                  "Indique clientes para a RS TECH",
                  "O serviço deve ser concluído e pago",
                  "A comissão será liberada após confirmação do pagamento",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 bg-card p-4 rounded-lg border border-border">
                    <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-foreground/90">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Pagamento</h2>
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Banknote className="text-primary flex-shrink-0 mt-0.5" size={22} />
                  <div>
                    <p className="font-bold text-foreground">Via Pix</p>
                    <p className="text-sm text-muted-foreground">Forma de pagamento exclusiva</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={22} />
                  <div>
                    <p className="font-bold text-foreground">Em até 7 dias úteis</p>
                    <p className="text-sm text-muted-foreground">Após confirmação do pagamento do serviço</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Regras */}
        <section className="py-14 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-8 flex items-center justify-center gap-2">
              <AlertTriangle className="text-secondary" size={26} /> Regras
            </h2>
            <ul className="space-y-3">
              {[
                "Comissão válida apenas para serviços pagos",
                "Não é permitido spam ou divulgação enganosa",
                "Descontos fidelidade não são acumulativos",
                "Promoções podem alterar os percentuais",
                "Regras sujeitas a alterações sem aviso prévio",
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-3 bg-card p-4 rounded-lg border border-border">
                  <span className="text-primary font-bold">•</span>
                  <span className="text-foreground/90">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA cadastro com login */}
        <section className="py-14">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Quero participar
            </h2>
            <p className="text-muted-foreground mb-8">
              Cadastre-se gratuitamente, gere seu link de indicação e acompanhe suas comissões e descontos fidelidade no painel exclusivo.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <a href="/auth?mode=signup" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-lg transition-colors">
                Criar conta grátis
              </a>
              <a href="/auth" className="bg-card border border-border hover:border-primary text-foreground font-bold py-3 px-6 rounded-lg transition-colors">
                Já tenho conta — Entrar
              </a>
            </div>
            <a
              href="https://wa.me/5535998793630?text=Ol%C3%A1%2C%20quero%20participar%20do%20Programa%20Fidelidade%20e%20Indica%C3%A7%C3%A3o%20RS%20TECH"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <MessageCircle size={20} /> Falar direto no WhatsApp
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Afiliados;
