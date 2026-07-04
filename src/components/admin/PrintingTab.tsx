import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type Settings = {
  pickup_location: string;
  local_fee_cents: number;
  whatsapp: string;
  pb_frente: number[];
  pb_frente_verso: number[];
  color_frente: number[];
  color_frente_verso: number[];
  enable_pickup: boolean;
  enable_local: boolean;
  enable_correio: boolean;
};

const TIERS = ["1–10", "11–50", "51–200", "201+"];

const toReais = (c: number) => (c / 100).toFixed(2);
const toCents = (v: string) => Math.round(Number(v.replace(",", ".")) * 100) || 0;

const PriceRow = ({ label, values, onChange }: { label: string; values: number[]; onChange: (v: number[]) => void }) => (
  <div>
    <Label className="text-sm font-semibold">{label} (R$ por folha)</Label>
    <div className="grid grid-cols-4 gap-2 mt-1">
      {TIERS.map((t, i) => (
        <div key={t}>
          <p className="text-xs text-muted-foreground mb-1">{t}</p>
          <Input value={toReais(values[i] ?? 0)} onChange={(e) => {
            const next = [...values];
            next[i] = toCents(e.target.value);
            onChange(next);
          }} />
        </div>
      ))}
    </div>
  </div>
);

const PrintingTab = () => {
  const qc = useQueryClient();
  const [form, setForm] = useState<Settings | null>(null);

  const { data } = useQuery({
    queryKey: ["admin_printing_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("printing_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data as Settings;
    },
  });

  useEffect(() => { if (data && !form) setForm(data); }, [data, form]);

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!form) return;
      const { error } = await supabase.from("printing_settings").update(form).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_printing_settings"] });
      qc.invalidateQueries({ queryKey: ["printing_settings"] });
      toast.success("Configurações salvas!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!form) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-xl border border-border p-6 space-y-4">
        <h3 className="font-display font-bold text-lg">Configurações Gerais</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Local de retirada</Label><Input value={form.pickup_location} onChange={(e) => setForm({ ...form, pickup_location: e.target.value })} /></div>
          <div><Label>WhatsApp (só números com DDI)</Label><Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="5535998793630" /></div>
          <div><Label>Taxa entrega local (R$)</Label><Input value={toReais(form.local_fee_cents)} onChange={(e) => setForm({ ...form, local_fee_cents: toCents(e.target.value) })} /></div>
        </div>
        <div className="flex flex-wrap gap-4 pt-2">
          <label className="flex items-center gap-2"><Switch checked={form.enable_pickup} onCheckedChange={(v) => setForm({ ...form, enable_pickup: v })} /> Retirada na loja</label>
          <label className="flex items-center gap-2"><Switch checked={form.enable_local} onCheckedChange={(v) => setForm({ ...form, enable_local: v })} /> Entrega local</label>
          <label className="flex items-center gap-2"><Switch checked={form.enable_correio} onCheckedChange={(v) => setForm({ ...form, enable_correio: v })} /> Correios (SuperFrete)</label>
        </div>
      </div>

      <div className="bg-background rounded-xl border border-border p-6 space-y-4">
        <h3 className="font-display font-bold text-lg">Preços por Folha (4 faixas de quantidade)</h3>
        <PriceRow label="Preto e Branco — Só Frente" values={form.pb_frente} onChange={(v) => setForm({ ...form, pb_frente: v })} />
        <PriceRow label="Preto e Branco — Frente e Verso" values={form.pb_frente_verso} onChange={(v) => setForm({ ...form, pb_frente_verso: v })} />
        <PriceRow label="Colorida — Só Frente" values={form.color_frente} onChange={(v) => setForm({ ...form, color_frente: v })} />
        <PriceRow label="Colorida — Frente e Verso" values={form.color_frente_verso} onChange={(v) => setForm({ ...form, color_frente_verso: v })} />
      </div>

      <Button size="lg" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
        {saveMut.isPending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </div>
  );
};

export default PrintingTab;
