import { createFileRoute } from "@tanstack/react-router";

/**
 * Public read proxy for the private `product-media` bucket.
 * Admin uploads land in storage; the storefront reads them through this
 * stable URL so no signed links expire.
 */
export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = (params as Record<string, string>)["_splat"] ?? "";
        const path = decodeURIComponent(raw).replace(/^\/+/, "");

        // Only allow plain nested paths — no traversal, no query tricks.
        if (!path || path.includes("..") || !/^[A-Za-z0-9._\-/]+$/.test(path)) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("product-media").download(path);

        if (error || !data) {
          return new Response("Not found", { status: 404 });
        }

        return new Response(await data.arrayBuffer(), {
          headers: {
            "Content-Type": data.type || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
