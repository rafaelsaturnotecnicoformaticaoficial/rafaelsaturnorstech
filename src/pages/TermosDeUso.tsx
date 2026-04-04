import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermosDeUso = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Termos de Uso</h1>

        <div className="space-y-6 text-foreground/80 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">1. Aceitação dos Termos</h2>
            <p>Ao acessar e utilizar este site, você concorda com estes Termos de Uso. Se não concordar, por favor, não utilize o site.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">2. Serviços</h2>
            <p>O site Rafael Saturno – RS Tech oferece informações sobre serviços de assistência técnica em informática, impressão, gráfica rápida e vendas de produtos de tecnologia através da Magazine Rafael Saturno.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">3. Propriedade Intelectual</h2>
            <p>Todo o conteúdo deste site, incluindo textos, imagens, logotipos e design, é propriedade de Rafael Saturno – RS Tech e está protegido por leis de direitos autorais.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">4. Uso Permitido</h2>
            <p>Você pode navegar, visualizar e utilizar o site para fins pessoais e não comerciais. É proibido copiar, modificar, distribuir ou reproduzir qualquer conteúdo sem autorização prévia.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">5. Links Externos</h2>
            <p>Este site pode conter links para sites de terceiros (como Magazine Luiza e WhatsApp). Não nos responsabilizamos pelo conteúdo ou práticas de privacidade desses sites.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">6. Limitação de Responsabilidade</h2>
            <p>Nos esforçamos para manter as informações atualizadas, mas não garantimos a precisão completa de todo o conteúdo. O uso do site é por sua conta e risco.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">7. Alterações</h2>
            <p>Reservamo-nos o direito de alterar estes termos a qualquer momento. As alterações entram em vigor imediatamente após a publicação no site.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">8. Contato</h2>
            <p>Para dúvidas sobre estes termos, entre em contato: Rafael Saturno – RS Tech, São Pedro da União - MG. WhatsApp: (35) 99879-3630.</p>
          </section>

          <p className="text-xs text-muted-foreground mt-8">Última atualização: Abril de 2026.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermosDeUso;
