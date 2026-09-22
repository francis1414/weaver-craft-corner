CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.create_secure_order(
  _customer jsonb,
  _cart jsonb,
  _shipping_method text,
  _payment_method text,
  _promo_code text,
  _currency text,
  _customer_notes text
)
RETURNS TABLE(order_number text, checkout_token text, subtotal numeric, shipping_cost numeric, tax numeric, discount numeric, total numeric, currency text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings public.store_settings%ROWTYPE;
  v_item jsonb;
  v_product public.products%ROWTYPE;
  v_items jsonb := '[]'::jsonb;
  v_subtotal_usd numeric := 0;
  v_discount_rate numeric := 0;
  v_discount_usd numeric;
  v_discounted_usd numeric;
  v_shipping_usd numeric;
  v_tax_usd numeric;
  v_total_usd numeric;
  v_rate numeric;
  v_units integer := 0;
  v_quantity integer;
  v_order_number text;
  v_checkout_token text;
  v_email text;
  v_phone text;
BEGIN
  IF jsonb_typeof(_customer) <> 'object' OR jsonb_typeof(_cart) <> 'array' OR jsonb_array_length(_cart) < 1 OR jsonb_array_length(_cart) > 50 THEN
    RAISE EXCEPTION 'Invalid order details';
  END IF;

  v_email := lower(trim(coalesce(_customer->>'email', '')));
  v_phone := trim(coalesce(_customer->>'phone', ''));
  IF length(trim(coalesce(_customer->>'name', ''))) NOT BETWEEN 2 AND 100
    OR v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    OR length(v_email) > 255
    OR v_phone !~ '^[0-9+() -]{7,30}$'
    OR length(trim(coalesce(_customer->>'address', ''))) NOT BETWEEN 5 AND 200
    OR length(trim(coalesce(_customer->>'city', ''))) NOT BETWEEN 2 AND 80
    OR length(trim(coalesce(_customer->>'postalCode', ''))) NOT BETWEEN 3 AND 20
    OR length(trim(coalesce(_customer->>'country', ''))) NOT BETWEEN 2 AND 80 THEN
    RAISE EXCEPTION 'Invalid customer details';
  END IF;

  IF _shipping_method NOT IN ('standard', 'express')
    OR _payment_method NOT IN ('card', 'contact-to-pay', 'mobile-money', 'bank-transfer')
    OR _currency NOT IN ('USD', 'EUR', 'GBP', 'GHS', 'CAD')
    OR length(coalesce(_customer_notes, '')) > 500 THEN
    RAISE EXCEPTION 'Invalid order options';
  END IF;

  IF upper(trim(coalesce(_promo_code, ''))) NOT IN ('', 'BOLGA10', 'WEAVE15', 'HARVEST20') THEN
    RAISE EXCEPTION 'Invalid promo code';
  END IF;

  IF (SELECT count(*) FROM jsonb_array_elements(_cart)) <>
     (SELECT count(DISTINCT value->>'productId') FROM jsonb_array_elements(_cart)) THEN
    RAISE EXCEPTION 'Duplicate cart item';
  END IF;

  SELECT * INTO v_settings FROM public.store_settings WHERE id = 'default';
  IF NOT FOUND THEN RAISE EXCEPTION 'Store settings unavailable'; END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(_cart)
  LOOP
    IF jsonb_typeof(v_item) <> 'object' OR coalesce(v_item->>'productId', '') !~ '^[0-9a-fA-F-]{36}$' OR coalesce(v_item->>'quantity', '') !~ '^[0-9]{1,3}$' THEN
      RAISE EXCEPTION 'Invalid cart item';
    END IF;
    v_quantity := (v_item->>'quantity')::integer;
    IF v_quantity < 1 OR v_quantity > 99 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;

    SELECT * INTO v_product FROM public.products
    WHERE id = (v_item->>'productId')::uuid AND status = 'active'
    FOR SHARE;
    IF NOT FOUND THEN RAISE EXCEPTION 'A product is no longer available'; END IF;
    IF v_product.stock_quantity < v_quantity THEN RAISE EXCEPTION 'Requested quantity is unavailable'; END IF;

    v_subtotal_usd := v_subtotal_usd + coalesce(v_product.sale_price, v_product.price) * v_quantity;
    v_units := v_units + v_quantity;
    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'productId', v_product.id,
      'name', v_product.name,
      'price', coalesce(v_product.sale_price, v_product.price),
      'quantity', v_quantity,
      'image', v_product.primary_image
    ));
  END LOOP;

  CASE upper(trim(coalesce(_promo_code, '')))
    WHEN 'BOLGA10' THEN v_discount_rate := 0.10;
    WHEN 'WEAVE15' THEN v_discount_rate := 0.15;
    WHEN 'HARVEST20' THEN v_discount_rate := 0.20;
    ELSE v_discount_rate := 0;
  END CASE;

  v_discount_usd := v_subtotal_usd * v_discount_rate;
  v_discounted_usd := v_subtotal_usd - v_discount_usd;
  v_shipping_usd := CASE WHEN v_discounted_usd >= v_settings.free_shipping_threshold THEN 0 ELSE v_settings.shipping_international + greatest(0, v_units - 1) * v_settings.shipping_additional_item END;
  IF _shipping_method = 'express' THEN v_shipping_usd := v_shipping_usd * 2.2; END IF;
  v_tax_usd := v_discounted_usd * v_settings.tax_rate;
  v_total_usd := v_discounted_usd + v_shipping_usd + v_tax_usd;
  v_rate := CASE WHEN _currency = 'USD' THEN 1 ELSE coalesce((v_settings.currency_rates ->> _currency)::numeric, 1) END;
  IF v_rate <= 0 THEN RAISE EXCEPTION 'Invalid currency rate'; END IF;

  v_order_number := 'VS-' || upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 8));
  v_checkout_token := encode(extensions.gen_random_bytes(32), 'hex');

  INSERT INTO public.orders (
    order_number, checkout_token, customer, items, subtotal, shipping_cost, tax, discount, total,
    payment_method, currency, customer_notes
  ) VALUES (
    v_order_number,
    v_checkout_token,
    jsonb_build_object(
      'name', trim(_customer->>'name'), 'email', v_email, 'phone', v_phone,
      'address', trim(_customer->>'address'), 'city', trim(_customer->>'city'),
      'postalCode', trim(_customer->>'postalCode'), 'country', trim(_customer->>'country')
    ),
    (SELECT coalesce(jsonb_agg(item || jsonb_build_object('price', round(((item->>'price')::numeric * v_rate), 2))), '[]'::jsonb) FROM jsonb_array_elements(v_items) item),
    round(v_subtotal_usd * v_rate, 2), round(v_shipping_usd * v_rate, 2), round(v_tax_usd * v_rate, 2),
    round(v_discount_usd * v_rate, 2), round(v_total_usd * v_rate, 2), _payment_method, _currency,
    nullif(trim(coalesce(_customer_notes, '')), '')
  );

  RETURN QUERY SELECT v_order_number, v_checkout_token,
    round(v_subtotal_usd * v_rate, 2), round(v_shipping_usd * v_rate, 2), round(v_tax_usd * v_rate, 2),
    round(v_discount_usd * v_rate, 2), round(v_total_usd * v_rate, 2), _currency;
END;
$$;

REVOKE ALL ON FUNCTION public.create_secure_order(jsonb, jsonb, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_secure_order(jsonb, jsonb, text, text, text, text, text) TO anon, authenticated;