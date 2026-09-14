import { Link, createFileRoute } from "@tanstack/react-router";

import { SmartImage } from "@/components/SmartImage";
import { useJournal } from "@/hooks/use-store-data";
import { absoluteUrl, canonical, jsonLdScript } from "@/lib/seo";

export const Route = createFileRoute("/journal/$slug")({
  loader: async ({ params }) => {
    try {
      const entries = await fetchJournal();
      const entry = entries.find((e) => e.slug === params.slug);
      if (!entry) return { entry: null };
      return {
        entry: {
          title: entry.title,
          excerpt: entry.excerpt,
          image: entry.coverImage ? assetUrl(entry.coverImage) : "",
          publishedAt: entry.publishedAt,
          author: entry.author,
        },
      };
    } catch {
      return { entry: null };
    }
  },
  head: ({ params, loaderData }) => {
    const loaded = loaderData?.entry ?? null;
    const title =
      loaded?.title ??
      params.slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    const description =
      loaded?.excerpt && loaded.excerpt.trim().length > 40
        ? loaded.excerpt.trim().slice(0, 300)
        : `${title}: an essay from the Vetastudio journal on Ghanaian craft and sustainable decor.`;
    return {
      meta: [
        { title: `${title} — Vetastudio Journal` },
        { name: "description", content: description },
        { property: "og:title", content: `${title} — Vetastudio Journal` },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...canonical(`/journal/${params.slug}`).meta,
      ],
      links: canonical(`/journal/${params.slug}`).links,
      scripts: [
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: title,
          description,
          url: absoluteUrl(`/journal/${params.slug}`),
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": absoluteUrl(`/journal/${params.slug}`),
          },
          ...(loaded?.image ? { image: [loaded.image] } : {}),
          ...(loaded?.publishedAt
            ? { datePublished: loaded.publishedAt, dateModified: loaded.publishedAt }
            : {}),
          author: { "@type": "Organization", name: loaded?.author || "Vetastudio" },
          publisher: { "@type": "Organization", name: "Vetastudio" },
        }),
      ],
    };
  },
  component: JournalEntryPage,
});

function JournalEntryPage() {
  const { slug } = Route.useParams();
  const { data: entries } = useJournal();
  const entry = entries.find((e) => e.slug === slug);

  if (!entry) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl">That story has moved</h1>
        <Link
          to="/journal"
          className="mt-6 inline-flex h-12 items-center bg-foreground px-6 text-xs uppercase tracking-[0.2em] text-background"
        >
          Back to the journal
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-8">
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {new Date(entry.publishedAt).toLocaleDateString()} · {entry.readTime} min read ·{" "}
        {entry.author}
      </p>
      <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">{entry.title}</h1>
      <SmartImage src={entry.coverImage} alt={entry.title} ratio="16/9" priority className="mt-8" />
      <div className="mt-10 space-y-6 text-base leading-relaxed text-muted-foreground">
        {entry.content.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      {entry.tags.length > 0 && (
        <ul className="mt-10 flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <li key={tag} className="border border-border px-3 py-1 text-xs capitalize">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
