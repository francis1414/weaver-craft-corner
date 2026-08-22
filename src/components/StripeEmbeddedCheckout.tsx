import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";

import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createOrderCheckout } from "@/lib/payments.functions";

interface Props {
  orderNumber: string;
  returnUrl: string;
}

export function StripeEmbeddedCheckout({ orderNumber, returnUrl }: Props) {
  const fetchClientSecret = async (): Promise<string> => {
    const result = await createOrderCheckout({
      data: { orderNumber, returnUrl, environment: getStripeEnvironment() },
    });
    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("The payment provider returned no session");
    return result.clientSecret;
  };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
