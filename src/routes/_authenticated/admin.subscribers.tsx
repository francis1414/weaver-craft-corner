import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSubscribers } from "@/hooks/use-store-data";

export const Route = createFileRoute("/_authenticated/admin/subscribers")({
  component: AdminSubscribers,
});

function AdminSubscribers() {
  const { data: subscribers = [], isLoading } = useSubscribers();

  function exportCsv() {
    const rows = [
      ["email", "status", "source", "subscribed_at"],
      ...subscribers.map((s) => [s.email, s.status, s.source, s.createdAt]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "vetastudio-subscribers.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Newsletter subscribers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {subscribers.length} collectors on the list.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={subscribers.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </header>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="p-4">Email</th>
              <th className="p-4">Source</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={4}>
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && subscribers.length === 0 && (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={4}>
                  No subscribers yet.
                </td>
              </tr>
            )}
            {subscribers.map((s) => (
              <tr key={s.id}>
                <td className="p-4">{s.email}</td>
                <td className="p-4 text-muted-foreground">{s.source}</td>
                <td className="p-4 text-muted-foreground">{s.status}</td>
                <td className="p-4 text-muted-foreground">
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
