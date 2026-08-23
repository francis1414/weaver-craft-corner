import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

let _supabase: ReturnType<typeof createClient<Database>> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient<Database>(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
    );
  }
  return _supabase;
}

type OrderItem = { productId?: string; quantity?: number };

/** Decrements stock for each item in a paid order. Runs once per order. */
async function reduceStock(items: OrderItem[]) {
  const supabase = getSupabase();
  for (const item of items) {
    const productId = item.productId;
    const quantity = Math.max(1, Math.round(Number(item.quantity) || 1));
    if (!productId) continue;
    const { data: product } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", productId)
      .maybeSingle();
    if (!product) continue;
    await supabase
      .from("products")
      .update({
        stock_quantity: Math.max(0, (product.stock_quantity ?? 0) - quantity),
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);
  }
}

async function markOrder(
  orderNumber: string | undefined,
  paymentStatus: "paid" | "failed",
  reference: string | null,
) {
  if (!orderNumber) return;
  const supabase = getSupabase();

  // `.neq` on payment_status makes this idempotent: Stripe can deliver the same
  // event more than once, but only the first delivery updates rows — so stock
  // is never decremented twice for one order.
  const { data: updated } = await supabase
    .from("orders")
    .update({
      payment_status: paymentStatus,
      payment_reference: reference,
      ...(paymentStatus === "paid" ? { fulfillment_status: "processing" } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("order_number", orderNumber)
    .neq("payment_status", paymentStatus)
    .select("items");

  if (paymentStatus !== "paid" || !updated?.length) return;
  const items = Array.isArray(updated[0]?.items) ? (updated[0].items as OrderItem[]) : [];
  await reduceStock(items);
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
