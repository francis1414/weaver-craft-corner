import { useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Heart, Minus, Plus, Scale, Truck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { ProductCard } from "@/components/ProductCard";
import { SmartImage } from "@/components/SmartImage";
import { StarPicker, StarRating } from "@/components/StarRating";
import { useStore } from "@/context/StoreProvider";
import { useProducts, useReviews } from "@/hooks/use-store-data";
import { usePrice } from "@/hooks/use-price";
import { submitReview } from "@/lib/store-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    const name = params.slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `${name} — Vetastudio` },
        {
          name: "description",
          content: `${name}: handwoven Bolga elephant grass craft from Ghana, fair-wage made and shipped carbon-neutral.`,
        },
        { property: "og:title", content: `${name} — Vetastudio` },
        {
          property: "og:description",
          content: `${name}: handwoven Bolga elephant grass craft from Ghana.`,
        },
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

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { data: products } = useProducts();
  const { data: reviews } = useReviews();
  const price = usePrice();
  const { addToCart, toggleWishlist, isWishlisted, toggleCompare, isCompared, openDrawer } =
    useStore();

  const product = products.find((p) => p.slug === slug);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [form, setForm] = useState({ customerName: "", title: "", comment: "" });
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
      products
        .filter((p) => p.id !== product?.id && p.category === product?.category)
        .slice(0, 4),
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

  async function handleReview(e: React.FormEvent) {
    e.preventDefault();
    const parsed = reviewSchema.safeParse({ ...form, rating });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your review");
      return;
    }
    setPending(true);
    try {
      await submitReview({ productId: product!.id, ...parsed.data });
      toast.success("Thank you — your review is awaiting approval");
      setForm({ customerName: "", title: "", comment: "" });
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

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <div className="group overflow-hidden">
            <SmartImage
              src={gallery[activeImage]}
              alt={product.name}
              ratio="4/5"
              priority
              className="transition-transform duration-700 group-hover:scale-[1.12]"
            />
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 flex gap-3">
              {gallery.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    "w-20 border transition-colors",
                    i === activeImage ? "border-gold" : "border-transparent",
                  )}
                >
                  <SmartImage src={img} alt="" ratio="1/1" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">{product.category}</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <StarRating value={product.rating} />
            <span className="text-xs text-muted-foreground">
              {product.reviewCount} collector reviews
            </span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-serif text-3xl">{price(product.salePrice ?? product.price)}</span>
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

          {lowStock && (
            <p className="mt-5 text-xs uppercase tracking-[0.16em] text-destructive">
              Only {product.stockQuantity} left in stock
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
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
                toast.success("Added to cart");
                openDrawer("cart");
              }}
              className="h-12 flex-1 bg-foreground px-6 text-xs uppercase tracking-[0.2em] text-background disabled:opacity-40"
            >
              Add to cart
            </motion.button>

            <button
              type="button"
              disabled={product.stockQuantity <= 0}
              onClick={() => {
                addToCart(product, quantity);
                void navigate({ to: "/checkout" });
              }}
              className="h-12 border border-foreground px-6 text-xs uppercase tracking-[0.2em] disabled:opacity-40"
            >
              Buy now
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className="flex h-11 items-center gap-2 hover:text-gold"
            >
              <Heart size={14} className={cn(isWishlisted(product.id) && "fill-gold text-gold")} />
              {isWishlisted(product.id) ? "Saved" : "Add to wishlist"}
            </button>
            <button
              type="button"
              onClick={() => toggleCompare(product)}
              className="flex h-11 items-center gap-2 hover:text-gold"
            >
              <Scale size={14} className={cn(isCompared(product.id) && "text-gold")} />
              {isCompared(product.id) ? "In compare" : "Compare"}
            </button>
            <span className="flex h-11 items-center gap-2">
              <Truck size={14} /> Carbon-neutral delivery
            </span>
          </div>

          <div className="mt-10 divide-y divide-border border-y border-border">
            <Accordion title="Dimensions & weight">
              <p>{product.dimensions || "Dimensions vary slightly by weave."}</p>
              <p className="mt-1">Weight: {product.weightKg || 1.2} kg</p>
              {product.capacity && <p className="mt-1">Capacity: {product.capacity}</p>}
              {product.handle && <p className="mt-1">Handle: {product.handle}</p>}
            </Accordion>
            <Accordion title="Weaving technique & dye origin">
              <p>{product.artisanStory || "Woven in Bolgatanga from sun-dried veta vera grass."}</p>
              <p className="mt-2">Material: {product.material || "Elephant grass, leather trim"}</p>
              {product.color.length > 0 && (
                <p className="mt-1 capitalize">Natural dyes: {product.color.join(", ")}</p>
              )}
            </Accordion>
            <Accordion title="Care & reshaping">
              <p>
                {product.careInstructions ||
                  "Mist the weave with warm water, reshape gently by hand and dry away from direct sunlight."}
              </p>
              <Link to="/care" className="mt-3 inline-block text-gold underline">
                Read the full reshaping guide
              </Link>
            </Accordion>
          </div>
        </div>
      </div>

      <section className="mt-24 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="font-serif text-3xl">Collector reviews</h2>
          <div className="mt-6 flex items-center gap-4">
            <span className="font-serif text-5xl">{product.rating.toFixed(1)}</span>
            <div>
              <StarRating value={product.rating} size={16} />
              <p className="mt-1 text-xs text-muted-foreground">
                {productReviews.length} verified reviews
              </p>
            </div>
          </div>
          <ul className="mt-6 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = breakdown[stars - 1] ?? 0;
              const pct = productReviews.length ? (count / productReviews.length) * 100 : 0;
              return (
                <li key={stars} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                  <span className="w-8 text-xs text-muted-foreground">{stars}★</span>
                  <span className="h-1.5 w-full bg-stone">
                    <span className="block h-full bg-gold" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="w-6 text-right text-xs text-muted-foreground">{count}</span>
                </li>
              );
            })}
          </ul>

          <form onSubmit={handleReview} className="mt-10 border border-border p-5">
            <h3 className="font-serif text-xl">Write a review</h3>
            <StarPicker value={rating} onChange={setRating} />
            <input
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              placeholder="Your name"
              maxLength={80}
              aria-label="Your name"
              className="mt-3 h-11 w-full border border-border bg-transparent px-3 text-sm outline-none focus:border-gold"
            />
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Headline"
              maxLength={120}
              aria-label="Review headline"
              className="mt-3 h-11 w-full border border-border bg-transparent px-3 text-sm outline-none focus:border-gold"
            />
            <textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="What did you think of the weave?"
              maxLength={1000}
              rows={4}
              aria-label="Review comment"
              className="mt-3 w-full border border-border bg-transparent p-3 text-sm outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={pending}
              className="mt-4 h-12 w-full bg-foreground text-xs uppercase tracking-[0.2em] text-background disabled:opacity-50"
            >
              {pending ? "Sending…" : "Submit review"}
            </button>
          </form>
        </div>

        <ul className="space-y-8">
          {productReviews.length === 0 && (
            <li className="text-sm text-muted-foreground">
              No reviews yet — be the first collector to write one.
            </li>
          )}
          {productReviews.map((review) => (
            <li key={review.id} className="border-b border-border pb-6">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <StarRating value={review.rating} />
                  <h3 className="mt-2 font-serif text-lg">{review.title}</h3>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </time>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {review.customerName}
                {review.isVerifiedPurchase && <span className="ml-2 text-sage">Verified buyer</span>}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {related.length > 0 && (
        <section className="mt-24">
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

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-14 w-full items-center justify-between text-left text-xs uppercase tracking-[0.16em]"
      >
        {title}
        <Plus
          size={14}
          className={cn("transition-transform duration-300", open && "rotate-45")}
        />
      </button>
      {open && (
        <div className="pb-5 text-sm leading-relaxed text-muted-foreground">{children}</div>
      )}
    </div>
  );
}
