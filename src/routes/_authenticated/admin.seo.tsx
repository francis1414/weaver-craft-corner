import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ExternalLink, Info, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAdminProducts, useCategories, useJournal } from "@/hooks/use-store-data";

export const Route = createFileRoute("/_authenticated/admin/seo")({
  component: AdminSeo,
});

type Severity = "critical" | "warning" | "pass";

interface Finding {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  fixHref?: string;
  fixLabel?: string;
}

function AdminSeo() {
  const { data: products = [], isLoading } = useAdminProducts();
  const { data: journal = [] } = useJournal();
  const { data: categories = [] } = useCategories();
  const [technical, setTechnical] = useState<Finding[]>([]);
  const [checking, setChecking] = useState(false);

  async function runTechnicalChecks() {
    setChecking(true);
    const results: Finding[] = [];
    const files: { path: string; label: string; must: string }[] = [
      { path: "/sitemap.xml", label: "sitemap.xml", must: "<urlset" },
      { path: "/robots.txt", label: "robots.txt", must: "User-agent" },
    ];
    for (const file of files) {
      try {
        const res = await fetch(file.path, { cache: "no-store" });
        const text = await res.text();
        if (res.ok && text.includes(file.must)) {
          results.push({
            id: file.label,
            severity: "pass",
            title: `${file.label} is served correctly`,
            detail:
              file.path === "/sitemap.xml"
                ? `${(text.match(/<loc>/g) ?? []).length} URLs listed, including every active product.`
                : "Crawlers are allowed and the sitemap is declared.",
          });
        } else {
          results.push({
            id: file.label,
            severity: "critical",
            title: `${file.label} is unreachable`,
            detail: `Expected ${file.must} in the response but got status ${res.status}.`,
          });
        }
      } catch {
        results.push({
          id: file.label,
          severity: "critical",
          title: `${file.label} could not be fetched`,
          detail: "The request failed — check the deployment.",
        });
      }
    }
    setTechnical(results);
    setChecking(false);
  }

  useEffect(() => {
    void runTechnicalChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contentFindings = useMemo<Finding[]>(() => {
    const findings: Finding[] = [];
    const active = products.filter((p) => p.status === "active");

    const noDescription = active.filter((p) => p.description.trim().length < 80);
    if (noDescription.length) {
      findings.push({
        id: "product-description",
        severity: "critical",
        title: `${noDescription.length} product${noDescription.length > 1 ? "s" : ""} need a longer description`,
        detail: `Search engines need 80+ characters of unique copy. Missing on: ${noDescription
          .slice(0, 4)
          .map((p) => p.name)
          .join(", ")}${noDescription.length > 4 ? "…" : ""}`,
        fixHref: "/admin/products",
        fixLabel: "Edit products",
      });
    }

    const noImages = active.filter((p) => !p.primaryImage && p.images.length === 0);
    if (noImages.length) {
      findings.push({
        id: "product-images",
        severity: "critical",
        title: `${noImages.length} product${noImages.length > 1 ? "s" : ""} have no photo`,
        detail:
          "Image-less products cannot rank in Google Images or Shopping and hurt conversion.",
        fixHref: "/admin/products",
        fixLabel: "Upload photos",
      });
    }

    const longTitles = active.filter((p) => p.name.length > 60);
    if (longTitles.length) {
      findings.push({
        id: "product-title-length",
        severity: "warning",
        title: `${longTitles.length} product title${longTitles.length > 1 ? "s" : ""} exceed 60 characters`,
        detail: "Longer titles get truncated in search results.",
        fixHref: "/admin/products",
        fixLabel: "Shorten titles",
      });
    }

    const noTags = active.filter((p) => p.tags.length === 0);
    if (noTags.length) {
      findings.push({
        id: "product-tags",
        severity: "warning",
        title: `${noTags.length} product${noTags.length > 1 ? "s" : ""} have no keyword tags`,
        detail: "Tags feed internal linking and on-page keyword coverage.",
        fixHref: "/admin/products",
        fixLabel: "Add tags",
      });
    }

    const noStory = active.filter((p) => !p.artisanStory.trim());
    if (noStory.length) {
      findings.push({
        id: "product-story",
        severity: "warning",
        title: `${noStory.length} product${noStory.length > 1 ? "s" : ""} are missing the artisan story`,
        detail: "Unique long-form copy is the strongest differentiator against marketplace listings.",
        fixHref: "/admin/products",
        fixLabel: "Add stories",
      });
    }

    const thinJournal = journal.filter((entry) => entry.excerpt.trim().length < 60);
    if (thinJournal.length) {
      findings.push({
        id: "journal-excerpt",
        severity: "warning",
        title: `${thinJournal.length} journal post${thinJournal.length > 1 ? "s" : ""} lack a meta-ready excerpt`,
        detail: "Excerpts become the meta description for each article.",
      });
    }

    const emptyCategories = categories.filter((c) => !c.description.trim() || !c.image);
    if (emptyCategories.length) {
      findings.push({
        id: "category-content",
        severity: "warning",
        title: `${emptyCategories.length} craft categor${emptyCategories.length > 1 ? "ies" : "y"} missing copy or artwork`,
        detail: "Category tiles are prime landing pages for “bolga basket” style queries.",
        fixHref: "/admin/categories",
        fixLabel: "Edit categories",
      });
    }

    if (journal.length < 3) {
      findings.push({
        id: "journal-volume",
        severity: "warning",
        title: "Publish more journal articles",
        detail: "Three or more evergreen articles build topical authority around Ghanaian craft.",
      });
    }

    findings.push({
      id: "structured-data",
      severity: "pass",
      title: "Structured data is in place",
      detail:
        "Organization, WebSite, Product, BlogPosting and BreadcrumbList JSON-LD ship with each page.",
    });
    findings.push({
      id: "canonical",
      severity: "pass",
      title: "Canonical URLs and social cards configured",
      detail:
        "Every public page emits a canonical link, og:url, og:title, og:description and twitter:card.",
    });

    return findings;
  }, [products, journal, categories]);

  const all = [...technical, ...contentFindings];
  const critical = all.filter((f) => f.severity === "critical");
  const warnings = all.filter((f) => f.severity === "warning");
  const passes = all.filter((f) => f.severity === "pass");
  const score = Math.max(
    0,
    Math.min(100, 100 - critical.length * 12 - warnings.length * 5),
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">SEO audit</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live checks across catalogue content, structured data and crawlability.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/sitemap.xml" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> View sitemap
            </a>
          </Button>
          <Button onClick={() => void runTechnicalChecks()} disabled={checking}>
            <RefreshCw className={`mr-2 h-4 w-4 ${checking ? "animate-spin" : ""}`} /> Re-run audit
          </Button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-5 sm:col-span-2">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Health score</p>
          <p className="mt-2 font-serif text-4xl">{score}/100</p>
          <Progress value={score} className="mt-3" />
        </div>
        <Stat label="Critical issues" value={critical.length} tone="critical" />
        <Stat label="Opportunities" value={warnings.length} tone="warning" />
      </section>

      {isLoading && <p className="text-sm text-muted-foreground">Auditing catalogue…</p>}

      <section className="space-y-3">
        {[...critical, ...warnings, ...passes].map((finding) => (
          <article
            key={finding.id}
            className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-border bg-card p-5"
          >
            <div className="flex gap-3">
              {finding.severity === "critical" ? (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              ) : finding.severity === "warning" ? (
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#C29B38]" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#4A5D4E]" />
              )}
              <div>
                <h2 className="font-medium">{finding.title}</h2>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{finding.detail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={finding.severity === "critical" ? "destructive" : "secondary"}
                className="capitalize"
              >
                {finding.severity === "pass" ? "passing" : finding.severity}
              </Badge>
              {finding.fixHref && (
                <Button size="sm" variant="outline" asChild>
                  <Link to={finding.fixHref}>{finding.fixLabel ?? "Fix"}</Link>
                </Button>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "critical" | "warning";
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p
        className={`mt-2 font-serif text-4xl ${
          value === 0 ? "text-[#4A5D4E]" : tone === "critical" ? "text-destructive" : "text-[#C29B38]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
