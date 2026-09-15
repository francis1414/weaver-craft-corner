import { Mail, MessageCircle, Truck } from "lucide-react";

import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/whatsapp";

import { useStore } from "@/context/StoreProvider";
import { useSettings } from "@/hooks/use-store-data";
import { CURRENCIES } from "@/lib/currency";
import type { CurrencyCode } from "@/types";

export function AnnouncementBar() {
  const settings = useSettings();
  const { currency, setCurrency } = useStore();

  return (
    <div className="border-b border-border bg-foreground text-background">
      <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-2 md:px-8">
        <div className="flex min-w-0 items-center gap-2 text-[11px] uppercase tracking-[0.16em]">
          <Truck size={13} className="shrink-0 text-gold" />
          <span className="truncate">
            {settings.announcement ||
              `Free worldwide shipping over $${settings.freeShippingThreshold}`}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-4 text-[11px]">
          <a
            href={`mailto:${settings.supportEmail}`}
            className="hidden items-center gap-1.5 hover:text-gold lg:flex"
          >
            <Mail size={12} /> {settings.supportEmail}
          </a>
          <a
            href={whatsappLink("Hello Veta Vera Studio, I have an enquiry.")}
            target="_blank"
            rel="noreferrer noopener"
            className="hidden items-center gap-1.5 hover:text-gold lg:flex"
          >
            <MessageCircle size={12} /> WhatsApp {WHATSAPP_DISPLAY}
          </a>
          <label className="flex items-center gap-1.5">
            <span className="sr-only">Currency</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="bg-transparent py-1 text-[11px] uppercase tracking-[0.16em] outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="text-foreground">
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
