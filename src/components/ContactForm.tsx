import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(1, "Informe seu nome").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  whatsapp: z.string().trim().regex(/^[0-9()+\-\s]{8,20}$/, "WhatsApp inválido"),
  message: z.string().trim().min(1, "Escreva sua mensagem").max(2000),
});

const ContactForm = () => {
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert(parsed.data as any);
    setSending(false);
    if (error) return toast.error("Não foi possível enviar. Tente novamente.");
    setSent(true);
    setForm({ name: "", email: "", whatsapp: "", message: "" });
  };

  if (sent)
    return (
      <div className="max-w-lg mx-auto bg-card border border-border rounded-xl p-6 text-center">
        <p className="font-bold">Mensagem enviada!</p>
        <p className="text-muted-foreground text-sm mt-1">Recebemos seu contato e responderemos em breve.</p>
        <Button variant="outline" className="mt-4" onClick={() => setSent(false)}>Enviar outra</Button>
      </div>
    );

  return (
    <form onSubmit={submit} className="max-w-lg mx-auto bg-card border border-border rounded-xl p-6 space-y-4 text-left">
      <div><Label htmlFor="c-name">Nome</Label><Input id="c-name" maxLength={100} value={form.name} onChange={set("name")} /></div>
      <div><Label htmlFor="c-email">E-mail</Label><Input id="c-email" type="email" maxLength={255} value={form.email} onChange={set("email")} /></div>
      <div><Label htmlFor="c-wa">WhatsApp</Label><Input id="c-wa" maxLength={20} value={form.whatsapp} onChange={set("whatsapp")} /></div>
      <div><Label htmlFor="c-msg">Mensagem</Label><Textarea id="c-msg" rows={5} maxLength={2000} value={form.message} onChange={set("message")} /></div>
      <Button type="submit" className="w-full" disabled={sending}>{sending ? "Enviando..." : "Enviar mensagem"}</Button>
    </form>
  );
};
export default ContactForm;
