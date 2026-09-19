import { createFileRoute, Link } from "@tanstack/react-router";

import wovenLightInterior from "@/assets/woven-light-interior.avif.asset.json";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { SmartImage } from "@/components/SmartImage";
import { useProducts } from "@/hooks/use-store-data";
import { assetUrl } from "@/lib/asset-url";
import {
  breadcrumbJsonLd,
  canonical,
  jsonLdScript,
  organizationJsonLd,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

const TITLE = "Bolga Art Baskets — Sculptural Ghanaian Basketry, Artist-Direct | Veta Vera Studio";
const DESCRIPTION =
  "Bolga art baskets: one-of-one sculptural elephant grass work signed by the weaver, sold artist-direct from Bolgatanga, Ghana. Woven vessels, wall discs and lampshades shipped worldwide.";

export const Route = createFileRoute("/bolga-art-baskets")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...canonical("/bolga-art-baskets").meta,
    ],
    links: canonical("/bolga-art-baskets").links,
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Bolga art baskets", path: "/bolga-art-baskets" },
        ]),
      ),
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Bolga art baskets",
        description: DESCRIPTION,
        url: `${SITE_URL}/bolga-art-baskets`,
        about: {
          "@type": "VisualArtwork",
          name: "Bolga art basket",
          artform: "Fibre art",
          artMedium: "Elephant grass (veta vera), plant dyes, goat leather",
          artworkSurface: "Hand-coiled woven vessel",
          creator: { "@type": "Organization", name: SITE_NAME },
        },
        publisher: organizationJsonLd,
      }),
    ],
  }),
  component: ArtBasketsPage,
});

const DIFFERENCE = [
  {
    title: "Art basket vs market basket",
    body: "A market basket is made to a repeatable size for daily carrying. An art basket is designed as a form first: the weaver sets an unusual silhouette, plays a pattern across the curve, and finishes the rim as a line rather than a lip. The technique is identical; the intent is not.",
  },
  {
    title: "One of one, and signed",
    body: "Each art piece is coiled freehand over days, so the shape cannot be repeated exactly. Every piece leaves the studio recorded with the weaver's name, village and weaving dates.",
  },
  {
    title: "Artist-direct, not resold",
    body: "Marketplaces and galleries list work they have never handled and add their commission to the artist's price. Here the basket in the photograph is the basket that ships, and the commission stays in Bolgatanga.",
  },
  {
    title: "Made to live in a room",
    body: "Scale, tone and shadow are chosen for interiors — plinth-height vessels, wall constellations and woven light that patterns a plaster wall at night.",
  },
];

const FORMS = [
  {
    title: "Sculptural vessels",
    body: "Tall coiled forms and asymmetric silhouettes read as standalone sculpture on a plinth, console or floor.",
  },
  {
    title: "Wall discs and fans",
    body: "Flat woven discs hung in groups — an alternative to canvas across large plaster, stone or lime-washed walls.",
  },
  {
    title: "Woven light",
    body: "Pendant and floor shades that throw patterned shadow, so the artwork also lights the room.",
  },
];

function ArtBasketsPage() {
  const { data: products, isLoading } = useProducts();
  const art = products.filter((p) => p.category === "sculpture" || p.category === "lampshade");
  const shown = (art.length ? art : products).slice(0, 6);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-8 md:py-24">
      <header className="mx-auto max-w-3xl text-center">
        <p className="label-caps text-gold">Sculptural basketry</p>
        <h1 className="mt-5 font-serif text-4xl leading-tight md:text-6xl">
          Bolga art baskets, woven as sculpture
        </h1>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          The same elephant grass and the same hands that make Bolgatanga's market baskets, worked
          instead into one-of-one art pieces: coiled vessels, wall discs and woven light, signed by
          the weaver and sold direct from the studio in Ghana.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            to="/shop"
            className="inline-flex h-12 items-center border border-foreground px-8 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background"
          >
            View available pieces
          </Link>
          <a
            href={whatsappLink("Hello Veta Vera Studio, I am interested in a Bolga art basket.")}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-12 items-center border border-gold px-8 text-xs uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-gold-foreground"
          >
            Ask about a piece
          </a>
        </div>
      </header>

      <div className="mt-16 hover-zoom shadow-editorial">
        <SmartImage
          src={assetUrl(wovenLightInterior.url)}
          alt="Sculptural Bolga art basket hand-coiled from dyed elephant grass"
          ratio="16/9"
          priority
        />
      </div>

      <section className="mt-20">
        <h2 className="font-serif text-3xl leading-tight md:text-4xl">
          What makes a Bolga basket an art basket
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {DIFFERENCE.map((item) => (
            <div key={item.title} className="border-t border-foreground/15 pt-6">
              <h3 className="font-serif text-xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="font-serif text-3xl leading-tight md:text-4xl">The three forms we weave</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {FORMS.map((form) => (
            <div key={form.title} className="bg-stone/60 p-7">
              <h3 className="font-serif text-xl">{form.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{form.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <h2 className="font-serif text-3xl leading-tight md:text-4xl">Art baskets in the studio now</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : shown.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="mt-20 bg-stone/60 p-8 md:p-12">
        <h2 className="font-serif text-3xl leading-tight md:text-4xl">
          Collecting and commissioning
        </h2>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Collectors and interior designers can commission tonal sets, custom diameters and repeat
          runs, with lead times confirmed before deposit. Read how buying direct compares to
          collecting through a marketplace on our{" "}
          <Link to="/collect" className="text-gold underline-offset-4 hover:underline">
            collectors page
          </Link>
          , see delivery terms for{" "}
          <Link to="/europe" className="text-gold underline-offset-4 hover:underline">
            France, Germany, Switzerland, Monaco, Spain and Greece
          </Link>
          , or start with the{" "}
          <Link to="/bolga-baskets" className="text-gold underline-offset-4 hover:underline">
            Bolga basket buying guide
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
