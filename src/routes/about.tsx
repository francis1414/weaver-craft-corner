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
          <SmartImage
            src={IMAGES.weavingCircle}
            alt="Bolgatanga weavers sitting in a circle splitting elephant grass in the compound"
            ratio="4/3"
            priority
          />
        </div>
        <div>
          <p className="label-caps text-gold">Chapter one — the circle</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
            Work begins as a conversation on the ground
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Mornings in the compound start with sorting. Bundles of veta vera grass are shaken out,
            graded by length and passed around the circle so nobody is left with only the brittle
            stems. The women weave shoulder to shoulder because pattern counts are spoken aloud, not
            written down.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            This is also where orders are shared out. Cooperative leaders agree who takes which piece
            based on what each household can carry that week, which is why our lead times move with the
            season rather than a factory calendar.
          </p>
        </div>
      </section>

      <section className="mt-24 grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className="order-2 md:order-1">
          <p className="label-caps text-gold">Chapter two — the base</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
            Every basket is decided in its first ten centimetres
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            A weaver opens with a flat cross of twisted cord on her knee and works outward in a tight
            spiral. The tension she sets here dictates the final silhouette — a loose start slumps, a
            hard start refuses to flare. There is no mould and no measuring tape.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            If the base is wrong she cuts it out and begins again. It is the reason two baskets ordered
            in the same colourway will never be identical twins, and the reason we never grade a piece
            against a machine-made ideal.
          </p>
        </div>
        <div className="order-1 hover-zoom shadow-editorial md:order-2">
          <SmartImage
            src={IMAGES.artisanBase}
            alt="Weaver closing the flat base of a Bolga basket on her knee"
            ratio="4/3"
          />
        </div>
      </section>

      <section className="mt-24 grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className="hover-zoom shadow-editorial">
          <SmartImage
            src={IMAGES.artisanCoil}
            alt="Artisan coiling dyed elephant grass cord on a woven mat"
            ratio="4/3"
          />
        </div>
        <div>
          <p className="label-caps text-gold">Chapter three — the coil</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
            Colour is counted, not printed
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Dyed cord is kept in separate coils beside the weaver: indigo, ochre from root bark,
            charcoal from iron-rich pots, and undyed straw. Stripes and zebra fringes are produced by
            switching cord on a remembered count, so the geometry drifts a little as the wall rises.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Those small drifts are the signature of hand work. We keep them rather than trimming them
            out, and we tell you the dye source for every colourway on the product page.
          </p>
        </div>
      </section>

      <section className="mt-24">
        <p className="label-caps text-gold">Chapter four — in motion</p>
        <h2 className="mt-3 font-serif text-3xl leading-tight md:text-4xl">
          How things are done, filmed where it happens
        </h2>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Photographs freeze the craft; the sound of it is closer to the truth. Our own film follows a
          single afternoon in the compound, from splitting through to the leather-bound rim.
        </p>
        <div className="mt-8 shadow-editorial">
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
        </div>
      </section>

      <section className="mt-24 grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className="order-2 md:order-1">
          <p className="label-caps text-gold">Chapter five — the maker</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
            A finished piece leaves with a name attached
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            When a basket is done it is carried out, checked for a true rim and photographed with the
            woman who made it. Weavers are paid at collection — before the piece is listed, shipped or
            sold — at per-piece rates agreed with cooperative leaders each season.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            That handover is the whole point of Vetastudio: your basket is traceable to a household in
            Bolgatanga, Sumbrungu or Zuarungu rather than to an anonymous wholesale crate.
          </p>
        </div>
        <div className="order-1 hover-zoom shadow-editorial md:order-2">
          <SmartImage
            src={IMAGES.weaverPortrait}
            alt="Vetastudio weaver holding the finished striped Bolga basket she wove"
            ratio="4/3"
          />
        </div>
      </section>

      <section className="mt-24 grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className="hover-zoom shadow-editorial">
          <SmartImage
            src={IMAGES.basketInterior}
            alt="Large black and natural Bolga floor basket styled on a sunlit terrace"
            ratio="4/3"
          />
        </div>
        <div>
          <p className="label-caps text-gold">Chapter six — at home</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
            It travels folded, then opens into your room
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Grass is shipped compressed to keep freight light and emissions low. Ten minutes with a
            spray bottle of warm water, a firm push on the walls and a loose stuffing overnight returns
            the piece to the shape it left the compound in.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            After that it wants indirect light and an occasional mist in dry heat. Treated that way,
            these baskets outlive most of the furniture around them.
          </p>
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
