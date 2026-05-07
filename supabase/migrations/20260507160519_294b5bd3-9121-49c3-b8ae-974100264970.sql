-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  whatsapp TEXT,
  city TEXT,
  is_affiliate BOOLEAN NOT NULL DEFAULT false,
  is_loyalty_member BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, whatsapp)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'whatsapp', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Affiliate codes
CREATE TABLE public.affiliate_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.affiliate_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view codes" ON public.affiliate_codes FOR SELECT USING (true);
CREATE POLICY "User insert own code" ON public.affiliate_codes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage codes" ON public.affiliate_codes FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TRIGGER affiliate_codes_updated BEFORE UPDATE ON public.affiliate_codes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Increment click function (public)
CREATE OR REPLACE FUNCTION public.increment_affiliate_click(_code TEXT)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
  UPDATE public.affiliate_codes SET clicks = clicks + 1 WHERE code = _code;
$$;

-- Link existing commissions to affiliate user via profile
ALTER TABLE public.affiliate_commissions ADD COLUMN IF NOT EXISTS affiliate_user_id UUID;

CREATE POLICY "Affiliates view own commissions" ON public.affiliate_commissions FOR SELECT USING (auth.uid() = affiliate_user_id);

-- Loyalty services log
CREATE TABLE public.loyalty_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_user_id UUID NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'informatica',
  service_value NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  service_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Client views own loyalty" ON public.loyalty_services FOR SELECT USING (auth.uid() = client_user_id);
CREATE POLICY "Admins manage loyalty" ON public.loyalty_services FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TRIGGER loyalty_services_updated BEFORE UPDATE ON public.loyalty_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();