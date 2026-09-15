import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { HandHeart, HeartPulse, Sprout, X } from "lucide-react";

const STORAGE_KEY = "vv.impact-notice";

export function ImpactPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let seen: string | null = "1";
    try {
      seen = sessionStorage.getItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
    if (seen) return undefined;
    const t = setTimeout(() => setOpen(true), 1600);
    return () => clearTimeout(t);
  }, []);

  function close() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          role="dialog"
          aria-label="How your order supports weavers"
          className="fixed bottom-24 right-4 z-40 w-[min(22rem,calc(100vw-2rem))] border border-gold/40 bg-foreground p-6 text-background shadow-lift md:bottom-24 md:right-7"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute right-3 top-3 text-background/50 transition-colors hover:text-gold"
          >
            <X size={16} />
          </button>
          <p className="label-caps inline-flex items-center gap-2 text-gold">
            <HandHeart size={14} /> Your order matters
          </p>
          <h2 className="mt-3 font-serif text-xl leading-snug">
            Every basket pays its maker first
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-background/65">
            <li className="flex gap-3">
              <HandHeart size={16} className="mt-0.5 shrink-0 text-gold" />
              Weavers are paid fair commissions on collection day — well above regional rates.
            </li>
            <li className="flex gap-3">
              <HeartPulse size={16} className="mt-0.5 shrink-0 text-gold" />
              A share of every sale covers medical care for weavers and their children.
            </li>
            <li className="flex gap-3">
              <Sprout size={16} className="mt-0.5 shrink-0 text-gold" />
              Community projects — school fees, boreholes and dye gardens in Bolgatanga.
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/about"
              hash="transparency"
              onClick={close}
              className="inline-flex h-11 items-center border border-gold px-5 label-caps text-gold transition-colors hover:bg-gold hover:text-gold-foreground"
            >
              See where money goes
            </Link>
            <button
              type="button"
              onClick={close}
              className="inline-flex h-11 items-center px-2 label-caps text-background/55 transition-colors hover:text-gold"
            >
              Continue
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
