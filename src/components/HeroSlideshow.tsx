import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import slide1 from "@/assets/hero-slide-1.png.asset.json";
import slide2 from "@/assets/hero-slide-2.png.asset.json";
import slide3 from "@/assets/hero-slide-3.webp.asset.json";
import { assetUrl } from "@/lib/asset-url";
import { cn } from "@/lib/utils";

const SLIDES = [
  { src: assetUrl(slide1.url), alt: "Weaver holding a scarlet handwoven elephant grass vase basket" },
  { src: assetUrl(slide2.url), alt: "Artisan shaping sculptural Bolga baskets in a studio setting" },
  { src: assetUrl(slide3.url), alt: "Bolgatanga weaver carrying a red art basket beside a village compound" },
];

const INTERVAL = 5000;

/** Auto-advancing editorial slideshow for the homepage hero image column. */
export function HeroSlideshow({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={cn("relative overflow-hidden bg-stone", className)}>
      <AnimatePresence initial={false}>
        <motion.img
          key={index}
          src={SLIDES[index]!.src}
          alt={SLIDES[index]!.alt}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="sync"
          fetchPriority="high"
        />
      </AnimatePresence>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show hero image ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 w-8 transition-colors",
              i === index ? "bg-gold" : "bg-background/50 hover:bg-background/80",
            )}
          />
        ))}
      </div>
    </div>
  );
}
