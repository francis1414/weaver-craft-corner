import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Heart, Scale, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { SmartImage } from "@/components/SmartImage";
import { StarRating } from "@/components/StarRating";
import { useStore } from "@/context/StoreProvider";
import { usePrice } from "@/hooks/use-price";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const price = usePrice();
  const { addToCart, toggleWishlist, isWishlisted, toggleCompare, isCompared } = useStore();
  const onSale = product.salePrice != null && product.salePrice < product.price;
  const soldOut = product.stockQuantity <= 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.3) }}
      className="group relative"
    >
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="block"
        aria-label={product.name}
      >
        <div className="relative overflow-hidden">
          <SmartImage
            src={product.primaryImage}
            alt={product.name}
            ratio="4/5"
            className="transition-transform duration-700 group-hover:scale-[1.04]"
          />
          {product.images[1] && (
            <SmartImage
              src={product.images[1]}
              alt=""
              ratio="4/5"
              className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
          <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
            {onSale && (
              <span className="bg-gold px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-background">
                Sale
              </span>
            )}
            {product.featured && !onSale && (
              <span className="bg-sage px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-background">
                Signature
              </span>
            )}
            {soldOut && (
              <span className="bg-foreground px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-background">
                Sold out
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100 max-md:opacity-100">
        <button
          type="button"
          onClick={() => {
            toggleWishlist(product);
            toast.success(isWishlisted(product.id) ? "Removed from wishlist" : "Saved to wishlist");
          }}
          aria-label="Toggle wishlist"
          className="grid h-11 w-11 place-items-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
        >
          <Heart size={16} className={cn(isWishlisted(product.id) && "fill-gold text-gold")} />
        </button>
        <button
          type="button"
          onClick={() => {
            toggleCompare(product);
            toast.success(isCompared(product.id) ? "Removed from compare" : "Added to compare");
          }}
          aria-label="Toggle compare"
          className="grid h-11 w-11 place-items-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
        >
          <Scale size={16} className={cn(isCompared(product.id) && "text-gold")} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <Link to="/product/$slug" params={{ slug: product.slug }}>
            <h3 className="font-serif text-lg leading-tight text-foreground">{product.name}</h3>
          </Link>
          <p className="mt-1 truncate text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {product.dimensions || product.material}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-foreground">{price(product.salePrice ?? product.price)}</span>
            {onSale && (
              <span className="text-xs text-muted-foreground line-through">
                {price(product.price)}
              </span>
            )}
          </div>
          {product.reviewCount > 0 && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <StarRating value={product.rating} size={12} />
              <span className="text-[11px] text-muted-foreground">({product.reviewCount})</span>
            </div>
          )}
        </div>
        <button
          type="button"
          disabled={soldOut}
          onClick={() => {
            addToCart(product);
            toast.success(`${product.name} added to cart`);
          }}
          aria-label={`Add ${product.name} to cart`}
          className="grid h-11 w-11 shrink-0 place-items-center border border-border text-foreground transition-colors hover:border-gold hover:text-gold disabled:opacity-40"
        >
          <ShoppingBag size={16} />
        </button>
      </div>
    </motion.article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <div className="shimmer aspect-[4/5] w-full bg-stone" />
      <div className="mt-4 space-y-2">
        <div className="shimmer h-4 w-3/4 bg-stone" />
        <div className="shimmer h-3 w-1/2 bg-stone" />
      </div>
    </div>
  );
}
