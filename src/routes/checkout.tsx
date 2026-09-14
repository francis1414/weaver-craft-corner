import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { SmartImage } from "@/components/SmartImage";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { useStore } from "@/context/StoreProvider";
import { useSettings } from "@/hooks/use-store-data";
import { usePrice } from "@/hooks/use-price";
import { createOrder } from "@/lib/store-api";
import { paymentsConfigured } from "@/lib/stripe";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";



export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Checkout — Vetastudio" },
      {
        name: "description",
        content:
          "Complete your Vetastudio order: shipping details, delivery method and order confirmation.",
      },
      { property: "og:title", content: "Secure Checkout — Vetastudio" },
      { property: "og:description", content: "Complete your handwoven basket order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const addressSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .min(7, "Enter your mobile number so we can reach you")
    .max(30)
    .regex(/^[0-9+()\s-]{7,30}$/, "Enter a valid mobile number"),
  address: z.string().trim().min(5, "Enter your street address").max(200),
  city: z.string().trim().min(2, "Enter your city").max(80),
  postalCode: z.string().trim().min(3, "Enter a postal code").max(20),
  country: z.string().trim().min(2, "Enter your country").max(80),
});


const SHIPPING = [
  { id: "standard", label: "Standard (7–12 days)", multiplier: 1 },
  { id: "express", label: "DHL Express (3–5 days)", multiplier: 2.2 },
] as const;

function createCheckoutToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function CheckoutPage() {
  const { cart, cartSubtotal, discountRate, promoCode, applyPromo, clearCart, currency } =
    useStore();
  const settings = useSettings();
  const price = usePrice();

  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<(typeof SHIPPING)[number]["id"]>("standard");
  const [payment, setPayment] = useState("card");
  const [notes, setNotes] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [checkoutToken, setCheckoutToken] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const totals = useMemo(() => {
    const discount = cartSubtotal * discountRate;
    const discounted = cartSubtotal - discount;
    const units = cart.reduce((sum, line) => sum + line.quantity, 0);
    const base =
      discounted >= settings.freeShippingThreshold
        ? 0
        : settings.shippingInternational +
          Math.max(0, units - 1) * settings.shippingAdditionalItem;
    const shipping = base * (SHIPPING.find((s) => s.id === method)?.multiplier ?? 1);
    const tax = discounted * settings.taxRate;
    return { discount, discounted, shipping, tax, total: discounted + shipping + tax };
  }, [cart, cartSubtotal, discountRate, method, settings]);

  async function placeOrder() {
    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      setStep(1);
      return;
    }
    setPending(true);
    const number = `VS-${Date.now().toString().slice(-8)}`;
    const token = createCheckoutToken();
    try {
      await createOrder({
        orderNumber: number,
        checkoutToken: token,
        customer: parsed.data,
        items: cart.map((l) => ({
          productId: l.productId,
          name: l.name,
          price: l.price,
          quantity: l.quantity,
          image: l.image,
        })),
        subtotal: cartSubtotal,
        shippingCost: totals.shipping,
        tax: totals.tax,
        discount: totals.discount,
        total: totals.total,
        paymentMethod: payment,
        currency,
        customerNotes: notes,
      });
      setOrderNumber(number);
      setCheckoutToken(token);
      clearCart();
      setStep(payment === "card" && paymentsConfigured() ? 5 : 4);
    } catch {
      toast.error("We could not place your order. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (step === 5 && orderNumber && checkoutToken) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 md:px-8">
        <PaymentTestModeBanner />
        <p className="label-caps mt-8 text-gold">Secure payment</p>
        <h1 className="mt-3 font-serif text-4xl">Pay for order {orderNumber}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your order is reserved. Complete payment below to confirm it with our studio.
        </p>
        <div className="mt-8">
          <StripeEmbeddedCheckout
            orderNumber={orderNumber}
            checkoutToken={checkoutToken}
            returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
          />
        </div>
      </div>
    );
  }

  if (step === 4 && orderNumber) {
    const contactToPay = payment === "contact-to-pay";
    return (
      <div className="mx-auto max-w-xl px-4 py-28 text-center md:px-8">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage text-background">
          <Check size={22} />
        </span>
        <p className="label-caps mt-6 text-gold">Thank you</p>
        <h1 className="mt-3 font-serif text-4xl">
          {contactToPay ? "Order reserved" : "Order confirmed"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {contactToPay ? (
            <>
              Your order <strong>{orderNumber}</strong> is reserved with our Bolgatanga studio.
              Message us to arrange payment and we will confirm your basket right away.
            </>
          ) : (
            <>
              Your order <strong>{orderNumber}</strong> is with our Bolgatanga studio. We will email
              tracking details as soon as it ships.
            </>
          )}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {contactToPay && (
            <a
              href={whatsappLink(
                `Hello Vetastudio, I have placed order ${orderNumber} and would like to arrange payment.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center bg-foreground px-6 text-xs uppercase tracking-[0.2em] text-background"
            >
              Contact us on WhatsApp
            </a>
          )}
          <Link
            to="/shop"
            className={cn(
              "inline-flex h-12 items-center px-6 text-xs uppercase tracking-[0.2em]",
              contactToPay
                ? "border border-border"
                : "bg-foreground text-background",
            )}
          >
            Continue browsing
          </Link>
        </div>
      </div>
    );
  }




  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-28 text-center md:px-8">
        <p className="label-caps text-gold">Your collection</p>
        <h1 className="mt-4 font-serif text-3xl">Your shopping bag is empty</h1>
        <p className="mt-4 text-sm text-muted-foreground">Explore our handcrafted collectible baskets before proceeding to checkout.</p>
        <Link
          to="/shop"
          className="mt-6 inline-flex h-12 items-center bg-foreground px-6 text-xs uppercase tracking-[0.2em] text-background"
        >
          Browse the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-8 md:py-24">
      <header className="border-b border-border pb-10">
        <p className="label-caps text-gold">Secure checkout</p>
        <h1 className="mt-4 font-serif text-5xl">Complete your collection</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">Your details are handled securely. Review each step before placing your order with our Bolgatanga studio.</p>
      </header>
      <ol className="mt-8 grid grid-cols-3 gap-3 text-[10px] uppercase tracking-[0.16em] sm:flex sm:gap-8 sm:text-xs">
        {["Address", "Delivery", "Payment"].map((label, i) => (
          <li
            key={label}
            className={cn(
              "min-w-0 items-center gap-2 border-b pb-4 sm:flex",
              step === i + 1 ? "text-gold" : "text-muted-foreground",
            )}
          >
            <span className="mb-2 grid h-6 w-6 place-items-center rounded-full border border-current sm:mb-0">
              {i + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>

      <div className="mt-12 grid items-start gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.8fr)] lg:gap-16">
        <div className="min-w-0">
          {step === 1 && (
            <section className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["name", "Full name"],
                  ["email", "Email"],
                  ["phone", "Mobile number (required)"],
                  ["address", "Street address"],
                  ["city", "City"],
                  ["postalCode", "Postal code"],
                  ["country", "Country"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className={cn("block", key === "address" && "sm:col-span-2")}>
                  <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {label}
                  </span>
                  <input
                    value={form[key]}
                    required={key === "phone"}
                    {...(key === "phone"
                      ? { type: "tel", inputMode: "tel" as const, placeholder: "+233 20 000 0000" }
                      : {})}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="mt-2 h-11 w-full border border-border bg-transparent px-3 text-sm outline-none focus:border-gold"
                  />

                </label>
              ))}
              <label className="sm:col-span-2">
                <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Order notes (optional)
                </span>
                <textarea
                  value={notes}
                  maxLength={500}
                  rows={3}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2 w-full border border-border bg-transparent p-3 text-sm outline-none focus:border-gold"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  const parsed = addressSchema.safeParse(form);
                  if (!parsed.success) {
                    toast.error(parsed.error.issues[0]?.message ?? "Check your details");
                    return;
                  }
                  setStep(2);
                }}
                className="h-12 bg-foreground px-6 text-xs uppercase tracking-[0.2em] text-background sm:col-span-2"
              >
                Continue to delivery
              </button>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-3">
              {SHIPPING.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between border p-4 text-sm",
                    method === option.id ? "border-gold" : "border-border",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={method === option.id}
                      onChange={() => setMethod(option.id)}
                      className="h-4 w-4 accent-[var(--gold)]"
                    />
                    {option.label}
                  </span>
                  <span>
                    {totals.shipping === 0 && option.id === "standard"
                      ? "Free"
                      : price(settings.shippingInternational * option.multiplier)}
                  </span>
                </label>
              ))}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-12 border border-border px-6 text-xs uppercase tracking-[0.2em]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="h-12 flex-1 bg-foreground text-xs uppercase tracking-[0.2em] text-background"
                >
                  Continue to payment
                </button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-3">
              {[
                { id: "card", label: "Credit / debit card" },
                { id: "contact-to-pay", label: "Contact to pay (reserve now, pay via WhatsApp)" },
                { id: "mobile-money", label: "Mobile Money (MTN, Telecel)" },
                { id: "bank-transfer", label: "Bank transfer" },
              ].map((option) => (

                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 border p-4 text-sm",
                    payment === option.id ? "border-gold" : "border-border",
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === option.id}
                    onChange={() => setPayment(option.id)}
                    className="h-4 w-4 accent-[var(--gold)]"
                  />
                  {option.label}
                </label>
              ))}
              {payment === "card" && paymentsConfigured() ? (
                <p className="pt-2 text-xs text-muted-foreground">
                  You will pay securely by card on the next step. Nothing is charged until then.
                </p>
              ) : payment === "contact-to-pay" ? (
                <p className="pt-2 text-xs text-muted-foreground">
                  We reserve your baskets and you message our studio on WhatsApp to settle payment
                  by card, mobile money or transfer.
                </p>
              ) : (
                <p className="pt-2 text-xs text-muted-foreground">
                  Orders placed with this method stay pending until the studio confirms payment.
                </p>
              )}


              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="h-12 border border-border px-6 text-xs uppercase tracking-[0.2em]"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void placeOrder()}
                  className="h-12 flex-1 bg-foreground text-xs uppercase tracking-[0.2em] text-background disabled:opacity-50"
                >
                  {pending ? "Placing order…" : "Place order"}
                </button>
              </div>
            </section>
          )}
        </div>

        <aside className="border border-border bg-card p-6 shadow-editorial lg:sticky lg:top-28">
          <p className="label-caps text-gold">Your selection</p>
          <h2 className="mt-3 font-serif text-2xl">Order summary</h2>
          <ul className="mt-4 divide-y divide-border">
            {cart.map((line) => (
              <li key={line.productId} className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 py-3">
                <SmartImage src={line.image} alt="" ratio="1/1" className="h-14 w-12 shrink-0" />
                <span className="min-w-0">
                  <span className="block truncate text-sm">{line.name}</span>
                  <span className="text-xs text-muted-foreground">Qty {line.quantity}</span>
                </span>
                <span className="shrink-0 text-sm">{price(line.price * line.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Discount code"
              aria-label="Discount code"
              className="h-11 min-w-0 flex-1 border border-border bg-transparent px-3 text-sm outline-none focus:border-gold"
            />
            <button
              type="button"
              onClick={() =>
                applyPromo(code) ? toast.success("Discount applied") : toast.error("Invalid code")
              }
              className="h-11 shrink-0 border border-border px-4 text-xs uppercase tracking-[0.16em]"
            >
              Apply
            </button>
          </div>

          <dl className="mt-5 space-y-2 text-sm">
            <Row label="Subtotal" value={price(cartSubtotal)} />
            {promoCode && <Row label={`Discount (${promoCode})`} value={`-${price(totals.discount)}`} />}
            <Row label="Shipping" value={totals.shipping === 0 ? "Free" : price(totals.shipping)} />
            <Row label={`Tax (${Math.round(settings.taxRate * 100)}%)`} value={price(totals.tax)} />
            <div className="flex items-center justify-between border-t border-border pt-3 font-serif text-lg">
              <dt>Total</dt>
              <dd>{price(totals.total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
