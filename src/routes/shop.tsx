import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";

import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { useCategories, useProducts } from "@/hooks/use-store-data";
import { DYE_COLORS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { breadcrumbJsonLd, canonical, jsonLdScript } from "@/lib/seo";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Handwoven Bolga Baskets — Vetastudio" },
      {
        name: "description",
        content:
          "Browse sculptural Bolga baskets, woven lampshades, fans, planters and totes handmade from Ghanaian elephant grass.",
      },
      { property: "og:title", content: "Shop Handwoven Bolga Baskets — Vetastudio" },
      {
        property: "og:description",
        content: "Sculptural elephant grass craft from the Bolgatanga cooperatives of Ghana.",
      },
      ...canonical("/shop").meta,
    ],
    links: canonical("/shop").links,
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
        ]),
      ),
    ],
  }),
  component: ShopPage,
});

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest ↓" },
  { value: "price-asc", label: "Price: Low to High ↑" },
  { value: "price-desc", label: "Price: High to Low ↓" },
  { value: "rating", label: "Highest Rated ★ ↓" },
  { value: "az", label: "Alphabetical: A–Z ↑" },
  { value: "za", label: "Alphabetical: Z–A ↓" },
] as const;

const PRICE_PRESETS = [
  { label: "$0–$50", min: 0, max: 50 },
  { label: "$50–$100", min: 50, max: 100 },
  { label: "$100–$200", min: 100, max: 200 },
  { label: "$200+", min: 200, max: 1000 },
];

function ShopPage() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();

  const [category, setCategory] = useState<string | null>(null);
  const [range, setRange] = useState<[number, number]>([0, 1000]);
  const [colors, setColors] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) map.set(p.category, (map.get(p.category) ?? 0) + 1);
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    const effective = (p: Product) => p.salePrice ?? p.price;
    let list = products.filter((p) => {
      if (category && p.category !== category) return false;
      const value = effective(p);
      if (value < range[0] || value > range[1]) return false;
      if (colors.length > 0 && !p.color.some((c) => colors.includes(c.toLowerCase()))) return false;
      if (inStockOnly && p.stockQuantity <= 0) return false;
      if (onSaleOnly && !(p.salePrice != null && p.salePrice < p.price)) return false;
      return true;
    });
    list = [...list];
    switch (sort) {
      case "newest":
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case "price-asc":
        list.sort((a, b) => effective(a) - effective(b));
        break;
      case "price-desc":
        list.sort((a, b) => effective(b) - effective(a));
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "az":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        list.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return list;
  }, [products, category, range, colors, inStockOnly, onSaleOnly, sort]);

  const chips: { label: string; clear: () => void }[] = [
    ...(category ? [{ label: category, clear: () => setCategory(null) }] : []),
    ...(range[0] !== 0 || range[1] !== 1000
      ? [{ label: `$${range[0]}–$${range[1]}`, clear: () => setRange([0, 1000]) }]
      : []),
    ...colors.map((c) => ({
      label: c,
      clear: () => setColors((prev) => prev.filter((x) => x !== c)),
    })),
    ...(inStockOnly ? [{ label: "In stock", clear: () => setInStockOnly(false) }] : []),
    ...(onSaleOnly ? [{ label: "On sale", clear: () => setOnSaleOnly(false) }] : []),
  ];

  function resetAll() {
    setCategory(null);
    setRange([0, 1000]);
    setColors([]);
    setInStockOnly(false);
    setOnSaleOnly(false);
  }

  const filterPanel = (
    <div className="space-y-8">
      <section>
        <h3 className="text-xs uppercase tracking-[0.2em] text-foreground">Craft Categories</h3>
        <ul className="mt-4 space-y-1">
          <li>
            <button
              type="button"
              onClick={() => setCategory(null)}
              className={cn(
                "flex h-11 w-full items-center justify-between text-sm",
                !category ? "text-gold" : "text-muted-foreground hover:text-foreground",
              )}
            >
              All pieces <span className="text-xs">{products.length}</span>
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setCategory(c.slug)}
                className={cn(
                  "flex h-11 w-full items-center justify-between text-sm",
                  category === c.slug ? "text-gold" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="truncate">{c.name}</span>
                <span className="text-xs">{counts.get(c.slug) ?? 0}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-xs uppercase tracking-[0.2em] text-foreground">Price</h3>
        <input
          type="range"
          min={0}
          max={1000}
          step={10}
          value={range[1]}
          onChange={(e) => setRange([range[0], Number(e.target.value)])}
          aria-label="Maximum price"
          className="mt-4 w-full accent-[var(--gold)]"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          ${range[0]} – ${range[1]}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRICE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setRange([preset.min, preset.max])}
              className="h-11 border border-border px-3 text-xs hover:border-gold"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs uppercase tracking-[0.2em] text-foreground">Natural Dye Palette</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {DYE_COLORS.map((dye) => {
            const value = dye.name.toLowerCase();
            const active = colors.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setColors((prev) =>
                    prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value],
                  )
                }
                aria-label={dye.name}
                aria-pressed={active}
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-full border transition-colors",
                  active ? "border-gold" : "border-border",
                )}
              >
                <span
                  className="h-6 w-6 rounded-full"
                  style={{ backgroundColor: dye.swatch }}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <label className="flex h-11 items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="h-4 w-4 accent-[var(--gold)]"
          />
          In stock only
        </label>
        <label className="flex h-11 items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={onSaleOnly}
            onChange={(e) => setOnSaleOnly(e.target.checked)}
            className="h-4 w-4 accent-[var(--gold)]"
          />
          On sale only
        </label>
      </section>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-8">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">The Collection</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
          Handwoven elephant grass craft
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Each piece is woven by name-known artisans in Bolgatanga, Upper East Ghana. Sizes vary
          slightly — that is the signature of the hand.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">{filterPanel}</aside>

        <div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border pb-4">
            <p className="min-w-0 truncate text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {filtered.length} pieces
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="flex h-11 items-center gap-2 border border-border px-3 text-xs uppercase tracking-[0.16em] lg:hidden"
              >
                <SlidersHorizontal size={14} /> Filters
              </button>
              <label className="flex items-center gap-2">
                <span className="sr-only">Sort products</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="h-11 border border-border bg-transparent px-3 text-xs uppercase tracking-[0.12em] outline-none focus:border-gold"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={chip.clear}
                  className="flex h-9 items-center gap-1.5 border border-border px-3 text-xs capitalize hover:border-gold"
                >
                  {chip.label} <X size={12} />
                </button>
              ))}
              <button
                type="button"
                onClick={resetAll}
                className="h-9 px-2 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-gold"
              >
                Clear all
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-16 border border-border px-6 py-16 text-center">
              <h2 className="font-serif text-2xl">No products found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try widening your price range or clearing a dye colour.
              </p>
              <button
                type="button"
                onClick={resetAll}
                className="mt-6 h-12 bg-foreground px-6 text-xs uppercase tracking-[0.2em] text-background"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-background p-5"
          >
            <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center">
              <h2 className="font-serif text-xl">Filters</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                className="grid h-11 w-11 place-items-center"
              >
                <X size={18} />
              </button>
            </div>
            {filterPanel}
          </motion.div>
        </div>
      )}
    </div>
  );
}
