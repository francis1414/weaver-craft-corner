import { useEffect, useState } from "react";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";

import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createOrderCheckout } from "@/lib/payments.functions";
import { whatsappLink } from "@/lib/whatsapp";

interface Props {
  orderNumber: string;
  checkoutToken: string;
  returnUrl: string;
}

const LIVE_PAYMENT_SERVICE = "https://weaver-craft-corner.lovable.app";

async function requestCheckout(data: {
  orderNumber: string;
  checkoutToken: string;
  returnUrl: string;
  environment: "sandbox" | "live";
}) {
  const isLovableHosted =
    window.location.hostname.endsWith(".lovable.app") ||
    window.location.hostname === "localhost";
  if (isLovableHosted) return createOrderCheckout({ data });

  const response = await fetch(`${LIVE_PAYMENT_SERVICE}/api/public/payments/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = (await response.json()) as { clientSecret?: string; error?: string };
  if (!response.ok && !result.error) throw new Error("The secure payment service is unavailable");
  return result.error ? { error: result.error } : { clientSecret: result.clientSecret ?? "" };
}

export function StripeEmbeddedCheckout({ orderNumber, checkoutToken, returnUrl }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setClientSecret(null);

    (async () => {
      try {
        const result = await requestCheckout({
          orderNumber,
          checkoutToken,
          returnUrl,
          environment: getStripeEnvironment(),
        });
        if (cancelled) return;
        if ("error" in result) {
          setError(result.error);
          return;
        }
        if (!result.clientSecret) {
          setError("The payment provider returned no session. Please try again.");
          return;
        }
        setClientSecret(result.clientSecret);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "We could not start the card payment.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderNumber, checkoutToken, returnUrl, attempt]);

  if (error) {
    return (
      <div className="border border-border bg-card p-6">
        <p className="label-caps text-gold">Payment could not start</p>
        <p className="mt-3 text-sm text-muted-foreground">{error}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setAttempt((a) => a + 1)}
            className="inline-flex h-11 items-center bg-foreground px-5 text-xs uppercase tracking-[0.2em] text-background"
          >
            Try again
          </button>
          <a
            href={whatsappLink(
              `Hello Veta Vera Studio, I would like to pay for order ${orderNumber}. The card form did not open.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center border border-border px-5 text-xs uppercase tracking-[0.2em]"
          >
            Pay with our studio on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex h-40 items-center justify-center gap-3 border border-border bg-card text-sm text-muted-foreground">
        <Loader2 className="animate-spin" size={18} /> Preparing secure card payment…
      </div>
    );
  }

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret: async () => clientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
