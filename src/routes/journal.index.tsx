import { Link, createFileRoute } from "@tanstack/react-router";

import { SmartImage } from "@/components/SmartImage";
import { useJournal } from "@/hooks/use-store-data";

export const Route = createFileRoute("/journal/")({
  head: () => ({
    meta: [
      { title: "The Journal — Sustainable Decor & Ghanaian Craft | Vetastudio" },
      {
        name: "description",
        content:
          "Essays on West African weaving traditions, natural dyeing, and living well with handmade objects.",
      },
      { property: "og:title", content: "The Journal — Vetastudio" },
      {
        property: "og:description",
        content: "Essays on West African weaving, natural dyeing and sustainable decor.",
      },
    ],
  }),
  component: JournalPage,
});

function JournalPage() {
  const { data: entries } = useJournal();

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-8">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Journal</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
          Notes from the weaving villages
        </h1>
      </header>

      <div className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <article key={entry.id}>
            <Link to="/journal/$slug" params={{ slug: entry.slug }} className="group block">
              <SmartImage
                src={entry.coverImage}
                alt={entry.title}
                ratio="4/3"
                className="transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {new Date(entry.publishedAt).toLocaleDateString()} · {entry.readTime} min read
              </p>
              <h2 className="mt-2 font-serif text-2xl leading-snug">{entry.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{entry.excerpt}</p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
