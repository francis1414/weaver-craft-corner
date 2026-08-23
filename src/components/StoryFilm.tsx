import { motion } from "motion/react";

import { IMAGES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * Editorial "how it is made" band — our own studio film beside
 * photographs from the weaving compounds in Bolgatanga.
 */
export function StoryFilm({ className }: { className?: string }) {
  return (
    <section className={cn("border-y border-border bg-stone/40", className)}>
      <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Inside the compound</p>
          <h2 className="mt-4 font-serif text-3xl md:text-4xl">
            How every basket is made, filmed where it happens
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Grass is split by hand on the knee, coiled from the base outward and counted from memory.
            No two pieces leave the compound the same.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden bg-foreground/5"
          >
            <video
              src={IMAGES.storyFilm}
              poster={IMAGES.weavingCircle}
              controls
              playsInline
              muted
              loop
              preload="metadata"
              className="aspect-video h-full w-full object-cover"
            />
          </motion.div>

          <div className="grid grid-cols-2 gap-6 lg:grid-cols-1">
            <motion.img
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
              src={IMAGES.artisanBase}
              alt="Weaver closing the base of a Bolga basket by hand"
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <motion.img
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.16 }}
              src={IMAGES.artisanCoil}
              alt="Artisan coiling elephant grass inside a village compound"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
