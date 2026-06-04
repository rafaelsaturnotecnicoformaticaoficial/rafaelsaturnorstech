import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

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
    is_affiliate: true,
    is_loyalty_member: true,
    message: "",
  });
  const SERVICE_OPTIONS = [
    "Formatação de Computador",
    "Manutenção / Conserto",
    "Instalação de Programas",
    "Remoção de Vírus",
    "Recuperação de Dados",
    "Recarga de Cartucho / Toner",
    "Impressão / Cópias / Digitalização",
    "Suporte Remoto",
    "Montagem de PC",
    "Outros",
  ];
  const [services, setServices] = useState<string[]>([]);
  const toggleService = (s: string) =>
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const BUSINESS_WHATSAPP = "5535998793630";
  const sendBudgetToWhatsApp = () => {
    const lines = [
      "*Novo cadastro - Pedido de Orçamento (RS Tech)*",
      "",
      `*Nome:* ${form.full_name}`,
      `*WhatsApp:* ${form.whatsapp}`,
      form.phone ? `*Telefone:* ${form.phone}` : "",
      `*Endereço:* ${form.address}`,
      `*Cidade/UF:* ${form.city} - ${form.state}`,
      `*E-mail:* ${form.email}`,
      "",
      `*Programas:* ${[form.is_affiliate ? "Afiliado" : "", form.is_loyalty_member ? "Fidelidade" : ""].filter(Boolean).join(", ") || "Nenhum"}`,
      "",
      "*Serviços desejados:*",
      services.length ? services.map((s) => `- ${s}`).join("\n") : "- (não selecionado)",
      form.message ? `\n*Mensagem:*\n${form.message}` : "",
    ].filter(Boolean);
    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/${BUSINESS_WHATSAPP}?text=${text}`, "_blank");
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/portal");
    });
  }, [navigate]);

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/portal`,
        data: {
          full_name: form.full_name,
          whatsapp: form.whatsapp,
        },
      },
    });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    if (data.user) {
      // Update profile flags + extra fields
      await supabase
        .from("profiles")
        .update({
          full_name: form.full_name,
          whatsapp: form.whatsapp,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          is_affiliate: form.is_affiliate,
          is_loyalty_member: form.is_loyalty_member,
        })
        .eq("user_id", data.user.id);

      // Create affiliate code if opted in
      if (form.is_affiliate) {
        const code =
          (form.full_name || "rstech")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "")
            .slice(0, 8) + Math.random().toString(36).slice(2, 6);
        await supabase.from("affiliate_codes").insert({ user_id: data.user.id, code });
      }
    }
    setLoading(false);
    toast.success("Conta criada! Abrindo WhatsApp com seu pedido...");
    sendBudgetToWhatsApp();
    setTab("login");
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
            Portal do Cliente RS Tech
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Acompanhe suas indicações, comissões e programa fidelidade.
          </p>

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

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
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
              <form onSubmit={handleSignup} className="space-y-3">
                <div>
                  <Label>Nome completo *</Label>
                  <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div>
                  <Label>WhatsApp *</Label>
                  <Input required value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <Label>Endereço *</Label>
                  <Input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Cidade *</Label>
                    <Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                  <div>
                    <Label>Estado *</Label>
                    <Input required maxLength={2} placeholder="SP" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} />
                  </div>
                </div>
                <div>
                  <Label>E-mail *</Label>
                  <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <Label>Senha *</Label>
                  <Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.is_affiliate}
                      onChange={(e) => setForm({ ...form, is_affiliate: e.target.checked })}
                    />
                    Quero participar do Programa de Afiliados
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.is_loyalty_member}
                      onChange={(e) => setForm({ ...form, is_loyalty_member: e.target.checked })}
                    />
                    Quero participar do Programa Fidelidade
                  </label>
                </div>

                <div className="pt-2">
                  <Label className="mb-2 block">Serviços desejados (orçamento)</Label>
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
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Descreva o problema ou serviço desejado..."
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Ao criar a conta, abriremos o WhatsApp da RS Tech com seus dados e o pedido de orçamento.
                </p>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Cadastrando..." : "Criar conta e enviar pedido pelo WhatsApp"}
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
