import { motion } from "motion/react";

import { IMAGES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * Single-subject band: the studio film, given room to breathe, with the
 * story of what you are watching set beside it.
 */
export function StoryFilm({ className }: { className?: string }) {
  return (
    <section className={cn("border-y border-border bg-stone/40", className)}>
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-4 py-20 md:px-8 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden bg-foreground/5 shadow-editorial"
        >
          <video
            src={IMAGES.storyFilm}
            poster={IMAGES.weavingCircle}
            controls
            playsInline
            muted
            loop
            preload="metadata"
            className="aspect-video w-full object-cover"
          />
        </motion.div>

        <div>
          <p className="label-caps text-gold">Filmed in Bolgatanga</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
            Two minutes inside a working compound
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            No studio set, no stand-ins. This is the courtyard where our weavers sit through the
            afternoon: grass split against the thumbnail, twisted into cord, then coiled row over row
            while conversation carries the count.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            A single sculptural basket takes two to five days of this. Watch the hands rather than the
            basket — the rhythm is what you are buying.
          </p>
        </div>
      </div>
    </section>
  );
}
