import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import {
  useAdminProducts,
  useOrders,
  useSubscribers,
} from "@/hooks/use-store-data";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

const usd = (n: number) => `$${n.toFixed(2)}`;

function AdminOverview() {
  const { data: products = [] } = useAdminProducts();
  const { data: orders = [] } = useOrders();
  const { data: subscribers = [] } = useSubscribers();

  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const active = products.filter((p) => p.status === "active");
  const lowStock = products.filter(
    (p) => p.stockQuantity <= p.lowStockThreshold && p.status !== "archived",
  );

  const byMonth = new Map<string, { month: string; revenue: number; orders: number }>();
  for (const order of orders) {
    const d = new Date(order.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const entry = byMonth.get(key) ?? { month: key, revenue: 0, orders: 0 };
    entry.revenue += order.total;
    entry.orders += 1;
    byMonth.set(key, entry);
  }
  const series = [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));

  const stats = [
    { label: "Gross revenue", value: usd(revenue) },
    { label: "Orders", value: String(orders.length) },
    { label: "Active products", value: String(active.length) },
    { label: "Low stock alerts", value: String(lowStock.length) },
    { label: "Subscribers", value: String(subscribers.length) },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl">Dashboard overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live figures straight from the store database.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-serif text-2xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-serif text-xl">Revenue</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#C29B38" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-serif text-xl">Order volume</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="#4A5D4E" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-serif text-xl">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm text-primary hover:underline">
            Fulfilment centre
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {orders.slice(0, 8).map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="truncate text-muted-foreground">{order.customer?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{order.paymentStatus}</Badge>
                  <Badge variant="secondary">{order.fulfillmentStatus}</Badge>
                  <span className="w-20 text-right">{usd(order.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {lowStock.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-serif text-xl">Low stock</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {lowStock.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>{p.name}</span>
                <span className="text-muted-foreground">{p.stockQuantity} left</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
