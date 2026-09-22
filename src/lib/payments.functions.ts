import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  type StripeEnv,
  createStripeClient,
  getStripeErrorMessage,
} from "@/lib/stripe.server";
import {
  type CheckoutResult,
  createOrderCheckoutSession,
} from "@/lib/order-checkout.server";

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
      const returnUrl = new URL(data.returnUrl);
      const approvedHosts = new Set([
        "vetaverra.com",
        "www.vetaverra.com",
        "shop.vetaverastudio.com",
        "weaver-craft-corner.lovable.app",
        "localhost",
      ]);
      if ((returnUrl.protocol !== "https:" && returnUrl.hostname !== "localhost") || !approvedHosts.has(returnUrl.hostname)) {
        throw new Error("Invalid return URL");
      }
      return data;
    },
  )
  .handler(async ({ data }): Promise<CheckoutResult> => createOrderCheckoutSession(data));


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
