import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoreNav from "@/components/store/StoreNav";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { brl, cartStore, fmtDate, orderNumber, PAYMENT, PICKUP_CITY, STORE_WHATSAPP, useCart, useSession } from "@/lib/store";

const Carrinho = () => {
  const cart = useCart();
  const { user, loading } = useSession();
  const [f, setF] = useState({ name: "", email: "", whatsapp: "", city: "", state: "" });
  const [delivery, setDelivery] = useState<"retirada" | "outra_cidade">("retirada");
  const [payment, setPayment] = useState("pix");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const total = cart.reduce((s, c) => s + c.price_cents * c.quantity, 0);
  const [pct, setPct] = useState(0);
  const discount = Math.round(total * pct / 100);
  useEffect(() => { if (user) supabase.rpc("my_discount").then(({ data }) => setPct(Number((data as { percent?: number })?.percent) || 0)); }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name,email,whatsapp,city,state").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      setF({ name: data?.full_name || "", email: data?.email || user.email || "", whatsapp: data?.whatsapp || "", city: data?.city || "", state: data?.state || "" });
    });
  }, [user]);

  const freteMsg = () => {
    const txt = `Olá! Gostaria de consultar o frete para ${f.city || "minha cidade"} ${f.state}.\nItens: ${cart.map((c) => `${c.quantity}x ${c.name}`).join(", ")}`;
    window.open(`https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(txt)}`, "_blank");
  };

  const finalizar = async () => {
    if (!user) return toast.error("Faça login para finalizar o pedido.");
    if (f.name.trim().length < 2 || f.whatsapp.replace(/\D/g, "").length < 10) return toast.error("Preencha nome e WhatsApp.");
    const w = window.open("", "_blank");
    setBusy(true);
    try {
      const hasFiles = cart.some((c) => c.files?.length);
      const { data, error } = await supabase.rpc("create_order", {
        payload: {
          ...f, delivery, payment_method: payment, notes, has_files: hasFiles,
          items: cart.map((c) => ({ item_id: c.item_id, variant_id: c.variant_id, quantity: c.quantity, deadline_text: c.deadline_text, custom: c.custom || {}, date: c.date, time: c.time, appt_notes: c.appt_notes })),
        },
      });
      if (error) throw error;
      const o = data as { id: string; number: number; subtotal_cents: number; discount_cents?: number };
      const fresh = await supabase.from("orders").select("subtotal_cents,discount_cents").eq("id", o.id).maybeSingle();
      if (fresh.data) { o.subtotal_cents = fresh.data.subtotal_cents; o.discount_cents = fresh.data.discount_cents; }
      for (const c of cart) for (const file of c.files || []) {
        const path = `${user.id}/${o.id}/${crypto.randomUUID()}.${file.name.split(".").pop()?.toLowerCase()}`;
        const up = await supabase.storage.from("order-files").upload(path, file);
        if (!up.error) await supabase.from("order_files").insert({ order_id: o.id, user_id: user.id, path, file_name: file.name, item_name: c.name });
        else toast.error(`Falha ao enviar ${file.name}`);
      }
      const lines = cart.map((c) => {
        let l = `• ${c.quantity}x ${c.name} — ${brl(c.price_cents * c.quantity)}`;
        if (c.date && c.time) l += `\n  Agendamento: ${fmtDate(c.date)} às ${c.time}`;
        if (c.deadline_text) l += `\n  ${c.deadline_text}`;
        Object.entries(c.custom || {}).forEach(([k, v]) => v && (l += `\n  ${k}: ${v}`));
        return l;
      }).join("\n");
      const msg = `*Pedido ${orderNumber(o.number)} — RS Tech*\n\nCliente: ${f.name}\nWhatsApp: ${f.whatsapp}\nCidade: ${f.city} ${f.state}\n\n${lines}${o.discount_cents ? `\n\nDesconto indicação (5%): -${brl(o.discount_cents)}` : ""}\n\nTotal: ${brl(o.subtotal_cents)}\nRecebimento: ${delivery === "retirada" ? `Retirada em ${PICKUP_CITY}` : "Outra cidade (consultar frete)"}\nPagamento: ${PAYMENT[payment]}${hasFiles ? "\nArquivos enviados pelo site." : ""}${notes ? `\nObs: ${notes}` : ""}`;
      const url = `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(msg)}`;
      if (w) w.location.href = url; else window.location.href = url;
      cartStore.clear();
      toast.success(`Pedido ${orderNumber(o.number)} enviado!`);
    } catch (e) {
      w?.close();
      toast.error((e as Error).message || "Não foi possível finalizar o pedido.");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header /><StoreNav />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Carrinho</h1>
        {cart.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <p className="text-muted-foreground">Seu carrinho está vazio.</p>
            <Button asChild><Link to="/produtos">Ver produtos e serviços</Link></Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_340px] gap-6">
            <div className="space-y-3">
              {cart.map((c) => (
                <div key={c.key} className="flex gap-3 bg-card border border-border rounded-xl p-3">
                  <img src={c.image_url || logo} alt={c.name} className="w-20 h-20 object-cover rounded bg-muted" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{brl(c.price_cents)} cada</p>
                    {c.date && c.time && <p className="text-xs">Agendamento: {fmtDate(c.date)} às {c.time}</p>}
                    {c.deadline_text && <p className="text-xs">{c.deadline_text}</p>}
                    {!!c.files?.length && <p className="text-xs">{c.files.length} arquivo(s) anexado(s)</p>}
                    <div className="flex items-center gap-2 mt-2">
                      {!c.date && <Input type="number" min={1} max={999} value={c.quantity} className="w-20 h-8"
                        onChange={(e) => cartStore.update(c.key, { quantity: Math.max(1, Math.min(999, Number(e.target.value) || 1)) })} />}
                      <span className="font-semibold ml-auto">{brl(c.price_cents * c.quantity)}</span>
                      <Button size="icon" variant="ghost" aria-label="Remover" onClick={() => cartStore.remove(c.key)}><Trash2 size={16} /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-card border border-border rounded-xl p-4 space-y-3 h-fit">
              <p className="flex justify-between font-bold text-lg"><span>Subtotal</span><span>{brl(total)}</span></p>
              {discount > 0 && <><p className="flex justify-between text-success"><span>Desconto indicação (5%)</span><span>-{brl(discount)}</span></p><p className="flex justify-between font-bold text-lg"><span>Total</span><span>{brl(total - discount)}</span></p></>}
              {loading ? null : !user ? (
                <div className="space-y-2">
                  <p className="text-sm">Entre na sua conta para finalizar o pedido.</p>
                  <Button asChild className="w-full"><Link to="/entrar">Entrar ou criar conta</Link></Button>
                </div>
              ) : (
                <>
                  {(["name", "email", "whatsapp", "city", "state"] as const).map((k) => (
                    <div key={k}><Label>{{ name: "Nome", email: "E-mail", whatsapp: "WhatsApp", city: "Cidade", state: "Estado" }[k]}</Label>
                      <Input value={f[k]} maxLength={120} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>
                  ))}
                  <div><Label>Recebimento</Label>
                    <select className="w-full border border-input rounded-md h-10 px-2 bg-background" value={delivery} onChange={(e) => setDelivery(e.target.value as any)}>
                      <option value="retirada">Retirada em {PICKUP_CITY} (sem frete)</option>
                      <option value="outra_cidade">Outra cidade</option>
                    </select>
                    {delivery === "outra_cidade" && <Button variant="outline" className="w-full mt-2" onClick={freteMsg}>Consultar frete pelo WhatsApp</Button>}
                  </div>
                  <div><Label>Pagamento</Label>
                    <select className="w-full border border-input rounded-md h-10 px-2 bg-background" value={payment} onChange={(e) => setPayment(e.target.value)}>
                      {Object.entries(PAYMENT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div><Label>Observações</Label><Textarea value={notes} maxLength={2000} onChange={(e) => setNotes(e.target.value)} /></div>
                  <Button className="w-full" disabled={busy} onClick={finalizar}>{busy ? "Enviando..." : "FINALIZAR PEDIDO"}</Button>
                </>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
export default Carrinho;
