import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { ShoppingCart, Plus, Minus, Trash2, Truck, MessageCircle, Package } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"shop_products">;

const BUSINESS_WHATSAPP = "5535998793630";
const CART_KEY = "rstech_cart_v1";

type CartLine = { product_id: string; quantity: number };
type FreteOption = { id: string; name: string; company: string; price_cents: number; delivery_days: number };

const brl = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Pedidos = () => {
  const [cart, setCart] = useState<CartLine[]>(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
  });
  const [openCart, setOpenCart] = useState(false);

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);

  const { data: products, isLoading } = useQuery({
    queryKey: ["shop_products_public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shop_products")
        .select("*")
        .eq("active", true)
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  const productMap = useMemo(
    () => new Map((products ?? []).map((p) => [p.id, p])),
    [products],
  );

  const addToCart = (id: string) => {
    setCart((c) => {
      const found = c.find((i) => i.product_id === id);
      if (found) return c.map((i) => (i.product_id === id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...c, { product_id: id, quantity: 1 }];
    });
    setOpenCart(true);
  };

  const updateQty = (id: string, delta: number) => {
    setCart((c) =>
      c
        .map((i) => (i.product_id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0),
    );
  };

  const removeFromCart = (id: string) => setCart((c) => c.filter((i) => i.product_id !== id));

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => {
    const p = productMap.get(i.product_id);
    return s + (p ? p.price_cents * i.quantity : 0);
  }, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-primary py-10 text-center">
          <div className="container mx-auto px-4">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
              <Package size={16} /> Loja RS Tech
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-2">
              Peça seus produtos
            </h1>
            <p className="text-primary-foreground/80 max-w-lg mx-auto">
              Escolha, calcule o frete pelo CEP e finalize direto conosco.
            </p>
          </div>
        </div>

        <section className="py-10 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">Produtos disponíveis</h2>
              <Sheet open={openCart} onOpenChange={setOpenCart}>
                <SheetTrigger asChild>
                  <Button variant="default" className="relative">
                    <ShoppingCart size={18} /> Carrinho
                    {cartCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center bg-secondary text-secondary-foreground text-xs font-bold rounded-full h-5 min-w-5 px-1">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <CartSheet
                  cart={cart}
                  products={productMap}
                  subtotal={subtotal}
                  updateQty={updateQty}
                  removeFromCart={removeFromCart}
                  onClose={() => setOpenCart(false)}
                  clearCart={() => setCart([])}
                />
              </Sheet>
            </div>

            {isLoading && <p className="text-muted-foreground">Carregando produtos...</p>}
            {!isLoading && (products?.length ?? 0) === 0 && (
              <div className="text-center py-16 border border-dashed border-border rounded-xl">
                <Package className="mx-auto text-muted-foreground mb-3" size={40} />
                <p className="text-muted-foreground">Nenhum produto cadastrado ainda.</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products?.map((p) => (
                <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <p className="font-semibold text-foreground line-clamp-2 min-h-[2.5rem]">{p.name}</p>
                    {p.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.description}</p>}
                    <p className="mt-2 font-display font-bold text-primary text-lg">{brl(p.price_cents)}</p>
                    <Button className="mt-3 w-full" size="sm" onClick={() => addToCart(p.id)} disabled={p.stock <= 0}>
                      {p.stock <= 0 ? "Esgotado" : (<><Plus size={14} /> Adicionar</>)}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

/* ============ CART SHEET ============ */

const CartSheet = ({
  cart, products, subtotal, updateQty, removeFromCart, onClose, clearCart,
}: {
  cart: CartLine[];
  products: Map<string, Product>;
  subtotal: number;
  updateQty: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  onClose: () => void;
  clearCart: () => void;
}) => {
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [customer, setCustomer] = useState({
    name: "", email: "", whatsapp: "",
    cep: "", address: "", number: "", complement: "",
    neighborhood: "", city: "", state: "",
  });
  const [notes, setNotes] = useState("");
  const [freteOptions, setFreteOptions] = useState<FreteOption[] | null>(null);
  const [freteSelected, setFreteSelected] = useState<FreteOption | null>(null);
  const [loadingFrete, setLoadingFrete] = useState(false);
  const [loadingViaCep, setLoadingViaCep] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const total = subtotal + (freteSelected?.price_cents ?? 0);

  const buscarCep = async () => {
    const cep = customer.cep.replace(/\D/g, "");
    if (cep.length !== 8) { toast.error("CEP inválido"); return; }
    setLoadingViaCep(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await r.json();
      if (data.erro) { toast.error("CEP não encontrado"); return; }
      setCustomer((c) => ({
        ...c,
        address: data.logradouro || c.address,
        neighborhood: data.bairro || c.neighborhood,
        city: data.localidade || c.city,
        state: data.uf || c.state,
      }));
    } catch { toast.error("Falha ao buscar CEP"); }
    finally { setLoadingViaCep(false); }
  };

  const calcularFrete = async () => {
    const cep = customer.cep.replace(/\D/g, "");
    if (cep.length !== 8) { toast.error("Informe o CEP de destino"); return; }
    if (cart.length === 0) return;

    setLoadingFrete(true);
    setFreteOptions(null);
    setFreteSelected(null);
    try {
      const items = cart.map((c) => {
        const p = products.get(c.product_id)!;
        return {
          weight_g: p.weight_g, width_cm: Number(p.width_cm),
          height_cm: Number(p.height_cm), length_cm: Number(p.length_cm),
          quantity: c.quantity,
        };
      });
      const { data, error } = await supabase.functions.invoke("calcular-frete", {
        body: { cep_destino: cep, items },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const opts = (data as any).options as FreteOption[];
      if (!opts || opts.length === 0) { toast.error("Nenhuma opção de frete disponível"); return; }
      setFreteOptions(opts);
      setFreteSelected(opts[0]);
    } catch (e: any) {
      toast.error(e.message || "Erro ao calcular frete");
    } finally { setLoadingFrete(false); }
  };

  const finalizar = async () => {
    if (!customer.name || !customer.email || !customer.whatsapp) {
      toast.error("Preencha nome, e-mail e WhatsApp"); return;
    }
    if (!customer.address || !customer.cep) { toast.error("Preencha o endereço"); return; }
    if (!freteSelected) { toast.error("Calcule e selecione o frete"); return; }

    setSubmitting(true);
    try {
      const items = cart.map((c) => ({ product_id: c.product_id, quantity: c.quantity }));
      const { data, error } = await supabase.functions.invoke("criar-pedido", {
        body: {
          customer, items,
          shipping: {
            service: `${freteSelected.company} - ${freteSelected.name}`,
            price_cents: freteSelected.price_cents,
            deadline_days: freteSelected.delivery_days,
          },
          notes,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      const orderId = (data as any).order_id as string;

      const lines = [
        `*Novo Pedido — RS Tech Loja*`,
        `Nº: ${orderId.slice(0, 8)}`,
        ``,
        `*Cliente:* ${customer.name}`,
        `E-mail: ${customer.email}`,
        `WhatsApp: ${customer.whatsapp}`,
        ``,
        `*Endereço:*`,
        `${customer.address}${customer.number ? ", " + customer.number : ""}${customer.complement ? " - " + customer.complement : ""}`,
        `${customer.neighborhood || ""} - ${customer.city || ""}/${customer.state || ""}`,
        `CEP ${customer.cep}`,
        ``,
        `*Itens:*`,
        ...cart.map((c) => {
          const p = products.get(c.product_id)!;
          return `• ${c.quantity}x ${p.name} - ${brl(p.price_cents * c.quantity)}`;
        }),
        ``,
        `Subtotal: ${brl(subtotal)}`,
        `Frete (${freteSelected.company} - ${freteSelected.name}, ~${freteSelected.delivery_days} dias): ${brl(freteSelected.price_cents)}`,
        `*Total: ${brl(total)}*`,
        notes ? `\nObs: ${notes}` : "",
      ].filter(Boolean).join("\n");

      const url = `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(lines)}`;
      window.open(url, "_blank");
      toast.success("Pedido registrado! Combine o pagamento pelo WhatsApp.");
      clearCart();
      setStep("cart");
      setFreteOptions(null); setFreteSelected(null);
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Falha ao criar pedido");
    } finally { setSubmitting(false); }
  };

  return (
    <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{step === "cart" ? "Seu carrinho" : "Finalizar pedido"}</SheetTitle>
      </SheetHeader>

      {step === "cart" && (
        <div className="mt-4 space-y-4">
          {cart.length === 0 && <p className="text-muted-foreground text-center py-10">Carrinho vazio.</p>}
          {cart.map((c) => {
            const p = products.get(c.product_id);
            if (!p) return null;
            return (
              <div key={c.product_id} className="flex gap-3 border-b border-border pb-3">
                <img src={p.image_url} alt={p.name} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground line-clamp-2">{p.name}</p>
                  <p className="text-primary font-bold text-sm mt-1">{brl(p.price_cents)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(c.product_id, -1)}><Minus size={12} /></Button>
                    <span className="text-sm font-semibold w-6 text-center">{c.quantity}</span>
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(c.product_id, +1)}><Plus size={12} /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 ml-auto" onClick={() => removeFromCart(c.product_id)}>
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          {cart.length > 0 && (
            <>
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>Subtotal</span><span>{brl(subtotal)}</span>
              </div>
              <Button className="w-full" size="lg" onClick={() => setStep("checkout")}>
                Continuar para entrega
              </Button>
            </>
          )}
        </div>
      )}

      {step === "checkout" && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2"><Label>Nome completo</Label><Input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} /></div>
            <div><Label>E-mail</Label><Input type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} /></div>
            <div><Label>WhatsApp</Label><Input value={customer.whatsapp} onChange={(e) => setCustomer({ ...customer, whatsapp: e.target.value })} placeholder="(35) 99999-9999" /></div>
            <div className="col-span-2 flex gap-2 items-end">
              <div className="flex-1"><Label>CEP</Label><Input value={customer.cep} onChange={(e) => setCustomer({ ...customer, cep: e.target.value })} placeholder="00000-000" /></div>
              <Button variant="outline" onClick={buscarCep} disabled={loadingViaCep}>{loadingViaCep ? "Buscando..." : "Buscar"}</Button>
            </div>
            <div className="col-span-2"><Label>Endereço</Label><Input value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} /></div>
            <div><Label>Número</Label><Input value={customer.number} onChange={(e) => setCustomer({ ...customer, number: e.target.value })} /></div>
            <div><Label>Complemento</Label><Input value={customer.complement} onChange={(e) => setCustomer({ ...customer, complement: e.target.value })} /></div>
            <div><Label>Bairro</Label><Input value={customer.neighborhood} onChange={(e) => setCustomer({ ...customer, neighborhood: e.target.value })} /></div>
            <div><Label>Cidade</Label><Input value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} /></div>
            <div className="col-span-2"><Label>Estado</Label><Input value={customer.state} onChange={(e) => setCustomer({ ...customer, state: e.target.value })} /></div>
          </div>

          <Button className="w-full" variant="outline" onClick={calcularFrete} disabled={loadingFrete}>
            <Truck size={16} /> {loadingFrete ? "Calculando..." : "Calcular frete"}
          </Button>

          {freteOptions && (
            <div className="space-y-2 border border-border rounded-lg p-3">
              <p className="text-sm font-semibold">Opções de envio</p>
              {freteOptions.map((o) => (
                <label key={o.id} className={`flex items-center justify-between p-2 rounded border cursor-pointer ${freteSelected?.id === o.id ? "border-primary bg-primary/5" : "border-border"}`}>
                  <div className="flex items-center gap-2">
                    <input type="radio" name="frete" checked={freteSelected?.id === o.id} onChange={() => setFreteSelected(o)} />
                    <div>
                      <p className="text-sm font-semibold">{o.company} — {o.name}</p>
                      <p className="text-xs text-muted-foreground">~{o.delivery_days} dias úteis</p>
                    </div>
                  </div>
                  <p className="font-bold text-primary">{brl(o.price_cents)}</p>
                </label>
              ))}
            </div>
          )}

          <div><Label>Observação (opcional)</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>

          <div className="border-t border-border pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{brl(subtotal)}</span></div>
            <div className="flex justify-between"><span>Frete</span><span>{freteSelected ? brl(freteSelected.price_cents) : "—"}</span></div>
            <div className="flex justify-between font-bold text-lg pt-1"><span>Total</span><span>{brl(total)}</span></div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep("cart")}>Voltar</Button>
            <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={finalizar} disabled={submitting || !freteSelected}>
              <MessageCircle size={16} /> {submitting ? "Enviando..." : "Enviar via WhatsApp"}
            </Button>
          </div>
        </div>
      )}
    </SheetContent>
  );
};

export default Pedidos;
