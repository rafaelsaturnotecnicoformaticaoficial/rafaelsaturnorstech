
-- Create supporters table
CREATE TABLE public.supporters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.supporters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active supporters"
ON public.supporters FOR SELECT TO public
USING (active = true);

CREATE POLICY "Admins can manage supporters"
ON public.supporters FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_supporters_updated_at
BEFORE UPDATE ON public.supporters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for banner images
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);

CREATE POLICY "Anyone can view banners"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'banners');

CREATE POLICY "Admins can upload banners"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete banners"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'::app_role));
