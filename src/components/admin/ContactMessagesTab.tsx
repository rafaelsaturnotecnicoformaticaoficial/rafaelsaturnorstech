import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type ContactMessage = { id: string; name: string; email: string; whatsapp: string; message: string; read: boolean; created_at: string };

export const useContactMessages = () => {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase.channel("contact-messages-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, (p) => {
        if (p.eventType === "INSERT") toast.info(`Nova mensagem de contato: ${(p.new as ContactMessage).name}`);
        qc.invalidateQueries({ queryKey: ["contact-messages"] });
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);
  return useQuery({
    queryKey: ["contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ContactMessage[];
    },
  });
};

const ContactMessagesTab = () => {
  const qc = useQueryClient();
  const { data = [], isLoading } = useContactMessages();
  const update = async (id: string, read: boolean) => {
    await supabase.from("contact_messages" as any).update({ read }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["contact-messages"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Excluir esta mensagem?")) return;
    await supabase.from("contact_messages" as any).delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["contact-messages"] });
  };
  if (isLoading) return <p>Carregando...</p>;
  if (!data.length) return <p className="text-muted-foreground">Nenhuma mensagem ainda.</p>;
  return (
    <div className="space-y-3">
      {data.map((m) => (
        <div key={m.id} className={`border rounded-lg p-4 ${m.read ? "border-border" : "border-primary bg-primary/5"}`}>
          <div className="flex flex-wrap justify-between gap-2">
            <p className="font-bold">{m.name} {!m.read && <span className="text-xs text-primary ml-2">NOVA</span>}</p>
            <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("pt-BR")}</span>
          </div>
          <p className="text-sm text-muted-foreground">{m.email} · {m.whatsapp}</p>
          <p className="mt-2 whitespace-pre-wrap">{m.message}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button size="sm" variant="outline" asChild><a href={`https://wa.me/55${m.whatsapp.replace(/\D/g, "").replace(/^55/, "")}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></Button>
            <Button size="sm" variant="outline" asChild><a href={`mailto:${m.email}`}>E-mail</a></Button>
            <Button size="sm" variant="outline" onClick={() => update(m.id, !m.read)}>{m.read ? "Marcar não lida" : "Marcar lida"}</Button>
            <Button size="sm" variant="destructive" onClick={() => remove(m.id)}>Excluir</Button>
          </div>
        </div>
      ))}
    </div>
  );
};
export default ContactMessagesTab;
