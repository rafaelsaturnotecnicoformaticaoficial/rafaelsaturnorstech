import { useState } from "react";
import { Monitor, Laptop, CalendarIcon, Send, CreditCard, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const paymentPlatforms = [
  { name: "Mercado Pago", color: "bg-blue-500 hover:bg-blue-600", url: "https://mpago.li/26yCx9t" },
  { name: "Kiwify", color: "bg-green-500 hover:bg-green-600", url: "https://pay.kiwify.com.br/LIDaekk" },
  { name: "Hotmart", color: "bg-orange-500 hover:bg-orange-600", url: "https://hotmart.com/pt-br/marketplace/produtos/rafaelsaturnosuporteremoto/M77346974Q" },
  { name: "Monetizze", color: "bg-purple-500 hover:bg-purple-600", url: "https://pay.monetizze.com.br/DMH175767" },
];

const availableTimes = ["09:00", "11:00", "13:00", "16:00"];

// Brazilian national holidays (fixed + mobile dates for 2024-2027)
const getBrazilianHolidays = (): string[] => {
  const fixed = [
    // Fixed holidays every year
    "01-01", // Confraternização Universal
    "04-21", // Tiradentes
    "05-01", // Dia do Trabalho
    "09-07", // Independência do Brasil
    "10-12", // Nossa Senhora Aparecida
    "11-02", // Finados
    "11-15", // Proclamação da República
    "12-25", // Natal
  ];

  const years = [2024, 2025, 2026, 2027];
  const holidays: string[] = [];

  years.forEach((y) => {
    fixed.forEach((md) => holidays.push(`${y}-${md}`));
  });

  // Mobile holidays (Carnaval, Sexta-feira Santa, Corpus Christi)
  const mobileHolidays = [
    // 2024
    "2024-02-12", "2024-02-13", // Carnaval
    "2024-03-29", // Sexta-feira Santa
    "2024-05-30", // Corpus Christi
    // 2025
    "2025-03-03", "2025-03-04", // Carnaval
    "2025-04-18", // Sexta-feira Santa
    "2025-06-19", // Corpus Christi
    // 2026
    "2026-02-16", "2026-02-17", // Carnaval
    "2026-04-03", // Sexta-feira Santa
    "2026-06-04", // Corpus Christi
    // 2027
    "2027-02-08", "2027-02-09", // Carnaval
    "2027-03-26", // Sexta-feira Santa
    "2027-05-27", // Corpus Christi
  ];

  holidays.push(...mobileHolidays);
  return holidays;
};

const brazilianHolidays = getBrazilianHolidays();

const isHoliday = (date: Date): boolean => {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return brazilianHolidays.includes(dateStr);
};

const isWeekday = (date: Date) => {
  const day = date.getDay();
  return day >= 1 && day <= 5;
};

const RemoteSupport = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deviceType, setDeviceType] = useState("computador");
  const [problem, setProblem] = useState("");
  const [date, setDate] = useState<Date>();
  const [preferredTime, setPreferredTime] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !problem) {
      toast.error("Preencha os campos obrigatórios: nome, telefone e descrição do problema.");
      return;
    }

    setLoading(true);

    const formattedDate = date ? format(date, "dd/MM/yyyy") : "";
    const deviceLabel = deviceType === "computador" ? "Computador" : "Notebook";

    const message = `*Agendamento Suporte Remoto*%0A%0A` +
      `*Nome:* ${encodeURIComponent(name)}%0A` +
      `*Email:* ${encodeURIComponent(email)}%0A` +
      `*Telefone:* ${encodeURIComponent(phone)}%0A` +
      `*Dispositivo:* ${deviceLabel}%0A` +
      `*Problema:* ${encodeURIComponent(problem)}%0A` +
      (formattedDate ? `*Data preferida:* ${formattedDate}%0A` : "") +
      (preferredTime ? `*Horário preferido:* ${encodeURIComponent(preferredTime)}` : "");

    // Open WhatsApp
    window.open(`https://wa.me/5535998793630?text=${message}`, "_blank");

    // Send email notification
    const emailSubject = encodeURIComponent("Novo Agendamento - Suporte Remoto");
    const emailBody = encodeURIComponent(
      `Agendamento Suporte Remoto\n\n` +
      `Nome: ${name}\n` +
      `Email: ${email}\n` +
      `Telefone: ${phone}\n` +
      `Dispositivo: ${deviceLabel}\n` +
      `Problema: ${problem}\n` +
      (formattedDate ? `Data preferida: ${formattedDate}\n` : "") +
      (preferredTime ? `Horário preferido: ${preferredTime}\n` : "")
    );

    // Open default email client with both recipients
    const emailRecipients = "rafaelsaturnodepaulaspu@gmail.com,rafaelsaturnotecnicoformatica@gmail.com";
    window.open(`mailto:${emailRecipients}?subject=${emailSubject}&body=${emailBody}`, "_self");

    toast.success("Redirecionando para o WhatsApp e abrindo email...");
    setLoading(false);
  };

  return (
    <section id="suporte-remoto" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
          Suporte <span className="text-gradient">Remoto</span>
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Atendimento remoto para computadores e notebooks. Agende seu horário e resolva seu problema sem sair de casa!
        </p>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Formulário */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-display text-xl font-bold text-card-foreground mb-6 flex items-center gap-2">
              <CalendarIcon size={20} className="text-primary" />
              Agendar Suporte Remoto
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="rs-name">Nome *</Label>
                <Input id="rs-name" placeholder="Seu nome completo" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
              </div>

              <div>
                <Label htmlFor="rs-email">Email</Label>
                <Input id="rs-email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
              </div>

              <div>
                <Label htmlFor="rs-phone">Telefone / WhatsApp *</Label>
                <Input id="rs-phone" placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={20} />
              </div>

              <div>
                <Label>Tipo de Dispositivo</Label>
                <RadioGroup value={deviceType} onValueChange={setDeviceType} className="flex gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="computador" id="rs-pc" />
                    <Label htmlFor="rs-pc" className="flex items-center gap-1 cursor-pointer">
                      <Monitor size={16} /> Computador
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="notebook" id="rs-nb" />
                    <Label htmlFor="rs-nb" className="flex items-center gap-1 cursor-pointer">
                      <Laptop size={16} /> Notebook
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="rs-problem">Descrição do Problema *</Label>
                <Textarea id="rs-problem" placeholder="Descreva o problema que está enfrentando..." value={problem} onChange={(e) => setProblem(e.target.value)} required maxLength={1000} rows={4} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data Preferida</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "dd/MM/yyyy") : "Selecionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(d) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return d < today || !isWeekday(d) || isHoliday(d);
                        }}
                        locale={ptBR}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Horário</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {availableTimes.map((time) => (
                      <Button
                        key={time}
                        type="button"
                        variant={preferredTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPreferredTime(time)}
                        className="text-xs"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Send size={16} className="mr-2" />
                {loading ? "Enviando..." : "Agendar via WhatsApp"}
              </Button>
            </form>
          </div>

          {/* Info + Pagamento */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-display text-xl font-bold text-card-foreground mb-4 flex items-center gap-2">
                <Monitor size={20} className="text-primary" />
                Como Funciona
              </h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">1</span>
                  <span>Preencha o formulário com os detalhes do problema</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">2</span>
                  <span>Confirmamos o horário e enviamos as instruções de acesso remoto</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">3</span>
                  <span>Realizamos o suporte remotamente no horário agendado</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">4</span>
                  <span>Efetue o pagamento pela plataforma de sua preferência</span>
                </li>
              </ol>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-display text-xl font-bold text-card-foreground mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-primary" />
                Formas de Pagamento
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Após o atendimento, efetue o pagamento pela plataforma de sua preferência:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {paymentPlatforms.map((p) => (
                  <a
                    key={p.name}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center justify-center gap-2 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-colors",
                      p.color
                    )}
                  >
                    <ExternalLink size={14} />
                    {p.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RemoteSupport;
