import { createFileRoute } from "@tanstack/react-router";

import { SmartImage } from "@/components/SmartImage";
import { IMAGES } from "@/lib/mock-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "The Artisan Story — Vetastudio" },
      {
        name: "description",
        content:
          "Meet the Bolgatanga weaving cooperatives behind Vetastudio: fair-wage certified artisans working with veta vera elephant grass.",
      },
      { property: "og:title", content: "The Artisan Story — Vetastudio" },
      {
        property: "og:description",
        content: "Fair-trade transparency and the weavers of Upper East Ghana.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-8">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Our Mission</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight md:text-6xl">
          Craft that pays the weaver first
        </h1>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          Vetastudio works directly with weaving cooperatives in Bolgatanga, Upper East Ghana. Every
          basket is made from veta vera elephant grass harvested in the dry season, split by hand,
          dyed with plant pigments, and woven over two to five days by a single artisan.
        </p>
      </header>

      <SmartImage
        src={IMAGES.artisan}
        alt="A weaver working elephant grass into a Bolga basket"
        ratio="16/9"
        priority
        className="mt-12"
      />

      <div className="mt-16 grid gap-12 md:grid-cols-3">
        {[
          {
            title: "Fair-wage transparency",
            body: "Weavers are paid per piece at 2.4× the regional average, agreed with cooperative leaders before each season and paid on collection, not on sale.",
          },
          {
            title: "The cooperative model",
            body: "We buy from four cooperatives across Bolgatanga, Sumbrungu and Zuarungu. Each holds its own dye stock and rotates orders so no household is over-committed.",
          },
          {
            title: "Carbon-neutral shipping",
            body: "Baskets travel folded and are reshaped on arrival with a warm water mist. All freight is offset through certified West African reforestation.",
          },
        ].map((block) => (
          <section key={block.title}>
            <h2 className="font-serif text-2xl">{block.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{block.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-20 border-t border-border pt-12">
        <h2 className="font-serif text-3xl">Where your money goes</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-4">
          {[
            { label: "Artisan payment", value: "46%" },
            { label: "Materials & dyes", value: "14%" },
            { label: "Freight & offsets", value: "18%" },
            { label: "Studio operations", value: "22%" },
          ].map((stat) => (
            <li key={stat.label} className="border border-border p-5">
              <p className="font-serif text-3xl text-gold">{stat.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {stat.label}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
