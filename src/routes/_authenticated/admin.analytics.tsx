import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { supabase } from "@/integrations/supabase/client";
import { useOrders } from "@/hooks/use-store-data";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AdminAnalytics,
});

type ViewRow = {
  path: string;
  referrer: string | null;
  session_id: string;
  device: string;
  is_new_session: boolean;
  created_at: string;
};

const RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

function usePageViews(days: number) {
  return useQuery<ViewRow[]>({
    queryKey: ["admin", "page_views", days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 86_400_000).toISOString();
      const { data, error } = await supabase
        .from("page_views")
        .select("path, referrer, session_id, device, is_new_session, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(20_000);
      if (error) throw error;
      return (data ?? []) as ViewRow[];
    },
  });
}

function topOf(rows: ViewRow[], pick: (r: ViewRow) => string | null, limit = 8) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = pick(row);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function AdminAnalytics() {
  const [days, setDays] = useState(30);
  const { data: rows = [], isLoading, error } = usePageViews(days);
  const { data: orders = [] } = useOrders();

  const stats = useMemo(() => {
    const visitors = new Set(rows.map((r) => r.session_id)).size;
    const since = Date.now() - days * 86_400_000;
    const periodOrders = orders.filter((o) => new Date(o.createdAt).getTime() >= since);
    const buckets = new Map<string, { day: string; views: number; visitors: Set<string> }>();
    for (let i = days - 1; i >= 0; i -= 1) {
      const key = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
      buckets.set(key, { day: key.slice(5), views: 0, visitors: new Set() });
    }
    for (const row of rows) {
      const key = row.created_at.slice(0, 10);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      bucket.views += 1;
      bucket.visitors.add(row.session_id);
    }
    const series = [...buckets.values()].map((b) => ({
      day: b.day,
      views: b.views,
      visitors: b.visitors.size,
    }));
    return {
      views: rows.length,
      visitors,
      returning: visitors - rows.filter((r) => r.is_new_session).length,
      perVisit: visitors ? (rows.length / visitors).toFixed(1) : "0",
      conversion: visitors ? `${((periodOrders.length / visitors) * 100).toFixed(1)}%` : "0%",
      orders: periodOrders.length,
      series,
      pages: topOf(rows, (r) => r.path),
      referrers: topOf(rows, (r) => {
        if (!r.referrer) return "Direct / bookmark";
        try {
          return new URL(r.referrer).hostname.replace(/^www\./, "");
        } catch {
          return "Direct / bookmark";
        }
      }),
      devices: topOf(rows, (r) => r.device, 3),
    };
  }, [rows, orders, days]);

  const cards = [
    { label: "Page views", value: String(stats.views) },
    { label: "Unique visitors", value: String(stats.visitors) },
    { label: "Pages per visit", value: stats.perVisit },
    { label: "Orders placed", value: String(stats.orders) },
    { label: "Visit-to-order rate", value: stats.conversion },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Visitors &amp; performance</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            First-party traffic recorded on your storefront — no third-party trackers.
          </p>
        </div>
        <div className="flex gap-2">
          {RANGES.map((range) => (
            <button
              key={range.days}
              type="button"
              onClick={() => setDays(range.days)}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] transition ${
                days === range.days
                  ? "border-transparent bg-[#1F1D1A] text-[#EFEBE4]"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </header>

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">
          Visitor data could not be loaded. {(error as Error).message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-2 font-serif text-2xl">{isLoading ? "—" : card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-serif text-xl">Traffic over time</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.series}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="day" fontSize={11} interval="preserveStartEnd" />
              <YAxis fontSize={11} allowDecimals={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#C29B38"
                fill="#C29B38"
                fillOpacity={0.18}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="#4A5D4E"
                fill="#4A5D4E"
                fillOpacity={0.12}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Gold = page views, green = unique visitors.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-serif text-xl">Most visited pages</h2>
          {stats.pages.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No visits recorded yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {stats.pages.map((page) => (
                <li key={page.name} className="flex justify-between gap-4">
                  <span className="truncate">{page.name}</span>
                  <span className="text-muted-foreground">{page.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-serif text-xl">Where visitors come from</h2>
          {stats.referrers.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No sources recorded yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {stats.referrers.map((ref) => (
                <li key={ref.name} className="flex justify-between gap-4">
                  <span className="truncate">{ref.name}</span>
                  <span className="text-muted-foreground">{ref.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-serif text-xl">Devices</h2>
        <div className="mt-4 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.devices}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#1F1D1A" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
