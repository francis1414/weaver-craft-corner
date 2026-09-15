import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Cookie, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "vv.cookie-consent";

export function CookieNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let stored: string | null = "accepted";
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
    if (stored) return undefined;
    const t = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(t);
  }, []);

  function decide(value: "accepted" | "essential") {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          role="dialog"
          aria-label="Cookie notice"
          className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-xl border border-gold/40 bg-foreground p-5 text-background shadow-lift md:bottom-7 md:left-7 md:right-auto md:p-6"
        >
          <button
            type="button"
            aria-label="Dismiss cookie notice"
            onClick={() => decide("essential")}
            className="absolute right-3 top-3 text-background/50 transition-colors hover:text-gold"
          >
            <X size={16} />
          </button>
          <p className="label-caps inline-flex items-center gap-2 text-gold">
            <Cookie size={14} /> Cookies
          </p>
          <p className="mt-3 pr-6 text-sm leading-relaxed text-background/65">
            We use a few cookies to keep your cart, remember your currency and understand which
            pieces visitors love most. Nothing is sold or shared with advertisers.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              onClick={() => decide("accepted")}
              className="h-11 rounded-none bg-gold px-6 label-caps text-gold-foreground hover:bg-gold-deep"
            >
              Accept
            </Button>
            <Button
              variant="outline"
              onClick={() => decide("essential")}
              className="h-11 rounded-none border-background/30 bg-transparent px-6 label-caps text-background hover:bg-background/10 hover:text-background"
            >
              Essential only
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
