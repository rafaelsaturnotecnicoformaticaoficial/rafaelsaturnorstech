import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const SERVICE_OPTIONS = [
  // Informática
  "Formatação de Computador",
  "Manutenção / Conserto",
  "Instalação de Programas",
  "Remoção de Vírus",
  "Recarga Crédito de Celular",
  "Suporte Remoto",
  "Montagem de PC",
  // Gráfica
  "Impressão / Cópias / Digitalização",
  "Impressão Colorida",
  "Cartão de Visita",
  "Banner / Faixa",
  "Plotagem",
  "Encadernação",
  "Outros",
];

const BUSINESS_WHATSAPP = "5535998793630";

const budgetSchema = z.object({
  full_name: z.string().trim().min(2, "Nome muito curto").max(100, "Nome muito longo"),
  whatsapp: z.string().trim().min(10, "WhatsApp inválido").max(20, "WhatsApp inválido"),
  phone: z.string().trim().max(20, "Telefone inválido").optional().or(z.literal("")),
  email: z.string().trim().email("E-mail inválido").max(255, "E-mail muito longo"),
  city: z.string().trim().min(2, "Cidade obrigatória").max(80, "Cidade muito longa"),
  state: z.string().trim().length(2, "Use a sigla do estado (ex.: SP)"),
  address: z.string().trim().max(200, "Endereço muito longo").optional().or(z.literal("")),
  message: z.string().trim().max(1000, "Mensagem muito longa").optional().or(z.literal("")),
});

const Auth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialMode = params.get("mode") === "signup" ? "signup" : "login";
  const [tab, setTab] = useState(initialMode);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    whatsapp: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    message: "",
  });
  const [services, setServices] = useState<string[]>([]);
  const toggleService = (s: string) =>
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/portal");
    });
  }, [navigate]);

  const sendBudgetToWhatsApp = () => {
    const lines = [
      "*Pedido de Orçamento - RS Tech*",
      "",
      `*Nome:* ${form.full_name}`,
      `*WhatsApp:* ${form.whatsapp}`,
      form.phone ? `*Telefone:* ${form.phone}` : "",
      form.address ? `*Endereço:* ${form.address}` : "",
      `*Cidade/UF:* ${form.city} - ${form.state}`,
      `*E-mail:* ${form.email}`,
      "",
      "*Serviços desejados:*",
      services.length ? services.map((s) => `- ${s}`).join("\n") : "- (não selecionado)",
      form.message ? `\n*Mensagem:*\n${form.message}` : "",
    ].filter(Boolean);
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/${BUSINESS_WHATSAPP}?text=${text}`, "_blank");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Bem-vindo de volta!");
    navigate("/portal");
  };

  const handleBudgetRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = budgetSchema.safeParse(form);
    if (!parsed.success) {
      return toast.error(parsed.error.issues[0].message);
    }
    if (services.length === 0) {
      return toast.error("Selecione pelo menos um serviço");
    }

    setLoading(true);

    const notesParts = [
      form.phone ? `Telefone: ${form.phone}` : "",
      form.address ? `Endereço: ${form.address}` : "",
      form.state ? `Estado: ${form.state}` : "",
      `Serviços: ${services.join(", ")}`,
      form.message ? `Mensagem: ${form.message}` : "",
    ].filter(Boolean);

    const { error } = await supabase.from("affiliate_signups").insert({
      name: form.full_name,
      email: form.email,
      whatsapp: form.whatsapp,
      city: form.city || null,
      channel: "Orçamento site",
      notes: notesParts.join(" | ") || null,
    });

    setLoading(false);

    if (error) {
      return toast.error("Não foi possível enviar. Tente novamente.");
    }

    toast.success("Pedido enviado! Abrindo WhatsApp...");
    sendBudgetToWhatsApp();
    setForm({
      email: "", password: "", full_name: "", whatsapp: "", phone: "",
      address: "", city: "", state: "", message: "",
    });
    setServices([]);
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/portal`,
    });
    if (result.error) toast.error("Erro no login com Google");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-6 md:p-8">
          <h1 className="font-display text-2xl font-extrabold text-center mb-2">
            RS Tech - Atendimento ao Cliente
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Solicite seu orçamento de serviços de informática e gráfica, ou acesse sua conta.
          </p>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="signup">Solicitar Orçamento</TabsTrigger>
              <TabsTrigger value="login">Entrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Button
                type="button"
                variant="outline"
                className="w-full mb-4"
                onClick={handleGoogle}
              >
                Entrar com Google
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                <span className="relative bg-card px-2 text-xs text-muted-foreground mx-auto block w-fit">ou com e-mail</span>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <Label>E-mail</Label>
                  <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <Label>Senha</Label>
                  <Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleBudgetRequest} className="space-y-3">
                <p className="text-xs text-muted-foreground bg-muted/40 border border-border rounded-md px-3 py-2">
                  Preencha seus dados e selecione os serviços. Enviaremos seu pedido direto para o nosso WhatsApp.
                </p>
                <div>
                  <Label>Nome completo *</Label>
                  <Input required maxLength={100} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div>
                  <Label>WhatsApp *</Label>
                  <Input required maxLength={20} placeholder="(35) 99999-9999" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input maxLength={20} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <Label>E-mail *</Label>
                  <Input type="email" required maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <Label>Endereço</Label>
                  <Input maxLength={200} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Cidade *</Label>
                    <Input required maxLength={80} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                  <div>
                    <Label>Estado *</Label>
                    <Input required maxLength={2} placeholder="SP" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} />
                  </div>
                </div>

                <div className="pt-2">
                  <Label className="mb-2 block">Serviços desejados *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-border rounded-md p-3 bg-muted/30">
                    {SERVICE_OPTIONS.map((s) => (
                      <label key={s} className="flex items-start gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={services.includes(s)}
                          onChange={() => toggleService(s)}
                        />
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Mensagem / detalhes (opcional)</Label>
                  <textarea
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    maxLength={1000}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Descreva o problema ou serviço desejado..."
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar pedido pelo WhatsApp"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
