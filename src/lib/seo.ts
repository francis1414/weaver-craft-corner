export const SITE_URL = "https://www.vetaverra.com";
export const SITE_NAME = "Veta Vera Studio";

export const absoluteUrl = (path: string): string =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Canonical link + og:url for a route path. */
export function canonical(path: string) {
  const url = absoluteUrl(path);
  return {
    links: [{ rel: "canonical", href: url }],
    meta: [{ property: "og:url", content: url }],
  };
}

export const noindexMeta = [{ name: "robots", content: "noindex, nofollow" }] as const;

export function jsonLdScript(data: unknown) {
  return { type: "application/ld+json", children: JSON.stringify(data) };
}

export type EuropeMarket = {
  name: string;
  code: string;
  heading: string;
  currency: string;
  transit: string;
  body: string;
};

/** Priority European markets used for metadata, structured data and the /europe page. */
export const EUROPE_MARKETS: EuropeMarket[] = [
  {
    name: "France",
    code: "FR",
    heading: "France — Paris, Lyon, Bordeaux and the Riviera",
    currency: "Priced in EUR",
    transit: "7–10 business days",
    body: "Tracked door-to-door delivery anywhere in metropolitan France, including apartment buildings with concierge handover. Popular with Parisian decorators specifying woven light and floor sculpture for haussmannien interiors.",
  },
  {
    name: "Germany",
    code: "DE",
    heading: "Germany — Berlin, Munich, Hamburg and Cologne",
    currency: "Priced in EUR",
    transit: "7–10 business days",
    body: "Air freight into Frankfurt with onward courier delivery, invoices formatted for German business accounting, and packing notes suited to studios buying multiples for retail display.",
  },
  {
    name: "Switzerland",
    code: "CH",
    heading: "Switzerland — Zurich, Geneva, Basel and Lausanne",
    currency: "Priced in CHF or EUR",
    transit: "8–11 business days",
    body: "Non-EU customs handled with a full commercial invoice and certificate of origin, so Swiss collectors receive a clean release without paperwork on their side.",
  },
  {
    name: "Monaco",
    code: "MC",
    heading: "Monaco and the Côte d'Azur",
    currency: "Priced in EUR",
    transit: "7–10 business days",
    body: "Discreet delivery to residences, yacht agents and design offices in Monaco, Cap-Ferrat and Saint-Tropez, with condition photographs sent before dispatch.",
  },
  {
    name: "Spain",
    code: "ES",
    heading: "Spain — Madrid, Barcelona, Valencia, Ibiza and Mallorca",
    currency: "Priced in EUR",
    transit: "7–11 business days",
    body: "Mainland and island delivery, including Balearic addresses. Natural elephant grass and plant-dyed tones sit easily beside Mediterranean lime plaster and terracotta.",
  },
  {
    name: "Greece",
    code: "GR",
    heading: "Greece — Athens, Thessaloniki and the islands",
    currency: "Priced in EUR",
    transit: "8–12 business days",
    body: "Delivery to Athens and to island addresses via the mainland hub, favoured by hotel and villa projects fitting out Cycladic and Ionian properties.",
  },
];

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description:
    "Fair-wage handwoven Bolgatanga baskets, sculptural fibre art and elephant grass craft from Upper East Ghana, shipped to collectors and interior designers across Europe.",
  sameAs: ["https://www.instagram.com/vetaverastudio"],
  areaServed: [
    { "@type": "Place", name: "Worldwide" },
    ...EUROPE_MARKETS.map((market) => ({ "@type": "Country", name: market.name })),
  ],
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/shop?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
