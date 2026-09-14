ALTER TABLE public.cms_homepage
  ADD COLUMN IF NOT EXISTS fair_wage jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS fair_wage_pillars jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS section_headings jsonb NOT NULL DEFAULT '{}'::jsonb;

INSERT INTO public.cms_homepage (id) VALUES ('default')
ON CONFLICT (id) DO NOTHING;

UPDATE public.cms_homepage
SET
  fair_wage = CASE WHEN fair_wage = '{}'::jsonb THEN jsonb_build_object(
    'eyebrow', 'Fair-wage transparency',
    'heading', 'Every basket pays its maker first',
    'ctaLabel', 'See where your money goes'
  ) ELSE fair_wage END,
  fair_wage_pillars = CASE WHEN fair_wage_pillars = '[]'::jsonb THEN jsonb_build_array(
    jsonb_build_object('title', '2.4x fair wages', 'body', 'Per-piece commissions at 2.4x the regional average, paid on collection day - never on sale.'),
    jsonb_build_object('title', 'Medical care covered', 'body', 'A share of every order funds clinic visits, prescriptions and emergencies for weavers and their children.'),
    jsonb_build_object('title', 'Community projects', 'body', 'School fees, boreholes and dye gardens funded in the weaving villages of Bolgatanga, Sumbrungu and Zuarungu.')
  ) ELSE fair_wage_pillars END,
  section_headings = CASE WHEN section_headings = '{}'::jsonb THEN jsonb_build_object(
    'categories', 'Shop by craft',
    'featured', 'The signature collection',
    'process', 'From grass to basket',
    'arrivals', 'Newly added',
    'campaigns', 'Studio campaigns',
    'spotlight', 'Weaver spotlight',
    'testimonials', 'Collector notes'
  ) ELSE section_headings END,
  updated_at = now()
WHERE id = 'default';