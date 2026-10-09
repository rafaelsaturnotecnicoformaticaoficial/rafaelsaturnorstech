import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoreNav from "@/components/store/StoreNav";
import SchedulePicker, { useScheduleData } from "@/components/store/SchedulePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, Lock, CalendarDays } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { brl, cartStore, deadlineText, fmtDate, useSession, validateFile } from "@/lib/store";

type Item = Tables<"catalog_items">;

const Produtos = () => {
  const { user } = useSession();
  const [cat, setCat] = useState("todas");
  const [kind, setKind] = useState("todos");
  const [open, setOpen] = useState<Item | null>(null);
  const sched = useScheduleData();

  const { data: cats } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });
  const { data: items } = useQuery({
    queryKey: ["catalog_public"],
    queryFn: async () => (await supabase.from("catalog_items").select("*").eq("active", true).order("sort_order").order("name")).data ?? [],
  });
  const { data: prices } = useQuery({
    queryKey: ["catalog_prices", user?.id],
    enabled: !!user,
    queryFn: async () => new Map(((await supabase.from("catalog_prices").select("*")).data ?? []).map((p) => [p.item_id, p.price_cents])),
  });

  const list = (items ?? []).filter((i) => (cat === "todas" || i.category_id === cat) && (kind === "todos" || (kind === "digital" ? i.kind === "produto" && i.product_type === "digital" : i.kind === kind)));

  return (
    <div className="min-h-screen flex flex-col">
      <Header /><StoreNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Produtos e <span className="text-primary">Serviços</span></h1>
        <p className="text-muted-foreground mb-6">Retirada disponível somente em São Pedro da União - MG. Atendemos outras regiões: consulte o frete pelo WhatsApp.</p>
        {!user && (
          <div className="mb-6 p-4 rounded-lg border border-secondary/40 bg-secondary/10 flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold flex items-center gap-2"><Lock size={16} /> Faça login ou crie sua conta para visualizar o preço.</p>
            <div className="flex gap-2">
              <Link to="/entrar?next=/produtos"><Button size="sm" variant="outline">Entrar</Button></Link>
              <Link to="/entrar?mode=signup&next=/produtos"><Button size="sm">Criar conta</Button></Link>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-3">
          {[["todos","Todos"],["produto","Produtos"],["digital","Produtos digitais"],["servico","Serviços"]].map(([v,l]) => (
            <Button key={v} size="sm" variant={kind === v ? "default" : "outline"} onClick={() => setKind(v)}>{l}</Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          <Button size="sm" variant={cat === "todas" ? "secondary" : "ghost"} onClick={() => setCat("todas")}>Todas categorias</Button>
          {cats?.map((c) => <Button key={c.id} size="sm" variant={cat === c.id ? "secondary" : "ghost"} onClick={() => setCat(c.id)}>{c.name}</Button>)}
        </div>
        {list.length === 0 && <p className="text-muted-foreground">Nenhum item nesta seleção.</p>}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map((i) => {
            const dt = deadlineText(i);
            return (
              <div key={i.id} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
                <div className="aspect-[4/3] bg-muted">{i.image_url && <img src={i.image_url} alt={i.name} className="w-full h-full object-cover" loading="lazy" />}</div>
                <div className="p-3 flex-1 flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">{i.kind === "servico" ? "Serviço" : i.product_type === "digital" ? "Produto digital" : "Produto"}</span>
                  <h3 className="font-bold leading-tight">{i.name}</h3>
                  {dt && <p className="text-xs text-muted-foreground">{dt}</p>}
                  {i.schedulable && <p className="text-xs text-primary flex items-center gap-1"><CalendarDays size={12} /> Agendável</p>}
                  <div className="mt-auto pt-2">
                    {user ? <p className="font-bold text-primary text-lg">{prices?.has(i.id) ? brl(prices.get(i.id)!) : "—"}</p>
                      : <p className="text-xs text-muted-foreground">Preço visível após login</p>}
                    <Button size="sm" className="w-full mt-2" onClick={() => setOpen(i)}>
                      {i.schedulable ? "Agendar serviço" : "Adicionar ao carrinho"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
      {open && <AddDialog item={open} price={prices?.get(open.id) ?? 0} logged={!!user} holidays={sched.data?.holidays} onClose={() => setOpen(null)} />}
    </div>
  );
};

const AddDialog = ({ item, price, logged, holidays, onClose }: { item: Item; price: number; logged: boolean; holidays?: Set<string>; onClose: () => void }) => {
  const [qty, setQty] = useState(1);
  const [custom, setCustom] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [date, setDate] = useState<string>();
  const [time, setTime] = useState<string>();
  const [notes, setNotes] = useState("");
  const allowFiles = item.accepts_files || (item.kind === "produto" && item.product_type === "digital");
  const dt = deadlineText(item, holidays);

  const pickFiles = (fl: FileList | null) => {
    if (!fl) return;
    const ok: File[] = [];
    for (const f of Array.from(fl)) { const err = validateFile(f); if (err) toast.error(`${f.name}: ${err}`); else ok.push(f); }
    setFiles((p) => [...p, ...ok].slice(0, 5));
  };

  const add = () => {
    if (!logged) { window.location.href = "/entrar?next=/produtos"; return; }
    if (item.schedulable && (!date || !time)) return toast.error("Escolha data e horário.");
    cartStore.add({
      key: crypto.randomUUID(), item_id: item.id, name: item.name, image_url: item.image_url, kind: item.kind,
      price_cents: price, quantity: item.schedulable ? 1 : qty, deadline_text: dt, custom, date, time, appt_notes: notes, files,
    });
    toast.success("Adicionado ao carrinho!");
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{item.name}</DialogTitle></DialogHeader>
        {item.image_url && <img src={item.image_url} alt="" className="w-full max-h-48 object-cover rounded" />}
        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
        {dt && <p className="text-sm font-semibold">{dt}</p>}
        {logged ? <p className="text-xl font-bold text-primary">{brl(price)}</p> : <p className="text-sm">Faça login ou crie sua conta para visualizar o preço.</p>}
        {!item.schedulable && (
          <div><Label>Quantidade</Label><Input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} /></div>
        )}
        {item.custom_fields.map((f) => (
          <div key={f}><Label>{f}</Label><Input value={custom[f] || ""} maxLength={200} onChange={(e) => setCustom({ ...custom, [f]: e.target.value })} /></div>
        ))}
        {item.custom_fields.length > 0 && (
          <div><Label>Observações</Label><Textarea value={custom["Observações"] || ""} maxLength={1000} onChange={(e) => setCustom({ ...custom, Observações: e.target.value })} /></div>
        )}
        {allowFiles && (
          <div>
            <Label>Enviar foto ou arquivo (JPG, PNG ou PDF, até 10 MB)</Label>
            <label className="mt-1 flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary text-sm">
              <Upload size={16} /> Selecionar arquivos
              <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" className="hidden" onChange={(e) => pickFiles(e.target.files)} />
            </label>
            {files.map((f, i) => (
              <p key={i} className="text-xs mt-1 flex justify-between">{f.name}<button className="text-destructive" onClick={() => setFiles(files.filter((_, j) => j !== i))}>remover</button></p>
            ))}
          </div>
        )}
        {item.schedulable && (
          <div>
            <Label>Escolha a data e o horário</Label>
            <SchedulePicker date={date} time={time} onChange={(d, t) => { setDate(d); setTime(t); }} />
            {date && time && <p className="text-sm font-semibold mt-2">Selecionado: {fmtDate(date)} às {time}</p>}
            <Label className="mt-2 block">Observação</Label>
            <Textarea value={notes} maxLength={1000} onChange={(e) => setNotes(e.target.value)} />
          </div>
        )}
        <Button onClick={add} className="w-full">{logged ? "Adicionar ao carrinho" : "Entrar para comprar"}</Button>
      </DialogContent>
    </Dialog>
  );
};

export default Produtos;
