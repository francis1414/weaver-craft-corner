CREATE TABLE public.cms_lookbook (
  id text PRIMARY KEY DEFAULT 'default',
  title text NOT NULL DEFAULT 'Trade Lookbook',
  edition text NOT NULL DEFAULT 'Handwoven in Ghana',
  company_profile text NOT NULL DEFAULT '',
  cover_image text NOT NULL DEFAULT '',
  logo_image text NOT NULL DEFAULT '',
  weaver_image text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  contact_address text NOT NULL DEFAULT '',
  product_overrides jsonb NOT NULL DEFAULT '{}'::jsonb,
  product_order jsonb NOT NULL DEFAULT '[]'::jsonb,
  excluded_product_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_lookbook TO authenticated;
GRANT ALL ON public.cms_lookbook TO service_role;
ALTER TABLE public.cms_lookbook ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage trade lookbook"
ON public.cms_lookbook
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));