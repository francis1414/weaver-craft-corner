const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from", "has", "have", "in",
  "into", "is", "it", "its", "of", "on", "or", "our", "that", "the", "their", "them", "then",
  "there", "these", "they", "this", "to", "was", "were", "will", "with", "you", "your", "we",
  "each", "every", "when", "which", "while", "also", "made", "make", "very", "more", "most",
  "can", "just", "over", "under", "about", "up", "out", "one", "two", "all", "any", "both",
]);

const BASE_KEYWORDS = [
  "handwoven basket",
  "bolga basket",
  "ghana basket",
  "elephant grass",
  "fair trade decor",
];

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
}

/**
 * Derives SEO keywords for a product from its title and description
 * (plus optional category/material/colour hints). Returns lowercase,
 * de-duplicated phrases ordered by relevance.
 */
export function deriveProductKeywords(input: {
  name: string;
  description?: string;
  category?: string;
  material?: string;
  colors?: string[];
}): string[] {
  const title = words(input.name);
  const body = words(input.description ?? "");

  const counts = new Map<string, number>();
  const bump = (word: string, weight: number) =>
    counts.set(word, (counts.get(word) ?? 0) + weight);

  title.forEach((w) => bump(w, 5));
  body.forEach((w) => bump(w, 1));

  const singles = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([w]) => w);

  // Two-word phrases from the title carry the highest search intent.
  const phrases: string[] = [];
  for (let i = 0; i < title.length - 1; i += 1) {
    phrases.push(`${title[i]} ${title[i + 1]}`);
  }

  const hints = [
    input.category ? `${input.category.replace(/-/g, " ")} basket` : "",
    input.material ? input.material.toLowerCase() : "",
    ...(input.colors ?? []).map((c) => `${c.toLowerCase()} ${input.category ?? "woven"} basket`),
  ].filter(Boolean);

  const all = [...phrases, ...singles, ...hints, ...BASE_KEYWORDS].map((k) =>
    k.replace(/\s+/g, " ").trim(),
  );

  return [...new Set(all)].filter(Boolean).slice(0, 18);
}

/** Merges manual tags with auto-detected keywords, keeping manual ones first. */
export function mergeKeywords(manual: string[], auto: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of [...manual, ...auto]) {
    const key = tag.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(tag.trim());
  }
  return out.slice(0, 24);
}
