import { createFileRoute, Link } from "@tanstack/react-router";

import { SmartImage } from "@/components/SmartImage";
import { IMAGES } from "@/lib/mock-data";
import { EUROPE_MARKETS, breadcrumbJsonLd, canonical, jsonLdScript, SITE_NAME, SITE_URL } from "@/lib/seo";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/whatsapp";

const TITLE = "Bolga Baskets Delivered to Europe — France, Germany, Switzerland, Spain, Greece, Monaco | Veta Vera Studio";
const DESCRIPTION =
  "Handwoven Bolga baskets and fibre art shipped from Ghana to Europe: tracked delivery to France, Germany, Switzerland, Monaco, Spain and Greece in 7–10 business days, with euro and Swiss franc pricing at checkout.";

export const Route = createFileRoute("/europe")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...canonical("/europe").meta,
    ],
    links: canonical("/europe").links,
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Europe delivery", path: "/europe" },
        ]),
      ),
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Delivery of handwoven Ghanaian baskets to Europe",
        serviceType: "International art and homeware delivery",
        provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        areaServed: EUROPE_MARKETS.map((market) => ({
          "@type": "Country",
          name: market.name,
        })),
        description: DESCRIPTION,
      }),
    ],
  }),
  component: EuropePage,
});

function EuropePage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-8 md:py-24">
      <header className="mx-auto max-w-3xl text-center">
        <p className="label-caps text-gold">Shipping from Bolgatanga to Europe</p>
        <h1 className="mt-5 font-serif text-4xl leading-tight md:text-6xl">
          Handwoven Ghanaian baskets, delivered across Europe
        </h1>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          Every piece leaves the studio in Upper East Ghana on tracked air freight and clears into
          Europe in roughly 7–10 business days. Prices convert to euro, pound sterling and Swiss
          franc at checkout, and larger orders ship at our cost.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            to="/shop"
            className="inline-flex h-12 items-center border border-foreground px-8 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background"
          >
            Shop the collection
          </Link>
          <a
            href={whatsappLink("Hello Veta Vera Studio, I am ordering from Europe and have a delivery question.")}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-12 items-center border border-gold px-8 text-xs uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-gold-foreground"
          >
            Ask about delivery
          </a>
        </div>
      </header>

      <div className="mt-16 hover-zoom shadow-editorial">
        <SmartImage
          src={IMAGES.basketInterior}
          alt="Handwoven Bolga basket styled in a European interior"
          ratio="16/9"
          priority
        />
      </div>

      <section className="mt-20">
        <h2 className="font-serif text-3xl leading-tight md:text-4xl">Where we deliver</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {EUROPE_MARKETS.map((market) => (
            <article key={market.name} className="border-t border-foreground/15 pt-6">
              <h3 className="font-serif text-xl">{market.heading}</h3>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gold">
                {market.currency} · {market.transit}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{market.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20 bg-stone/60 p-8 md:p-12">
        <h2 className="font-serif text-3xl leading-tight md:text-4xl">Duties, taxes and returns</h2>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Handwoven basketry from Ghana enters the European Union under preferential terms, and our
          courier presents the certificate of origin on your behalf. Any import VAT or duty assessed
          locally is settled by the recipient on delivery — the courier contacts you before release.
          Pieces can be returned within the window set out in our{" "}
          <Link to="/care" hash="returns" className="text-gold underline-offset-4 hover:underline">
            returns policy
          </Link>
          . For a customs pre-check on a large or multi-piece consignment, message the studio at{" "}
          {WHATSAPP_DISPLAY}.
        </p>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Collectors and interior designers sourcing multiples should start on the{" "}
          <Link to="/collect" className="text-gold underline-offset-4 hover:underline">
            collectors page
          </Link>{" "}
          or request trade pricing through{" "}
          <Link to="/wholesale" className="text-gold underline-offset-4 hover:underline">
            wholesale
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
