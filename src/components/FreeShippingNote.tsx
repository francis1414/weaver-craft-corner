import { Truck } from "lucide-react";

import { useSettings } from "@/hooks/use-store-data";
import { cn } from "@/lib/utils";

/** Editorial free-shipping promise strip used on the storefront and shop pages. */
export function FreeShippingNote({ className }: { className?: string }) {
  const settings = useSettings();
  const message =
    settings.announcement ||
    `Free worldwide shipping on orders over $${settings.freeShippingThreshold} — every basket woven by us`;

  return (
    <p
      className={cn(
        "flex items-center justify-center gap-2 border-y border-gold/30 bg-gold/10 px-4 py-3 text-center text-[11px] uppercase tracking-[0.18em] text-foreground",
        className,
      )}
    >
      <Truck size={14} className="shrink-0 text-gold" />
      <span>{message}</span>
    </p>
  );
}
