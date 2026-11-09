import { useEffect, useState } from "react";

// Horário de atendimento (São Paulo): Seg–Sex 09:00–11:00 e 13:00–16:00
const PERIODS: [number, number][] = [[9 * 60, 11 * 60], [13 * 60, 16 * 60]];

export const isOpenAt = (d: Date) => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  if (["Sat", "Sun"].includes(get("weekday"))) return false;
  const min = (Number(get("hour")) % 24) * 60 + Number(get("minute"));
  return PERIODS.some(([a, b]) => min >= a && min < b);
};

const HOURS_TEXT = "Horário de atendimento: Segunda a Sexta, 09:00 às 11:00 e 13:00 às 16:00";

const useOpenState = () => {
  const [open, setOpen] = useState(() => isOpenAt(new Date()));
  useEffect(() => {
    const t = setInterval(() => setOpen(isOpenAt(new Date())), 30000);
    return () => clearInterval(t);
  }, []);
  return open;
};

// Faixa cheia, usada no topo das páginas
const OpenStatus = () => {
  const open = useOpenState();
  return (
    <div className={`text-center text-xs sm:text-sm font-bold py-1.5 px-2 ${open ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}`}>
      {open ? "ABERTO AGORA" : "FECHADO AGORA"} · {HOURS_TEXT}
    </div>
  );
};

// Selo compacto, usado dentro de Produtos e Serviços
export const OpenStatusBadge = () => {
  const open = useOpenState();
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs sm:text-sm font-bold ${open ? "border-success/40 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${open ? "bg-success" : "bg-destructive"}`} />
      <span>{open ? "Aberto agora" : "Fechado agora"}</span>
      <span className="font-semibold text-foreground/70">{HOURS_TEXT}</span>
    </div>
  );
};

export default OpenStatus;
