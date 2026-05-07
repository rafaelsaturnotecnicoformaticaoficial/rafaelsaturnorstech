import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Referral = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      if (code) {
        try {
          localStorage.setItem("rstech_ref", code);
          await supabase.rpc("increment_affiliate_click" as never, { _code: code } as never);
        } catch {
          // ignore
        }
      }
      navigate("/", { replace: true });
    };
    run();
  }, [code, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
      Redirecionando...
    </div>
  );
};

export default Referral;
