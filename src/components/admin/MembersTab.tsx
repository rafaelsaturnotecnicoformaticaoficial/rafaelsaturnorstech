import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, Star, Users, UserX } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

const wppLink = (n: string | null) => (n ? `https://wa.me/55${n.replace(/\D/g, "")}` : "#");

const MembersTab = () => {
  const qc = useQueryClient();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin_program_members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .or("is_affiliate.eq.true,is_loyalty_member.eq.true")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const { data: codes } = useQuery({
    queryKey: ["admin_affiliate_codes_all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("affiliate_codes").select("*");
      if (error) throw error;
      return data;
    },
  });

  const codeByUser = (uid: string) => codes?.find((c) => c.user_id === uid);

  const removeAffiliate = useMutation({
    mutationFn: async (userId: string) => {
      const { error: e1 } = await supabase
        .from("profiles")
        .update({ is_affiliate: false })
        .eq("user_id", userId);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("affiliate_codes").delete().eq("user_id", userId);
      if (e2) throw e2;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_program_members"] });
      qc.invalidateQueries({ queryKey: ["admin_affiliate_codes_all"] });
      toast.success("Afiliado removido por descumprimento de regras.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeLoyalty = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_loyalty_member: false })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_program_members"] });
      toast.success("Cliente removido do programa fidelidade.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;

  const affiliates = profiles?.filter((p) => p.is_affiliate) || [];
  const loyalty = profiles?.filter((p) => p.is_loyalty_member) || [];

  const Card = ({ p, badge }: { p: Profile; badge: "afiliado" | "fidelidade" }) => {
    const code = codeByUser(p.user_id);
    return (
      <div className="border border-border rounded-lg p-4 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-foreground">{p.full_name || "(sem nome)"}</p>
            <p className="text-xs text-muted-foreground">
              Cadastro: {new Date(p.created_at).toLocaleDateString("pt-BR")} {p.city && `· ${p.city}`}
            </p>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full font-semibold ${
              badge === "afiliado" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {badge}
          </span>
        </div>
        <div className="text-sm text-foreground/90 grid sm:grid-cols-2 gap-1">
          {p.email && (
            <p>
              <Mail size={12} className="inline mr-1" />
              {p.email}
            </p>
          )}
          {p.whatsapp && (
            <p>
              <MessageCircle size={12} className="inline mr-1" />
              WhatsApp: {p.whatsapp}
            </p>
          )}
          {(p as any).phone && <p>Tel: {(p as any).phone}</p>}
          {(p as any).address && (
            <p className="sm:col-span-2">
              End: {(p as any).address}
              {p.city && `, ${p.city}`}
              {(p as any).state && ` - ${(p as any).state}`}
            </p>
          )}
        </div>
        {badge === "afiliado" && code && (
          <p className="text-xs text-muted-foreground">
            <strong>Código:</strong> {code.code} · <strong>Cliques:</strong> {code.clicks}
          </p>
        )}
        <div className="pt-2 flex flex-wrap gap-2">
          {p.whatsapp && (
            <a href={wppLink(p.whatsapp)} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="text-green-700 border-green-300">
                <MessageCircle size={14} className="mr-1" /> WhatsApp
              </Button>
            </a>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive border-destructive/40">
                <UserX size={14} className="mr-1" />
                {badge === "afiliado" ? "Excluir afiliado" : "Excluir fidelidade"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Remover {badge === "afiliado" ? "afiliado" : "membro fidelidade"}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {badge === "afiliado"
                    ? "O usuário perderá o acesso de afiliado e seu código/link de indicação será excluído. Use esta opção quando o afiliado não cumprir as regras do programa."
                    : "O usuário será removido do programa fidelidade."}
                  {" "}A conta de login do cliente permanece ativa.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    badge === "afiliado"
                      ? removeAffiliate.mutate(p.user_id)
                      : removeLoyalty.mutate(p.user_id)
                  }
                >
                  Confirmar exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
          <Users size={18} className="text-primary" /> Afiliados ({affiliates.length})
        </h3>
        {affiliates.length === 0 && <p className="text-muted-foreground">Nenhum afiliado cadastrado.</p>}
        <div className="space-y-3">
          {affiliates.map((p) => (
            <Card key={p.id} p={p} badge="afiliado" />
          ))}
        </div>
      </div>

      <div className="bg-background rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
          <Star size={18} className="text-yellow-500" /> Programa Fidelidade ({loyalty.length})
        </h3>
        {loyalty.length === 0 && (
          <p className="text-muted-foreground">Nenhum cliente no programa fidelidade.</p>
        )}
        <div className="space-y-3">
          {loyalty.map((p) => (
            <Card key={p.id} p={p} badge="fidelidade" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembersTab;
