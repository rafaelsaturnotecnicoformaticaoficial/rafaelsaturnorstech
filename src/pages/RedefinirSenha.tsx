import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const RedefinirSenha = () => {
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const save = async () => {
    if (pw.length < 6) return toast.error("Senha com no mínimo 6 caracteres");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return toast.error(error.message);
    toast.success("Senha alterada!");
    nav("/minha-conta");
  };
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-md space-y-3">
        <h1 className="font-display text-2xl font-bold">Nova senha</h1>
        <Label>Digite a nova senha</Label>
        <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <Button onClick={save} className="w-full">Salvar</Button>
      </main>
      <Footer />
    </div>
  );
};
export default RedefinirSenha;
