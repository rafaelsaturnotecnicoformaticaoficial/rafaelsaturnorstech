
CREATE TABLE public.categories (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL UNIQUE, sort_order int NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.categories TO anon, authenticated; GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated; GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cat read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "cat admin" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.catalog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'produto' CHECK (kind IN ('produto','servico')),
  product_type text NOT NULL DEFAULT 'fisico' CHECK (product_type IN ('fisico','digital')),
  name text NOT NULL, description text, image_url text, category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  stock int, active boolean NOT NULL DEFAULT true, accepts_files boolean NOT NULL DEFAULT false,
  schedulable boolean NOT NULL DEFAULT false, deadline_type text NOT NULL DEFAULT 'nenhum' CHECK (deadline_type IN ('nenhum','5','10','personalizado','consulta')),
  deadline_days int, duration_minutes int, custom_fields text[] NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.catalog_items TO anon, authenticated; GRANT INSERT, UPDATE, DELETE ON public.catalog_items TO authenticated; GRANT ALL ON public.catalog_items TO service_role;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items read" ON public.catalog_items FOR SELECT USING (active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "items admin" ON public.catalog_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER catalog_items_upd BEFORE UPDATE ON public.catalog_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.catalog_prices (item_id uuid PRIMARY KEY REFERENCES public.catalog_items(id) ON DELETE CASCADE, price_cents int NOT NULL DEFAULT 0);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_prices TO authenticated; GRANT ALL ON public.catalog_prices TO service_role;
ALTER TABLE public.catalog_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prices logged read" ON public.catalog_prices FOR SELECT TO authenticated USING (true);
CREATE POLICY "prices admin" ON public.catalog_prices FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.holidays (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), holiday_date date NOT NULL UNIQUE, name text NOT NULL);
GRANT SELECT ON public.holidays TO anon, authenticated; GRANT INSERT, UPDATE, DELETE ON public.holidays TO authenticated; GRANT ALL ON public.holidays TO service_role;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hol read" ON public.holidays FOR SELECT USING (true);
CREATE POLICY "hol admin" ON public.holidays FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.business_hours (weekday int PRIMARY KEY CHECK (weekday BETWEEN 0 AND 6), slots text[] NOT NULL DEFAULT '{}');
GRANT SELECT ON public.business_hours TO anon, authenticated; GRANT INSERT, UPDATE, DELETE ON public.business_hours TO authenticated; GRANT ALL ON public.business_hours TO service_role;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bh read" ON public.business_hours FOR SELECT USING (true);
CREATE POLICY "bh admin" ON public.business_hours FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.blocked_slots (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slot_date date NOT NULL, slot_time text, reason text);
GRANT SELECT ON public.blocked_slots TO anon, authenticated; GRANT INSERT, UPDATE, DELETE ON public.blocked_slots TO authenticated; GRANT ALL ON public.blocked_slots TO service_role;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bs read" ON public.blocked_slots FOR SELECT USING (true);
CREATE POLICY "bs admin" ON public.blocked_slots FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.store_settings (id int PRIMARY KEY DEFAULT 1 CHECK (id=1), company text NOT NULL DEFAULT 'Rafael Saturno Técnico Informática - RS Tech', city text NOT NULL DEFAULT 'São Pedro da União - MG', whatsapp text NOT NULL DEFAULT '5535998793630', hours_text text NOT NULL DEFAULT '09:00–11:00 / 13:00–16:00', pickup text NOT NULL DEFAULT 'São Pedro da União - MG', freight_text text NOT NULL DEFAULT 'Consultar pelo WhatsApp para outras regiões.');
GRANT SELECT ON public.store_settings TO anon, authenticated; GRANT INSERT, UPDATE ON public.store_settings TO authenticated; GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ss read" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "ss admin" ON public.store_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE SEQUENCE public.order_number_seq;
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), number int NOT NULL DEFAULT nextval('public.order_number_seq') UNIQUE,
  user_id uuid NOT NULL, customer_name text NOT NULL, customer_email text, customer_whatsapp text NOT NULL, city text, state text,
  delivery text NOT NULL DEFAULT 'retirada', payment_method text NOT NULL, subtotal_cents int NOT NULL DEFAULT 0, notes text,
  status text NOT NULL DEFAULT 'aguardando_confirmacao', has_files boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, UPDATE, DELETE ON public.orders TO authenticated; GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders own" ON public.orders FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders admin upd" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders admin del" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER orders_upd BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.catalog_items(id) ON DELETE SET NULL, name text NOT NULL, kind text NOT NULL,
  unit_price_cents int NOT NULL, quantity int NOT NULL, deadline_text text, custom_data jsonb NOT NULL DEFAULT '{}');
GRANT SELECT ON public.order_items TO authenticated; GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "oi own" ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id=order_id AND o.user_id=auth.uid()));

CREATE TABLE public.order_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL, path text NOT NULL, file_name text NOT NULL, item_name text, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, DELETE ON public.order_files TO authenticated; GRANT ALL ON public.order_files TO service_role;
ALTER TABLE public.order_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "of read" ON public.order_files FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "of ins" ON public.order_files FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id=order_id AND o.user_id=auth.uid()));
CREATE POLICY "of del" ON public.order_files FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.catalog_items(id) ON DELETE SET NULL, service_name text NOT NULL, slot_date date NOT NULL, slot_time text NOT NULL,
  notes text, status text NOT NULL DEFAULT 'solicitado', customer_name text, customer_whatsapp text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE UNIQUE INDEX appointments_slot_unique ON public.appointments(slot_date, slot_time) WHERE status <> 'cancelado';
GRANT SELECT, UPDATE, DELETE ON public.appointments TO authenticated; GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ap own" ON public.appointments FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "ap admin upd" ON public.appointments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "ap admin del" ON public.appointments FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER ap_upd BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.taken_slots(_from date, _to date)
RETURNS TABLE(slot_date date, slot_time text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT a.slot_date, a.slot_time FROM public.appointments a WHERE a.status <> 'cancelado' AND a.slot_date BETWEEN _from AND _to
$$;
GRANT EXECUTE ON FUNCTION public.taken_slots(date,date) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.slot_available(_date date, _time text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT _date >= CURRENT_DATE
    AND NOT EXISTS (SELECT 1 FROM public.holidays h WHERE h.holiday_date=_date)
    AND EXISTS (SELECT 1 FROM public.business_hours b WHERE b.weekday=EXTRACT(DOW FROM _date)::int AND _time = ANY(b.slots))
    AND NOT EXISTS (SELECT 1 FROM public.blocked_slots s WHERE s.slot_date=_date AND (s.slot_time IS NULL OR s.slot_time=_time))
    AND NOT EXISTS (SELECT 1 FROM public.appointments a WHERE a.slot_date=_date AND a.slot_time=_time AND a.status<>'cancelado')
$$;

CREATE OR REPLACE FUNCTION public.create_order(payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid(); o public.orders; it jsonb; ci public.catalog_items; pr int; qty int; sub int := 0;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Faça login para finalizar o pedido'; END IF;
  IF jsonb_array_length(COALESCE(payload->'items','[]'::jsonb)) = 0 THEN RAISE EXCEPTION 'Carrinho vazio'; END IF;
  IF COALESCE(payload->>'payment_method','') NOT IN ('pix','dinheiro','debito','credito') THEN RAISE EXCEPTION 'Forma de pagamento inválida'; END IF;
  IF length(COALESCE(payload->>'name',''))<2 OR length(COALESCE(payload->>'whatsapp',''))<8 THEN RAISE EXCEPTION 'Dados do cliente incompletos'; END IF;
  INSERT INTO public.orders(user_id, customer_name, customer_email, customer_whatsapp, city, state, delivery, payment_method, notes, has_files)
  VALUES (uid, left(payload->>'name',120), left(payload->>'email',200), left(payload->>'whatsapp',30), left(payload->>'city',100), left(payload->>'state',30),
    CASE WHEN payload->>'delivery'='outra_cidade' THEN 'outra_cidade' ELSE 'retirada' END, payload->>'payment_method', left(payload->>'notes',2000), COALESCE((payload->>'has_files')::boolean,false))
  RETURNING * INTO o;
  FOR it IN SELECT * FROM jsonb_array_elements(payload->'items') LOOP
    SELECT * INTO ci FROM public.catalog_items WHERE id=(it->>'item_id')::uuid AND active;
    IF NOT FOUND THEN RAISE EXCEPTION 'Item indisponível'; END IF;
    SELECT price_cents INTO pr FROM public.catalog_prices WHERE item_id=ci.id; pr := COALESCE(pr,0);
    qty := GREATEST(1, LEAST(999, COALESCE((it->>'quantity')::int,1)));
    IF ci.kind='produto' AND ci.product_type='fisico' AND ci.stock IS NOT NULL THEN
      IF ci.stock < qty THEN RAISE EXCEPTION 'Estoque insuficiente para %', ci.name; END IF;
      UPDATE public.catalog_items SET stock = stock - qty WHERE id=ci.id;
    END IF;
    sub := sub + pr*qty;
    INSERT INTO public.order_items(order_id,item_id,name,kind,unit_price_cents,quantity,deadline_text,custom_data)
    VALUES (o.id, ci.id, ci.name, ci.kind, pr, qty, it->>'deadline_text', COALESCE(it->'custom','{}'::jsonb));
    IF ci.schedulable AND COALESCE(it->>'date','')<>'' AND COALESCE(it->>'time','')<>'' THEN
      IF NOT public.slot_available((it->>'date')::date, it->>'time') THEN RAISE EXCEPTION 'Horário % % indisponível', it->>'date', it->>'time'; END IF;
      INSERT INTO public.appointments(user_id,order_id,item_id,service_name,slot_date,slot_time,notes,customer_name,customer_whatsapp)
      VALUES (uid, o.id, ci.id, ci.name, (it->>'date')::date, it->>'time', left(it->>'appt_notes',1000), o.customer_name, o.customer_whatsapp);
    END IF;
  END LOOP;
  UPDATE public.orders SET subtotal_cents=sub WHERE id=o.id;
  RETURN jsonb_build_object('id', o.id, 'number', o.number, 'subtotal_cents', sub);
END $$;
REVOKE EXECUTE ON FUNCTION public.create_order(jsonb) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.create_order(jsonb) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.slot_available(date,text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.slot_available(date,text) TO authenticated;

CREATE POLICY "order files upload own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='order-files' AND (storage.foldername(name))[1]=auth.uid()::text AND lower(storage.extension(name)) IN ('jpg','jpeg','png','pdf'));
CREATE POLICY "order files read own" ON storage.objects FOR SELECT TO authenticated USING (bucket_id='order-files' AND ((storage.foldername(name))[1]=auth.uid()::text OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "order files admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='order-files' AND public.has_role(auth.uid(),'admin'));
