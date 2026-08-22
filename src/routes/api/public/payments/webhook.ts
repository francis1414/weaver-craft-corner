import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
    );
  }
  return _supabase;
}

async function markOrder(
  orderNumber: string | undefined,
  paymentStatus: "paid" | "failed",
  reference: string | null,
) {
  if (!orderNumber) return;
  await getSupabase()
    .from("orders")
    .update({
      payment_status: paymentStatus,
      payment_reference: reference,
      ...(paymentStatus === "paid" ? { fulfillment_status: "processing" } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("order_number", orderNumber);
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);
  const object = event.data.object;
  const orderNumber = object?.metadata?.orderNumber as string | undefined;

  switch (event.type) {
    case "checkout.session.completed":
      if (object?.payment_status !== "unpaid") {
        await markOrder(orderNumber, "paid", object?.id ?? null);
      }
      break;
    case "checkout.session.async_payment_succeeded":
      await markOrder(orderNumber, "paid", object?.id ?? null);
      break;
    case "checkout.session.async_payment_failed":
      await markOrder(orderNumber, "failed", object?.id ?? null);
      break;
    default:
      console.log("Unhandled payments event:", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          console.error("Payments webhook received invalid env:", rawEnv);
          return Response.json({ received: true, ignored: "invalid env" });
        }
        try {
          await handleWebhook(request, rawEnv);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Payments webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
