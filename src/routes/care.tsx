import { createFileRoute } from "@tanstack/react-router";

import { SmartImage } from "@/components/SmartImage";
import { IMAGES } from "@/lib/mock-data";
import { canonical } from "@/lib/seo";

export const Route = createFileRoute("/care")({
  head: () => ({
    meta: [
      { title: "Care & Reshaping Guide — Vetastudio" },
      {
        name: "description",
        content:
          "How to reshape a folded Bolga basket with a warm water mist, plus long-term care for elephant grass and leather handles.",
      },
      { property: "og:title", content: "Care & Reshaping Guide — Vetastudio" },
      {
        property: "og:description",
        content: "Step-by-step reshaping and care for handwoven elephant grass baskets.",
      },
      ...canonical("/care").meta,
    ],
    links: canonical("/care").links,
  }),
  component: CarePage,
});

const STEPS = [
  {
    title: "1. Unpack and let it breathe",
    body: "Baskets ship folded to reduce freight volume. Remove all packing and leave the piece at room temperature for an hour so the grass relaxes.",
  },
  {
    title: "2. Mist with warm water",
    body: "Fill a spray bottle with warm (not hot) water and mist the weave evenly inside and out until it is damp — never soaked. The fibre becomes pliable within a minute.",
  },
  {
    title: "3. Reshape with your hands",
    body: "Push the base flat from inside, then work around the rim pressing outward to open the mouth. For sculptural pieces, shape the curve slowly and hold for a few seconds.",
  },
  {
    title: "4. Dry in shade",
    body: "Let the basket dry away from direct sun or heaters, which fade natural dyes. Stuff with a towel to hold the new shape while drying.",
  },
  {
    title: "5. Long-term care",
    body: "Dust with a dry brush, spot-clean with a barely damp cloth, and condition leather handles once a year with a neutral balm. Repeat the mist-and-reshape whenever the form softens.",
  },
];

function CarePage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-16 md:px-8">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Care Guide</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
          Reshaping your Bolga basket
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Elephant grass has memory. A folded basket returns to its woven form in minutes with
          nothing more than warm water and your hands.
        </p>
      </header>

      <SmartImage
        src={IMAGES.hero}
        alt="Handwoven Bolga basket with fringed elephant grass rim"
        ratio="16/9"
        priority
        className="mt-10"
      />

      <ol className="mt-14 divide-y divide-border border-y border-border">
        {STEPS.map((step) => (
          <li key={step.title} className="grid gap-3 py-8 md:grid-cols-[240px_minmax(0,1fr)]">
            <h2 className="font-serif text-xl">{step.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>

      <section className="mt-14 bg-stone/60 p-8">
        <h2 className="font-serif text-2xl">Never do this</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Do not submerge the basket or put it in a washing machine.</li>
          <li>Do not dry with a hairdryer or in direct sun — dyes will fade unevenly.</li>
          <li>Do not store crushed under heavy objects for long periods.</li>
        </ul>
      </section>
    </div>
  );
}
