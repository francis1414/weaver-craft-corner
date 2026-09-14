ALTER TABLE public.orders
ADD COLUMN checkout_token text;

CREATE UNIQUE INDEX orders_checkout_token_unique
ON public.orders (checkout_token)
WHERE checkout_token IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_order_for_checkout(
  _order_number text,
  _checkout_token text
)
RETURNS TABLE (
  order_number text,
  total numeric,
  currency text,
  customer jsonb,
  items jsonb,
  payment_status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    o.order_number,
    o.total,
    o.currency,
    o.customer,
    o.items,
    o.payment_status
  FROM public.orders AS o
  WHERE o.order_number = _order_number
    AND o.checkout_token = _checkout_token
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_order_for_checkout(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_for_checkout(text, text) TO anon, authenticated, service_role;