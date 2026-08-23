/** Studio WhatsApp line — all client messages, order notes and enquiries route here. */
export const WHATSAPP_NUMBER = "233200084444";
export const WHATSAPP_DISPLAY = "+233 20 008 4444";

/** Builds a click-to-chat deep link with an optional prefilled message. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
