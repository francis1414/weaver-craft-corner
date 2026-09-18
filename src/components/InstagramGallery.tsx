import { ExternalLink, Instagram } from "lucide-react";

import { SmartImage } from "@/components/SmartImage";
import type { InstagramPost } from "@/types";

const INSTAGRAM_PROFILE = "https://www.instagram.com/vetaverastudio";

export function InstagramGallery({ posts }: { posts: InstagramPost[] }) {
  const visiblePosts = posts
    .filter((post) => post.url.trim() && post.image.trim())
    .slice(0, 4);

  if (visiblePosts.length === 0) return null;

  return (
    <section className="border-t border-border bg-stone/40">
      <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="label-caps flex items-center gap-2 text-gold">
              <Instagram className="h-4 w-4" aria-hidden="true" /> From the studio
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">Follow the weave</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              New work, weaving days and stories from Bolgatanga, shared as they happen.
            </p>
          </div>
          <a
            href={INSTAGRAM_PROFILE}
            target="_blank"
            rel="noreferrer noopener"
            className="rule-link inline-flex min-h-11 items-center gap-2 py-2 text-xs uppercase tracking-[0.18em] text-foreground"
          >
            Follow @vetaverastudio <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {visiblePosts.map((post, index) => (
            <a
              key={`${post.url}-${index}`}
              href={post.url}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`View Instagram post${post.caption ? `: ${post.caption}` : ""}`}
              className="group relative block overflow-hidden bg-stone"
            >
              <SmartImage
                src={post.image}
                alt={post.caption || `Veta Vera Studio Instagram post ${index + 1}`}
                ratio="1/1"
                sizes="(min-width: 768px) 25vw, 50vw"
                className="transition-transform duration-700 group-hover:scale-[1.03]"
                fallbackMessage="Instagram photograph unavailable"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-foreground/85 px-4 py-3 text-background opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="line-clamp-2 text-xs leading-relaxed">
                  {post.caption || "View on Instagram"}
                </span>
                <Instagram className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}