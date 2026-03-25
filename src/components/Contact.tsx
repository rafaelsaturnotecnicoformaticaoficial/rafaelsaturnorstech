import { MessageCircle, MapPin, Clock } from "lucide-react";

const Contact = () => {
  return (
    <section id="contato" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
          Entre em <span className="text-gradient">Contato</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* WhatsApp */}
          <div className="text-center p-6 rounded-xl bg-card border border-border">
            <MessageCircle size={32} className="text-green-600 mx-auto mb-3" />
            <h3 className="font-display font-bold mb-2 text-card-foreground">WhatsApp</h3>
            <a
              href="https://wa.me/5535998793630"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              (35) 99879-3630
            </a>
          </div>

          {/* Endereço */}
          <div className="text-center p-6 rounded-xl bg-card border border-border">
            <MapPin size={32} className="text-secondary mx-auto mb-3" />
            <h3 className="font-display font-bold mb-2 text-card-foreground">Endereço</h3>
            <p className="text-sm text-muted-foreground">
              Rua Vereador Jorge Florêncio Nº 269
              <br />
              São Pedro da União - MG
            </p>
          </div>

          {/* Horário */}
          <div className="text-center p-6 rounded-xl bg-card border border-border">
            <Clock size={32} className="text-primary mx-auto mb-3" />
            <h3 className="font-display font-bold mb-2 text-card-foreground">Horário</h3>
            <p className="text-sm text-muted-foreground">
              Seg a Sex: 09:00–11:00 | 13:00–16:00
              <br />
              Sáb e Dom: Fechado
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
