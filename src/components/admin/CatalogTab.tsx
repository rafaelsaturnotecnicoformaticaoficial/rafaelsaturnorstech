import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { brl } from "@/lib/store";
import logo from "@/assets/logo.png";
import type { TablesInsert } from "@/integrations/supabase/types";

const blank = { id: "", name: "", description: "", image_url: "", kind: "produto", product_type: "fisico", category_id: "", price: "", stock: "", active: true, accepts_files: false, schedulable: false, deadline_type: "nenhum", deadline_days: "5", duration_minutes: "30", custom_fields: "", sort_order: "0" };
export default function CatalogTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categoryEdit, setCategoryEdit] = useState<string | null>(null);
  const { data, isLoading, error } = useQuery({ queryKey: ["admin_catalog"], queryFn: async () => {
    const [items, prices, cats] = await Promise.all([supabase.from("catalog_items").select("*").order("name"), supabase.from("catalog_prices").select("*"), supabase.from("categories").select("*").order("sort_order")]);
    if (items.error) throw items.error; if (prices.error) throw prices.error; if (cats.error) throw cats.error;
    return { items: items.data, prices: new Map(prices.data.map(p => [p.item_id, p.price_cents])), cats: cats.data };
  }});
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin_catalog"] }); qc.invalidateQueries({ queryKey: ["catalog_public"] }); qc.invalidateQueries({ queryKey: ["catalog_prices"] }); qc.invalidateQueries({ queryKey: ["categories"] }); };
  const field = (key: keyof typeof blank, label: string, type = "text") => <div><Label htmlFor={`catalog-${key}`}>{label}</Label><Input id={`catalog-${key}`} type={type} value={String(form[key])} onChange={e => setForm({ ...form, [key]: e.target.value })} /></div>;
  const select = (key: keyof typeof blank, label: string, values: [string, string][]) => <div><Label>{label}</Label><Select value={String(form[key]) || "none"} onValueChange={v => setForm({ ...form, [key]: v === "none" ? "" : v })}><SelectTrigger aria-label={label}><SelectValue /></SelectTrigger><SelectContent>{values.map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div>;
  const save = async () => {
    const price = Number(form.price.replace(",", "."));
    if (!form.name.trim() || !form.price.trim() || !Number.isFinite(price) || price < 0) return toast.error("Informe nome e preço válido.");
    if (form.stock !== "" && (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0)) return toast.error("Estoque deve ser um número inteiro positivo.");
    if (form.deadline_type === "personalizado" && Number(form.deadline_days) < 1) return toast.error("Informe um prazo válido.");
    setBusy(true);
    try {
      const id = form.id || crypto.randomUUID();
      const row: TablesInsert<"catalog_items"> = { id, name: form.name.trim(), description: form.description || null, image_url: form.image_url || null, kind: form.kind, product_type: form.product_type, category_id: form.category_id || null, stock: form.stock === "" ? null : Number(form.stock), active: form.active, accepts_files: form.accepts_files, schedulable: form.schedulable, deadline_type: form.deadline_type, deadline_days: form.deadline_type === "personalizado" ? Number(form.deadline_days) : null, duration_minutes: form.schedulable ? Number(form.duration_minutes) || 30 : null, custom_fields: form.custom_fields.split(",").map(s => s.trim()).filter(Boolean), sort_order: Number(form.sort_order) || 0 };
      const result = await supabase.from("catalog_items").upsert(row); if (result.error) throw result.error;
      setForm(f => ({ ...f, id }));
      const priced = await supabase.from("catalog_prices").upsert({ item_id: id, price_cents: Math.round(price * 100) }); if (priced.error) throw priced.error;
      refresh(); setOpen(false); toast.success("Item salvo!");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Não foi possível salvar o item."); } finally { setBusy(false); }
  };
  const remove = async (id: string) => {
    if (!window.confirm("Excluir este item do catálogo? Os pedidos existentes serão preservados.")) return;
    const { error } = await supabase.from("catalog_items").delete().eq("id", id);
    if (error) toast.error(error.message); else { refresh(); toast.success("Item excluído."); }
  };
  return <div className="space-y-6">
    <div className="flex flex-wrap gap-3 justify-between"><h2 className="text-xl font-bold">Produtos e Serviços</h2><Button onClick={() => { setForm(blank); setOpen(true); }}><Plus size={16} /> Novo item</Button></div>
    <Input aria-label="Buscar no catálogo" placeholder="Buscar por nome" value={search} onChange={e => setSearch(e.target.value)} />
    {isLoading && <p>Carregando catálogo...</p>}{error && <p className="text-destructive">Não foi possível carregar o catálogo.</p>}
    <div className="grid md:grid-cols-2 gap-3">{data?.items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).map(i => <div key={i.id} className="border border-border rounded-lg p-3 flex gap-3 items-center bg-card">
      <img src={i.image_url || logo} alt={i.name} className="w-16 h-16 object-contain" /><div className="min-w-0 flex-1"><p className="font-bold break-words">{i.name}</p><p>{brl(data.prices.get(i.id) ?? 0)}</p><p className="text-sm text-muted-foreground">{i.kind === "servico" ? "Serviço" : "Produto"} · {i.active ? "Ativo" : "Inativo"}</p></div>
      <Button variant="ghost" size="icon" aria-label={`Editar ${i.name}`} title="Editar" onClick={() => { setForm({ ...blank, ...i, id: i.id, description: i.description || "", image_url: i.image_url || "", category_id: i.category_id || "", price: ((data.prices.get(i.id) ?? 0) / 100).toFixed(2), stock: i.stock === null ? "" : String(i.stock), deadline_days: String(i.deadline_days ?? 5), duration_minutes: String(i.duration_minutes ?? 30), custom_fields: i.custom_fields.join(", "), sort_order: String(i.sort_order) }); setOpen(true); }}><Pencil size={16} /></Button>
      <Button variant="ghost" size="icon" aria-label={`Excluir ${i.name}`} title="Excluir" onClick={() => remove(i.id)}><Trash2 size={16} className="text-destructive" /></Button>
    </div>)}</div>
    {data?.items.length === 0 && <p className="text-muted-foreground">Nenhum item cadastrado.</p>}
    <section className="border-t border-border pt-5"><h2 className="text-xl font-bold mb-3">Categorias</h2><div className="flex gap-2 mb-4"><Input aria-label="Nome da categoria" placeholder="Nome da categoria" value={category} onChange={e => setCategory(e.target.value)} /><Button disabled={!category.trim()} onClick={async () => {
      const row = { name: category.trim() }; const result = categoryEdit ? await supabase.from("categories").update(row).eq("id", categoryEdit) : await supabase.from("categories").insert(row);
      if (result.error) toast.error(result.error.message); else { setCategory(""); setCategoryEdit(null); refresh(); toast.success("Categoria salva."); }
    }}>{categoryEdit ? "Salvar categoria" : "Adicionar categoria"}</Button>{categoryEdit && <Button variant="outline" onClick={() => { setCategoryEdit(null); setCategory(""); }}>Cancelar</Button>}</div>
      <div className="flex flex-wrap gap-3">{data?.cats.map(c => <div key={c.id} className="flex items-center border border-border rounded p-2"><span>{c.name}</span><Button variant="ghost" size="icon" aria-label={`Editar categoria ${c.name}`} onClick={() => { setCategoryEdit(c.id); setCategory(c.name); }}><Pencil size={14} /></Button><Button variant="ghost" size="icon" aria-label={`Excluir categoria ${c.name}`} onClick={async () => { if (!window.confirm(`Excluir categoria ${c.name}?`)) return; const { error } = await supabase.from("categories").delete().eq("id", c.id); if (error) toast.error(error.message); else refresh(); }}><Trash2 size={14} /></Button></div>)}</div>
    </section>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{form.id ? "Editar item" : "Novo item"}</DialogTitle></DialogHeader>
      <div className="grid sm:grid-cols-2 gap-4">{field("name", "Nome *")}{field("price", "Preço (R$) *")}
        {select("kind", "Tipo", [["produto","Produto"],["servico","Serviço"]])}{select("product_type", "Formato do produto", [["fisico","Físico"],["digital","Digital"]])}
        {select("category_id", "Categoria", [["none","Sem categoria"], ...(data?.cats.map(c => [c.id,c.name] as [string,string]) ?? [])])}{field("stock", "Estoque (vazio = sem limite)", "number")}
        <div className="sm:col-span-2"><Label htmlFor="catalog-description">Descrição</Label><Textarea id="catalog-description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div className="sm:col-span-2">{field("image_url", "URL da imagem") }<Label className="block mt-2" htmlFor="catalog-upload">Enviar imagem</Label><Input id="catalog-upload" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async e => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 10 * 1024 * 1024) return toast.error("Imagem maior que 10 MB."); setBusy(true); try { const path = `catalog/${crypto.randomUUID()}.${file.name.split('.').pop()}`; const { error } = await supabase.storage.from("banners").upload(path,file); if (error) throw error; setForm(f => ({ ...f,image_url:supabase.storage.from("banners").getPublicUrl(path).data.publicUrl })); } catch { toast.error("Não foi possível enviar a imagem."); } finally { setBusy(false); } }} /></div>
        {select("deadline_type", "Prazo", [["nenhum","Sem prazo"],["5","5 dias úteis"],["10","10 dias úteis"],["personalizado","Personalizado"],["consulta","Sob consulta"]])}{form.deadline_type === "personalizado" && field("deadline_days", "Dias úteis", "number")}
        {field("duration_minutes", "Duração (minutos)", "number")}{field("sort_order", "Ordem de exibição", "number")}{field("custom_fields", "Campos personalizados (separados por vírgula)")}
        {([['active','Ativo'],['accepts_files','Aceita arquivos'],['schedulable','Permite agendamento']] as const).map(([k,l]) => <div key={k} className="flex justify-between items-center gap-2"><Label htmlFor={`catalog-${k}`}>{l}</Label><Switch id={`catalog-${k}`} checked={form[k]} onCheckedChange={v => setForm({ ...form,[k]:v })} /></div>)}
      </div><Button disabled={busy} onClick={save}>{busy ? "Salvando..." : "Salvar item"}</Button>
    </DialogContent></Dialog>
  </div>;
}
