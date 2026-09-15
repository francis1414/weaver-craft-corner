import { Link, createFileRoute } from "@tanstack/react-router";

import { SmartImage } from "@/components/SmartImage";
import { useJournal } from "@/hooks/use-store-data";
import { canonical } from "@/lib/seo";

export const Route = createFileRoute("/journal/")({
  head: () => ({
    meta: [
      { title: "The Journal — Sustainable Decor & Ghanaian Craft | Veta Vera Studio" },
      {
        name: "description",
        content:
          "Essays on West African weaving traditions, natural dyeing, and living well with handmade objects.",
      },
      { property: "og:title", content: "The Journal — Veta Vera Studio" },
      {
        property: "og:description",
        content: "Essays on West African weaving, natural dyeing and sustainable decor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...canonical("/journal").meta,
    ],
    links: canonical("/journal").links,
  }),
  component: JournalPage,
});

function JournalPage() {
  const { data: entries } = useJournal();
  const [featured, ...archive] = entries;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-8 md:py-24">
      <header className="grid items-end gap-8 border-b border-border pb-10 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="max-w-3xl">
          <p className="label-caps text-gold">Stories, provenance & interior styling</p>
          <h1 className="mt-5 font-serif text-5xl leading-tight md:text-7xl">The Veta Vera Studio Journal</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Exploring the intersection of ancestral Ghanaian craftsmanship and contemporary design.
            Our stories are woven from the hands of the masters.
          </p>
        </div>
        <span className="label-caps border-b border-foreground pb-1">All stories</span>
      </header>

      {featured && (
        <section className="mt-14 grid items-start gap-10 md:grid-cols-12">
          <article className="md:col-span-8">
            <Link to="/journal/$slug" params={{ slug: featured.slug }} className="group block">
              <div className="hover-zoom">
                <SmartImage src={featured.coverImage} alt={featured.title} ratio="16/9" priority />
              </div>
              <div className="mt-7 max-w-2xl">
                <p className="label-caps text-gold">Featured essay · {featured.readTime} min read</p>
                <h2 className="mt-3 font-serif text-3xl leading-snug md:text-4xl">{featured.title}</h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">{featured.excerpt}</p>
                <span className="mt-6 inline-block border-b border-border pb-1 font-serif italic transition-colors group-hover:border-foreground">
                  Read the narrative
                </span>
              </div>
            </Link>
          </article>

          <aside className="border border-border bg-card p-7 shadow-editorial md:col-span-4 md:mt-24 md:p-9">
            <h2 className="font-serif text-xl italic">From the archives</h2>
            <div className="mt-8 divide-y divide-border">
              {archive.map((entry) => (
                <Link key={entry.id} to="/journal/$slug" params={{ slug: entry.slug }} className="group block py-6 first:pt-0 last:pb-0">
                  <p className="label-caps text-muted-foreground">{new Date(entry.publishedAt).toLocaleDateString()} · {entry.readTime} min</p>
                  <h3 className="mt-2 font-serif text-lg leading-snug transition-colors group-hover:text-gold">{entry.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{entry.excerpt}</p>
                </Link>
              ))}
            </div>
          </aside>
        </section>
      )}
    </div>
  );
}
