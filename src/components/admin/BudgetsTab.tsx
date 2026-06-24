import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, MessageCircle, Mail, FileText, Filter } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Signup = Tables<"affiliate_signups">;

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  aprovado: "bg-green-100 text-green-800",
  recusado: "bg-red-100 text-red-800",
};

const SERVICE_OPTIONS = [
  "Formatação de Computador",
  "Manutenção / Conserto",
  "Instalação de Programas",
  "Remoção de Vírus",
  "Recarga Crédito de Celular",
  "Impressão / Cópias / Digitalização",
  "Suporte Remoto",
  "Montagem de PC",
  "Impressão Colorida",
  "Cartão de Visita",
  "Banner / Faixa",
  "Plotagem",
  "Encadernação",
  "Outros",
];

// Extracts a labeled section from the notes blob (e.g. "Serviços: a, b\nMensagem: ...")
const extractField = (notes: string | null, label: string): string => {
  if (!notes) return "";
  const re = new RegExp(`${label}\\s*:\\s*([^\\n]+)`, "i");
  const m = notes.match(re);
  return m ? m[1].trim() : "";
};

const BudgetsTab = () => {
  const qc = useQueryClient();
  const [serviceFilter, setServiceFilter] = useState<string>("todos");
  const [cityFilter, setCityFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [search, setSearch] = useState("");

  const { data: signups, isLoading } = useQuery({
    queryKey: ["admin_budgets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliate_signups")
        .select("*")
        .eq("channel", "Orçamento site")
        .order("created_at", { ascending: false });
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
      qc.invalidateQueries({ queryKey: ["admin_budgets"] });
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
      qc.invalidateQueries({ queryKey: ["admin_budgets"] });
      toast.success("Orçamento removido!");
    },
  });

  const cityOptions = useMemo(() => {
    const set = new Set<string>();
    signups?.forEach((s) => s.city && set.add(s.city));
    return Array.from(set).sort();
  }, [signups]);

  const filtered = useMemo(() => {
    return (signups || []).filter((s) => {
      if (statusFilter !== "todos" && s.status !== statusFilter) return false;
      if (cityFilter !== "todos" && (s.city || "") !== cityFilter) return false;
      if (serviceFilter !== "todos") {
        const svcs = extractField(s.notes, "Serviços").toLowerCase();
        if (!svcs.includes(serviceFilter.toLowerCase())) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const hay = `${s.name} ${s.email} ${s.whatsapp} ${s.city || ""} ${s.notes || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [signups, statusFilter, cityFilter, serviceFilter, search]);

  const wppLink = (n: string) => `https://wa.me/55${n.replace(/\D/g, "")}`;

  const clearFilters = () => {
    setServiceFilter("todos");
    setCityFilter("todos");
    setStatusFilter("todos");
    setSearch("");
  };

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-primary" />
          <h3 className="font-display font-bold text-lg">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs">Serviço</Label>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="todos">Todos os serviços</SelectItem>
                {SERVICE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Cidade</Label>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="todos">Todas as cidades</SelectItem>
                {cityOptions.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="recusado">Recusado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Buscar</Label>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nome, e-mail, telefone..." />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={clearFilters}>Limpar filtros</Button>
        </div>
      </div>

      <div className="bg-background rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          Orçamentos ({filtered.length}{signups && filtered.length !== signups.length ? ` de ${signups.length}` : ""})
        </h3>
        {filtered.length === 0 && (
          <p className="text-muted-foreground">Nenhum orçamento encontrado com os filtros atuais.</p>
        )}
        <div className="space-y-3">
          {filtered.map((s) => {
            const phone = extractField(s.notes, "Telefone");
            const address = extractField(s.notes, "Endereço");
            const state = extractField(s.notes, "Estado");
            const services = extractField(s.notes, "Serviços");
            const message = extractField(s.notes, "Mensagem");
            return (
              <div key={s.id} className="border border-border rounded-lg p-4 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.created_at).toLocaleString("pt-BR")}
                      {s.city && ` · ${s.city}`}
                      {state && ` / ${state}`}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColors[s.status] || "bg-muted"}`}>
                    {s.status}
                  </span>
                </div>
                <div className="text-sm text-foreground/90 grid sm:grid-cols-2 gap-1">
                  <p><Mail size={12} className="inline mr-1" />{s.email}</p>
                  <p><MessageCircle size={12} className="inline mr-1" />{s.whatsapp}</p>
                  {phone && <p><strong>Telefone:</strong> {phone}</p>}
                  {address && <p><strong>Endereço:</strong> {address}</p>}
                </div>
                {services && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {services.split(",").map((sv, i) => (
                      <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {sv.trim()}
                      </span>
                    ))}
                  </div>
                )}
                {message && (
                  <p className="text-sm text-muted-foreground border-l-2 border-border pl-2 italic">
                    "{message}"
                  </p>
                )}
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
                  <a href={`mailto:${s.email}`}>
                    <Button variant="outline" size="sm">
                      <Mail size={14} className="mr-1" /> E-mail
                    </Button>
                  </a>
                  <Button variant="ghost" size="sm" onClick={() => deleteSignup.mutate(s.id)}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BudgetsTab;
