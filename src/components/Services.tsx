import {
  Monitor, HardDrive, MemoryStick, Cpu, Wrench, MonitorSmartphone,
  Keyboard, PcCase, Printer, Image, ScanLine, FileText,
  BookOpen, Sticker, Palette, ClipboardList
} from "lucide-react";

const informaticaServices = [
  { icon: Monitor, label: "Formatação e instalação de sistemas" },
  { icon: ClipboardList, label: "Instalação de programas" },
  { icon: HardDrive, label: "Troca de HD por SSD" },
  { icon: MemoryStick, label: "Upgrade de memória" },
  { icon: Wrench, label: "Limpeza completa" },
  { icon: Cpu, label: "Reparo e troca de placa-mãe" },
  { icon: MonitorSmartphone, label: "Troca de tela de notebook" },
  { icon: Keyboard, label: "Troca de teclado de notebook" },
  { icon: PcCase, label: "Montagem de computadores" },
];

const impressaoServices = [
  { icon: Printer, label: "Xerox" },
  { icon: Printer, label: "Impressões" },
  { icon: Image, label: "Impressão de fotos" },
  { icon: ScanLine, label: "Digitalização" },
  { icon: FileText, label: "Impressão de boletos" },
  { icon: BookOpen, label: "Plastificação e encadernação" },
  { icon: Palette, label: "Topo de bolo (sob agendamento)" },
  { icon: Sticker, label: "Tags, adesivos e tubetes (sob agendamento)" },
  { icon: Palette, label: "Atividades escolares e desenhos para colorir" },
];

const ServiceCard = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
  <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all group">
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
      <Icon size={20} className="text-primary" />
    </div>
    <span className="text-sm font-medium text-card-foreground">{label}</span>
  </div>
);

const Services = () => {
  return (
    <section id="servicos" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
          Nossos <span className="text-gradient">Serviços</span>
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          Soluções completas em informática e impressão para você e sua empresa
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Informática */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Monitor size={24} className="text-primary" />
              <h3 className="font-display text-xl font-bold text-foreground">Informática</h3>
            </div>
            <div className="space-y-3">
              {informaticaServices.map((s) => (
                <ServiceCard key={s.label} {...s} />
              ))}
            </div>
          </div>

          {/* Impressão */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Printer size={24} className="text-secondary" />
              <h3 className="font-display text-xl font-bold text-foreground">Impressão e Gráfica</h3>
            </div>
            <div className="space-y-3">
              {impressaoServices.map((s) => (
                <ServiceCard key={s.label} {...s} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
