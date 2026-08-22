import { AnimatePresence, motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { toast } from "sonner";

import { SmartImage } from "@/components/SmartImage";
import { useStore } from "@/context/StoreProvider";
import { useProducts } from "@/hooks/use-store-data";
import { usePrice } from "@/hooks/use-price";

export function WishlistDrawer() {
  const { drawer, closeDrawer, wishlist, addToCart, toggleWishlist } = useStore();
  const { data: products } = useProducts();
  const price = usePrice();
  const open = drawer === "wishlist";

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
            aria-label="Wishlist"
          >
            <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-5 py-4">
              <h2 className="truncate font-serif text-xl">Saved Pieces</h2>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close wishlist"
                className="grid h-11 w-11 shrink-0 place-items-center"
              >
                <X size={18} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5">
              {wishlist.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  Nothing saved yet.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {wishlist.map((entry) => {
                    const product = products.find((p) => p.id === entry.productId);
                    return (
                      <li
                        key={entry.productId}
                        className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 py-5"
                      >
                        <SmartImage
                          src={entry.image}
                          alt={entry.name}
                          ratio="1/1"
                          className="h-24 w-20 shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            to="/product/$slug"
                            params={{ slug: entry.slug }}
                            onClick={closeDrawer}
                            className="block truncate font-serif text-base"
                          >
                            {entry.name}
                          </Link>
                          <p className="mt-1 text-sm text-muted-foreground">{price(entry.price)}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={!product}
                              onClick={() => {
                                if (!product) return;
                                addToCart(product);
                                toast.success("Moved to cart");
                              }}
                              className="h-11 border border-border px-4 text-xs uppercase tracking-[0.16em] hover:border-gold disabled:opacity-40"
                            >
                              Add to cart
                            </button>
                            <button
                              type="button"
                              onClick={() => product && toggleWishlist(product)}
                              className="h-11 px-2 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-destructive"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
