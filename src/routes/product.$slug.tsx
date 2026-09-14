import { useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Globe,
  Heart,
  MessageSquare,
  Minus,
  Plane,
  Plus,
  RotateCcw,
  Scale,
  ShieldCheck,
  Sparkles,
  Truck,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { ProductCard } from "@/components/ProductCard";
import { SmartImage } from "@/components/SmartImage";
import { StarPicker, StarRating } from "@/components/StarRating";
import { useStore } from "@/context/StoreProvider";
import { useProducts, useReviews, useSettings } from "@/hooks/use-store-data";
import { usePrice } from "@/hooks/use-price";
import { submitReview } from "@/lib/store-api";
import { cn } from "@/lib/utils";
import { youtubeEmbedUrl } from "@/lib/media";
import { absoluteUrl, breadcrumbJsonLd, canonical, jsonLdScript } from "@/lib/seo";
import { assetUrl } from "@/lib/asset-url";
import { fetchProducts } from "@/lib/store-api";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    try {
      const products = await fetchProducts();
      const match = products.find((p) => p.slug === params.slug);
      if (!match) return { product: null };
      const image = match.primaryImage || match.images[0] || "";
      return {
        product: {
          name: match.name,
          description: match.description,
          image: image ? assetUrl(image) : "",
          price: match.salePrice ?? match.price,
          inStock: match.stockQuantity > 0,
          rating: match.rating,
          reviewCount: match.reviewCount,
          sku: match.sku,
          material: match.material,
        },
      };
    } catch {
      return { product: null };
    }
  },
  head: ({ params, loaderData }) => {
    const loaded = loaderData?.product ?? null;
    const name =
      loaded?.name ??
      params.slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    const description =
      loaded?.description && loaded.description.trim().length > 40
        ? loaded.description.trim().slice(0, 300)
        : `${name}: handwoven Bolga elephant grass craft from Ghana, fair-wage made and shipped carbon-neutral.`;
    return {
      meta: [
        { title: `${name} — Vetastudio` },
        { name: "description", content: description },
        { property: "og:title", content: `${name} — Vetastudio` },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
        ...canonical(`/product/${params.slug}`).meta,
      ],
      links: canonical(`/product/${params.slug}`).links,
      scripts: [
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "Product",
          name,
          url: absoluteUrl(`/product/${params.slug}`),
          brand: { "@type": "Brand", name: "Vetastudio" },
          material: loaded?.material || "Elephant grass (veta vera)",
          description,
          ...(loaded?.image ? { image: [loaded.image] } : {}),
          ...(loaded?.sku ? { sku: loaded.sku } : {}),
          ...(loaded
            ? {
                offers: {
                  "@type": "Offer",
                  url: absoluteUrl(`/product/${params.slug}`),
                  price: loaded.price.toFixed(2),
                  priceCurrency: "USD",
                  availability: loaded.inStock
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                  itemCondition: "https://schema.org/NewCondition",
                },
              }
            : {}),
          ...(loaded && loaded.reviewCount > 0 && loaded.rating > 0
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: loaded.rating.toFixed(1),
                  reviewCount: loaded.reviewCount,
                },
              }
            : {}),
        }),
        jsonLdScript(
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name, path: `/product/${params.slug}` },
          ]),
        ),
      ],
    };
  },
  component: ProductPage,
});

const reviewSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your name").max(80),
  title: z.string().trim().min(3, "Add a headline").max(120),
  comment: z.string().trim().min(10, "Tell us a little more").max(1000),
  rating: z.number().min(1).max(5),
});

const RATING_LABEL: Record<number, string> = {
  5: "5 Stars — Outstanding & Authentic",
  4: "4 Stars — Excellent Craft",
  3: "3 Stars — Good",
  2: "2 Stars — Below Expectations",
  1: "1 Star — Disappointed",
};

const TABS = [
  "Description",
  "Dimensions & Weight",
  "Materials",
  "Craftsmanship",
  "Shipping",
  "Care Instructions",
] as const;

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { data: products } = useProducts();
  const { data: reviews } = useReviews();
  const settings = useSettings();
  const price = usePrice();
  const { addToCart, toggleWishlist, isWishlisted, toggleCompare, isCompared, openDrawer } =
    useStore();

  const product = products.find((p) => p.slug === slug);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Description");
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [rating, setRating] = useState(5);
  const [form, setForm] = useState({ customerName: "", email: "", title: "", comment: "" });
  const [pending, setPending] = useState(false);

  const productReviews = useMemo(
    () => reviews.filter((r) => r.productId === product?.id),
    [reviews, product?.id],
  );

  const breakdown = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const r of productReviews) counts[Math.min(4, Math.max(0, r.rating - 1))]! += 1;
    return counts;
  }, [productReviews]);

  const related = useMemo(
    () =>
      products.filter((p) => p.id !== product?.id && p.category === product?.category).slice(0, 4),
    [products, product],
  );

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl">This piece is no longer available</h1>
        <Link
          to="/shop"
          className="mt-6 inline-flex h-12 items-center bg-foreground px-6 text-xs uppercase tracking-[0.2em] text-background"
        >
          Browse the collection
        </Link>
      </div>
    );
  }

  const gallery = [product.primaryImage, ...product.images].filter(Boolean);
  const onSale = product.salePrice != null && product.salePrice < product.price;
  const lowStock = product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold;
  const shipBase = settings.shippingInternational;
  const shipExtra = settings.shippingAdditionalItem;
  const averageRating = productReviews.length
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
    : product.rating;

  async function handleReview(e: React.FormEvent) {
    e.preventDefault();
    const parsed = reviewSchema.safeParse({
      customerName: form.customerName,
      title: form.title,
      comment: form.comment,
      rating,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your review");
      return;
    }
    setPending(true);
    try {
      await submitReview({ productId: product!.id, ...parsed.data });
      toast.success("Thank you — your review is awaiting approval");
      setForm({ customerName: "", email: "", title: "", comment: "" });
      setRating(5);
    } catch {
      toast.error("Could not submit your review right now");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-8">
      <nav className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        <Link to="/shop" className="hover:text-gold">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="capitalize">{product.category}</span>
      </nav>

      {/* Gallery + purchase panel */}
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div
            className="relative overflow-hidden border border-border"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setZoom({
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100,
              });
            }}
            onMouseLeave={() => setZoom(null)}
          >
            <div
              className={cn("transition-transform duration-500", zoom ? "scale-[1.7]" : "scale-100")}
              style={{ transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "center" }}
            >
              <SmartImage src={gallery[activeImage]} alt={product.name} ratio="1/1" priority />
            </div>
            <span className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 bg-foreground/85 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-background">
              <ZoomIn size={12} /> Hover to zoom weave
            </span>
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {gallery.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    "w-[68px] border p-0.5 transition-colors",
                    i === activeImage ? "border-gold" : "border-border hover:border-foreground/40",
                  )}
                >
                  <SmartImage src={img} alt="" ratio="1/1" />
                </button>
              ))}
            </div>
          )}
          {product.videoUrl &&
            (youtubeEmbedUrl(product.videoUrl, product.videoLoop) ? (
              <div className="mt-4 aspect-video w-full overflow-hidden border border-border">
                <iframe
                  src={youtubeEmbedUrl(product.videoUrl, product.videoLoop)!}
                  title={`${product.name} video`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            ) : (
              <video
                src={product.videoUrl}
                controls
                playsInline
                muted={product.videoLoop}
                loop={product.videoLoop}
                autoPlay={product.videoLoop}
                className="mt-4 w-full border border-border"
              />
            ))}
        </div>


        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">
            {product.material || "100% Elephant grass (veta vera)"}
            <span className="mx-2 text-muted-foreground">•</span>
            <span className="text-muted-foreground">SKU: {product.sku}</span>
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2.5">
            <StarRating value={averageRating} />
            <span className="text-sm">{averageRating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">
              ({productReviews.length} customer reviews)
            </span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-serif text-4xl">{price(product.salePrice ?? product.price)}</span>
            {onSale && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  {price(product.price)}
                </span>
                <span className="bg-gold px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-background">
                  Sale
                </span>
              </>
            )}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          {/* Shipping box */}
          <div className="mt-7 border border-border">
            <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
              <span className="flex items-center gap-2 text-sm">
                <Globe size={15} className="text-gold" /> {settings.shippingLabel}
              </span>
              <span className="bg-stone px-3 py-1 font-mono text-xs">{price(shipBase)}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-xs text-muted-foreground">
              <span>
                • Base rate: <strong className="text-foreground">{price(shipBase)}</strong> for 1st
                item
              </span>
              <span>(+{price(shipExtra)} for each additional item)</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 px-4 pb-3 text-xs text-muted-foreground">
              <Plane size={13} className="text-gold" /> {settings.shippingCarrier}
              <span className="mx-1">•</span>
              <strong className="text-foreground">{settings.shippingTransitTime}</strong> delivery
            </div>
          </div>

          {lowStock && (
            <p className="mt-5 text-xs uppercase tracking-[0.16em] text-destructive">
              Only {product.stockQuantity} left in stock
            </p>
          )}

          {/* Purchase actions */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center border border-border">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="grid h-12 w-12 place-items-center"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stockQuantity || 1, q + 1))}
                aria-label="Increase quantity"
                className="grid h-12 w-12 place-items-center"
              >
                <Plus size={14} />
              </button>
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              disabled={product.stockQuantity <= 0}
              onClick={() => {
                addToCart(product, quantity);
                toast.success("Added to your bag");
                openDrawer("cart");
              }}
              className="flex h-12 flex-1 items-center justify-center gap-2 bg-foreground px-6 text-xs uppercase tracking-[0.2em] text-background disabled:opacity-40"
            >
              Add to shopping bag
            </motion.button>

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              aria-label="Add to wishlist"
              className="grid h-12 w-12 place-items-center border border-border transition-colors hover:border-gold"
            >
              <Heart size={16} className={cn(isWishlisted(product.id) && "fill-gold text-gold")} />
            </button>
          </div>

          <button
            type="button"
            disabled={product.stockQuantity <= 0}
            onClick={() => {
              addToCart(product, quantity);
              void navigate({ to: "/checkout" });
            }}
            className="mt-3 h-12 w-full bg-gold text-xs uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Buy now (fast checkout)
          </button>

          {/* Trust badges */}
          <div className="mt-6 grid gap-3 border border-border p-4 sm:grid-cols-2">
            <Badge icon={<Truck size={15} />} label="Worldwide Express Air Delivery" />
            <Badge icon={<ShieldCheck size={15} />} label="100% Authentic Ghanaian Handwoven" />
            <Badge icon={<RotateCcw size={15} />} label="Easy Reshaping & Care Guarantee" />
            <Badge icon={<Sparkles size={15} />} label="Secure Card & Encrypted Checkout" />
          </div>

          <button
            type="button"
            onClick={() => toggleCompare(product)}
            className="mt-4 flex h-11 items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-gold"
          >
            <Scale size={14} className={cn(isCompared(product.id) && "text-gold")} />
            {isCompared(product.id) ? "In comparison tray" : "Add to comparison"}
          </button>
        </div>
      </div>

      {/* Detail tabs */}
      <section className="mt-16 border border-border">
        <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-border px-6 pt-5">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "border-b-2 pb-3 text-[11px] uppercase tracking-[0.16em] transition-colors",
                tab === t ? "border-gold text-gold" : "border-transparent text-muted-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="max-w-3xl px-6 py-8 text-sm leading-relaxed text-muted-foreground">
          {tab === "Description" && <p>{product.description}</p>}
          {tab === "Dimensions & Weight" && (
            <ul className="space-y-1.5">
              <li>Dimensions: {product.dimensions || "Varies slightly by weave."}</li>
              <li>Weight: {product.weightKg || 1.2} kg</li>
              {product.capacity && <li>Capacity: {product.capacity}</li>}
              {product.handle && <li>Handle: {product.handle}</li>}
            </ul>
          )}
          {tab === "Materials" && (
            <div className="space-y-2">
              <p>{product.material || "100% elephant grass (veta vera) with leather trim."}</p>
              {product.color.length > 0 && (
                <p className="capitalize">Natural dyes: {product.color.join(", ")}</p>
              )}
            </div>
          )}
          {tab === "Craftsmanship" && (
            <p>{product.artisanStory || "Woven in Bolgatanga from sun-dried veta vera grass."}</p>
          )}
          {tab === "Shipping" && (
            <div className="space-y-2">
              <p>
                {settings.shippingCarrier} — {price(shipBase)} base rate for the first item,
                +{price(shipExtra)} per additional item. {settings.shippingTransitTime} worldwide.
              </p>

              <p>
                Complimentary shipping on orders above {price(settings.freeShippingThreshold)}. Each
                basket travels folded and is reshaped at home.
              </p>
            </div>
          )}
          {tab === "Care Instructions" && (
            <div className="space-y-3">
              <p>
                {product.careInstructions ||
                  "Mist the weave with warm water, reshape gently by hand and dry away from direct sunlight."}
              </p>
              <Link to="/care" className="inline-block text-gold underline">
                Read the full reshaping guide
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Reviews */}
      <section className="mt-14 border border-border px-6 py-10 md:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-gold">
              <MessageSquare size={14} /> Artisan quality reviews
            </p>
            <h2 className="mt-3 font-serif text-3xl">
              Customer Feedback ({productReviews.length})
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Real experiences from worldwide collectors celebrating authentic Ghanaian weave,
              texture and longevity.
            </p>
          </div>

          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-8 bg-stone/50 p-6">
            <div className="text-center">
              <p className="font-serif text-4xl">{averageRating.toFixed(1)}</p>
              <StarRating value={averageRating} size={14} />
              <p className="mt-2 text-[11px] text-muted-foreground">
                Based on {productReviews.length} reviews
              </p>
            </div>
            <ul className="space-y-1.5 border-l border-border pl-6">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = breakdown[stars - 1] ?? 0;
                const pct = productReviews.length ? (count / productReviews.length) * 100 : 0;
                return (
                  <li key={stars} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                    <span className="w-6 text-xs text-muted-foreground">{stars}★</span>
                    <span className="h-1.5 w-full bg-background">
                      <span className="block h-full bg-gold" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-5 text-right text-xs text-muted-foreground">{count}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-10 grid gap-10 border-t border-border pt-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <h3 className="flex items-center gap-3 font-serif text-xl">
              Verified Customer Reviews
              <span className="bg-stone px-2 py-0.5 text-xs">{productReviews.length}</span>
            </h3>
            {productReviews.length === 0 ? (
              <div className="mt-6 border border-border bg-stone/30 px-6 py-12 text-center">
                <Sparkles size={20} className="mx-auto text-gold" />
                <p className="mt-4 font-serif text-lg">No reviews yet for {product.name}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Be the first to share your impressions of the elephant grass weave, colours and
                  craftsmanship using the form.
                </p>
              </div>
            ) : (
              <ul className="mt-6 space-y-8">
                {productReviews.map((review) => (
                  <li key={review.id} className="border-b border-border pb-6">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="min-w-0">
                        <StarRating value={review.rating} />
                        <h4 className="mt-2 font-serif text-lg">{review.title}</h4>
                      </div>
                      <time className="shrink-0 text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {review.comment}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {review.customerName}
                      {review.isVerifiedPurchase && (
                        <span className="ml-2 text-sage">Verified buyer</span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={handleReview} className="border border-border bg-stone/30 p-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Leave feedback</p>
            <h3 className="mt-2 font-serif text-2xl">Rate & review this basket</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Share your star rating and feedback. Reviews are published after a quick check and help
              fellow collectors worldwide.
            </p>

            <div className="mt-6 flex items-center justify-between gap-3">
              <label className="text-xs uppercase tracking-[0.14em]">Your overall rating *</label>
              <span className="text-[11px] text-muted-foreground">{RATING_LABEL[rating]}</span>
            </div>
            <div className="mt-2 border border-border bg-background px-3 py-2">
              <StarPicker value={rating} onChange={setRating} />
            </div>

            <input
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              placeholder="Your full name *"
              maxLength={80}
              aria-label="Your full name"
              className="mt-3 h-11 w-full border border-border bg-background px-3 text-sm outline-none focus:border-gold"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Your email (for verification)"
              maxLength={160}
              aria-label="Your email"
              className="mt-3 h-11 w-full border border-border bg-background px-3 text-sm outline-none focus:border-gold"
            />
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Review headline / title *"
              maxLength={120}
              aria-label="Review headline"
              className="mt-3 h-11 w-full border border-border bg-background px-3 text-sm outline-none focus:border-gold"
            />
            <textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="Your text review feedback *"
              maxLength={1000}
              rows={4}
              aria-label="Review comment"
              className="mt-3 w-full border border-border bg-background p-3 text-sm outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={pending}
              className="mt-4 h-12 w-full bg-foreground text-xs uppercase tracking-[0.2em] text-background disabled:opacity-50"
            >
              {pending ? "Sending…" : "Submit verified review"}
            </button>
          </form>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-serif text-3xl">You may also love</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="text-gold">{icon}</span>
      {label}
    </span>
  );
}
