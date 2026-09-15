import { createFileRoute, Link } from "@tanstack/react-router";

import { SmartImage } from "@/components/SmartImage";
import { IMAGES } from "@/lib/mock-data";
import { breadcrumbJsonLd, canonical, jsonLdScript, organizationJsonLd, SITE_NAME, SITE_URL } from "@/lib/seo";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/whatsapp";

const TITLE = "Collectible Woven Fibre Art — Buy Direct from the Artists | Veta Vera Studio";
const DESCRIPTION =
  "Collect original handwoven fibre art and sculptural Bolga baskets direct from the Ghanaian artists — an alternative to Saatchi Art and Chairish for collectors and interior designers in France, Germany, Switzerland, Monaco, Spain and Greece.";

export const Route = createFileRoute("/collect")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...canonical("/collect").meta,
    ],
    links: canonical("/collect").links,
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Collect", path: "/collect" },
        ]),
      ),
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Collectible woven fibre art",
        url: `${SITE_URL}/collect`,
        description: DESCRIPTION,
        about: {
          "@type": "VisualArtwork",
          artform: "Fibre art",
          artMedium: "Elephant grass (veta vera), plant dyes, goat leather",
          artworkSurface: "Hand-coiled woven vessel",
          creator: { "@type": "Organization", name: SITE_NAME },
        },
        publisher: organizationJsonLd,
      }),
    ],
  }),
  component: CollectPage,
});

const REASONS = [
  {
    title: "One-of-one, signed by the weaver",
    body: "Every sculptural piece is coiled freehand, so no two are identical. Each arrives with the maker's name, village and weaving dates — the provenance a collector expects from a gallery listing, without the gallery commission.",
  },
  {
    title: "Artist-direct pricing",
    body: "Marketplaces like Saatchi Art and Chairish add 30–40% on top of the artist's price. Buying here sends the full margin to the Bolgatanga cooperative and keeps the collector's price honest.",
  },
  {
    title: "Museum-standard packing to Europe",
    body: "Pieces travel double-boxed with rigid internal formwork on tracked DHL or FedEx air freight, cleared for delivery across the EU, Switzerland and Monaco in 7–10 business days.",
  },
  {
    title: "Designer and trade support",
    body: "Interior designers specifying multiples for a residence, hotel or yacht can request tonal sets, custom diameters and repeat runs, with lead times confirmed before deposit.",
  },
];

const COLLECTION_TYPES = [
  {
    title: "Sculptural vessels",
    body: "Tall coiled forms and asymmetric silhouettes made to be read as standalone sculpture on a plinth or floor.",
  },
  {
    title: "Woven light",
    body: "Pendant and floor lampshades that cast patterned shadow — a fibre-art commission that also lights the room.",
  },
  {
    title: "Wall works",
    body: "Flat woven discs and fans hung in constellations, an alternative to canvas for large plaster or stone walls.",
  },
];

function CollectPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-8 md:py-24">
      <header className="mx-auto max-w-3xl text-center">
        <p className="label-caps text-gold">For collectors & interior designers</p>
        <h1 className="mt-5 font-serif text-4xl leading-tight md:text-6xl">
          Collectible woven fibre art, bought direct from the artists
        </h1>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          If you collect through Saatchi Art or furnish through Chairish, this is the same category
          of work — original, signed, one-of-one African fibre art — sourced straight from the
          weaving cooperatives of Bolgatanga, Upper East Ghana, and shipped to Europe on tracked air
          freight.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            to="/shop"
            className="inline-flex h-12 items-center border border-foreground px-8 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background"
          >
            View available works
          </Link>
          <a
            href={whatsappLink("Hello Veta Vera Studio, I am a collector and would like to discuss a piece.")}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-12 items-center border border-gold px-8 text-xs uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-gold-foreground"
          >
            Speak to the studio
          </a>
        </div>
      </header>

      <div className="mt-16 hover-zoom shadow-editorial">
        <SmartImage
          src={IMAGES.sculpture}
          alt="Sculptural handwoven elephant grass basket presented as collectible fibre art"
          ratio="16/9"
          priority
        />
      </div>

      <section className="mt-20">
        <h2 className="font-serif text-3xl leading-tight md:text-4xl">
          Why collectors buy from the studio instead of a marketplace
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {REASONS.map((reason) => (
            <div key={reason.title} className="border-t border-foreground/15 pt-6">
              <h3 className="font-serif text-xl">{reason.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{reason.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="font-serif text-3xl leading-tight md:text-4xl">What is in the collection</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {COLLECTION_TYPES.map((type) => (
            <div key={type.title} className="bg-stone/60 p-7">
              <h3 className="font-serif text-xl">{type.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{type.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 bg-stone/60 p-8 md:p-12">
        <h2 className="font-serif text-3xl leading-tight md:text-4xl">
          Acquiring a piece from Europe
        </h2>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Prices are shown in your currency, including euro, pound sterling and Swiss franc
          conversions at checkout. Orders above the studio's free-shipping threshold travel at our
          cost, and every consignment is insured door to door. Collectors in France, Germany,
          Switzerland, Monaco, Spain and Greece can read the full delivery terms on our{" "}
          <Link to="/europe" className="text-gold underline-offset-4 hover:underline">
            Europe delivery page
          </Link>
          , or message the studio on WhatsApp at {WHATSAPP_DISPLAY} for condition photographs and
          dimensions before committing.
        </p>
      </section>
    </div>
  );
}
