import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { SmartImage } from "@/components/SmartImage";
import { useStore } from "@/context/StoreProvider";
import { useSettings } from "@/hooks/use-store-data";
import { usePrice } from "@/hooks/use-price";

export function CartDrawer() {
  const {
    drawer,
    closeDrawer,
    cart,
    cartSubtotal,
    setQuantity,
    removeFromCart,
    applyPromo,
    promoCode,
    discountRate,
    clearPromo,
  } = useStore();
  const settings = useSettings();
  const price = usePrice();
  const [code, setCode] = useState("");

  const threshold = settings.freeShippingThreshold;
  const progress = Math.min(100, (cartSubtotal / threshold) * 100);
  const remaining = Math.max(0, threshold - cartSubtotal);
  const open = drawer === "cart";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background"
            role="dialog"
            aria-label="Shopping cart"
          >
            <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-5 py-4">
              <h2 className="truncate font-serif text-xl">Your Cart</h2>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close cart"
                className="grid h-11 w-11 shrink-0 place-items-center"
              >
                <X size={18} />
              </button>
            </header>

            <div className="border-b border-border px-5 py-4">
              <p className="text-xs text-muted-foreground">
                {remaining > 0
                  ? `${price(remaining)} away from free worldwide shipping`
                  : "Free worldwide shipping unlocked"}
              </p>
              <div className="mt-2 h-1 w-full bg-stone">
                <div className="h-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5">
              {cart.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  Your cart is empty.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {cart.map((line) => (
                    <li key={line.productId} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 py-5">
                      <SmartImage src={line.image} alt={line.name} ratio="1/1" className="h-24 w-20 shrink-0" />
                      <div className="min-w-0">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                          <Link
                            to="/product/$slug"
                            params={{ slug: line.slug }}
                            onClick={closeDrawer}
                            className="truncate font-serif text-base"
                          >
                            {line.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromCart(line.productId)}
                            aria-label={`Remove ${line.name}`}
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{price(line.price)}</p>
                        <div className="mt-3 inline-flex items-center border border-border">
                          <button
                            type="button"
                            onClick={() => setQuantity(line.productId, line.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="grid h-10 w-10 place-items-center"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-8 text-center text-sm">{line.quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQuantity(line.productId, line.quantity + 1)}
                            aria-label="Increase quantity"
                            className="grid h-10 w-10 place-items-center"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cart.length > 0 && (
              <footer className="border-t border-border px-5 py-5">
                <div className="flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Promo code"
                    aria-label="Promo code"
                    className="h-11 min-w-0 flex-1 border border-border bg-transparent px-3 text-sm outline-none focus:border-gold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (promoCode) {
                        clearPromo();
                        setCode("");
                        return;
                      }
                      if (applyPromo(code)) toast.success("Promo applied");
                      else toast.error("Invalid promo code");
                    }}
                    className="h-11 shrink-0 border border-border px-4 text-xs uppercase tracking-[0.16em]"
                  >
                    {promoCode ? "Remove" : "Apply"}
                  </button>
                </div>
                {discountRate > 0 && (
                  <p className="mt-2 text-xs text-sage">
                    {Math.round(discountRate * 100)}% discount applied
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between font-serif text-lg">
                  <span>Subtotal</span>
                  <span>{price(cartSubtotal * (1 - discountRate))}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={closeDrawer}
                  className="mt-4 flex h-12 items-center justify-center bg-foreground text-xs uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-90"
                >
                  Express Checkout
                </Link>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
