import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PoliticaPrivacidade = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Política de Privacidade</h1>

        <div className="space-y-6 text-foreground/80 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">1. Informações Coletadas</h2>
            <p>Coletamos informações que você nos fornece diretamente, como nome, e-mail e telefone ao entrar em contato conosco. Também coletamos dados de navegação automaticamente, como endereço IP, tipo de navegador e páginas visitadas.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">2. Uso das Informações</h2>
            <p>Utilizamos suas informações para: responder suas solicitações, melhorar nossos serviços, enviar comunicações relevantes e exibir anúncios personalizados por meio do Google AdSense.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">3. Cookies</h2>
            <p>Nosso site utiliza cookies para melhorar sua experiência de navegação e exibir anúncios relevantes. Cookies são pequenos arquivos armazenados no seu dispositivo. Você pode desativar os cookies nas configurações do seu navegador, mas isso pode afetar a funcionalidade do site.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">4. Google AdSense</h2>
            <p>Utilizamos o Google AdSense para exibir anúncios. O Google pode usar cookies para exibir anúncios com base em visitas anteriores ao nosso site ou outros sites. Para mais informações, acesse a <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">Política de Privacidade do Google</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">5. Compartilhamento de Dados</h2>
            <p>Não vendemos suas informações pessoais. Podemos compartilhar dados com parceiros de confiança apenas quando necessário para a prestação dos nossos serviços.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">6. Seus Direitos</h2>
            <p>Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento. Entre em contato conosco pelo WhatsApp (35) 99879-3630 para exercer seus direitos.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-2">7. Contato</h2>
            <p>Para dúvidas sobre esta política, entre em contato: Rafael Saturno – RS Tech, São Pedro da União - MG. WhatsApp: (35) 99879-3630.</p>
          </section>

          <p className="text-xs text-muted-foreground mt-8">Última atualização: Abril de 2026.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PoliticaPrivacidade;
