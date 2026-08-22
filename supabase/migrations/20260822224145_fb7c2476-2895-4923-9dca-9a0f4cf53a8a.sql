ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS length_cm numeric,
  ADD COLUMN IF NOT EXISTS width_cm numeric,
  ADD COLUMN IF NOT EXISTS height_cm numeric,
  ADD COLUMN IF NOT EXISTS diameter_cm numeric,
  ADD COLUMN IF NOT EXISTS color_description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS video_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS video_loop boolean NOT NULL DEFAULT false;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_reference text;

DROP POLICY IF EXISTS "Admins read product media" ON storage.objects;
CREATE POLICY "Admins read product media"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'product-media' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins upload product media" ON storage.objects;
CREATE POLICY "Admins upload product media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-media' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update product media" ON storage.objects;
CREATE POLICY "Admins update product media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-media' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete product media" ON storage.objects;
CREATE POLICY "Admins delete product media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-media' AND public.has_role(auth.uid(), 'admin'));