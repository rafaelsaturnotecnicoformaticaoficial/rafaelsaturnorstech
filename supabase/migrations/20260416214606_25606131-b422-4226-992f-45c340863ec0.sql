-- Drop overly broad policies on storage.objects for the 'banners' bucket if any
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT polname FROM pg_policy
    WHERE polrelid = 'storage.objects'::regclass
      AND (polname ILIKE '%banners%' OR polname ILIKE '%banner%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.polname);
  END LOOP;
END $$;

-- Allow public read of individual objects in 'banners' (needed to display images)
CREATE POLICY "Public can read banner files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'banners' AND name IS NOT NULL);

-- Admins can upload/update/delete in 'banners'
CREATE POLICY "Admins can upload banners"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'banners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update banners"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'banners' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete banners"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'banners' AND has_role(auth.uid(), 'admin'::app_role));