import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CreditCard, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { listRecentPayments } from "@/lib/payments.functions";
import { getStripeEnvironment, paymentsConfigured } from "@/lib/stripe";
import { useOrders } from "@/hooks/use-store-data";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  component: AdminPayments,
});

function money(amount: number, currency: string) {
  return `${currency} ${amount.toFixed(2)}`;
}

function AdminPayments() {
  const fetchPayments = useServerFn(listRecentPayments);
  const { data: orders = [] } = useOrders();

  const configured = paymentsConfigured();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "payments"],
    enabled: configured,
    queryFn: async () => {
      const result = await fetchPayments({ data: { environment: getStripeEnvironment() } });
      if ("error" in result) throw new Error(result.error);
      return result.payments;
    },
  });

  const paid = orders.filter((o) => o.paymentStatus === "paid");
  const pending = orders.filter((o) => o.paymentStatus === "pending");
  const captured = paid.reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { label: "Captured revenue", value: `$${captured.toFixed(2)}` },
    { label: "Paid orders", value: String(paid.length) },
    { label: "Awaiting payment", value: String(pending.length) },
  ];

  return (
    <div className="space-y-8">
      <PaymentTestModeBanner />
      <header>
        <h1 className="font-serif text-3xl">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Card checkout is wired into the storefront. Transactions settle here automatically.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-serif text-2xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border p-5">
          <CreditCard className="h-4 w-4 text-gold" />
          <h2 className="font-serif text-xl">Recent card transactions</h2>
        </div>
        {!configured && (
          <p className="p-5 text-sm text-muted-foreground">
            Card payments are not configured for this build yet.
          </p>
        )}
        {configured && isLoading && (
          <p className="p-5 text-sm text-muted-foreground">Loading transactions…</p>
        )}
        {configured && error && (
          <p className="p-5 text-sm text-destructive">
            {error instanceof Error ? error.message : "Could not load transactions"}
          </p>
        )}
        {configured && data && data.length === 0 && (
          <p className="p-5 text-sm text-muted-foreground">
            No card transactions yet. Place a test order from the storefront to see one here.
          </p>
        )}
        {configured && data && data.length > 0 && (
          <ul className="divide-y divide-border">
            {data.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.description ?? row.id}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {row.email ?? "No email"} ·{" "}
                    {row.created ? new Date(row.created).toLocaleString() : "—"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge variant={row.refunded ? "outline" : "secondary"}>
                    {row.refunded ? "refunded" : row.status}
                  </Badge>
                  <span>{money(row.amount, row.currency)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-serif text-xl">Orders awaiting payment</h2>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Everything is settled.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {pending.slice(0, 10).map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-3">
                <span className="truncate">
                  {order.orderNumber} · {order.customer?.name}
                </span>
                <span className="text-muted-foreground">${order.total.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
          <ExternalLink className="h-3 w-3" /> Payouts, refunds and go-live live in the Payments tab
          of your Lovable project.
        </p>
      </div>
    </div>
  );
}
