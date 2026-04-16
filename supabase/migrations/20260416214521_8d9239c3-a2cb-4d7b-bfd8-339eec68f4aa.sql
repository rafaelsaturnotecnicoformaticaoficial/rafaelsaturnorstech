-- 1. Restrict adsense_blocks SELECT to admins only (was public)
DROP POLICY IF EXISTS "Anyone can view active ads" ON public.adsense_blocks;

CREATE POLICY "Admins can view ads"
ON public.adsense_blocks
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Lock down user_roles: explicit deny for INSERT/UPDATE/DELETE except admins
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));