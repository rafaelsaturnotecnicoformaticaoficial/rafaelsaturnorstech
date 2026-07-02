import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, Upload, Pencil, Package, ClipboardList, MessageCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type SProduct = Tables<"shop_products">;
type SOrder = Tables<"shop_orders">;
type SItem = Tables<"shop_order_items">;

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const emptyProduct = {
  name: "", description: "", image_url: "",
  price_reais: "", stock: "10",
  weight_g: "300", width_cm: "15", height_cm: "10", length_cm: "20",
};

const ShopTab = () => (
  <Tabs defaultValue="products">
    <TabsList className="mb-4">
      <TabsTrigger value="products" className="gap-1"><Package size={14} /> Produtos</TabsTrigger>
      <TabsTrigger value="orders" className="gap-1"><ClipboardList size={14} /> Pedidos</TabsTrigger>
    </TabsList>
    <TabsContent value="products"><ShopProductsTab /></TabsContent>
    <TabsContent value="orders"><ShopOrdersTab /></TabsContent>
  </Tabs>
);

/* ============ PRODUCTS ============ */

const ShopProductsTab = () => {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyProduct);
  const [editing, setEditing] = useState<SProduct | null>(null);
  const [editForm, setEditForm] = useState(emptyProduct);
  const [uploading, setUploading] = useState(false);
  const [editUploading, setEditUploading] = useState(false);

  const uploadImage = async (file: File, isEdit = false) => {
    const setUp = isEdit ? setEditUploading : setUploading;
    setUp(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `shop/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("banners").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("banners").getPublicUrl(path);
      if (isEdit) setEditForm((f) => ({ ...f, image_url: data.publicUrl }));
      else setForm((f) => ({ ...f, image_url: data.publicUrl }));
      toast.success("Imagem enviada!");
    } catch (e: any) { toast.error(e.message); }
    finally { setUp(false); }
  };

  const { data: products } = useQuery({
    queryKey: ["admin_shop_products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shop_products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as SProduct[];
    },
  });

  const toRow = (f: typeof emptyProduct) => ({
    name: f.name,
    description: f.description || null,
    image_url: f.image_url,
    price_cents: Math.round(Number(f.price_reais.replace(",", ".")) * 100),
    stock: Number(f.stock) || 0,
    weight_g: Number(f.weight_g) || 300,
    width_cm: Number(f.width_cm) || 15,
    height_cm: Number(f.height_cm) || 10,
    length_cm: Number(f.length_cm) || 20,
  });

  const addMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("shop_products").insert(toRow(form));
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_shop_products"] });
      qc.invalidateQueries({ queryKey: ["shop_products_public"] });
      setForm(emptyProduct);
      toast.success("Produto adicionado!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updMut = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const { error } = await supabase.from("shop_products").update(toRow(editForm)).eq("id", editing.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_shop_products"] });
      qc.invalidateQueries({ queryKey: ["shop_products_public"] });
      setEditing(null);
      toast.success("Produto atualizado!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shop_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_shop_products"] });
      qc.invalidateQueries({ queryKey: ["shop_products_public"] });
      toast.success("Produto removido!");
    },
  });

  const toggleMut = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("shop_products").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_shop_products"] });
      qc.invalidateQueries({ queryKey: ["shop_products_public"] });
    },
  });

  const openEdit = (p: SProduct) => {
    setEditing(p);
    setEditForm({
      name: p.name, description: p.description || "", image_url: p.image_url,
      price_reais: (p.price_cents / 100).toFixed(2),
      stock: String(p.stock), weight_g: String(p.weight_g),
      width_cm: String(p.width_cm), height_cm: String(p.height_cm), length_cm: String(p.length_cm),
    });
  };

  const canSave = (f: typeof emptyProduct) => f.name && f.image_url && Number(f.price_reais.replace(",", ".")) > 0;

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4">Adicionar Produto</h3>
        <ProductFormFields form={form} setForm={setForm} uploading={uploading} uploadImage={uploadImage} />
        <Button className="mt-4" onClick={() => addMut.mutate()} disabled={!canSave(form) || addMut.isPending}>
          <Plus size={16} /> Adicionar
        </Button>
      </div>

      <div className="bg-background rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4">Produtos ({products?.length || 0})</h3>
        {(products?.length ?? 0) === 0 && <p className="text-muted-foreground">Nenhum produto cadastrado.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {products?.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <img src={p.image_url} alt={p.name} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{p.name}</p>
                <p className="text-sm text-primary font-bold">{brl(p.price_cents)}</p>
                <p className="text-xs text-muted-foreground">Estoque: {p.stock} · {p.weight_g}g</p>
              </div>
              <Switch checked={p.active} onCheckedChange={(active) => toggleMut.mutate({ id: p.id, active })} />
              <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil size={16} className="text-primary" /></Button>
              <Button variant="ghost" size="icon" onClick={() => delMut.mutate(p.id)}><Trash2 size={16} className="text-destructive" /></Button>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Produto</DialogTitle></DialogHeader>
          <ProductFormFields form={editForm} setForm={setEditForm} uploading={editUploading} uploadImage={(f) => uploadImage(f, true)} />
          <Button onClick={() => updMut.mutate()} disabled={!canSave(editForm) || updMut.isPending}>Salvar</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ProductFormFields = ({
  form, setForm, uploading, uploadImage,
}: {
  form: typeof emptyProduct;
  setForm: (f: typeof emptyProduct) => void;
  uploading: boolean;
  uploadImage: (file: File, isEdit?: boolean) => void;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="md:col-span-2"><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
    <div className="md:col-span-2"><Label>Descrição</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
    <div className="md:col-span-2">
      <Label>Imagem *</Label>
      <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="URL ou envie arquivo" />
      <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline mt-2">
        <Upload size={14} /> {uploading ? "Enviando..." : "Enviar imagem"}
        <input type="file" accept="image/*" className="hidden" disabled={uploading}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
      </label>
      {form.image_url && <img src={form.image_url} alt="" className="w-24 h-24 object-cover rounded mt-2" />}
    </div>
    <div><Label>Preço (R$) *</Label><Input value={form.price_reais} onChange={(e) => setForm({ ...form, price_reais: e.target.value })} placeholder="99.90" /></div>
    <div><Label>Estoque</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
    <div><Label>Peso (g)</Label><Input type="number" value={form.weight_g} onChange={(e) => setForm({ ...form, weight_g: e.target.value })} /></div>
    <div><Label>Largura (cm)</Label><Input type="number" value={form.width_cm} onChange={(e) => setForm({ ...form, width_cm: e.target.value })} /></div>
    <div><Label>Altura (cm)</Label><Input type="number" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} /></div>
    <div><Label>Comprimento (cm)</Label><Input type="number" value={form.length_cm} onChange={(e) => setForm({ ...form, length_cm: e.target.value })} /></div>
  </div>
);

/* ============ ORDERS ============ */

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  pago: "bg-blue-100 text-blue-800",
  enviado: "bg-purple-100 text-purple-800",
  entregue: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

const ShopOrdersTab = () => {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selected, setSelected] = useState<SOrder | null>(null);

  const { data: orders } = useQuery({
    queryKey: ["admin_shop_orders", statusFilter],
    queryFn: async () => {
      let q = supabase.from("shop_orders").select("*").order("created_at", { ascending: false });
      if (statusFilter !== "todos") q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data as SOrder[];
    },
  });

  const { data: items } = useQuery({
    queryKey: ["admin_shop_order_items", selected?.id],
    enabled: !!selected,
    queryFn: async () => {
      const { data, error } = await supabase.from("shop_order_items").select("*").eq("order_id", selected!.id);
      if (error) throw error;
      return data as SItem[];
    },
  });

  const updMut = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<SOrder> }) => {
      const { error } = await supabase.from("shop_orders").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_shop_orders"] });
      toast.success("Pedido atualizado!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shop_orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_shop_orders"] });
      setSelected(null);
      toast.success("Pedido excluído!");
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-xl border border-border p-4 flex flex-wrap gap-3 items-center">
        <span className="text-sm font-semibold">Status:</span>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="enviado">Enviado</SelectItem>
            <SelectItem value="entregue">Entregue</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-background rounded-xl border border-border p-6">
        <h3 className="font-display font-bold text-lg mb-4">Pedidos ({orders?.length || 0})</h3>
        {(orders?.length ?? 0) === 0 && <p className="text-muted-foreground">Nenhum pedido.</p>}
        <div className="space-y-3">
          {orders?.map((o) => (
            <div key={o.id} className="p-4 border border-border rounded-lg">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold text-foreground">{o.customer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    #{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-sm mt-1">{o.city}/{o.state} · CEP {o.cep}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColors[o.status]}`}>{o.status}</span>
                  <p className="font-bold text-primary text-lg mt-1">{brl(o.total_cents)}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => setSelected(o)}>Ver detalhes</Button>
                <a href={`https://wa.me/55${o.customer_whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline" className="text-green-700"><MessageCircle size={14} /> WhatsApp</Button>
                </a>
                <Select value={o.status} onValueChange={(status) => updMut.mutate({ id: o.id, patch: { status } })}>
                  <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Pedido #{selected?.id.slice(0, 8)}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold">Cliente</p>
                <p>{selected.customer_name} · {selected.customer_email} · {selected.customer_whatsapp}</p>
              </div>
              <div>
                <p className="font-semibold">Endereço</p>
                <p>{selected.address}{selected.address_number ? ", " + selected.address_number : ""}{selected.address_complement ? " - " + selected.address_complement : ""}</p>
                <p>{selected.neighborhood} - {selected.city}/{selected.state} · CEP {selected.cep}</p>
              </div>
              <div>
                <p className="font-semibold">Itens</p>
                {items?.map((i) => (
                  <p key={i.id}>{i.quantity}x {i.product_name} - {brl(i.unit_price_cents * i.quantity)}</p>
                ))}
              </div>
              <div className="border-t pt-2 space-y-1">
                <p>Subtotal: {brl(selected.subtotal_cents)}</p>
                <p>Frete ({selected.shipping_service}, {selected.shipping_deadline_days} dias): {brl(selected.shipping_cents)}</p>
                <p className="font-bold text-lg">Total: {brl(selected.total_cents)}</p>
              </div>
              {selected.notes && <div><p className="font-semibold">Observação</p><p>{selected.notes}</p></div>}
              <div>
                <Label>Código de rastreio</Label>
                <div className="flex gap-2">
                  <Input defaultValue={selected.tracking_code || ""} onBlur={(e) => {
                    if (e.target.value !== (selected.tracking_code || "")) {
                      updMut.mutate({ id: selected.id, patch: { tracking_code: e.target.value } });
                    }
                  }} />
                </div>
              </div>
              <Button variant="destructive" size="sm" onClick={() => delMut.mutate(selected.id)}>
                <Trash2 size={14} /> Excluir pedido
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShopTab;
