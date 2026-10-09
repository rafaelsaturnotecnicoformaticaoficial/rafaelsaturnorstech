import { useEffect, useState, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const STORE_WHATSAPP = "5535998793630";
export const PICKUP_CITY = "São Pedro da União - MG";
export const ALLOWED_EXT = ["jpg", "jpeg", "png", "pdf"];
export const MAX_FILE_MB = 10;

export const orderNumber = (n: number) => `#${String(n).padStart(4, "0")}`;

export const ORDER_STATUS: Record<string, string> = {
  aguardando_confirmacao: "Aguardando confirmação",
  confirmado: "Confirmado",
  em_producao: "Em produção",
  pronto: "Pronto",
  aguardando_retirada: "Aguardando retirada",
  concluido: "Concluído",
  cancelado: "Cancelado",
};
export const APPT_STATUS: Record<string, string> = {
  solicitado: "Solicitado",
  confirmado: "Confirmado",
  agendado: "Agendado",
  em_atendimento: "Em atendimento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};
export const PAYMENT: Record<string, string> = { pix: "PIX", dinheiro: "Dinheiro", debito: "Cartão de débito", credito: "Cartão de crédito" };

/* ---------- datas / dias úteis ---------- */
export const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const fmtDate = (s: string) => s.split("-").reverse().join("/");

export const addBusinessDays = (start: Date, days: number, holidays: Set<string>) => {
  const d = new Date(start);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6 && !holidays.has(ymd(d))) added++;
  }
  return d;
};

export type DeadlineItem = { deadline_type: string; deadline_days: number | null };
export const deadlineDays = (i: DeadlineItem) =>
  i.deadline_type === "5" ? 5 : i.deadline_type === "10" ? 10 : i.deadline_type === "personalizado" ? i.deadline_days ?? null : null;

export const deadlineText = (i: DeadlineItem, holidays?: Set<string>) => {
  if (i.deadline_type === "consulta") return "Prazo sob consulta";
  const n = deadlineDays(i);
  if (!n) return null;
  let t = `Prazo estimado: até ${n} dias úteis.`;
  if (holidays) t += ` (previsão ${addBusinessDays(new Date(), n, holidays).toLocaleDateString("pt-BR")})`;
  return t;
};

/* ---------- auth ---------- */
export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    return () => data.subscription.unsubscribe();
  }, []);
  return { session, user: session?.user ?? null, loading };
};

/* ---------- carrinho ---------- */
export type CartItem = {
  key: string;
  item_id: string;
  name: string;
  image_url: string | null;
  kind: string;
  price_cents: number;
  quantity: number;
  deadline_text?: string | null;
  custom?: Record<string, string>;
  date?: string;
  time?: string;
  appt_notes?: string;
  files?: File[]; // apenas em memória
};

const KEY = "rstech_cart_v1";
let cart: CartItem[] = (() => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
})();
const listeners = new Set<() => void>();
const emit = () => {
  localStorage.setItem(KEY, JSON.stringify(cart.map(({ files, ...r }) => r)));
  listeners.forEach((l) => l());
};
export const cartStore = {
  get: () => cart,
  add: (i: CartItem) => { cart = [...cart, i]; emit(); },
  update: (key: string, patch: Partial<CartItem>) => { cart = cart.map((c) => (c.key === key ? { ...c, ...patch } : c)); emit(); },
  remove: (key: string) => { cart = cart.filter((c) => c.key !== key); emit(); },
  clear: () => { cart = []; emit(); },
};
export const useCart = () =>
  useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => cart);

export const validateFile = (f: File) => {
  const ext = f.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXT.includes(ext)) return "Formato não permitido. Use JPG, JPEG, PNG ou PDF.";
  if (f.size > MAX_FILE_MB * 1024 * 1024) return `Arquivo maior que ${MAX_FILE_MB} MB.`;
  return null;
};
