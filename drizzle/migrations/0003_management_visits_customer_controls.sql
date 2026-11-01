CREATE TABLE public.site_sessions (session_id uuid PRIMARY KEY, last_seen timestamptz NOT NULL DEFAULT now(), path text NOT NULL);
GRANT SELECT ON public.site_sessions TO authenticated;
GRANT ALL ON public.site_sessions TO service_role;
ALTER TABLE public.site_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read live sessions" ON public.site_sessions FOR SELECT TO authenticated USING(public.has_role(auth.uid(),'admin'));
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_sessions;
CREATE OR REPLACE FUNCTION public.record_site_visit(_session uuid, _path text, _view boolean DEFAULT false) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE previous_seen timestamptz;
BEGIN
 IF _session IS NULL OR _path IS NULL OR length(_path)>300 OR left(_path,1)<>'/' OR _path LIKE '/admin%' THEN RETURN; END IF;
 SELECT last_seen INTO previous_seen FROM public.site_sessions WHERE session_id=_session;
 IF previous_seen > now()-interval '2 seconds' THEN RETURN; END IF;
 INSERT INTO public.site_sessions(session_id,path) VALUES(_session,_path) ON CONFLICT(session_id) DO UPDATE SET last_seen=now(),path=excluded.path;
 IF _view THEN INSERT INTO public.page_views(session_id,path) VALUES(_session::text,_path); END IF;
END $$;
REVOKE ALL ON FUNCTION public.record_site_visit(uuid,text,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_site_visit(uuid,text,boolean) TO anon,authenticated;
CREATE OR REPLACE FUNCTION public.delete_customer_profile(_profile_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE target uuid;
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Acesso negado'; END IF;
 SELECT user_id INTO target FROM public.profiles WHERE id=_profile_id;
 IF target IS NULL THEN RAISE EXCEPTION 'Cliente não encontrado'; END IF;
 IF target=auth.uid() OR public.has_role(target,'admin') THEN RAISE EXCEPTION 'Não é permitido excluir administradores'; END IF;
 DELETE FROM public.profiles WHERE id=_profile_id;
END $$;
REVOKE ALL ON FUNCTION public.delete_customer_profile(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_customer_profile(uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.management_report(_from date, _to date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb; start_at timestamptz := _from::timestamp AT TIME ZONE 'America/Sao_Paulo'; end_at timestamptz := (_to+1)::timestamp AT TIME ZONE 'America/Sao_Paulo';
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Acesso negado'; END IF;
 IF _from IS NULL OR _to IS NULL OR _to<_from THEN RAISE EXCEPTION 'Período inválido'; END IF;
 SELECT jsonb_build_object(
 'orders',(SELECT count(*) FROM public.orders WHERE created_at>=start_at AND created_at<end_at),
 'order_value_cents',(SELECT coalesce(sum(subtotal_cents),0) FROM public.orders WHERE created_at>=start_at AND created_at<end_at AND status<>'cancelado'),
 'completed_value_cents',(SELECT coalesce(sum(subtotal_cents),0) FROM public.orders WHERE created_at>=start_at AND created_at<end_at AND status='concluido'),
 'appointments',(SELECT count(*) FROM public.appointments WHERE slot_date BETWEEN _from AND _to AND status<>'cancelado'),
 'customers',(SELECT count(*) FROM public.profiles WHERE created_at>=start_at AND created_at<end_at),
 'views',(SELECT count(*) FROM public.page_views WHERE created_at>=start_at AND created_at<end_at),
 'visitors',(SELECT count(DISTINCT session_id) FROM public.page_views WHERE created_at>=start_at AND created_at<end_at),
 'online',(SELECT count(*) FROM public.site_sessions WHERE last_seen>now()-interval '90 seconds'),
 'pages',coalesce((SELECT jsonb_agg(p) FROM (SELECT path,count(*) AS views FROM public.page_views WHERE created_at>=start_at AND created_at<end_at GROUP BY path ORDER BY count(*) DESC LIMIT 20)p),'[]'::jsonb),
 'statuses',coalesce((SELECT jsonb_agg(s) FROM (SELECT status,count(*) AS total FROM public.orders WHERE created_at>=start_at AND created_at<end_at GROUP BY status)s),'[]'::jsonb)
 ) INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.management_report(date,date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.management_report(date,date) TO authenticated;