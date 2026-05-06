import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Wallet, Gift, Users, CheckCircle2, MessageCircle } from "lucide-react";

const Afiliados = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    city: "",
    channel: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.whatsapp) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("affiliate_signups").insert([form]);
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Cadastro enviado!", description: "Em breve entraremos em contato." });
    setForm({ name: "", email: "", whatsapp: "", city: "", channel: "", notes: "" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h1 className="font-display text-3xl md:text-5xl font-extrabold mb-4">
              Programa de Afiliados RS Tech
            </h1>
            <p className="text-base md:text-lg opacity-95">
              Ganhe <strong>Cashback</strong>, acumule pontos de <strong>Fidelidade</strong> e receba
              <strong> Comissão por Indicação</strong> divulgando os serviços e produtos da Rafael Saturno – RS Tech.
            </p>
          </div>
        </section>

        {/* Benefícios */}
        <section className="py-14">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
              Como você <span className="text-primary">ganha</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors">
                <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-3">
                  <Wallet size={28} />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">Cashback</h3>
                <p className="text-sm text-muted-foreground">
                  Receba até <strong>5% de volta</strong> em cada compra realizada nas lojas parceiras pelo seu link de afiliado.
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors">
                <div className="inline-flex p-3 rounded-full bg-secondary/10 text-secondary mb-3">
                  <Gift size={28} />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">Fidelidade</h3>
                <p className="text-sm text-muted-foreground">
                  Acumule <strong>1 ponto a cada R$ 1</strong> em serviços RS Tech e troque por descontos, brindes e suporte gratuito.
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors">
                <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-3">
                  <Users size={28} />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">Comissão por Indicação</h3>
                <p className="text-sm text-muted-foreground">
                  Receba <strong>até 10% de comissão</strong> sobre cada cliente novo que fechar serviço através da sua indicação.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section className="py-14 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
              Como funciona
            </h2>
            <ul className="space-y-4">
              {[
                "Faça seu cadastro gratuito no formulário abaixo.",
                "Receba seu link/cupom exclusivo de divulgação no WhatsApp.",
                "Compartilhe com amigos, clientes e nas redes sociais.",
                "Acompanhe suas indicações, cashback e pontos.",
                "Receba pagamentos via PIX ou descontos em serviços RS Tech.",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 bg-card p-4 rounded-lg border border-border">
                  <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={22} />
                  <span className="text-foreground/90">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Formulário */}
        <section className="py-14">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
              Quero me cadastrar
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Preencha o formulário e entraremos em contato em até 24h.
            </p>
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  name="name" value={form.name} onChange={handleChange} placeholder="Nome completo *"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                  required
                />
                <input
                  name="email" type="email" value={form.email} onChange={handleChange} placeholder="E-mail *"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                  required
                />
                <input
                  name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="WhatsApp *"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                  required
                />
                <input
                  name="city" value={form.city} onChange={handleChange} placeholder="Cidade / UF"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
              <input
                name="channel" value={form.channel} onChange={handleChange}
                placeholder="Como pretende divulgar? (Instagram, WhatsApp, blog...)"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
              />
              <textarea
                name="notes" value={form.notes} onChange={handleChange} rows={3}
                placeholder="Observações (opcional)"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-primary resize-none"
              />
              <button
                type="submit" disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-bold py-3 rounded-lg transition-colors"
              >
                {loading ? "Enviando..." : "Quero ser Afiliado RS Tech"}
              </button>
              <p className="text-xs text-muted-foreground text-center">
                Ao enviar, você concorda com nossa Política de Privacidade.
              </p>
            </form>

            <div className="text-center mt-8">
              <a
                href="https://wa.me/5535998793630?text=Ol%C3%A1%2C%20quero%20participar%20do%20Programa%20de%20Afiliados%20RS%20Tech"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <MessageCircle size={20} /> Falar direto no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Afiliados;
