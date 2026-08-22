-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  product_count integer NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sku text NOT NULL DEFAULT '',
  category text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  sale_price numeric(10,2),
  stock_quantity integer NOT NULL DEFAULT 0,
  low_stock_threshold integer NOT NULL DEFAULT 3,
  status text NOT NULL DEFAULT 'active',
  featured boolean NOT NULL DEFAULT false,
  primary_image text NOT NULL DEFAULT '',
  images text[] NOT NULL DEFAULT '{}',
  description text NOT NULL DEFAULT '',
  dimensions text NOT NULL DEFAULT '',
  material text NOT NULL DEFAULT 'Veta Vera elephant grass',
  artisan_story text NOT NULL DEFAULT '',
  care_instructions text NOT NULL DEFAULT '',
  color text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  rating numeric(2,1) NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  weight_kg numeric(6,2) NOT NULL DEFAULT 1,
  capacity text NOT NULL DEFAULT '',
  handle text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active products are public" ON public.products FOR SELECT USING (status = 'active');
CREATE POLICY "Admins read all products" ON public.products FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer jsonb NOT NULL DEFAULT '{}'::jsonb,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  shipping_cost numeric(10,2) NOT NULL DEFAULT 0,
  tax numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'card',
  payment_status text NOT NULL DEFAULT 'pending',
  fulfillment_status text NOT NULL DEFAULT 'unfulfilled',
  tracking_number text,
  tracking_carrier text,
  customer_notes text,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can place an order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage orders" ON public.orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Subscribers
CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'subscribed',
  source text NOT NULL DEFAULT 'footer_newsletter',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.subscribers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscribers TO authenticated;
GRANT ALL ON public.subscribers TO service_role;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage subscribers" ON public.subscribers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  rating integer NOT NULL,
  title text NOT NULL DEFAULT '',
  comment text NOT NULL DEFAULT '',
  is_approved boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  is_verified_purchase boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved reviews are public" ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Anyone can submit a review" ON public.reviews FOR INSERT
  WITH CHECK (is_approved = false AND rating BETWEEN 1 AND 5 AND char_length(customer_name) BETWEEN 1 AND 80 AND char_length(comment) <= 1500);
CREATE POLICY "Admins manage reviews" ON public.reviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Journal
CREATE TABLE public.journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_image text NOT NULL DEFAULT '',
  author text NOT NULL DEFAULT 'Vetastudio',
  read_time integer NOT NULL DEFAULT 4,
  published_at timestamptz NOT NULL DEFAULT now(),
  tags text[] NOT NULL DEFAULT '{}'
);
GRANT SELECT ON public.journal TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal TO authenticated;
GRANT ALL ON public.journal TO service_role;
ALTER TABLE public.journal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Journal is public" ON public.journal FOR SELECT USING (true);
CREATE POLICY "Admins manage journal" ON public.journal FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Singleton config tables
CREATE TABLE public.store_settings (
  id text PRIMARY KEY DEFAULT 'default',
  currency_rates jsonb NOT NULL DEFAULT '{}'::jsonb,
  tax_rate numeric(5,4) NOT NULL DEFAULT 0.05,
  shipping_domestic numeric(10,2) NOT NULL DEFAULT 12,
  shipping_international numeric(10,2) NOT NULL DEFAULT 28,
  free_shipping_threshold numeric(10,2) NOT NULL DEFAULT 150,
  announcement text NOT NULL DEFAULT '',
  support_email text NOT NULL DEFAULT 'care@vetastudio.com',
  support_phone text NOT NULL DEFAULT '+233 20 000 0000',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings are public" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.store_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.cms_homepage (
  id text PRIMARY KEY DEFAULT 'default',
  hero_slides jsonb NOT NULL DEFAULT '[]'::jsonb,
  value_pillars jsonb NOT NULL DEFAULT '[]'::jsonb,
  weaver_spotlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  process_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  campaign_cards jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cms_homepage TO anon;
GRANT SELECT, INSERT, UPDATE ON public.cms_homepage TO authenticated;
GRANT ALL ON public.cms_homepage TO service_role;
ALTER TABLE public.cms_homepage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Homepage CMS is public" ON public.cms_homepage FOR SELECT USING (true);
CREATE POLICY "Admins manage homepage CMS" ON public.cms_homepage FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;