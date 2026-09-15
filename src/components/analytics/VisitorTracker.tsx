import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "vs.visitor.session";

function deviceType(): "mobile" | "tablet" | "desktop" {
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function sessionInfo(): { id: string; isNew: boolean } {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return { id: existing, isNew: false };
  const id = crypto.randomUUID().replace(/-/g, "");
  sessionStorage.setItem(SESSION_KEY, id);
  return { id, isNew: true };
}

/**
 * First-party visit logging for the storefront. Records one row per page view
 * with an anonymous per-tab session id — no cookies, no third-party trackers.
 */
export function VisitorTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname.startsWith("/admin")) return;

    const { id, isNew } = sessionInfo();
    const referrer = document.referrer && !document.referrer.includes(window.location.host)
      ? document.referrer.slice(0, 300)
      : null;

    void supabase
      .from("page_views")
      .insert({
        path: pathname.slice(0, 300),
        referrer,
        session_id: id,
        device: deviceType(),
        language: navigator.language?.slice(0, 20) ?? null,
        is_new_session: isNew,
      })
      .then(() => undefined);
  }, [pathname]);

  return null;
}
