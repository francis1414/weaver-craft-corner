import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { assetUrl } from "@/lib/mock-data";

type Probe = {
  label: string;
  url: string;
  status: number | null;
  ok: boolean | null;
  type: string;
  ms: number;
  error?: string;
};

/**
 * Quick media diagnostics: probes every story asset URL and reports HTTP
 * status, content type and latency. Useful for checking asset delivery on
 * non-Lovable hosts (e.g. Vercel). Visible only with `?media-check=1`.
 */
export function MediaDiagnostics({ items }: { items: { label: string; url: string }[] }) {
  const [enabled, setEnabled] = useState(false);
  const [probes, setProbes] = useState<Probe[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setEnabled(new URLSearchParams(window.location.search).has("media-check"));
  }, []);

  async function run() {
    setRunning(true);
    const results = await Promise.all(
      items.map(async ({ label, url }): Promise<Probe> => {
        const resolved = assetUrl(url);
        const started = performance.now();
        try {
          const res = await fetch(resolved, { method: "GET", cache: "no-store" });
          return {
            label,
            url: resolved,
            status: res.status,
            ok: res.ok,
            type: res.headers.get("content-type") ?? "unknown",
            ms: Math.round(performance.now() - started),
          };
        } catch (err) {
          return {
            label,
            url: resolved,
            status: null,
            ok: false,
            type: "unknown",
            ms: Math.round(performance.now() - started),
            error: err instanceof Error ? err.message : "Network error",
          };
        }
      }),
    );
    setProbes(results);
    setRunning(false);
  }

  useEffect(() => {
    if (enabled) void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  if (!enabled) return null;

  const failing = probes.filter((p) => !p.ok).length;

  return (
    <aside className="mt-20 border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label-caps text-gold">Media diagnostics</p>
          <h2 className="mt-2 font-serif text-2xl">
            {running
              ? "Probing story assets…"
              : `${probes.length - failing}/${probes.length} media URLs loading`}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => void run()}
          disabled={running}
          className="h-11 border border-border px-5 text-xs uppercase tracking-[0.14em] disabled:opacity-50"
        >
          Re-run check
        </button>
      </div>

      <ul className="mt-6 divide-y divide-border text-sm">
        {probes.map((p) => (
          <li key={p.url} className="flex flex-wrap items-center gap-3 py-3">
            {p.ok ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-sage" aria-hidden="true" />
            ) : running ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
            )}
            <span className="min-w-[9rem] font-medium">{p.label}</span>
            <span className="text-muted-foreground">
              {p.status ?? "no response"} · {p.type} · {p.ms}ms
            </span>
            <span className="w-full break-all text-xs text-muted-foreground">{p.url}</span>
            {p.error && <span className="text-xs text-destructive">{p.error}</span>}
          </li>
        ))}
      </ul>
    </aside>
  );
}
