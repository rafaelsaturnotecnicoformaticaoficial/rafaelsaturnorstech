import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ORDER_STATUS, PAYMENT, brl, orderNumber } from "@/lib/store";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export default function StoreOrdersTab() {
  const qc = useQueryClient(); const [filter,setFilter] = useState("todos"); const [selected,setSelected] = useState<string | null>(null); const [busy,setBusy] = useState(false);
  const { data: orders, isLoading, error } = useQuery({ queryKey:["admin_orders"],queryFn:async()=>{ const { data,error }=await supabase.from("orders").select("*").order("created_at",{ascending:false}); if(error)throw error; return data; }});
  const order = orders?.find(o=>o.id===selected);
  const { data: detail }=useQuery({ queryKey:["admin_order_detail",selected],enabled:!!selected,queryFn:async()=>{ if(!selected)return null; const [items,files]=await Promise.all([supabase.from("order_items").select("*").eq("order_id",selected),supabase.from("order_files").select("*").eq("order_id",selected)]); if(items.error)throw items.error;if(files.error)throw files.error; return { items:items.data,files:files.data }; }});
  const update=async(id:string,status:string)=>{setBusy(true);const {error}=await supabase.from("orders").update({status}).eq("id",id);setBusy(false);if(error)toast.error(error.message);else {qc.invalidateQueries({queryKey:["admin_orders"]});toast.success("Status atualizado.");}};
  const statusSelect=(o:Tables<"orders">)=><Select value={o.status} disabled={busy} onValueChange={v=>update(o.id,v)}><SelectTrigger aria-label={`Status ${orderNumber(o.number)}`} className="w-56"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(ORDER_STATUS).map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select>;
  return <div className="space-y-4"><h2 className="text-xl font-bold">Pedidos do catálogo</h2><Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-64" aria-label="Filtrar pedidos"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos os status</SelectItem>{Object.entries(ORDER_STATUS).map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select>
    {isLoading&&<p>Carregando pedidos...</p>}{error&&<p className="text-destructive">Não foi possível carregar os pedidos.</p>}
    {orders?.filter(o=>filter==="todos"||o.status===filter).map(o=><div key={o.id} className="border border-border bg-card rounded-lg p-4 flex flex-wrap gap-3 items-center justify-between"><div><p className="font-bold">{orderNumber(o.number)} · {o.customer_name}</p><p className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleString("pt-BR")} · {brl(o.subtotal_cents)}</p></div><div className="flex flex-wrap gap-2">{statusSelect(o)}<Button variant="outline" onClick={()=>setSelected(o.id)}>Ver pedido</Button></div></div>)}
    {orders?.filter(o=>filter==="todos"||o.status===filter).length===0&&<p className="text-muted-foreground">Nenhum pedido encontrado.</p>}
    <Dialog open={!!selected} onOpenChange={o=>!o&&setSelected(null)}><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Pedido {order?orderNumber(order.number):""}</DialogTitle></DialogHeader>{order&&<div className="space-y-4"><div><p className="font-bold">{order.customer_name}</p><p className="break-words">{order.customer_email} · {order.customer_whatsapp}</p><p>{order.city}/{order.state}</p></div><p>Entrega: {order.delivery==="retirada"?"Retirada":"Outra cidade — frete sob consulta"}</p><p>Pagamento: {PAYMENT[order.payment_method]??order.payment_method}</p>{statusSelect(order)}
      <div className="border-t border-border pt-3">{detail?.items.map(i=><div key={i.id} className="py-2"><p className="font-semibold">{i.quantity}× {i.name} — {brl(i.unit_price_cents*i.quantity)}</p>{i.deadline_text&&<p className="text-sm">{i.deadline_text}</p>}{Object.entries((i.custom_data??{}) as Record<string,unknown>).map(([k,v])=><p className="text-sm break-words" key={k}>{k}: {String(v)}</p>)}</div>)}<p className="font-bold">Total: {brl(order.subtotal_cents)}</p></div>{order.notes&&<p className="break-words">Observações: {order.notes}</p>}
      <div><h3 className="font-bold">Arquivos</h3>{detail?.files.length===0&&<p className="text-sm text-muted-foreground">Nenhum arquivo.</p>}{detail?.files.map(f=><Button key={f.id} variant="link" className="block max-w-full truncate" onClick={async()=>{const {data,error}=await supabase.storage.from("order-files").createSignedUrl(f.path,60);if(error)toast.error("Não foi possível abrir o arquivo.");else window.open(data.signedUrl,"_blank","noopener,noreferrer");}}>{f.file_name}</Button>)}</div>
      <Button asChild variant="outline"><a href={`https://wa.me/${order.customer_whatsapp.replace(/\D/g,"").replace(/^(?!55)/,"55")}`} target="_blank" rel="noreferrer">WhatsApp do cliente</a></Button>
    </div>}</DialogContent></Dialog>
  </div>;
}
