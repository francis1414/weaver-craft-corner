import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminHomepage } from "@/hooks/use-store-data";
import { MOCK_HOMEPAGE } from "@/lib/mock-data";
import { upsertSingleton } from "@/lib/store-api";
import type { FairWageIntro, HomepageContent, SectionHeadingKey, SectionHeadings } from "@/types";
import { MediaUploader } from "@/components/admin/MediaUploader";

export const Route = createFileRoute("/_authenticated/admin/homepage")({
  component: AdminHomepage,
});

type FieldKind = "text" | "textarea" | "number" | "image";
interface FieldDef {
  key: string;
  label: string;
  kind?: FieldKind;
}

type ListKey =
  | "heroSlides"
  | "valuePillars"
  | "weaverSpotlights"
  | "processSteps"
  | "campaignCards"
  | "fairWagePillars";

/** Each entry mirrors one band of the storefront homepage, in the order it appears. */
const SECTIONS: {
  key: ListKey;
  label: string;
  hint: string;
  fields: FieldDef[];
}[] = [
  {
    key: "heroSlides",
    label: "Hero carousel",
    hint: "Top of the homepage. Each slide supplies its own photo, headline, badge and button — the copy changes as the images rotate.",
    fields: [
      { key: "badge", label: "Badge" },
      { key: "title", label: "Title" },
      { key: "subtitle", label: "Subtitle", kind: "textarea" },
      { key: "image", label: "Slide image", kind: "image" },
      { key: "ctaLabel", label: "CTA label" },
      { key: "ctaHref", label: "CTA link" },
    ],
  },
  {
    key: "valuePillars",
    label: "Value pillars",
    hint: "The four-across strip directly under the hero. Only the first four items show.",
    fields: [
      { key: "title", label: "Title" },
      { key: "body", label: "Body", kind: "textarea" },
    ],
  },
  {
    key: "processSteps",
    label: "Process steps",
    hint: "The numbered “From grass to basket” band. Best with three to five steps.",
    fields: [
      { key: "step", label: "Step name" },
      { key: "body", label: "Body", kind: "textarea" },
    ],
  },
  {
    key: "fairWagePillars",
    label: "Fair-wage pillars",
    hint: "The three columns inside the dark fair-wage band after the story film.",
    fields: [
      { key: "title", label: "Title" },
      { key: "body", label: "Body", kind: "textarea" },
    ],
  },
  {
    key: "campaignCards",
    label: "Campaign cards",
    hint: "Promotional cards shown after “Newly added”. Leave empty to hide the whole band.",
    fields: [
      { key: "title", label: "Title" },
      { key: "body", label: "Body", kind: "textarea" },
      { key: "href", label: "Link" },
      { key: "image", label: "Card image", kind: "image" },
    ],
  },
  {
    key: "weaverSpotlights",
    label: "Weaver spotlights",
    hint: "The quote and portrait near the bottom of the homepage. The first entry is the one shown.",
    fields: [
      { key: "name", label: "Name" },
      { key: "village", label: "Village" },
      { key: "years", label: "Years weaving", kind: "number" },
      { key: "quote", label: "Quote", kind: "textarea" },
      { key: "image", label: "Portrait", kind: "image" },
    ],
  },
];

const HEADING_FIELDS: { key: SectionHeadingKey; label: string; hint: string }[] = [
  { key: "categories", label: "Shop by craft band", hint: "Above the category squares." },
  { key: "featured", label: "Featured collection band", hint: "Above the filter buttons." },
  { key: "process", label: "Process band", hint: "Above the numbered weaving steps." },
  { key: "arrivals", label: "New arrivals band", hint: "Above the newest four products." },
  { key: "campaigns", label: "Campaign cards band", hint: "Above the promotional cards." },
  { key: "spotlight", label: "Weaver spotlight label", hint: "Small gold label above the quote." },
  { key: "testimonials", label: "Reviews band", hint: "Above the collector reviews." },
];

const FAIR_WAGE_FIELDS: { key: keyof FairWageIntro; label: string }[] = [
  { key: "eyebrow", label: "Small gold label" },
  { key: "heading", label: "Heading" },
  { key: "ctaLabel", label: "Button label" },
];

type Row = Record<string, unknown>;

function AdminHomepage() {
  const { data, isLoading } = useAdminHomepage();
  const queryClient = useQueryClient();
  const [content, setContent] = useState<Record<string, Row[]>>({});
  const [fairWage, setFairWage] = useState<FairWageIntro>(MOCK_HOMEPAGE.fairWage);
  const [headings, setHeadings] = useState<SectionHeadings>(MOCK_HOMEPAGE.sectionHeadings);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const source: HomepageContent = data ?? MOCK_HOMEPAGE;
    setContent({
      heroSlides: source.heroSlides as unknown as Row[],
      valuePillars: source.valuePillars as unknown as Row[],
      weaverSpotlights: source.weaverSpotlights as unknown as Row[],
      processSteps: source.processSteps as unknown as Row[],
      campaignCards: source.campaignCards as unknown as Row[],
      fairWagePillars: source.fairWagePillars as unknown as Row[],
    });
    setFairWage(source.fairWage);
    setHeadings(source.sectionHeadings);
  }, [data]);

  async function save() {
    setBusy(true);
    try {
      await upsertSingleton("cms_homepage", {
        hero_slides: content["heroSlides"] ?? [],
        value_pillars: content["valuePillars"] ?? [],
        weaver_spotlights: content["weaverSpotlights"] ?? [],
        process_steps: content["processSteps"] ?? [],
        campaign_cards: content["campaignCards"] ?? [],
        fair_wage_pillars: content["fairWagePillars"] ?? [],
        fair_wage: fairWage,
        section_headings: headings,
        updated_at: new Date().toISOString(),
      });
      toast.success("Homepage content published");
      void queryClient.invalidateQueries({ queryKey: ["homepage"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "homepage"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Publish failed");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading homepage content…</p>;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Homepage CMS</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Every tab below matches a band on the live homepage, in the order visitors see it: hero,
            value pillars, shop by craft, featured collection, process, story film, fair-wage
            promise, new arrivals, campaign cards, weaver spotlight and collector reviews.
          </p>
        </div>
        <Button onClick={save} disabled={busy}>
          Publish changes
        </Button>
      </header>

      <Tabs defaultValue={SECTIONS[0]!.key}>
        <TabsList className="flex-wrap">
          {SECTIONS.map((s) => (
            <TabsTrigger key={s.key} value={s.key}>
              {s.label}
            </TabsTrigger>
          ))}
          <TabsTrigger value="fairWageIntro">Fair-wage intro</TabsTrigger>
          <TabsTrigger value="headings">Section headings</TabsTrigger>
        </TabsList>

        {SECTIONS.map((section) => {
          const items = content[section.key] ?? [];
          const update = (next: Row[]) => setContent({ ...content, [section.key]: next });
          return (
            <TabsContent key={section.key} value={section.key} className="space-y-4 pt-6">
              <p className="text-sm text-muted-foreground">{section.hint}</p>
              {items.map((item, index) => (
                <div key={index} className="rounded-lg border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-lg">
                      {section.label} #{index + 1}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => update(items.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {section.fields.map((field) => {
                      const value = item[field.key];
                      const set = (raw: string) =>
                        update(
                          items.map((row, i) =>
                            i === index
                              ? {
                                  ...row,
                                  [field.key]:
                                    field.kind === "number" ? Number(raw) || 0 : raw,
                                }
                              : row,
                          ),
                        );
                      return (
                        <div
                          key={field.key}
                          className={`space-y-2 ${field.kind === "textarea" || field.kind === "image" ? "sm:col-span-2" : ""}`}
                        >
                          {field.kind !== "image" && <Label>{field.label}</Label>}
                          {field.kind === "image" ? (
                            <MediaUploader
                              label={field.label}
                              value={value ? [String(value)] : []}
                              onChange={(next: string[]) => set(next[0] ?? "")}
                              multiple={false}
                              accept="image/*"
                              folder="homepage"
                              max={1}
                            />
                          ) : field.kind === "textarea" ? (
                            <Textarea
                              rows={3}
                              value={String(value ?? "")}
                              onChange={(e) => set(e.target.value)}
                            />
                          ) : (
                            <Input
                              type={field.kind === "number" ? "number" : "text"}
                              value={String(value ?? "")}
                              onChange={(e) => set(e.target.value)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  update([
                    ...items,
                    Object.fromEntries(
                      section.fields.map((f) => [f.key, f.kind === "number" ? 0 : ""]),
                    ),
                  ])
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Add {section.label.toLowerCase()} item
              </Button>
            </TabsContent>
          );
        })}

        <TabsContent value="fairWageIntro" className="space-y-4 pt-6">
          <p className="text-sm text-muted-foreground">
            The dark fair-wage band after the story film. The button always links to the
            transparency section of the story page.
          </p>
          <div className="grid gap-4 rounded-lg border border-border bg-card p-5 sm:grid-cols-2">
            {FAIR_WAGE_FIELDS.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label>{field.label}</Label>
                <Input
                  value={fairWage[field.key] ?? ""}
                  onChange={(e) => setFairWage({ ...fairWage, [field.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="headings" className="space-y-4 pt-6">
          <p className="text-sm text-muted-foreground">
            Rename any band title on the homepage. Leave a field empty to keep the current wording.
          </p>
          <div className="grid gap-4 rounded-lg border border-border bg-card p-5 sm:grid-cols-2">
            {HEADING_FIELDS.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label>{field.label}</Label>
                <Input
                  value={headings[field.key] ?? ""}
                  onChange={(e) => setHeadings({ ...headings, [field.key]: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">{field.hint}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground">
        Saved changes appear on the storefront immediately — no publish of the whole site needed.
      </p>
    </div>
  );
}
