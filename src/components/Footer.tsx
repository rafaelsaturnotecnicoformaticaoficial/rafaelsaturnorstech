import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <footer className="bg-white border-t border-primary/20 py-8">
      <div className="container mx-auto px-4 text-center space-y-4">
        <p className="text-secondary font-semibold text-sm">
          Entre em contato e faça seu orçamento agora!
        </p>
        <div className="flex justify-center gap-4 text-xs">
          <Link to="/politica-privacidade" className="text-muted-foreground hover:text-primary underline">Política de Privacidade</Link>
          <Link to="/termos-de-uso" className="text-muted-foreground hover:text-primary underline">Termos de Uso</Link>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2013–{new Date().getFullYear()} Rafael Saturno Técnico Informática ® RS Tech. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
