import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, MessageCircle, Mail } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Signup = Tables<"affiliate_signups">;

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  aprovado: "bg-green-100 text-green-800",
  recusado: "bg-red-100 text-red-800",
};

const AffiliateSignupsTab = () => {
  const qc = useQueryClient();

  const { data: signups, isLoading } = useQuery({
    queryKey: ["admin_affiliate_signups"],
    queryFn: async () => {
      const { data, error } = await supabase.from("affiliate_signups").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Signup[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("affiliate_signups").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_affiliate_signups"] });
      toast.success("Status atualizado!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteSignup = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("affiliate_signups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_affiliate_signups"] });
      toast.success("Cadastro removido!");
    },
  });

  const wppLink = (n: string) => `https://wa.me/55${n.replace(/\D/g, "")}`;

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4">
          Cadastros de Afiliados ({signups?.length || 0})
        </h3>
        {signups?.length === 0 && <p className="text-muted-foreground">Nenhum cadastro ainda.</p>}
        <div className="space-y-3">
          {signups?.map((s) => (
            <div key={s.id} className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleString("pt-BR")} {s.city && `· ${s.city}`}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColors[s.status] || "bg-muted"}`}>
                  {s.status}
                </span>
              </div>
              <div className="text-sm text-foreground/90 grid sm:grid-cols-2 gap-1">
                <p><Mail size={12} className="inline mr-1" />{s.email}</p>
                <p><MessageCircle size={12} className="inline mr-1" />{s.whatsapp}</p>
              </div>
              {s.channel && <p className="text-sm text-muted-foreground"><strong>Canal:</strong> {s.channel}</p>}
              {s.notes && <p className="text-sm text-muted-foreground"><strong>Obs:</strong> {s.notes}</p>}
              <div className="flex flex-wrap gap-2 pt-2">
                <Select value={s.status} onValueChange={(status) => updateStatus.mutate({ id: s.id, status })}>
                  <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="recusado">Recusado</SelectItem>
                  </SelectContent>
                </Select>
                <a href={wppLink(s.whatsapp)} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-green-700 border-green-300">
                    <MessageCircle size={14} className="mr-1" /> WhatsApp
                  </Button>
                </a>
                <Button variant="ghost" size="sm" onClick={() => deleteSignup.mutate(s.id)}>
                  <Trash2 size={14} className="text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AffiliateSignupsTab;
