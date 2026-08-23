import { createFileRoute } from "@tanstack/react-router";

import { SmartImage } from "@/components/SmartImage";
import { IMAGES } from "@/lib/mock-data";
import { breadcrumbJsonLd, canonical, jsonLdScript, organizationJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Fair-Trade Bolga Basket Weavers in Ghana | Vetastudio" },
      {
        name: "description",
        content:
          "Meet the Bolgatanga weaving cooperatives behind Vetastudio: fair-wage certified artisans working with veta vera elephant grass.",
      },
      {
        property: "og:title",
        content: "Our Story — Fair-Trade Bolga Basket Weavers in Ghana | Vetastudio",
      },
      {
        property: "og:description",
        content: "Fair-trade transparency and the weavers of Upper East Ghana.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...canonical("/about").meta,
    ],
    links: canonical("/about").links,
    scripts: [
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "The Vetastudio Story",
        url: "https://weaver-craft-corner.lovable.app/about",
        about: organizationJsonLd,
      }),
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Our Story", path: "/about" },
        ]),
      ),
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-8 md:py-24">
      <header id="story" className="mx-auto max-w-3xl scroll-mt-24 text-center">
        <p className="label-caps text-gold">Our brand heritage & provenance</p>
        <h1 className="mt-5 font-serif text-5xl leading-tight md:text-7xl">The Vetastudio Story</h1>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          Authentic handmade craftsmanship from Ghana, presented as contemporary, globally desirable
          fibre art for modern living.
        </p>
      </header>

      <section id="craft" className="mt-16 grid scroll-mt-24 items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className="hover-zoom shadow-editorial">
          <SmartImage src={IMAGES.weavingCircle} alt="Bolgatanga weavers splitting elephant grass together in the compound" ratio="4/3" priority />
        </div>
        <div>
          <p className="label-caps text-gold">Rooted in Bolgatanga</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">Rooted in Northern Ghana, designed for modern living</h2>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Vetastudio works directly with weaving cooperatives in Bolgatanga, Upper East Ghana. Every
            basket is made from veta vera elephant grass harvested in the dry season, split by hand,
            dyed with plant pigments, and woven over two to five days by a single artisan.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            We bridge generations of technique with a thoughtful contemporary point of view, honouring
            every maker and the landscape that supplies the fibre.
          </p>
        </div>
      </section>


      <section className="mt-24">
        <p className="label-caps text-gold">In their own hands</p>
        <h2 className="mt-3 font-serif text-3xl">How things are done</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <video
            src={IMAGES.storyFilm}
            poster={IMAGES.weavingCircle}
            controls
            playsInline
            muted
            loop
            preload="metadata"
            className="aspect-video w-full bg-stone object-cover"
          />
          <div className="grid grid-cols-2 gap-6 md:grid-cols-1">
            <img
              src={IMAGES.artisanBase}
              alt="Weaver closing the base of a Bolga basket"
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <img
              src={IMAGES.artisanCoil}
              alt="Artisan coiling elephant grass on a mat"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <img
            src={IMAGES.weaverPortrait}
            alt="Vetastudio weaver holding a finished striped Bolga basket"
            loading="lazy"
            className="w-full object-cover"
          />
          <img
            src={IMAGES.basketInterior}
            alt="Large black and natural Bolga floor basket styled in a sunlit terrace"
            loading="lazy"
            className="w-full object-cover"
          />
        </div>
      </section>

      <div id="transparency" className="mt-24 grid scroll-mt-24 gap-12 border-y border-border py-14 md:grid-cols-3">
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

      <section className="mt-20">
        <p className="label-caps text-gold">Complete transparency</p>
        <h2 className="mt-3 font-serif text-3xl">Where your money goes</h2>
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
