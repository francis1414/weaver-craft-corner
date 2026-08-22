ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS shipping_label text NOT NULL DEFAULT 'Worldwide Express Shipping',
  ADD COLUMN IF NOT EXISTS shipping_additional_item numeric NOT NULL DEFAULT 40,
  ADD COLUMN IF NOT EXISTS shipping_carrier text NOT NULL DEFAULT 'Tracked air courier via DHL Express / FedEx',
  ADD COLUMN IF NOT EXISTS shipping_transit_time text NOT NULL DEFAULT '7 - 10 Business Days';

UPDATE public.store_settings SET shipping_international = 68 WHERE id = 'default' AND shipping_international = 28;