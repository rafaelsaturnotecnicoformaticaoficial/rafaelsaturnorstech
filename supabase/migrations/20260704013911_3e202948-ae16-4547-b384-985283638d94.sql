
CREATE TABLE public.printing_settings (
  id INT PRIMARY KEY DEFAULT 1,
  pickup_location TEXT NOT NULL DEFAULT 'São Pedro da União - MG',
  local_fee_cents INT NOT NULL DEFAULT 1000,
  whatsapp TEXT NOT NULL DEFAULT '5535998793630',
  pb_frente INT[] NOT NULL DEFAULT ARRAY[100,80,60,40],
  pb_frente_verso INT[] NOT NULL DEFAULT ARRAY[150,120,90,60],
  color_frente INT[] NOT NULL DEFAULT ARRAY[300,250,200,150],
  color_frente_verso INT[] NOT NULL DEFAULT ARRAY[500,400,320,250],
  enable_pickup BOOLEAN NOT NULL DEFAULT true,
  enable_local BOOLEAN NOT NULL DEFAULT true,
  enable_correio BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

GRANT SELECT ON public.printing_settings TO anon, authenticated;
GRANT ALL ON public.printing_settings TO authenticated;
GRANT ALL ON public.printing_settings TO service_role;

ALTER TABLE public.printing_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read printing settings"
  ON public.printing_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage printing settings"
  ON public.printing_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.printing_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
