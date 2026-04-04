import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie-consent");
    if (!accepted) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-foreground text-background p-4 shadow-lg">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-center sm:text-left">
          Nosso site usa cookies para melhorar sua experiência. Ao continuar, você concorda com nossa{" "}
          <Link to="/politica-privacidade" className="underline font-semibold">
            Política de Privacidade
          </Link>{" "}
          e{" "}
          <Link to="/termos-de-uso" className="underline font-semibold">
            Termos de Uso
          </Link>.
        </p>
        <button
          onClick={handleAccept}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          Aceitar
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
