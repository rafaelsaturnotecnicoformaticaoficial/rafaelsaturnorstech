import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const KEY = "rstech_ref";

export const ReferralLanding = () => {
  const { code } = useParams();
  if (code && /^[A-Za-z0-9]{4,20}$/.test(code)) localStorage.setItem(KEY, code.toUpperCase());
  return <Navigate to="/entrar?mode=signup" replace />;
};

const ReferralCapture = () => {
  useEffect(() => {
    const apply = async () => {
      const code = localStorage.getItem(KEY);
      if (!code) return;
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      await supabase.rpc("apply_referral_code", { _code: code });
      localStorage.removeItem(KEY);
    };
    apply();
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { if (s) setTimeout(apply, 0); });
    return () => data.subscription.unsubscribe();
  }, []);
  return null;
};
export default ReferralCapture;
