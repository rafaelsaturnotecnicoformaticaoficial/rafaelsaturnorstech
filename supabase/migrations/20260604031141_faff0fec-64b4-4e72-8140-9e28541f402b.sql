DROP POLICY IF EXISTS "Anyone view codes" ON public.affiliate_codes;

CREATE POLICY "Owners view own codes"
ON public.affiliate_codes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins view all codes"
ON public.affiliate_codes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));