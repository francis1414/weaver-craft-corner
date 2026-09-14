import { createFileRoute } from "@tanstack/react-router";

import { createOrderCheckoutSession } from "@/lib/order-checkout.server";

function corsHeaders(origin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

export const Route = createFileRoute("/api/public/payments/checkout")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) =>
        new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) }),
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        const headers = corsHeaders(origin);

        try {
          const body = (await request.json()) as Record<string, unknown>;
          const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber : "";
          const checkoutToken = typeof body.checkoutToken === "string" ? body.checkoutToken : "";
          const returnUrl = typeof body.returnUrl === "string" ? body.returnUrl : "";
          const environment = body.environment === "live" ? "live" : body.environment === "sandbox" ? "sandbox" : null;

          if (!/^[A-Za-z0-9-]{4,40}$/.test(orderNumber)) throw new Error("Invalid order reference");
          if (!/^[a-f0-9]{64}$/.test(checkoutToken)) throw new Error("Invalid checkout token");
          if (!environment) throw new Error("Invalid payment environment");

          const parsedReturnUrl = new URL(returnUrl);
          if (parsedReturnUrl.protocol !== "https:" && parsedReturnUrl.hostname !== "localhost") {
            throw new Error("Invalid return URL");
          }
          if (origin && new URL(origin).origin !== parsedReturnUrl.origin) {
            throw new Error("Return URL must match the checkout site");
          }

          const result = await createOrderCheckoutSession({
            orderNumber,
            checkoutToken,
            returnUrl,
            environment,
          });
          return Response.json(result, { headers });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Invalid checkout request";
          return Response.json({ error: message }, { status: 400, headers });
        }
      },
    },
  },
});