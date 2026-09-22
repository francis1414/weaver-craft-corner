import { createFileRoute } from "@tanstack/react-router";

import { createOrderCheckoutSession } from "@/lib/order-checkout.server";

function isApprovedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    const exactHosts = new Set([
      "vetaverra.com",
      "www.vetaverra.com",
      "shop.vetaverastudio.com",
      "weaver-craft-corner.lovable.app",
      "localhost",
    ]);
    const isPreview = url.hostname.endsWith(".lovable.app") && url.hostname.includes("-preview--");
    return (url.protocol === "https:" || url.hostname === "localhost") && (exactHosts.has(url.hostname) || isPreview);
  } catch {
    return false;
  }
}

function corsHeaders(origin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

export const Route = createFileRoute("/api/public/payments/checkout")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) =>
        isApprovedOrigin(request.headers.get("origin"))
          ? new Response(null, {
              status: 204,
              headers: corsHeaders(request.headers.get("origin") ?? "https://weaver-craft-corner.lovable.app"),
            })
          : new Response(null, { status: 403 }),
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        if (!isApprovedOrigin(origin)) {
          return Response.json({ error: "Checkout origin is not approved" }, { status: 403 });
        }
        const headers = corsHeaders(origin ?? "https://weaver-craft-corner.lovable.app");

        try {
          const contentLength = Number(request.headers.get("content-length") ?? "0");
          if (contentLength > 8_192) {
            return Response.json({ error: "Checkout request is too large" }, { status: 413, headers });
          }
          const body = (await request.json()) as Record<string, unknown>;
          const orderNumber = typeof body["orderNumber"] === "string" ? body["orderNumber"] : "";
          const checkoutToken = typeof body["checkoutToken"] === "string" ? body["checkoutToken"] : "";
          const returnUrl = typeof body["returnUrl"] === "string" ? body["returnUrl"] : "";
          const environment = body["environment"] === "live" ? "live" : body["environment"] === "sandbox" ? "sandbox" : null;

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