import { MessageCircle } from "lucide-react";

import { whatsappLink } from "@/lib/whatsapp";

/** Floating click-to-chat button shown across the storefront. */
export function WhatsAppButton() {
  return (
    <a
      href={whatsappLink("Hello Vetastudio, I have a question about your handwoven Bolga baskets.")}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Chat with Vetastudio on WhatsApp"
      className="fixed bottom-36 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-sage text-background shadow-lift transition-colors hover:bg-gold hover:text-gold-foreground md:bottom-24 md:right-7"
    >
      <MessageCircle size={20} />
    </a>
  );
}
