import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";

import { HeroSlideshow } from "@/components/HeroSlideshow";
import { StoryFilm } from "@/components/StoryFilm";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { SmartImage } from "@/components/SmartImage";
import { StarRating } from "@/components/StarRating";
import { useCategories, useHomepage, useProducts, useReviews } from "@/hooks/use-store-data";
import { cn } from "@/lib/utils";
import { canonical, jsonLdScript, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vetastudio — Handwoven Bolga Baskets & Collectible Fibre Art from Ghana" },
      {
        name: "description",
        content:
          "Collectible handwoven Bolga baskets, sculptural fibre art and woven lampshades from Upper East Ghana, bought direct from the artists. Tracked delivery to France, Germany, Switzerland, Monaco, Spain and Greece in 7–10 days.",
      },
      {
        property: "og:title",
        content: "Vetastudio — Handwoven Bolga Baskets & Collectible Fibre Art from Ghana",
      },
      {
        property: "og:description",
        content:
          "Artist-direct sculptural elephant grass craft from Bolgatanga, shipped to collectors and interior designers across Europe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...canonical("/").meta,
    ],
    links: canonical("/").links,
    scripts: [jsonLdScript(organizationJsonLd), jsonLdScript(websiteJsonLd)],
  }),
  component: HomePage,
});

const TABS = [
  { id: "all", label: "All" },
  { id: "sculpture", label: "Sculptural Baskets" },
  { id: "lampshade", label: "Lampshades" },
  { id: "fans", label: "Woven Fans" },
  { id: "sale", label: "Sale Items" },
] as const;

function HomePage() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: reviews } = useReviews();
  const homepage = useHomepage();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");

  const hero = homepage.heroSlides[0];
  const featured = products
    .filter((p) => {
      if (tab === "all") return p.featured;
      if (tab === "sale") return p.salePrice != null && p.salePrice < p.price;
      return p.category === tab;
    })
    .slice(0, 6);
  const arrivals = [...products]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="grid items-stretch gap-0 lg:grid-cols-2">
        <div className="flex flex-col justify-center px-4 py-16 md:px-8 lg:py-28">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">
            {hero?.badge ?? "Bolgatanga, Ghana"}
          </p>
          <h1 className="mt-5 font-serif text-5xl leading-[1.05] md:text-6xl xl:text-7xl">
            {hero?.title ?? "Woven by hand, from elephant grass"}
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            {hero?.subtitle ??
              "Sculptural baskets, lampshades and fans made by fair-wage artisans in Upper East Ghana."}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="flex h-12 items-center bg-foreground px-7 text-xs uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-90"
            >
              Shop Collection
            </Link>
            <Link
              to="/about"
              className="flex h-12 items-center border border-foreground px-7 text-xs uppercase tracking-[0.2em] transition-colors hover:border-gold hover:text-gold"
            >
              Artisan Story
            </Link>
          </div>
        </div>
        <HeroSlideshow className="min-h-[420px] w-full lg:h-full" />
      </section>

      {/* Value pillars */}
      <section className="border-y border-border bg-stone/40">
        <ul className="mx-auto grid max-w-[1400px] gap-8 px-4 py-12 md:grid-cols-4 md:px-8">
          {homepage.valuePillars.slice(0, 4).map((pillar) => (
            <li key={pillar.title}>
              <h2 className="font-serif text-lg">{pillar.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 md:px-8">
        <h2 className="font-serif text-3xl md:text-4xl">Shop by craft</h2>
        <div
          className={cn(
            "mt-10 grid gap-5 grid-cols-2 sm:grid-cols-3",
            categories.length <= 2 ? "lg:grid-cols-3" : "lg:grid-cols-5",
          )}
        >
          {categories.slice(0, 8).map((category, i) => {
            const live = products.filter((p) => p.category === category.slug).length;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.04 }}
                className="h-full"
              >
                <Link
                  to="/shop"
                  search={{ category: category.slug }}
                  className="group flex h-full flex-col"
                >
                  <SmartImage
                    src={category.image}
                    alt={category.name}
                    ratio="1/1"
                    className="transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  <h3 className="mt-3 font-serif text-base leading-snug">{category.name}</h3>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {live || category.productCount} pieces
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Featured collection */}
      <section className="mx-auto max-w-[1400px] px-4 pb-20 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-serif text-3xl md:text-4xl">The signature collection</h2>
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "h-11 border px-4 text-xs uppercase tracking-[0.14em] transition-colors",
                  tab === t.id ? "border-gold text-gold" : "border-border text-muted-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* Process */}
      <section className="border-y border-border bg-stone/40">
        <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8">
          <h2 className="font-serif text-3xl md:text-4xl">From grass to basket</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-5">
            {homepage.processSteps.map((step, i) => (
              <li key={step.step}>
                <span className="font-serif text-3xl text-gold">0{i + 1}</span>
                <h3 className="mt-2 font-serif text-lg">{step.step}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <StoryFilm />

      {/* Fair-wage promise */}
      <section className="border-y border-border bg-foreground py-16 text-background">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_2fr]">
            <div>
              <p className="label-caps text-gold">Fair-wage transparency</p>
              <h2 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">
                Every basket pays its maker first
              </h2>
              <Link
                to="/about"
                hash="transparency"
                className="mt-6 inline-block border border-gold px-6 py-3 text-xs uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold hover:text-foreground"
              >
                See where your money goes
              </Link>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  title: "2.4× fair wages",
                  body: "Per-piece commissions at 2.4× the regional average, paid on collection day — never on sale.",
                },
                {
                  title: "Medical care covered",
                  body: "A share of every order funds clinic visits, prescriptions and emergencies for weavers and their children.",
                },
                {
                  title: "Community projects",
                  body: "School fees, boreholes and dye gardens funded in the weaving villages of Bolgatanga, Sumbrungu and Zuarungu.",
                },
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="font-serif text-xl text-gold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-background/80">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 md:px-8">
        <h2 className="font-serif text-3xl md:text-4xl">Newly added</h2>
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {arrivals.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Weaver spotlight */}
      {homepage.weaverSpotlights[0] && (
        <section className="mx-auto grid max-w-[1400px] gap-10 px-4 pb-20 md:px-8 lg:grid-cols-[1fr_1.1fr]">
          <SmartImage
            src={homepage.weaverSpotlights[0].image}
            alt={homepage.weaverSpotlights[0].name}
            ratio="4/3"
          />
          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Weaver spotlight</p>
            <blockquote className="mt-5 font-serif text-2xl leading-snug md:text-3xl">
              “{homepage.weaverSpotlights[0].quote}”
            </blockquote>
            <p className="mt-5 text-sm text-muted-foreground">
              {homepage.weaverSpotlights[0].name} · {homepage.weaverSpotlights[0].village} ·{" "}
              {homepage.weaverSpotlights[0].years} years weaving
            </p>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="mx-auto max-w-[1400px] px-4 pb-24 md:px-8">
        <h2 className="font-serif text-3xl md:text-4xl">Collector notes</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {reviews.slice(0, 3).map((review) => (
            <article key={review.id} className="border border-border p-6">
              <StarRating value={review.rating} />
              <h3 className="mt-3 font-serif text-xl">{review.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {review.customerName}
                {review.isVerifiedPurchase && <span className="ml-2 text-sage">Verified</span>}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
