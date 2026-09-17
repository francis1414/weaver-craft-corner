ALTER TABLE public.cms_homepage
ADD COLUMN IF NOT EXISTS instagram_posts jsonb NOT NULL DEFAULT '[]'::jsonb;