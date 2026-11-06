CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
  whatsapp text NOT NULL CHECK (char_length(whatsapp) BETWEEN 8 AND 20),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send contact" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (read = false);
CREATE POLICY "Admins read contact" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update contact" ON public.contact_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete contact" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;