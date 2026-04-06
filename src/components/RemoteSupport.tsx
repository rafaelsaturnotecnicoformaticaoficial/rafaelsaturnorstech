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
  { name: "Mercado Pago", color: "bg-blue-500 hover:bg-blue-600", url: "" },
  { name: "Kiwify", color: "bg-green-500 hover:bg-green-600", url: "" },
  { name: "Hotmart", color: "bg-orange-500 hover:bg-orange-600", url: "" },
  { name: "Monetizze", color: "bg-purple-500 hover:bg-purple-600", url: "" },
];

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

    const message = `*Agendamento Suporte Remoto*%0A%0A` +
      `*Nome:* ${encodeURIComponent(name)}%0A` +
      `*Email:* ${encodeURIComponent(email)}%0A` +
      `*Telefone:* ${encodeURIComponent(phone)}%0A` +
      `*Dispositivo:* ${deviceType === "computador" ? "Computador" : "Notebook"}%0A` +
      `*Problema:* ${encodeURIComponent(problem)}%0A` +
      (date ? `*Data preferida:* ${format(date, "dd/MM/yyyy")}%0A` : "") +
      (preferredTime ? `*Horário preferido:* ${encodeURIComponent(preferredTime)}` : "");

    window.open(`https://wa.me/5535998793630?text=${message}`, "_blank");

    toast.success("Redirecionando para o WhatsApp...");
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
                        disabled={(d) => d < new Date()}
                        locale={ptBR}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="rs-time">Horário Preferido</Label>
                  <Input id="rs-time" type="time" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} className="mt-1" />
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
                    href={p.url || "#"}
                    target={p.url ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!p.url) {
                        e.preventDefault();
                        toast.info(`Link de pagamento ${p.name} será configurado em breve.`);
                      }
                    }}
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
