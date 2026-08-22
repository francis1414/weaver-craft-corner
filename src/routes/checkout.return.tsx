import { Link, createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/checkout/return")({
  head: () => ({
    meta: [
      { title: "Payment Received — Vetastudio" },
      {
        name: "description",
        content: "Your Vetastudio payment has been received and your handwoven order is confirmed.",
      },
      { property: "og:title", content: "Payment Received — Vetastudio" },
      { property: "og:description", content: "Your handwoven basket order is confirmed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search["session_id"] === "string" ? search["session_id"] : undefined,
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id: sessionId } = Route.useSearch();

  return (
    <div className="mx-auto max-w-xl px-4 py-28 text-center md:px-8">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage text-background">
        <Check size={22} />
      </span>
      <p className="label-caps mt-6 text-gold">Thank you</p>
      <h1 className="mt-3 font-serif text-4xl">
        {sessionId ? "Payment received" : "Checkout complete"}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Your order is confirmed with our Bolgatanga studio. A receipt is on its way to your inbox,
        and we will email tracking details as soon as your piece ships.
      </p>
      <Link
        to="/shop"
        className="mt-8 inline-flex h-12 items-center bg-foreground px-6 text-xs uppercase tracking-[0.2em] text-background"
      >
        Continue browsing
      </Link>
    </div>
  );
}
