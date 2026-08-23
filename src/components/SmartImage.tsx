import { useState } from "react";

import { cn } from "@/lib/utils";
import { FALLBACK_IMAGE, assetUrl } from "@/lib/mock-data";

interface SmartImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
  ratio?: "4/5" | "4/3" | "1/1" | "16/9" | "3/4";
  priority?: boolean;
  sizes?: string;
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
 * placeholder while loading and swaps to a house image if the source fails.
 */
export function SmartImage({
  src,
  alt,
  className,
  ratio = "4/5",
  priority = false,
  sizes = "(min-width: 1024px) 33vw, 100vw",
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const resolved = failed || !src ? FALLBACK_IMAGE : assetUrl(src);

  return (
    <div className={cn("relative overflow-hidden bg-stone", RATIO_CLASS[ratio], className)}>
      {!loaded && <div className="shimmer absolute inset-0" aria-hidden="true" />}
      <img
        src={resolved}
        alt={alt}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setFailed(true);
          setLoaded(true);
        }}
        className={cn(
          "h-full w-full object-cover transition-[opacity,filter] duration-700",
          loaded ? "opacity-100 blur-0" : "opacity-0 blur-lg",
        )}
      />
    </div>
  );
}
