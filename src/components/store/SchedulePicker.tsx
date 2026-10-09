import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { ymd } from "@/lib/store";

type Props = { date?: string; time?: string; onChange: (date: string, time: string) => void };

export const useScheduleData = () => {
  const from = ymd(new Date());
  const toD = new Date(); toD.setDate(toD.getDate() + 90);
  const to = ymd(toD);
  return useQuery({
    queryKey: ["schedule_data", from],
    queryFn: async () => {
      const [h, bh, bs, taken] = await Promise.all([
        supabase.from("holidays").select("holiday_date"),
        supabase.from("business_hours").select("*"),
        supabase.from("blocked_slots").select("slot_date, slot_time").gte("slot_date", from),
        supabase.rpc("taken_slots", { _from: from, _to: to }),
      ]);
      return {
        holidays: new Set((h.data ?? []).map((x) => x.holiday_date)),
        hours: new Map((bh.data ?? []).map((x) => [x.weekday, x.slots as string[]])),
        blocked: bs.data ?? [],
        taken: new Set((taken.data ?? []).map((t: any) => `${t.slot_date} ${t.slot_time}`)),
      };
    },
  });
};

const SchedulePicker = ({ date, time, onChange }: Props) => {
  const { data } = useScheduleData();
  const [sel, setSel] = useState<Date | undefined>(date ? new Date(date + "T12:00") : undefined);

  const slotsFor = (d: Date) => {
    if (!data) return [];
    const key = ymd(d);
    if (data.holidays.has(key)) return [];
    if (data.blocked.some((b) => b.slot_date === key && !b.slot_time)) return [];
    const now = new Date();
    return (data.hours.get(d.getDay()) ?? []).filter((t) => {
      if (data.taken.has(`${key} ${t}`)) return false;
      if (data.blocked.some((b) => b.slot_date === key && b.slot_time === t)) return false;
      if (key === ymd(now)) {
        const [hh, mm] = t.split(":").map(Number);
        if (hh * 60 + mm <= now.getHours() * 60 + now.getMinutes()) return false;
      }
      return true;
    });
  };

  const max = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + 90); return d; }, []);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const slots = sel ? slotsFor(sel) : [];

  return (
    <div className="space-y-3">
      <Calendar
        mode="single"
        locale={ptBR}
        selected={sel}
        onSelect={(d) => setSel(d)}
        disabled={(d) => d < today || d > max || slotsFor(d).length === 0}
        className="rounded-md border border-border mx-auto"
      />
      {sel && (
        <div>
          <p className="text-sm font-semibold mb-2">Horários disponíveis em {sel.toLocaleDateString("pt-BR")}:</p>
          <div className="grid grid-cols-4 gap-2">
            {slots.map((t) => (
              <button key={t} type="button" onClick={() => onChange(ymd(sel), t)}
                className={`py-2 rounded-md border text-sm font-semibold ${date === ymd(sel) && time === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground">Atendimento: 09:00–11:00 e 13:00–16:00. Sábados, domingos e feriados fechado.</p>
    </div>
  );
};
export default SchedulePicker;
