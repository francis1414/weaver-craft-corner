import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Heart, Menu, Scale, Search, ShoppingBag, X } from "lucide-react";

import { SmartImage } from "@/components/SmartImage";
import { useStore } from "@/context/StoreProvider";
import { useProducts } from "@/hooks/use-store-data";
import { usePrice } from "@/hooks/use-price";
import logo from "@/assets/vetastudio-logo.png.asset.json";

const NAV = [
  { to: "/shop", label: "Shop" },
  { to: "/journal", label: "Journal" },
  { to: "/about", label: "Artisan Story" },
  { to: "/care", label: "Care Guide" },
] as const;

export function Header() {
  const { cartCount, wishlist, compare, openDrawer } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [term, setTerm] = useState("");
  const { data: products } = useProducts();
  const price = usePrice();

  const suggestions = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (q.length < 2) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      )
      .slice(0, 5);
  }, [term, products]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-[1400px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="grid h-11 w-11 place-items-center lg:hidden"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <Link to="/" className="shrink-0" aria-label="Vetastudio home">
            <img
              src={logo.url}
              alt="Vetastudio — handmade in Ghana, made to inspire"
              width={220}
              height={58}
              className="h-12 w-auto md:h-16"
            />
          </Link>
        </div>

        <nav className="hidden min-w-0 items-center justify-center gap-8 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-gold" }}
              className="relative text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:text-gold data-[status=active]:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <div className="relative hidden md:block">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search baskets"
              aria-label="Search products"
              className="h-11 w-44 border border-border bg-transparent pl-9 pr-3 text-sm outline-none transition-colors focus:border-gold xl:w-60"
            />
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 top-[calc(100%+6px)] w-80 border border-border bg-background p-2 shadow-lg"
                >
                  {suggestions.map((p) => (
                    <li key={p.id}>
                      <Link
                        to="/product/$slug"
                        params={{ slug: p.slug }}
                        onClick={() => setTerm("")}
                        className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-2 transition-colors hover:bg-stone"
                      >
                        <SmartImage
                          src={p.primaryImage}
                          alt=""
                          ratio="1/1"
                          className="h-12 w-12 shrink-0"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm">{p.name}</span>
                          <span className="block text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            {p.category}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm">{price(p.salePrice ?? p.price)}</span>
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          <IconButton label="Wishlist" count={wishlist.length} onClick={() => openDrawer("wishlist")}>
            <Heart size={18} />
          </IconButton>
          <IconButton label="Compare" count={compare.length} onClick={() => openDrawer("compare")}>
            <Scale size={18} />
          </IconButton>
          <IconButton label="Cart" count={cartCount} onClick={() => openDrawer("cart")}>
            <ShoppingBag size={18} />
          </IconButton>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border lg:hidden"
          >
            <div className="flex flex-col px-4 py-2">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-border py-4 text-sm uppercase tracking-[0.2em] last:border-0"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function IconButton({
  label,
  count,
  onClick,
  children,
}: {
  label: string;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label} (${count})`}
      className="relative grid h-11 w-11 place-items-center text-foreground transition-colors hover:text-gold"
    >
      {children}
      {count > 0 && (
        <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] text-background">
          {count}
        </span>
      )}
    </button>
  );
}
