import { useState } from "react";
import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { assetUrl } from "@/lib/mock-data";

interface SmartImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
  ratio?: "4/5" | "4/3" | "1/1" | "16/9" | "3/4";
  priority?: boolean;
  sizes?: string;
  /** Optional caption shown inside the fallback card when the media fails. */
  fallbackMessage?: string;
}

const RATIO_CLASS: Record<string, string> = {
  "4/5": "aspect-[4/5]",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
  "16/9": "aspect-video",
  "3/4": "aspect-[3/4]",
};

/**
 * Pre-allocates the aspect ratio to avoid layout shift, shows a shimmering
 * placeholder while loading and a styled woven-texture card with a friendly
 * message when the source is missing or fails to load.
 */
export function SmartImage({
  src,
  alt,
  className,
  ratio = "4/5",
  priority = false,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  fallbackMessage,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const unavailable = failed || !src;

  return (
    <div className={cn("relative overflow-hidden bg-stone", RATIO_CLASS[ratio], className)}>
      {!loaded && !unavailable && <div className="shimmer absolute inset-0" aria-hidden="true" />}

      {unavailable ? (
        <MediaFallback alt={alt} message={fallbackMessage} />
      ) : (
        <img
          src={assetUrl(src)}
          alt={alt}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "h-full w-full object-cover transition-[opacity,filter] duration-700",
            loaded ? "opacity-100 blur-0" : "opacity-0 blur-lg",
          )}
        />
      )}
    </div>
  );
}

/** Styled placeholder card used when an image or video cannot be displayed. */
export function MediaFallback({
  alt,
  message,
  className,
}: {
  alt?: string;
  message?: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={alt ? `Image unavailable: ${alt}` : "Image unavailable"}
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-3 border border-border bg-stone px-6 text-center",
        className,
      )}
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg, hsl(var(--border) / 0.5) 0 1px, transparent 1px 9px), repeating-linear-gradient(-45deg, hsl(var(--border) / 0.5) 0 1px, transparent 1px 9px)",
      }}
    >
      <ImageOff className="h-6 w-6 text-gold" aria-hidden="true" />
      <p className="font-serif text-base leading-snug text-foreground">
        {message ?? "This photograph is taking a rest"}
      </p>
      {alt && (
        <p className="max-w-[28ch] text-xs leading-relaxed text-muted-foreground">{alt}</p>
      )}
    </div>
  );
}
