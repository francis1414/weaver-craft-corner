import { createFileRoute, Link } from "@tanstack/react-router";

import { SmartImage } from "@/components/SmartImage";
import { WholesaleForm } from "@/components/WholesaleForm";

import { useSettings } from "@/hooks/use-store-data";
import { IMAGES } from "@/lib/mock-data";
import { breadcrumbJsonLd, canonical, jsonLdScript, SITE_NAME } from "@/lib/seo";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/wholesale")({
  head: () => ({
    meta: [
      { title: "Wholesale Bolga Baskets — Trade & Bulk Orders Direct from Ghana | Veta Vera Studio" },
      {
        name: "description",
        content:
          "Buy handwoven Bolga baskets wholesale direct from Bolgatanga weaving cooperatives: custom sizes, brand colourways, repeat production runs and trade pricing for retailers, designers and hospitality.",
      },
      {
        property: "og:title",
        content: "Wholesale Bolga Baskets — Trade & Bulk Orders Direct from Ghana",
      },
      {
        property: "og:description",
        content:
          "Trade pricing, custom colourways and repeat runs of handwoven elephant grass baskets, sourced direct from Ghanaian cooperatives.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...canonical("/wholesale").meta,
    ],
    links: canonical("/wholesale").links,
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Wholesale", path: "/wholesale" },
        ]),
      ),
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Wholesale handwoven Bolga baskets",
        serviceType: "Wholesale supply of handwoven elephant grass baskets",
        provider: { "@type": "Organization", name: SITE_NAME },
        areaServed: "Worldwide",
        description:
          "Bulk and custom production of handwoven Bolga baskets, lampshades, planters, fans and totes, made by cooperatives in Bolgatanga, Upper East Ghana.",
      }),
    ],
  }),
  component: WholesalePage,
});

const REASONS = [
  {
    title: "Direct from the cooperative",
    body: "No middle agents. Orders are placed with cooperative leaders in Bolgatanga, Sumbrungu and Zuarungu, so pricing reflects the weaver's rate rather than a reseller's margin.",
  },
  {
    title: "Made to your specification",
    body: "Custom diameters and heights, brand colourways from plant and mineral dyes, leather or grass handles, and unbranded packaging for your own labelling.",
  },
  {
    title: "Repeatable production runs",
    body: "Cooperatives rotate orders across households so a colourway and size can be rewoven season after season without over-committing any one weaver.",
  },
  {
    title: "Freight that arrives intact",
    body: "Pieces travel folded to lower volume and emissions, then reshape in minutes with a warm water mist — see the reshaping guide we supply with every trade shipment.",
  },
];

const STEPS = [
  { step: "01", title: "Send your brief", body: "Reference images, shapes, sizes, quantities and your delivery window." },
  { step: "02", title: "Quote & sample", body: "We confirm trade pricing with the cooperative and can weave a sample for approval." },
  { step: "03", title: "Production", body: "Typical lead time is three to six weeks depending on volume and colourway." },
  { step: "04", title: "Freight & delivery", body: "Tracked air courier worldwide, with consolidated shipping for larger runs." },
];

function WholesalePage() {
  const settings = useSettings();

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-8">
      <header className="max-w-3xl">
        <p className="label-caps text-gold">Trade & wholesale</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">
          Wholesale Bolga baskets, woven to order in Ghana
        </h1>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          Veta Vera Studio supplies retailers, interior designers, hospitality projects and gallery shops
          with handwoven elephant grass baskets, lampshades, planters, fans and totes — produced
          directly with Bolgatanga weaving cooperatives at fair-wage rates.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={whatsappLink(
              "Hello Veta Vera Studio, I would like trade pricing for a wholesale order.",
            )}
            target="_blank"
            rel="noreferrer noopener"
            className="border border-gold bg-gold px-7 py-3.5 text-xs uppercase tracking-[0.16em] text-gold-foreground hover:bg-gold-deep"
          >
            Request trade pricing on WhatsApp
          </a>
          <Link
            to="/shop"
            className="border border-border px-7 py-3.5 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:border-gold hover:text-foreground"
          >
            View the catalogue
          </Link>
        </div>
      </header>

      <SmartImage
        src={IMAGES.artisan}
        alt="Weavers in Bolgatanga, Ghana, preparing elephant grass for a wholesale basket order"
        ratio="16/9"
        priority
        className="mt-12"
      />

      <section className="mt-20">
        <h2 className="font-serif text-3xl">Why buy direct instead of through a marketplace</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {REASONS.map((r) => (
            <article key={r.title} className="border border-border p-7">
              <h3 className="font-serif text-xl">{r.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="font-serif text-3xl">How a wholesale order works</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.step} className="border-t border-gold pt-5">
              <p className="font-serif text-2xl text-gold">{s.step}</p>
              <h3 className="mt-2 font-serif text-lg">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="enquiry" className="mt-20 scroll-mt-28 bg-stone/60 p-8 md:p-12">
        <h2 className="font-serif text-3xl">Start a trade enquiry</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Tell us the pieces, quantities and dates you are working to and we will come back with
          pricing, lead time and freight options.
        </p>
        <div className="mt-10">
          <WholesaleForm />
        </div>
      </section>

      <section className="mt-16 bg-stone/60 p-8 md:p-12">
        <h2 className="font-serif text-3xl">Prefer to talk first?</h2>

        <ul className="mt-6 space-y-2 text-sm">
          <li>
            WhatsApp:{" "}
            <a
              href={whatsappLink(
                "Hello Veta Vera Studio, I would like trade pricing for a wholesale order.",
              )}
              target="_blank"
              rel="noreferrer noopener"
              className="text-gold hover:underline"
            >
              {WHATSAPP_DISPLAY}
            </a>
          </li>
          <li>
            Email:{" "}
            <a href={`mailto:${settings.supportEmail}`} className="text-gold hover:underline">
              {settings.supportEmail}
            </a>
          </li>
          <li>
            Phone:{" "}
            <a href={`tel:${settings.supportPhone}`} className="text-gold hover:underline">
              {settings.supportPhone}
            </a>
          </li>
          <li className="text-muted-foreground">
            Prefer retail quantities? Everything in the{" "}
            <Link to="/shop" className="text-gold hover:underline">
              shop
            </Link>{" "}
            ships worldwide, and{" "}
            <Link to="/care" hash="custom-orders" className="text-gold hover:underline">
              custom single pieces
            </Link>{" "}
            are welcome too.
          </li>
        </ul>
      </section>
    </div>
  );
}
