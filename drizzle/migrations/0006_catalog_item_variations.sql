CREATE TABLE public.catalog_variants (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 item_id uuid NOT NULL REFERENCES public.catalog_items(id) ON DELETE CASCADE,
 name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120),
 price_cents integer NOT NULL CHECK (price_cents >= 0),
 sort_order integer NOT NULL DEFAULT 0,
 UNIQUE(item_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_variants TO authenticated;
GRANT ALL ON public.catalog_variants TO service_role;
ALTER TABLE public.catalog_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed in customers read active item variations" ON public.catalog_variants FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.catalog_items i WHERE i.id=item_id AND i.active));
CREATE POLICY "Admins manage variations" ON public.catalog_variants FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE OR REPLACE FUNCTION public.save_catalog_variants(_item_id uuid, _variants jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Acesso negado'; END IF;
 PERFORM 1 FROM public.catalog_items WHERE id=_item_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Item não encontrado'; END IF;
 IF jsonb_typeof(_variants) <> 'array' THEN RAISE EXCEPTION 'Variações inválidas'; END IF;
 DELETE FROM public.catalog_variants WHERE item_id=_item_id AND id NOT IN (SELECT (v->>'id')::uuid FROM jsonb_array_elements(_variants) v);
 INSERT INTO public.catalog_variants(id,item_id,name,price_cents,sort_order)
 SELECT (v->>'id')::uuid,_item_id,trim(v->>'name'),(v->>'price_cents')::int,(n-1)::int FROM jsonb_array_elements(_variants) WITH ORDINALITY AS x(v,n)
 ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,price_cents=EXCLUDED.price_cents,sort_order=EXCLUDED.sort_order WHERE catalog_variants.item_id=_item_id;
END; $$;
REVOKE ALL ON FUNCTION public.save_catalog_variants(uuid,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.save_catalog_variants(uuid,jsonb) TO authenticated;
CREATE OR REPLACE FUNCTION public.create_order(payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
 uid uuid := auth.uid(); o public.orders; it jsonb; ci public.catalog_items; cv public.catalog_variants; pr int; qty int; sub int := 0; item_name text;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Faça login para finalizar o pedido'; END IF;
 IF jsonb_array_length(COALESCE(payload->'items','[]'::jsonb))=0 THEN RAISE EXCEPTION 'Carrinho vazio'; END IF;
 IF COALESCE(payload->>'payment_method','') NOT IN ('pix','dinheiro','debito','credito') THEN RAISE EXCEPTION 'Forma de pagamento inválida'; END IF;
 IF length(COALESCE(payload->>'name',''))<2 OR length(COALESCE(payload->>'whatsapp',''))<8 THEN RAISE EXCEPTION 'Dados do cliente incompletos'; END IF;
 INSERT INTO public.orders(user_id,customer_name,customer_email,customer_whatsapp,city,state,delivery,payment_method,notes,has_files)
 VALUES(uid,left(payload->>'name',120),left(payload->>'email',200),left(payload->>'whatsapp',30),left(payload->>'city',100),left(payload->>'state',30),CASE WHEN payload->>'delivery'='outra_cidade' THEN 'outra_cidade' ELSE 'retirada' END,payload->>'payment_method',left(payload->>'notes',2000),COALESCE((payload->>'has_files')::boolean,false)) RETURNING * INTO o;
 FOR it IN SELECT * FROM jsonb_array_elements(payload->'items') LOOP
  SELECT * INTO ci FROM public.catalog_items WHERE id=(it->>'item_id')::uuid AND active FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Item indisponível'; END IF;
  item_name := ci.name;
  IF COALESCE(it->>'variant_id','')<>'' THEN
   SELECT * INTO cv FROM public.catalog_variants WHERE id=(it->>'variant_id')::uuid AND item_id=ci.id;
   IF NOT FOUND THEN RAISE EXCEPTION 'Variação indisponível. Escolha novamente no catálogo.'; END IF;
   pr := cv.price_cents; item_name := ci.name || ' — ' || cv.name;
  ELSE
   IF EXISTS(SELECT 1 FROM public.catalog_variants WHERE item_id=ci.id) THEN RAISE EXCEPTION 'Escolha uma variação para %',ci.name; END IF;
   SELECT price_cents INTO pr FROM public.catalog_prices WHERE item_id=ci.id; pr:=COALESCE(pr,0);
  END IF;
  qty:=GREATEST(1,LEAST(999,COALESCE((it->>'quantity')::int,1)));
  IF ci.kind='produto' AND ci.product_type='fisico' AND ci.stock IS NOT NULL THEN
   IF ci.stock<qty THEN RAISE EXCEPTION 'Estoque insuficiente para %',ci.name; END IF;
   UPDATE public.catalog_items SET stock=stock-qty WHERE id=ci.id;
  END IF;
  sub:=sub+pr*qty;
  INSERT INTO public.order_items(order_id,item_id,name,kind,unit_price_cents,quantity,deadline_text,custom_data) VALUES(o.id,ci.id,item_name,ci.kind,pr,qty,it->>'deadline_text',COALESCE(it->'custom','{}'::jsonb));
  IF ci.schedulable AND COALESCE(it->>'date','')<>'' AND COALESCE(it->>'time','')<>'' THEN
   IF NOT public.slot_available((it->>'date')::date,it->>'time') THEN RAISE EXCEPTION 'Horário % % indisponível',it->>'date',it->>'time'; END IF;
   INSERT INTO public.appointments(user_id,order_id,item_id,service_name,slot_date,slot_time,notes,customer_name,customer_whatsapp) VALUES(uid,o.id,ci.id,item_name,(it->>'date')::date,it->>'time',left(it->>'appt_notes',1000),o.customer_name,o.customer_whatsapp);
  END IF;
 END LOOP;
 UPDATE public.orders SET subtotal_cents=sub WHERE id=o.id;
 RETURN jsonb_build_object('id',o.id,'number',o.number,'subtotal_cents',sub);
END; $$;