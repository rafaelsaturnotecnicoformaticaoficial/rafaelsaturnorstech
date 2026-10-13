import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { checkAdminAccess } from "@/lib/admin";
import { lovable } from "@/integrations/lovable";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try { if (await checkAdminAccess()) navigate("/admin", { replace: true }); }
      catch { toast.error("Não foi possível verificar o acesso. Tente novamente."); }
    };
    void verify();
    const { data } = supabase.auth.onAuthStateChange(() => { setTimeout(() => void verify(), 0); });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const googleLogin = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/admin/login`, extraParams: { prompt: "select_account" } });
      if (result.error) throw result.error;
      if (result.redirected) return;
      if (await checkAdminAccess()) navigate("/admin");
      else toast.error("Esta conta não tem acesso ao painel administrativo.");
    } catch { toast.error("Não foi possível entrar com Google."); }
    finally { setLoading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (!(await checkAdminAccess())) {
        await supabase.auth.signOut();
        toast.error("Acesso negado. Você não é administrador.");
        return;
      }

      toast.success("Login realizado com sucesso!");
      navigate("/admin");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao fazer login";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-sm bg-background rounded-2xl shadow-lg border border-border p-8">
        <div className="text-center mb-6">
          <img src={logo} alt="RS Tech" className="h-16 w-16 mx-auto mb-3" />
          <h1 className="font-display text-2xl font-bold text-foreground">Painel Admin</h1>
          <p className="text-muted-foreground text-sm">Faça login para gerenciar o site</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@exemplo.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            <Lock size={16} className="mr-2" />
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <Button variant="outline" className="w-full mt-3" disabled={loading} onClick={googleLogin}>Entrar com Google</Button>
        <Button variant="link" className="w-full mt-2" disabled={loading} onClick={async () => {
          if (!email.trim()) return toast.error("Informe seu e-mail para recuperar a senha.");
          const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/redefinir-senha` });
          if (error) toast.error("Não foi possível enviar o link."); else toast.success("Verifique seu e-mail para redefinir a senha.");
        }}>Esqueci minha senha</Button>
      </div>
    </div>
  );
};

export default AdminLogin;
