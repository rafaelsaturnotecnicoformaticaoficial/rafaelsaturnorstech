ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_cents integer NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_reason text;
COMMENT ON COLUMN public.orders.subtotal_cents IS 'Amount due after discount_cents';

CREATE TABLE public.referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  referred_user_id uuid NOT NULL UNIQUE,
  source_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  used_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referral_rewards TO authenticated;
GRANT ALL ON public.referral_rewards TO service_role;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own rewards readable" ON public.referral_rewards FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.my_referral_code() RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c text;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Faça login'; END IF;
 SELECT code INTO c FROM public.affiliate_codes WHERE user_id=auth.uid() LIMIT 1;
 IF c IS NULL THEN
  LOOP
   c := upper(substr(md5(gen_random_uuid()::text),1,7));
   EXIT WHEN NOT EXISTS(SELECT 1 FROM public.affiliate_codes WHERE code=c);
  END LOOP;
  INSERT INTO public.affiliate_codes(user_id,code) VALUES(auth.uid(),c);
 END IF;
 RETURN c;
END; $$;

CREATE OR REPLACE FUNCTION public.apply_referral_code(_code text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE owner uuid;
BEGIN
 IF auth.uid() IS NULL THEN RETURN false; END IF;
 SELECT user_id INTO owner FROM public.affiliate_codes WHERE code=upper(trim(_code));
 IF owner IS NULL OR owner=auth.uid() THEN RETURN false; END IF;
 IF EXISTS(SELECT 1 FROM public.orders WHERE user_id=auth.uid()) THEN RETURN false; END IF;
 UPDATE public.profiles SET referred_by_code=upper(trim(_code)) WHERE user_id=auth.uid() AND referred_by_code IS NULL;
 RETURN FOUND;
END; $$;

CREATE OR REPLACE FUNCTION public.my_discount() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid(); ref text; avail int;
BEGIN
 IF uid IS NULL THEN RETURN jsonb_build_object('percent',0); END IF;
 SELECT p.referred_by_code INTO ref FROM public.profiles p JOIN public.affiliate_codes a ON a.code=p.referred_by_code AND a.user_id<>uid WHERE p.user_id=uid;
 SELECT count(*) INTO avail FROM public.referral_rewards WHERE user_id=uid AND used_order_id IS NULL;
 IF ref IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.orders WHERE user_id=uid AND status<>'cancelado') THEN
  RETURN jsonb_build_object('percent',5,'reason','first_order','rewards',avail);
 ELSIF avail>0 THEN
  RETURN jsonb_build_object('percent',5,'reason','referral_reward','rewards',avail);
 END IF;
 RETURN jsonb_build_object('percent',0,'rewards',avail);
END; $$;

CREATE OR REPLACE FUNCTION public.grant_referral_reward() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE referrer uuid;
BEGIN
 IF NEW.status='concluido' AND OLD.status IS DISTINCT FROM 'concluido' THEN
  SELECT a.user_id INTO referrer FROM public.profiles p JOIN public.affiliate_codes a ON a.code=p.referred_by_code WHERE p.user_id=NEW.user_id;
  IF referrer IS NOT NULL AND referrer<>NEW.user_id THEN
   INSERT INTO public.referral_rewards(user_id,referred_user_id,source_order_id) VALUES(referrer,NEW.user_id,NEW.id) ON CONFLICT (referred_user_id) DO NOTHING;
  END IF;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER orders_grant_referral_reward AFTER UPDATE OF status ON public.orders FOR EACH ROW EXECUTE FUNCTION public.grant_referral_reward();

CREATE OR REPLACE FUNCTION public.apply_order_discount() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d jsonb; rid uuid; full_value int;
BEGIN
 IF NEW.subtotal_cents IS NOT DISTINCT FROM OLD.subtotal_cents OR OLD.discount_reason IS NOT NULL OR OLD.subtotal_cents<>0 THEN RETURN NEW; END IF;
 IF auth.uid() IS NULL OR auth.uid()<>NEW.user_id THEN RETURN NEW; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.orders WHERE user_id=NEW.user_id AND id<>NEW.id AND status<>'cancelado') THEN
  IF EXISTS(SELECT 1 FROM public.profiles p JOIN public.affiliate_codes a ON a.code=p.referred_by_code AND a.user_id<>NEW.user_id WHERE p.user_id=NEW.user_id) THEN
   NEW.discount_reason := 'Indicação: 5% na primeira compra';
  END IF;
 END IF;
 IF NEW.discount_reason IS NULL THEN
  SELECT id INTO rid FROM public.referral_rewards WHERE user_id=NEW.user_id AND used_order_id IS NULL ORDER BY created_at LIMIT 1 FOR UPDATE;
  IF rid IS NOT NULL THEN
   UPDATE public.referral_rewards SET used_order_id=NEW.id WHERE id=rid;
   NEW.discount_reason := 'Indicação: 5% por amigo indicado';
  END IF;
 END IF;
 IF NEW.discount_reason IS NOT NULL THEN
  full_value := NEW.subtotal_cents;
  NEW.discount_cents := round(full_value*0.05);
  NEW.subtotal_cents := full_value - NEW.discount_cents;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER orders_apply_discount BEFORE UPDATE OF subtotal_cents ON public.orders FOR EACH ROW EXECUTE FUNCTION public.apply_order_discount();

REVOKE ALL ON FUNCTION public.my_referral_code(), public.apply_referral_code(text), public.my_discount() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_referral_code(), public.apply_referral_code(text), public.my_discount() TO authenticated;
REVOKE ALL ON FUNCTION public.grant_referral_reward(), public.apply_order_discount() FROM PUBLIC, anon, authenticated;