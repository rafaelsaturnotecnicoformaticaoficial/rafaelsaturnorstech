
CREATE TABLE public.affiliate_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_signup_id UUID REFERENCES public.affiliate_signups(id) ON DELETE SET NULL,
  affiliate_name TEXT NOT NULL,
  affiliate_contact TEXT,
  client_name TEXT NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'informatica',
  service_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  commission_percent NUMERIC(5,2) NOT NULL DEFAULT 10,
  commission_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  service_status TEXT NOT NULL DEFAULT 'pendente',
  payment_status TEXT NOT NULL DEFAULT 'pendente',
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view commissions" ON public.affiliate_commissions
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert commissions" ON public.affiliate_commissions
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update commissions" ON public.affiliate_commissions
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete commissions" ON public.affiliate_commissions
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_affiliate_commissions_updated_at
BEFORE UPDATE ON public.affiliate_commissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
