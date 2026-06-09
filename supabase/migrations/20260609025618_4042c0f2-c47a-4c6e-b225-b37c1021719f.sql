ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by_code text;

CREATE OR REPLACE FUNCTION public.get_referrer_name(_code text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.full_name
  FROM public.affiliate_codes c
  JOIN public.profiles p ON p.user_id = c.user_id
  WHERE c.code = _code
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.get_referrer_name(text) TO anon, authenticated;