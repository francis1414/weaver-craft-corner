import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

import { SITE_URL } from "@/lib/seo";
import type { Database } from "@/integrations/supabase/types";

const STATIC_PATHS: { path: string; priority: string; changefreq: string }[] = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/shop", priority: "0.9", changefreq: "daily" },
  { path: "/journal", priority: "0.7", changefreq: "weekly" },
  { path: "/about", priority: "0.6", changefreq: "monthly" },
  { path: "/care", priority: "0.5", changefreq: "monthly" },
];

function urlEntry(path: string, priority: string, changefreq: string, lastmod?: string) {
  return [
    "  <url>",
    `    <loc>${SITE_URL}${path}</loc>`,
    lastmod ? `    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = STATIC_PATHS.map((s) => urlEntry(s.path, s.priority, s.changefreq));

        try {
          const supabase = createClient<Database>(
            process.env["SUPABASE_URL"]!,
            process.env["SUPABASE_PUBLISHABLE_KEY"]!,
            { auth: { persistSession: false, autoRefreshToken: false } },
          );

          const [{ data: products }, { data: posts }] = await Promise.all([
            supabase
              .from("products")
              .select("slug, updated_at")
              .eq("status", "active")
              .limit(1000),
            supabase.from("journal").select("slug, published_at").limit(500),
          ]);

          for (const product of products ?? []) {
            entries.push(
              urlEntry(`/product/${product.slug}`, "0.8", "weekly", product.updated_at ?? undefined),
            );
          }
          for (const post of posts ?? []) {
            entries.push(
              urlEntry(`/journal/${post.slug}`, "0.6", "monthly", post.published_at ?? undefined),
            );
          }
        } catch {
          // Fall back to static routes only.
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
