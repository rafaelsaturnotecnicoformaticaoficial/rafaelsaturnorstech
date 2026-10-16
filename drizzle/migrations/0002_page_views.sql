CREATE TABLE public.page_views (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), session_id text NOT NULL, path text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX page_views_created_idx ON public.page_views(created_at DESC);
GRANT INSERT ON public.page_views TO anon, authenticated;
GRANT SELECT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone logs views" ON public.page_views FOR INSERT TO anon, authenticated WITH CHECK (length(path) <= 300 AND length(session_id) <= 64);
CREATE POLICY "Admins read views" ON public.page_views FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
ALTER PUBLICATION supabase_realtime ADD TABLE public.page_views;