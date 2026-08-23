import { useEffect, useRef, useState } from "react";

import { MediaFallback } from "@/components/SmartImage";
import { assetUrl } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * Fires once the element gets within `rootMargin` of the viewport.
 * Used to defer heavy media and warm up the next chapter's images.
 */
export function useNearViewport<T extends HTMLElement>(rootMargin = "400px") {
  const ref = useRef<T | null>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [near, rootMargin]);

  return { ref, near };
}

/** Decodes images off-thread as soon as the chapter approaches the viewport. */
export function usePrefetchImages(urls: (string | undefined)[], active: boolean) {
  useEffect(() => {
    if (!active || typeof window === "undefined") return;
    urls.filter(Boolean).forEach((url) => {
      const img = new Image();
      img.decoding = "async";
      img.src = assetUrl(url as string);
    });
  }, [active, urls.join("|")]);
}

/**
 * Wraps a story chapter: defers its own media until near the viewport and
 * prefetches the images belonging to the following chapter.
 */
export function StoryChapter({
  prefetch = [],
  className,
  children,
  id,
}: {
  prefetch?: string[];
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  const { ref, near } = useNearViewport<HTMLElement>("500px");
  usePrefetchImages(prefetch, near);

  return (
    <section ref={ref} id={id} className={className}>
      {children}
    </section>
  );
}

/** Video with lazy metadata loading and a styled fallback if it cannot play. */
export function StoryVideo({
  src,
  poster,
  label,
  className,
}: {
  src: string;
  poster?: string;
  label: string;
  className?: string;
}) {
  const { ref, near } = useNearViewport<HTMLDivElement>("600px");
  const [failed, setFailed] = useState(false);

  return (
    <div ref={ref} className={cn("relative aspect-video w-full overflow-hidden bg-stone", className)}>
      {failed ? (
        <MediaFallback alt={label} message="This film could not be loaded right now" />
      ) : (
        <video
          src={near ? assetUrl(src) : undefined}
          poster={poster ? assetUrl(poster) : undefined}
          controls
          playsInline
          muted
          loop
          preload={near ? "metadata" : "none"}
          aria-label={label}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
