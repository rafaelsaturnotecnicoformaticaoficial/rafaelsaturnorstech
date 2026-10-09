import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoreNav from "@/components/store/StoreNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useSession } from "@/lib/store";

const signupSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome completo").max(120),
  email: z.string().trim().email("E-mail inválido").max(200),
  whatsapp: z.string().trim().min(10, "WhatsApp inválido").max(20),
  city: z.string().trim().min(2, "Informe a cidade").max(100),
  state: z.string().trim().min(2, "Informe o estado").max(30),
  password: z.string().min(6, "Senha com no mínimo 6 caracteres").max(72),
});

const Entrar = () => {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/produtos";
  const { user } = useSession();
  const [tab, setTab] = useState(params.get("mode") === "signup" ? "signup" : "login");
  const [busy, setBusy] = useState(false);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [su, setSu] = useState({ name: "", email: "", whatsapp: "", city: "", state: "", password: "" });
  const [forgot, setForgot] = useState("");

  useEffect(() => { if (user) nav(next); }, [user]);

  const doLogin = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: login.email.trim(), password: login.password });
    setBusy(false);
    if (error) toast.error("E-mail ou senha incorretos.");
  };

  const doSignup = async () => {
    const p = signupSchema.safeParse(su);
    if (!p.success) return toast.error(p.error.errors[0].message);
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: p.data.email, password: p.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/produtos`,
        data: { full_name: p.data.name, whatsapp: p.data.whatsapp, city: p.data.city, state: p.data.state },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message.includes("registered") ? "Este e-mail já tem conta. Use Entrar." : error.message);
    if (!data.session) toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail.");
  };

  const doForgot = async () => {
    if (!z.string().email().safeParse(forgot.trim()).success) return toast.error("E-mail inválido");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgot.trim(), { redirectTo: `${window.location.origin}/redefinir-senha` });
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Enviamos um link para redefinir sua senha.");
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/entrar" });
    if (r.error) toast.error("Não foi possível entrar com Google.");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header /><StoreNav />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-md">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Criar conta</TabsTrigger>
            <TabsTrigger value="forgot">Esqueci a senha</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="space-y-3 bg-card border border-border rounded-xl p-5">
            <div><Label>E-mail</Label><Input type="email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} /></div>
            <div><Label>Senha</Label><Input type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} /></div>
            <Button className="w-full" disabled={busy} onClick={doLogin}>Entrar</Button>
            <Button variant="outline" className="w-full" onClick={google}>Entrar com Google</Button>
          </TabsContent>
          <TabsContent value="signup" className="space-y-3 bg-card border border-border rounded-xl p-5">
            {([["name","Nome completo"],["email","E-mail"],["whatsapp","WhatsApp"],["city","Cidade"],["state","Estado"],["password","Senha"]] as const).map(([k, l]) => (
              <div key={k}><Label>{l}</Label><Input type={k === "password" ? "password" : k === "email" ? "email" : "text"} value={su[k]} onChange={(e) => setSu({ ...su, [k]: e.target.value })} /></div>
            ))}
            <Button className="w-full" disabled={busy} onClick={doSignup}>Criar conta</Button>
          </TabsContent>
          <TabsContent value="forgot" className="space-y-3 bg-card border border-border rounded-xl p-5">
            <div><Label>E-mail da conta</Label><Input type="email" value={forgot} onChange={(e) => setForgot(e.target.value)} /></div>
            <Button className="w-full" disabled={busy} onClick={doForgot}>Enviar link</Button>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};
export default Entrar;
