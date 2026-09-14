import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import {
  type StripeEnv,
  createStripeClient,
  getStripeErrorMessage,
} from "@/lib/stripe.server";

const ZERO_DECIMAL = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

function toMinorUnit(amount: number, currency: string): number {
  return ZERO_DECIMAL.has(currency.toLowerCase())
    ? Math.round(amount)
    : Math.round(amount * 100);
}

type CheckoutResult = { clientSecret: string } | { error: string };

type OrderItem = { name?: string; price?: number; quantity?: number; image?: string };

function createCheckoutDatabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    throw new Error("The secure payment service is temporarily unavailable");
  }

  return createClient<Database>(url, publishableKey, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Starts a card payment for an order that already exists in the database.
 * Line items are built on the fly from the stored order, so nothing has to be
 * registered up front in the payment provider — add or reprice products in the
 * dashboard and checkout follows automatically.
 */
export const createOrderCheckout = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      orderNumber: string;
      checkoutToken: string;
      returnUrl: string;
      environment: StripeEnv;
    }) => {
      if (!/^[A-Za-z0-9-]{4,40}$/.test(data.orderNumber)) {
        throw new Error("Invalid order reference");
      }
      if (!/^[a-f0-9]{64}$/.test(data.checkoutToken)) {
        throw new Error("Invalid checkout token");
      }
      if (!/^https?:\/\//.test(data.returnUrl)) throw new Error("Invalid return URL");
      return data;
    },
  )
  .handler(async ({ data }): Promise<CheckoutResult> => {
    try {
      const checkoutDb = createCheckoutDatabaseClient();
      const { data: orders, error } = await checkoutDb.rpc("get_order_for_checkout", {
        _order_number: data.orderNumber,
        _checkout_token: data.checkoutToken,
      });

      if (error) throw error;
      const order = orders?.[0];
      if (!order) return { error: "Order not found" };
      if (order.payment_status === "paid") return { error: "This order is already paid" };

      const currency = (order.currency ?? "USD").toLowerCase();
      const total = toMinorUnit(Number(order.total) || 0, currency);
      if (total < 50) return { error: "Order total is too low to charge" };

      const items = Array.isArray(order.items) ? (order.items as OrderItem[]) : [];
      const lineItems: {
        price_data: {
          currency: string;
          product_data: { name: string; images?: string[] };
          unit_amount: number;
        };
        quantity: number;
      }[] = [];

      let itemsTotal = 0;
      for (const item of items) {
        const unit = toMinorUnit(Number(item.price) || 0, currency);
        const quantity = Math.max(1, Math.round(Number(item.quantity) || 1));
        if (unit <= 0) continue;
        itemsTotal += unit * quantity;
        lineItems.push({
          price_data: {
            currency,
            product_data: {
              name: item.name?.slice(0, 250) || `Vetastudio order ${order.order_number}`,
              ...(item.image?.startsWith("https://") ? { images: [item.image] } : {}),
            },
            unit_amount: unit,
          },
          quantity,
        });
      }

      // Shipping and tax as their own line so the charged amount always equals
      // the order total the customer approved. Discounts make the remainder
      // negative — in that case charge the order total as one line.
      const remainder = total - itemsTotal;
      if (!lineItems.length || remainder < 0) {
        lineItems.length = 0;
        lineItems.push({
          price_data: {
            currency,
            product_data: { name: `Vetastudio order ${order.order_number}` },
            unit_amount: total,
          },
          quantity: 1,
        });
      } else if (remainder > 0) {
        lineItems.push({
          price_data: {
            currency,
            product_data: { name: "Shipping & tax" },
            unit_amount: remainder,
          },
          quantity: 1,
        });
      }

      const customer = (order.customer ?? {}) as { email?: string; name?: string };
      const stripe = createStripeClient(data.environment);

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        line_items: lineItems,
        payment_intent_data: {
          description: `Vetastudio order ${order.order_number}`,
        },
        ...(customer.email ? { customer_email: customer.email } : {}),
        metadata: { orderNumber: order.order_number },
      });

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });


export type PaymentRow = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  email: string | null;
  refunded: boolean;
  created: string | null;
};

type PaymentsResult = { payments: PaymentRow[] } | { error: string };

/** Recent card transactions for the back-office payments screen. */
export const listRecentPayments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data, context }): Promise<PaymentsResult> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) return { error: "Forbidden" };

    try {
      const stripe = createStripeClient(data.environment);
      const charges = await stripe.charges.list({ limit: 25 });
      return {
        payments: charges.data.map((charge) => ({
          id: charge.id,
          amount: ZERO_DECIMAL.has(charge.currency)
            ? charge.amount
            : charge.amount / 100,
          currency: charge.currency.toUpperCase(),
          status: charge.status,
          description: charge.description ?? null,
          email: charge.billing_details?.email ?? null,
          refunded: charge.refunded ?? false,
          created: charge.created ? new Date(charge.created * 1000).toISOString() : null,
        })),
      };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });
