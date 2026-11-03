import { createFileRoute, Link } from "@tanstack/react-router";

import { SmartImage } from "@/components/SmartImage";
import { IMAGES } from "@/lib/mock-data";
import { breadcrumbJsonLd, canonical, jsonLdScript, SITE_NAME, SITE_URL } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

const TITLE = "Panier tressé, suspension et décoration de luxe faits main | Veta Vera Studio";
const DESCRIPTION =
  "Paniers tressés, suspensions et luminaires tissés, éventails muraux : décoration africaine de luxe faite main au Ghana, livrée à Monaco, en France, en Suisse et au Luxembourg.";

const COUNTRIES = [
  {
    name: "Monaco",
    body: "Livraison discrète aux résidences, agents de yachts et bureaux d'architecture d'intérieur de Monaco, Cap-Ferrat et Saint-Tropez, avec photos de contrôle avant expédition.",
  },
  {
    name: "France",
    body: "Livraison suivie partout en France métropolitaine, de Paris à Lyon, Bordeaux et la Côte d'Azur — appréciée des décorateurs pour les intérieurs haussmanniens.",
  },
  {
    name: "Suisse",
    body: "Genève, Lausanne, Zurich, Bâle : dédouanement géré avec facture commerciale et certificat d'origine, prix en CHF ou en EUR.",
  },
  {
    name: "Luxembourg",
    body: "Livraison suivie à Luxembourg-Ville, Kirchberg et dans tout le Grand-Duché, factures en français ou en anglais pour particuliers et architectes.",
  },
];

const PIECES = [
  {
    title: "Panier tressé et panier décoratif",
    body: "Une alternative noble au panier en osier : chaque panier Bolga est tressé à la main en herbe à éléphant, teint de couleurs végétales et fini avec une anse en cuir. Rangement, plaid, plante ou simple objet de décoration.",
    filter: "sculpture",
  },
  {
    title: "Suspension et luminaire tissés",
    body: "Nos abat-jour tissés remplacent la suspension en osier ou le luminaire en rotin par une fibre plus dense, qui diffuse une lumière chaude et graphique au-dessus d'une table ou d'un escalier.",
    filter: "lampshade",
  },
  {
    title: "Éventail mural et décoration murale",
    body: "Les éventails muraux de Bolgatanga composent une décoration murale bohème et sculpturale, seuls ou en installation de plusieurs pièces.",
    filter: "wall-fans",
  },
];

export const Route = createFileRoute("/decoration-luxe")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_FR" },
      { name: "twitter:card", content: "summary_large_image" },
      ...canonical("/decoration-luxe").meta,
    ],
    links: [
      ...canonical("/decoration-luxe").links,
      { rel: "alternate", hrefLang: "fr", href: `${SITE_URL}/decoration-luxe` },
      { rel: "alternate", hrefLang: "en", href: `${SITE_URL}/europe` },
    ],
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Décoration de luxe", path: "/decoration-luxe" },
        ]),
      ),
      jsonLdScript({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        inLanguage: "fr",
        name: TITLE,
        description: DESCRIPTION,
        url: `${SITE_URL}/decoration-luxe`,
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        about: ["Panier tressé", "Suspension tissée", "Éventail mural", "Décoration africaine"],
        spatialCoverage: COUNTRIES.map((c) => ({ "@type": "Country", name: c.name })),
      }),
    ],
  }),
  component: DecorationLuxePage,
});

function DecorationLuxePage() {
  return (
    <div lang="fr" className="mx-auto max-w-[1280px] px-4 py-16 md:px-8 md:py-24">
      <header className="mx-auto max-w-3xl text-center">
        <p className="label-caps text-gold">Monaco · France · Suisse · Luxembourg</p>
        <h1 className="mt-5 font-serif text-4xl leading-tight md:text-6xl">
          Décoration intérieure de luxe, tressée à la main au Ghana
        </h1>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          Paniers tressés, suspensions tissées et éventails muraux signés par les tisserandes de
          Bolgatanga. Des pièces uniques de décoration africaine, pensées pour les intérieurs
          d'exception et livrées en 7 à 10 jours ouvrés.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            to="/shop"
            className="inline-flex h-12 items-center border border-foreground px-8 text-xs uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background"
          >
            Voir la collection
          </Link>
          <a
            href={whatsappLink("Bonjour Veta Vera Studio, j'aimerais un conseil pour une commande en Europe.")}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-12 items-center border border-gold px-8 text-xs uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold hover:text-gold-foreground"
          >
            Nous écrire
          </a>
        </div>
      </header>

      <div className="mt-16 shadow-editorial">
        <SmartImage src={IMAGES.basketInterior} alt="Panier tressé Bolga dans un intérieur de luxe" ratio="16/9" priority />
      </div>

      <section className="mt-20">
        <h2 className="font-serif text-3xl leading-tight md:text-4xl">Nos pièces de décoration</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {PIECES.map((p) => (
            <article key={p.title} className="border-t border-foreground/15 pt-6">
              <h3 className="font-serif text-xl">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              <Link
                to="/shop"
                search={{ category: p.filter } as never}
                className="mt-4 inline-block text-xs uppercase tracking-[0.2em] text-gold hover:underline"
              >
                Découvrir
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="font-serif text-3xl leading-tight md:text-4xl">Livraison en Europe francophone</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {COUNTRIES.map((c) => (
            <article key={c.name} className="border-t border-foreground/15 pt-6">
              <h3 className="font-serif text-xl">{c.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20 bg-stone/60 p-8 md:p-12">
        <h2 className="font-serif text-3xl leading-tight md:text-4xl">Un luxe équitable</h2>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Chaque achat rémunère d'abord la tisserande : salaires équitables, soins médicaux et
          projets communautaires à Bolgatanga, Sumbrungu et Winkongo.{" "}
          <Link to="/about" hash="transparency" className="text-gold underline-offset-4 hover:underline">
            Voir où va votre argent
          </Link>
          .
        </p>
        <h2 lang="de" className="mt-10 font-serif text-2xl">Für die Deutschschweiz</h2>
        <p lang="de" className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Handgeflochtene Körbe, Rattan-Alternativen als Hängelampe und afrikanische Wanddeko aus
          Ghana — geliefert nach Zürich, Basel und Bern, Preise in CHF.
        </p>
      </section>
    </div>
  );
}
