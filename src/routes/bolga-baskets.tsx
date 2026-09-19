import { createFileRoute, Link } from "@tanstack/react-router";

import wovenLightCloseup from "@/assets/woven-light-closeup.webp.asset.json";
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
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/whatsapp";

const TITLE = "Bolga Baskets — Handwoven in Bolgatanga, Ghana | Veta Vera Studio";
const DESCRIPTION =
  "What a Bolga basket is, how it is woven from elephant grass in Bolgatanga, Ghana, how to clean and reshape one, and where to buy fair-wage Bolga baskets direct from the weavers.";

export const Route = createFileRoute("/bolga-baskets")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      ...canonical("/bolga-baskets").meta,
    ],
    links: canonical("/bolga-baskets").links,
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Bolga baskets", path: "/bolga-baskets" },
        ]),
      ),
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Bolga baskets: the complete guide to Ghana's handwoven elephant grass baskets",
        description: DESCRIPTION,
        url: `${SITE_URL}/bolga-baskets`,
        author: { "@type": "Organization", name: SITE_NAME },
        publisher: organizationJsonLd,
        about: [
          { "@type": "Thing", name: "Bolga basket" },
          { "@type": "Thing", name: "Elephant grass weaving" },
          { "@type": "Place", name: "Bolgatanga, Upper East Region, Ghana" },
        ],
      }),
    ],
  }),
  component: BolgaBasketsPage,
});

const SECTIONS = [
  {
    id: "what-is-a-bolga-basket",
    heading: "What is a Bolga basket?",
    body: [
      "A Bolga basket is a hand-coiled basket woven from straw of elephant grass — locally called veta vera — in and around Bolgatanga, the capital of Ghana's Upper East Region. The grass is harvested in the dry season, split by hand, rolled into twine, dyed with plant and mineral colour, then woven wet so the fibres compress and lock as they dry. The finished basket is stiff, springy and strong enough to carry market loads, which is why the form has been in daily use for generations.",
      "Because every basket is coiled freehand rather than pressed in a mould, no two are identical. Slight variations in diameter, pattern rhythm and rim height are the signature of a genuine Bolga basket, not a defect.",
    ],
  },
  {
    id: "how-to-identify-authentic",
    heading: "How to identify an authentic Bolga basket",
    body: [
      "Look for a tightly packed weave with no gaps when held to the light, a rim finished by folding the grass back into the body rather than glueing or stapling it, and a handle wrapped in leather or in a second layer of grass. Colour should sit inside the fibre rather than on top of it — dyed straw keeps its tone when scratched lightly with a fingernail.",
      "Ask where the basket was woven and who wove it. Studios that work directly with cooperatives can name the weaver, the village and the season. Resellers and marketplace listings usually cannot.",
    ],
  },
  {
    id: "sizes-and-uses",
    heading: "Sizes, shapes and what each one is used for",
    body: [
      "Round market baskets (30–40 cm) work as shopping and laundry carriers. Wide bolga bowls and trays flatten the silhouette for fruit, bread and coffee-table styling. Tall storage baskets with lids hide blankets, toys and cables. Deep U-shapes become pet beds and planter sleeves. Fine flat discs and fans are hung as wall works, and coiled cones are wired into pendant and floor lampshades.",
      "If you are buying for a specific spot, measure the width first — a Bolga basket relaxes outward by a centimetre or two once the shipping compression is released.",
    ],
  },
  {
    id: "care-cleaning-reshaping",
    heading: "How to clean, reshape and store a Bolga basket",
    body: [
      "Dust weekly with a dry brush. For marks, wipe with a barely damp cloth and let the basket dry away from direct sun. Never soak it in a sink and never put it in a washing machine.",
      "To reshape a basket that arrived squashed, mist the outside lightly with water until the grass is supple, press it back into shape with your hands, then let it dry fully in an airy room — the fibre sets in the shape you leave it in. Repeat once if needed rather than forcing a dry basket.",
      "To stop a basket going mouldy, keep it out of bathrooms and unventilated cupboards, do not line it with a wet plant pot, and let it dry completely if it ever gets rained on. Grass is a natural fibre: airflow, not chemicals, keeps it sound for decades.",
    ],
  },
  {
    id: "fair-trade",
    heading: "Are Bolga baskets fair trade?",
    body: [
      "It depends entirely on who you buy from. The weaving is piecework, so the price paid at the point of collection decides whether the craft supports a household or merely subsidises a middleman. Veta Vera Studio buys at multiples of the regional market rate on collection day, contributes to a medical and welfare fund for weavers and their children, and reinvests in community projects — school fees, boreholes and dye gardens.",
      "The full breakdown of where each order goes is published on our transparency page, reviewed each season with cooperative leadership.",
    ],
  },
  {
    id: "where-to-buy",
    heading: "Where to buy Bolga baskets",
    body: [
      "You can buy Bolga baskets on large marketplaces, from home-goods importers, or direct from a studio working with the weavers. Marketplaces are convenient but list stock they have never handled, so photographs rarely match the piece that ships and provenance is impossible to verify. Importers hold better stock but add a retail margin on top of the wholesale price.",
      "Buying direct from Veta Vera Studio means the basket in the photograph is the basket you receive, the weaver is named, and the margin that would have gone to a marketplace goes to Bolgatanga instead. Orders ship on tracked air freight, reach Europe in 7–10 business days, and travel free above the studio's free-shipping threshold.",
    ],
  },
];

function BolgaBasketsPage() {
  const { data: products, isLoading } = useProducts();
  const featured = products.slice(0, 4);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-8 md:py-24">
      <header className="mx-auto max-w-3xl text-center">
        <p className="label-caps text-gold">Buying guide</p>
        <h1 className="mt-5 font-serif text-4xl leading-tight md:text-6xl">
          Bolga baskets, handwoven in Bolgatanga, Ghana
        </h1>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          Everything worth knowing before you buy: how a Bolga basket is made from elephant grass,
          how to tell an authentic weave from a copy, which size suits which room, how to clean and
          reshape one, and how fair-wage buying actually works in the Upper East Region.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            to="/shop"
            className="inline-flex h-12 items-center border border-foreground px-8 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background"
          >
            Shop Bolga baskets
          </Link>
          <Link
            to="/bolga-art-baskets"
            className="inline-flex h-12 items-center border border-gold px-8 text-xs uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-gold-foreground"
          >
            See Bolga art baskets
          </Link>
        </div>
      </header>

      <div className="mt-16 hover-zoom shadow-editorial">
        <SmartImage
          src={assetUrl(wovenLightCloseup.url)}
          alt="Handwoven Bolga basket coiled from dyed elephant grass in Bolgatanga, Ghana"
          ratio="16/9"
          priority
        />
      </div>

      <div className="mt-20 grid gap-14 lg:grid-cols-[0.28fr_1fr]">
        <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="label-caps text-muted-foreground">On this page</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-muted-foreground transition-colors hover:text-gold"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-14">
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="font-serif text-3xl leading-tight md:text-4xl">{section.heading}</h2>
              <div className="mt-5 space-y-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="text-base leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
              {section.id === "fair-trade" && (
                <Link
                  to="/about"
                  hash="transparency"
                  className="mt-5 inline-flex text-sm text-gold underline-offset-4 hover:underline"
                >
                  Read the fair-wage transparency breakdown →
                </Link>
              )}
              {section.id === "care-cleaning-reshaping" && (
                <Link
                  to="/care"
                  hash="care"
                  className="mt-5 inline-flex text-sm text-gold underline-offset-4 hover:underline"
                >
                  Full basket care guide →
                </Link>
              )}
            </section>
          ))}
        </div>
      </div>

      <section className="mt-24">
        <h2 className="font-serif text-3xl leading-tight md:text-4xl">
          Bolga baskets available from the studio
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
        <Link
          to="/shop"
          className="mt-10 inline-flex h-12 items-center border border-foreground px-8 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background"
        >
          View the full collection
        </Link>
      </section>

      <section className="mt-20 bg-stone/60 p-8 md:p-12">
        <h2 className="font-serif text-3xl leading-tight md:text-4xl">
          Not sure which basket you need?
        </h2>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Send us the measurements of your space on WhatsApp at {WHATSAPP_DISPLAY} and we will
          photograph the baskets currently in the studio that fit, with honest notes on colour and
          weave.{" "}
          <a
            href={whatsappLink("Hello Veta Vera Studio, I am looking for a Bolga basket and need help choosing.")}
            target="_blank"
            rel="noreferrer noopener"
            className="text-gold underline-offset-4 hover:underline"
          >
            Message the studio
          </a>
          .
        </p>
      </section>
    </div>
  );
}
