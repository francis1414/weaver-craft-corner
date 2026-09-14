CREATE OR REPLACE FUNCTION public.enforce_new_order_safety()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.payment_status := 'pending';
  NEW.fulfillment_status := 'unfulfilled';
  NEW.payment_reference := NULL;
  NEW.tracking_number := NULL;
  NEW.tracking_carrier := NULL;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_new_order_safety
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.enforce_new_order_safety();

DROP POLICY "Anyone can place an order" ON public.orders;
CREATE POLICY "Anyone can place a pending order"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  payment_status = 'pending'
  AND fulfillment_status = 'unfulfilled'
  AND payment_reference IS NULL
  AND tracking_number IS NULL
  AND tracking_carrier IS NULL
);