import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles, MessageCircle } from "lucide-react";
import { STORE_WHATSAPP } from "@/lib/store";

type Rec = { resumo: string; recomendados: { id: string; motivo: string }[]; solicitacao: string };

const AiAssistant = ({ names, onOpen }: { names: Map<string, string>; onOpen: (id: string) => void }) => {
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Rec | null>(null);
  const [msg, setMsg] = useState("");

  const run = async () => {
    if (desc.trim().length < 5) return toast.error("Descreva um pouco mais o que você precisa.");
    setBusy(true); setRes(null);
    const { data, error } = await supabase.functions.invoke("recomendar-servicos", { body: { descricao: desc } });
    setBusy(false);
    if (error || data?.error) {
      let m = data?.error;
      try { m = m || (await (error as any)?.context?.json())?.error; } catch { /* */ }
      return toast.error(m || "Não foi possível gerar a recomendação.");
    }
    setRes(data); setMsg(data.solicitacao);
  };

  return (
    <section className="mb-8 rounded-xl border border-primary/30 bg-primary/5 p-5">
      <h2 className="font-display text-xl font-bold flex items-center gap-2"><Sparkles size={18} className="text-primary" /> Não sabe qual serviço escolher?</h2>
      <p className="text-sm text-muted-foreground mb-3">Descreva o problema ou o que precisa de informática ou impressão. Vamos sugerir os serviços e montar seu pedido de orçamento.</p>
      <Textarea rows={3} maxLength={2000} value={desc} onChange={(e) => setDesc(e.target.value)}
        placeholder="Ex.: Meu notebook está muito lento e quero imprimir 50 convites coloridos." />
      <Button className="mt-3" onClick={run} disabled={busy}>{busy ? "Analisando..." : "Recomendar serviços"}</Button>

      {res && (
        <div className="mt-4 space-y-3">
          {res.resumo && <p className="text-sm">{res.resumo}</p>}
          <div className="grid sm:grid-cols-2 gap-2">
            {res.recomendados.map((r) => (
              <div key={r.id} className="bg-card border border-border rounded-lg p-3">
                <p className="font-bold">{names.get(r.id)}</p>
                <p className="text-xs text-muted-foreground mb-2">{r.motivo}</p>
                <Button size="sm" variant="outline" onClick={() => onOpen(r.id)}>Ver / adicionar</Button>
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold mb-1">Sua solicitação de orçamento (pode editar):</p>
            <Textarea rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} />
            <a href={`https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent("SOLICITAÇÃO DE ORÇAMENTO - RS TECH\n\n" + msg)}`} target="_blank" rel="noopener noreferrer">
              <Button className="mt-2 gap-2"><MessageCircle size={16} /> Enviar orçamento pelo WhatsApp</Button>
            </a>
          </div>
        </div>
      )}
    </section>
  );
};
export default AiAssistant;
