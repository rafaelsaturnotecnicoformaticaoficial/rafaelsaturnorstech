import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer, MessageCircle, Truck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BUSINESS_WHATSAPP = "5535998793630";

const brl = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type FreteOption = { id: string; name: string; company: string; price_cents: number; delivery_days: number };

// Preços por folha (em centavos). Faixas: 1-10, 11-50, 51-200, 201+
const PRICES = {
  pb: {
    frente:      [100, 80, 60, 40],  // 1,00 / 0,80 / 0,60 / 0,40
    frente_verso:[150, 120, 90, 60], // 1,50 / 1,20 / 0,90 / 0,60
  },
  color: {
    frente:      [300, 250, 200, 150],
    frente_verso:[500, 400, 320, 250],
  },
} as const;

const tierIndex = (qty: number) =>
  qty <= 10 ? 0 : qty <= 50 ? 1 : qty <= 200 ? 2 : 3;

type Color = "pb" | "color";
type Face = "frente" | "frente_verso";
type Delivery = "retirada" | "local" | "correio";

const LOCAL_FEE_CENTS = 1000; // R$ 10 entrega local São Pedro da União - MG
const PICKUP_LOCATION = "São Pedro da União - MG";

const PrintingService = () => {
  const [color, setColor] = useState<Color>("pb");
  const [face, setFace] = useState<Face>("frente");
  const [qty, setQty] = useState<number>(10);
  const [delivery, setDelivery] = useState<Delivery>("retirada");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [cep, setCep] = useState("");
  const [notes, setNotes] = useState("");
  const [freteOptions, setFreteOptions] = useState<FreteOption[] | null>(null);
  const [freteSelected, setFreteSelected] = useState<FreteOption | null>(null);
  const [loadingFrete, setLoadingFrete] = useState(false);

  const sheets = Math.max(1, qty);
  const pagesPerSheet = face === "frente" ? 1 : 2;
  const pages = sheets * pagesPerSheet;

  const unit = useMemo(
    () => PRICES[color][face][tierIndex(sheets)],
    [color, face, sheets],
  );

  const subtotal = unit * sheets;
  const shipping =
    delivery === "retirada"
      ? 0
      : delivery === "local"
      ? LOCAL_FEE_CENTS
      : freteSelected?.price_cents ?? 0;
  const total = subtotal + shipping;

  const calcularFreteCorreios = async () => {
    const cepClean = cep.replace(/\D/g, "");
    if (cepClean.length !== 8) {
      toast.error("Informe um CEP válido");
      return;
    }
    setLoadingFrete(true);
    setFreteOptions(null);
    setFreteSelected(null);
    try {
      // Papel A4 75g/m² ≈ 5g/folha. Envelope/pacote pequeno.
      const totalWeight = Math.max(100, sheets * 5);
      const items = [{
        weight_g: totalWeight,
        width_cm: 22,
        height_cm: Math.max(2, Math.ceil(sheets / 100)),
        length_cm: 32,
        quantity: 1,
      }];
      const { data, error } = await supabase.functions.invoke("calcular-frete", {
        body: { cep_destino: cepClean, items },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const opts = (data as any).options as FreteOption[];
      if (!opts?.length) { toast.error("Nenhuma opção de frete disponível"); return; }
      setFreteOptions(opts);
      setFreteSelected(opts[0]);
    } catch (e: any) {
      toast.error(e.message || "Erro ao calcular frete");
    } finally { setLoadingFrete(false); }
  };

  const enviar = () => {
    if (!name.trim() || !whatsapp.trim()) {
      toast.error("Preencha seu nome e WhatsApp");
      return;
    }
    if (delivery !== "retirada" && !address.trim()) {
      toast.error("Informe o endereço de entrega");
      return;
    }
    if (delivery === "correio" && !freteSelected) {
      toast.error("Calcule e selecione o frete dos Correios");
      return;
    }


    const lines = [
      "*Pedido — Impressão / Xerox — RS Tech*",
      "",
      `*Cliente:* ${name}`,
      `WhatsApp: ${whatsapp}`,
      "",
      `Tipo: ${color === "pb" ? "Preto e Branco" : "Colorida"}`,
      `Impressão: ${face === "frente" ? "Frente" : "Frente e Verso"}`,
      `Folhas: ${sheets}`,
      `Páginas impressas: ${pages} (${pagesPerSheet} por folha)`,
      `Valor por folha: ${brl(unit)}`,
      `Subtotal: ${brl(subtotal)}`,
      "",
      `Entrega: ${
        delivery === "retirada"
          ? `Retirada na loja — ${PICKUP_LOCATION} (grátis)`
          : delivery === "local"
          ? `Entrega em ${PICKUP_LOCATION} (${brl(LOCAL_FEE_CENTS)})`
          : `Correios (${freteSelected?.company} ${freteSelected?.name} — ${brl(freteSelected?.price_cents ?? 0)}, ~${freteSelected?.delivery_days ?? 0} dias)`
      }`,
      delivery !== "retirada" ? `Endereço: ${address}` : "",
      "",
      `*Total: ${brl(total)}*`,
      notes ? `\nObs: ${notes}` : "",
      "\nVou enviar o arquivo (PDF/DOC/imagem) por aqui.",
    ]
      .filter(Boolean)
      .join("\n");

    window.open(
      `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(lines)}`,
      "_blank",
    );
    toast.success("Pedido enviado! Envie o arquivo pelo WhatsApp.");
  };


  return (
    <section className="mb-8 bg-card border-2 border-primary/30 rounded-2xl overflow-hidden shadow-md">
      <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 flex items-center gap-2">
        <Printer className="text-primary" size={22} />
        <div>
          <h2 className="font-display font-bold text-lg text-foreground">
            Serviço de Impressão e Xerox
          </h2>
          <p className="text-xs text-muted-foreground">
            Preço por folha muda conforme a quantidade. Cálculo automático.
          </p>
        </div>
      </div>

      <div className="p-4 grid md:grid-cols-2 gap-4">
        {/* Configuração */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold">Tipo de impressão</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {(["pb", "color"] as Color[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`px-3 py-2 rounded-lg border text-sm font-semibold transition ${
                    color === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {c === "pb" ? "Preto e Branco" : "Colorida"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold">Face</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {(["frente", "frente_verso"] as Face[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFace(f)}
                  className={`px-3 py-2 rounded-lg border text-sm font-semibold transition ${
                    face === f
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {f === "frente" ? "Só Frente" : "Frente e Verso"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold">Quantidade de folhas</Label>
            <Input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Faixas: 1–10 · 11–50 · 51–200 · 201+ (quanto mais, mais barato)
            </p>
          </div>

          <div>
            <Label className="text-sm font-semibold flex items-center gap-1">
              <Truck size={14} /> Entrega
            </Label>
            <div className="grid gap-2 mt-1">
              {(
                [
                  { v: "retirada", label: `Retirar na loja — ${PICKUP_LOCATION}`, price: "Grátis" },
                  { v: "local", label: `Entrega em ${PICKUP_LOCATION}`, price: brl(LOCAL_FEE_CENTS) },
                  { v: "correio", label: "Envio pelos Correios (SuperFrete)", price: freteSelected ? brl(freteSelected.price_cents) : "Calcular" },
                ] as { v: Delivery; label: string; price: string }[]
              ).map((opt) => (
                <label
                  key={opt.v}
                  className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer text-sm ${
                    delivery === opt.v
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="printing-delivery"
                      checked={delivery === opt.v}
                      onChange={() => setDelivery(opt.v)}
                    />
                    {opt.label}
                  </span>
                  <span className="font-semibold text-primary">{opt.price}</span>
                </label>
              ))}
            </div>

            {delivery === "correio" && (
              <div className="mt-3 border border-border rounded-lg p-3 space-y-2 bg-muted/30">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">CEP de destino</Label>
                    <Input value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" />
                  </div>
                  <Button variant="outline" size="sm" onClick={calcularFreteCorreios} disabled={loadingFrete}>
                    {loadingFrete ? "Calculando..." : "Calcular"}
                  </Button>
                </div>
                {freteOptions && (
                  <div className="space-y-1">
                    {freteOptions.map((o) => (
                      <label key={o.id} className={`flex items-center justify-between p-2 rounded border cursor-pointer text-xs ${freteSelected?.id === o.id ? "border-primary bg-primary/5" : "border-border"}`}>
                        <span className="flex items-center gap-2">
                          <input type="radio" name="printing-frete" checked={freteSelected?.id === o.id} onChange={() => setFreteSelected(o)} />
                          <span>{o.company} — {o.name} <span className="text-muted-foreground">(~{o.delivery_days}d)</span></span>
                        </span>
                        <span className="font-semibold text-primary">{brl(o.price_cents)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resumo + dados */}
        <div className="space-y-3">
          <div className="bg-muted/40 rounded-lg p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Folhas</span>
              <span className="font-semibold">{sheets}</span>
            </div>
            <div className="flex justify-between">
              <span>Páginas impressas</span>
              <span className="font-semibold">
                {pages} <span className="text-xs text-muted-foreground">({pagesPerSheet}/folha)</span>
              </span>
            </div>
            <div className="flex justify-between">
              <span>Valor por folha</span>
              <span className="font-semibold">{brl(unit)}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal ({sheets} folha{sheets > 1 ? "s" : ""})</span>
              <span className="font-semibold">{brl(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Entrega</span>
              <span className="font-semibold">
                {shipping === 0 ? "Grátis" : brl(shipping)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-1 border-t border-border mt-1">
              <span>Total</span>
              <span className="text-primary">{brl(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <Label className="text-xs">Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">WhatsApp</Label>
              <Input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(35) 99999-9999"
              />
            </div>
            {delivery !== "retirada" && (
              <div className="col-span-2">
                <Label className="text-xs">Endereço de entrega</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, nº, bairro, cidade"
                />
              </div>
            )}
            <div className="col-span-2">
              <Label className="text-xs">Observação (opcional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: colorido só nas páginas 3 e 7"
              />
            </div>
          </div>

          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
            onClick={enviar}
          >
            <MessageCircle size={16} /> Pedir pelo WhatsApp
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">
            Envie o arquivo (PDF, DOC ou imagem) pelo WhatsApp após confirmar o pedido.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PrintingService;
