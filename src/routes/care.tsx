import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

import { SmartImage } from "@/components/SmartImage";
import { useSettings } from "@/hooks/use-store-data";
import { IMAGES } from "@/lib/mock-data";
import { breadcrumbJsonLd, canonical, jsonLdScript } from "@/lib/seo";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/care")({
  head: () => ({
    meta: [
      { title: "Help & Support — Bolga Basket Care, Shipping, Returns | Vetastudio" },
      {
        name: "description",
        content:
          "Vetastudio help centre: reshape a folded Bolga basket in minutes, plus worldwide express shipping rates, returns policy, custom and wholesale orders, and contact details.",
      },
      {
        property: "og:title",
        content: "Help & Support — Basket Care, Shipping & Returns | Vetastudio",
      },
      {
        property: "og:description",
        content:
          "Care and reshaping guide, shipping and returns, custom orders and direct contact for handwoven Ghanaian baskets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...canonical("/care").meta,
    ],
    links: canonical("/care").links,
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Help & Support", path: "/care" },
        ]),
      ),
    ],
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

const FAQS = [
  {
    q: "Are Vetastudio baskets genuinely handmade in Ghana?",
    a: "Yes. Every piece is woven by hand in Bolgatanga, Sumbrungu and Zuarungu in Upper East Ghana from veta vera elephant grass. Nothing is machine-made and nothing is imported for resale.",
  },
  {
    q: "Why does my basket arrive folded or flattened?",
    a: "Folding lowers freight volume and emissions. Elephant grass has memory: a warm water mist and two minutes of hand-shaping returns the basket to its woven form.",
  },
  {
    q: "Do you take custom sizes, colours and bulk orders?",
    a: "We do. Custom weaves, brand colourways, and wholesale volumes for retailers and interior projects are produced directly with cooperative leaders. Lead time is typically three to six weeks depending on volume.",
  },
  {
    q: "How are the dyes made, and will colours fade?",
    a: "Colours come from plant and mineral pigments cooked in small batches. Kept out of direct sun, tones stay rich for years; strong sunlight will soften them gradually.",
  },
  {
    q: "Can baskets be used outdoors or for plants?",
    a: "Planters can hold a plastic liner and cachepot indoors or on a covered porch. Prolonged rain and damp will weaken elephant grass, so avoid fully exposed outdoor use.",
  },
];

const ANCHORS = [
  { href: "#care", label: "Care & reshaping" },
  { href: "#shipping", label: "Shipping" },
  { href: "#returns", label: "Returns" },
  { href: "#custom-orders", label: "Custom & wholesale" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact us" },
];

function CarePage() {
  const settings = useSettings();
  const additional = settings.shippingAdditionalItem;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-16 md:px-8">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Help & Support Center</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
          Care, shipping and support for your handwoven basket
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Everything you need after ordering: reshaping a folded Bolga basket, delivery times and
          rates, returns, custom and wholesale enquiries, and how to reach the studio.
        </p>
      </header>

      <nav aria-label="Support topics" className="mt-8 flex flex-wrap gap-2">
        {ANCHORS.map((a) => (
          <a
            key={a.href}
            href={a.href}
            className="border border-border px-4 py-2 text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-gold hover:text-foreground"
          >
            {a.label}
          </a>
        ))}
      </nav>

      <SmartImage
        src={IMAGES.hero}
        alt="Handwoven Bolga basket with fringed elephant grass rim"
        ratio="16/9"
        priority
        className="mt-10"
      />

      <section id="care" className="scroll-mt-24">
        <h2 className="mt-14 font-serif text-3xl">Reshaping your Bolga basket</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Elephant grass has memory. A folded basket returns to its woven form in minutes with
          nothing more than warm water and your hands.
        </p>
        <ol className="mt-8 divide-y divide-border border-y border-border">
          {STEPS.map((step) => (
            <li key={step.title} className="grid gap-3 py-8 md:grid-cols-[240px_minmax(0,1fr)]">
              <h3 className="font-serif text-xl">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 bg-stone/60 p-8">
          <h3 className="font-serif text-2xl">Never do this</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Do not submerge the basket or put it in a washing machine.</li>
            <li>Do not dry with a hairdryer or in direct sun — dyes will fade unevenly.</li>
            <li>Do not store crushed under heavy objects for long periods.</li>
          </ul>
        </div>
      </section>

      <section id="shipping" className="mt-20 scroll-mt-24">
        <h2 className="font-serif text-3xl">Shipping</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="border border-border p-6">
            <h3 className="font-serif text-xl">{settings.shippingLabel}</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Base rate ${settings.shippingInternational.toFixed(2)} for the first item
              {additional > 0 ? ` (+$${additional.toFixed(2)} for each additional item)` : ""}.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{settings.shippingCarrier}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {settings.shippingTransitTime} delivery
            </p>
          </div>
          <div className="border border-border p-6">
            <h3 className="font-serif text-xl">Free shipping</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Orders over ${settings.freeShippingThreshold} ship free worldwide. Domestic delivery is
              ${settings.shippingDomestic.toFixed(2)} where applicable, and tax is calculated at
              checkout ({(settings.taxRate * 100).toFixed(1)}%).
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Every parcel is tracked; you receive the tracking number by email as soon as the order
              is dispatched.
            </p>
          </div>
        </div>
      </section>

      <section id="returns" className="mt-20 scroll-mt-24">
        <h2 className="font-serif text-3xl">Returns & exchanges</h2>
        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <li>
            Unused pieces can be returned within 30 days of delivery for a refund or exchange.
          </li>
          <li>
            Because each basket is handwoven, small variations in size, weave tension and dye tone
            are characteristics rather than faults.
          </li>
          <li>
            Damaged in transit? Send photographs within 7 days and we replace or refund the piece,
            shipping included.
          </li>
          <li>Custom and wholesale commissions are made to order and are non-returnable.</li>
        </ul>
      </section>

      <section id="custom-orders" className="mt-20 scroll-mt-24">
        <h2 className="font-serif text-3xl">Custom & wholesale orders</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          We weave to specification for interior designers, hospitality projects and retailers:
          custom dimensions, brand colourways, logo-free packaging and repeat production runs. Share
          your reference images, quantities and deadline and we quote directly with the cooperative.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={whatsappLink(
              "Hello Vetastudio, I would like a quote for a custom or wholesale basket order.",
            )}
            target="_blank"
            rel="noreferrer noopener"
            className="border border-gold px-6 py-3 text-xs uppercase tracking-[0.16em] text-foreground hover:bg-gold hover:text-gold-foreground"
          >
            Request a quote on WhatsApp
          </a>
          <a
            href={`mailto:${settings.supportEmail}?subject=Custom%20or%20wholesale%20order`}
            className="border border-border px-6 py-3 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:border-gold hover:text-foreground"
          >
            Email instead
          </a>
          <Link
            to="/shop"
            className="border border-border px-6 py-3 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:border-gold hover:text-foreground"
          >
            Browse the catalogue
          </Link>
        </div>
      </section>

      <section id="faq" className="mt-20 scroll-mt-24">
        <h2 className="font-serif text-3xl">Frequently asked questions</h2>
        <dl className="mt-6 divide-y divide-border border-y border-border">
          {FAQS.map((item) => (
            <div key={item.q} className="grid gap-3 py-7 md:grid-cols-[320px_minmax(0,1fr)]">
              <dt className="font-serif text-lg">{item.q}</dt>
              <dd className="text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="contact" className="mt-20 scroll-mt-24 bg-stone/60 p-8">
        <h2 className="font-serif text-3xl">Contact us</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          WhatsApp is the fastest way to reach the studio — messages are usually answered the same
          day.
        </p>
        <ul className="mt-5 space-y-2 text-sm">
          <li>
            WhatsApp:{" "}
            <a
              href={whatsappLink("Hello Vetastudio, I have a question.")}
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
          <li className="text-muted-foreground">Studios in St Louis, USA and Bolgatanga, Ghana.</li>
        </ul>
      </section>
    </div>
  );
}
