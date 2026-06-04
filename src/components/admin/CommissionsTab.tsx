import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, CheckCircle2, Clock, DollarSign } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Commission = Tables<"affiliate_commissions">;

const SERVICE_PERCENT: Record<string, number> = {
  informatica: 10,
  xerox: 5,
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const statusBadge = (status: string, type: "service" | "payment") => {
  if (type === "payment") {
    return status === "pago"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  }
  return status === "concluido"
    ? "bg-blue-100 text-blue-800"
    : "bg-orange-100 text-orange-800";
};

const CommissionsTab = () => {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    affiliate_user_id: "",
    affiliate_name: "",
    affiliate_contact: "",
    client_name: "",
    service_type: "informatica",
    service_value: "",
    notes: "",
  });

  const { data: affiliates } = useQuery({
    queryKey: ["admin_affiliates_list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, whatsapp")
        .eq("is_affiliate", true)
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const selectAffiliate = (user_id: string) => {
    if (user_id === "__manual__") {
      setForm({ ...form, affiliate_user_id: "", affiliate_name: "", affiliate_contact: "" });
      return;
    }
    const a = affiliates?.find((x) => x.user_id === user_id);
    if (!a) return;
    setForm({
      ...form,
      affiliate_user_id: user_id,
      affiliate_name: a.full_name || a.email || "",
      affiliate_contact: a.whatsapp || "",
    });
  };

  const { data: commissions } = useQuery({
    queryKey: ["admin_commissions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("affiliate_commissions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Commission[];
    },
  });

  const totals = useMemo(() => {
    const c = commissions || [];
    return {
      total: c.length,
      pending: c.filter((x) => x.payment_status === "pendente").reduce((s, x) => s + Number(x.commission_value), 0),
      paid: c.filter((x) => x.payment_status === "pago").reduce((s, x) => s + Number(x.commission_value), 0),
    };
  }, [commissions]);

  const addMutation = useMutation({
    mutationFn: async () => {
      const value = parseFloat(form.service_value) || 0;
      const percent = SERVICE_PERCENT[form.service_type] || 10;
      const commission_value = +(value * percent / 100).toFixed(2);
      const { error } = await supabase.from("affiliate_commissions").insert({
        affiliate_user_id: form.affiliate_user_id || null,
        affiliate_name: form.affiliate_name,
        affiliate_contact: form.affiliate_contact || null,
        client_name: form.client_name,
        service_type: form.service_type,
        service_value: value,
        commission_percent: percent,
        commission_value,
        notes: form.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_commissions"] });
      setForm({ affiliate_user_id: "", affiliate_name: "", affiliate_contact: "", client_name: "", service_type: "informatica", service_value: "", notes: "" });
      toast.success("Comissão registrada!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateField = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Commission> }) => {
      const { error } = await supabase.from("affiliate_commissions").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin_commissions"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const releasePayment = (c: Commission) => {
    updateField.mutate(
      { id: c.id, patch: { payment_status: "pago", paid_at: new Date().toISOString(), service_status: "concluido" } },
      { onSuccess: () => toast.success("Comissão liberada como paga!") }
    );
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("affiliate_commissions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_commissions"] });
      toast.success("Registro removido!");
    },
  });

  const previewCommission = (() => {
    const v = parseFloat(form.service_value) || 0;
    const p = SERVICE_PERCENT[form.service_type] || 10;
    return (v * p) / 100;
  })();

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-background rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase">Indicações</p>
          <p className="text-2xl font-extrabold text-foreground">{totals.total}</p>
        </div>
        <div className="bg-background rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase flex items-center gap-1"><Clock size={12} /> A pagar</p>
          <p className="text-2xl font-extrabold text-orange-600">{fmt(totals.pending)}</p>
        </div>
        <div className="bg-background rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase flex items-center gap-1"><CheckCircle2 size={12} /> Pago</p>
          <p className="text-2xl font-extrabold text-green-600">{fmt(totals.paid)}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-background rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4">Registrar Indicação / Comissão</h3>
        <div className="mb-4">
          <Label>Selecionar Afiliado Cadastrado</Label>
          <Select value={form.affiliate_user_id || "__manual__"} onValueChange={selectAffiliate}>
            <SelectTrigger><SelectValue placeholder="Escolha um afiliado..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__manual__">— Digitar manualmente —</SelectItem>
              {affiliates?.map((a) => (
                <SelectItem key={a.user_id} value={a.user_id}>
                  {a.full_name || a.email} {a.whatsapp ? `· ${a.whatsapp}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Nome do Afiliado</Label>
            <Input value={form.affiliate_name} onChange={(e) => setForm({ ...form, affiliate_name: e.target.value })} />
          </div>
          <div>
            <Label>Contato (WhatsApp)</Label>
            <Input value={form.affiliate_contact} onChange={(e) => setForm({ ...form, affiliate_contact: e.target.value })} />
          </div>
          <div>
            <Label>Cliente Indicado</Label>
            <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
          </div>
          <div>
            <Label>Tipo de Serviço</Label>
            <Select value={form.service_type} onValueChange={(v) => setForm({ ...form, service_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="informatica">Informática (10%)</SelectItem>
                <SelectItem value="xerox">Impressões/Xerox (5%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Valor do Serviço (R$)</Label>
            <Input type="number" step="0.01" value={form.service_value} onChange={(e) => setForm({ ...form, service_value: e.target.value })} />
          </div>
          <div>
            <Label>Comissão calculada</Label>
            <div className="h-10 flex items-center px-3 rounded-md border border-border bg-muted/40 font-bold text-primary">
              {fmt(previewCommission)}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Label>Observações</Label>
          <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <Button
          className="mt-4"
          onClick={() => addMutation.mutate()}
          disabled={!form.affiliate_name || !form.client_name || !form.service_value}
        >
          <Plus size={16} className="mr-1" /> Registrar
        </Button>
      </div>

      {/* List */}
      <div className="bg-background rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4">Comissões ({commissions?.length || 0})</h3>
        {commissions?.length === 0 && <p className="text-muted-foreground">Nenhuma comissão registrada.</p>}
        <div className="space-y-3">
          {commissions?.map((c) => (
            <div key={c.id} className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-foreground">
                    {c.affiliate_name} <span className="text-muted-foreground font-normal">indicou</span> {c.client_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleString("pt-BR")} · {c.service_type === "informatica" ? "Informática" : "Xerox"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Comissão</p>
                  <p className="font-extrabold text-primary">{fmt(Number(c.commission_value))}</p>
                  <p className="text-xs text-muted-foreground">de {fmt(Number(c.service_value))} ({c.commission_percent}%)</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusBadge(c.service_status, "service")}`}>
                  Serviço: {c.service_status}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusBadge(c.payment_status, "payment")}`}>
                  Pagamento: {c.payment_status}
                </span>
                {c.paid_at && (
                  <span className="text-xs text-muted-foreground">
                    Pago em {new Date(c.paid_at).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
              {c.notes && <p className="text-sm text-muted-foreground"><strong>Obs:</strong> {c.notes}</p>}
              <div className="flex flex-wrap gap-2 pt-2">
                <Select value={c.service_status} onValueChange={(v) => updateField.mutate({ id: c.id, patch: { service_status: v } })}>
                  <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Serviço pendente</SelectItem>
                    <SelectItem value="concluido">Serviço concluído</SelectItem>
                  </SelectContent>
                </Select>
                {c.payment_status !== "pago" ? (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => releasePayment(c)}
                  >
                    <DollarSign size={14} className="mr-1" /> Liberar Pagamento
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateField.mutate({ id: c.id, patch: { payment_status: "pendente", paid_at: null } })}
                  >
                    Reverter para pendente
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(c.id)}>
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

export default CommissionsTab;
