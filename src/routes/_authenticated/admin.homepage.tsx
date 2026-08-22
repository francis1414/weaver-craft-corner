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
import type { HomepageContent } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/homepage")({
  component: AdminHomepage,
});

type FieldKind = "text" | "textarea" | "number";
interface FieldDef {
  key: string;
  label: string;
  kind?: FieldKind;
}

const SECTIONS: {
  key: keyof HomepageContent;
  label: string;
  fields: FieldDef[];
}[] = [
  {
    key: "heroSlides",
    label: "Hero carousel",
    fields: [
      { key: "badge", label: "Badge" },
      { key: "title", label: "Title" },
      { key: "subtitle", label: "Subtitle", kind: "textarea" },
      { key: "image", label: "Image URL" },
      { key: "ctaLabel", label: "CTA label" },
      { key: "ctaHref", label: "CTA link" },
    ],
  },
  {
    key: "valuePillars",
    label: "Value pillars",
    fields: [
      { key: "title", label: "Title" },
      { key: "body", label: "Body", kind: "textarea" },
    ],
  },
  {
    key: "weaverSpotlights",
    label: "Weaver spotlights",
    fields: [
      { key: "name", label: "Name" },
      { key: "village", label: "Village" },
      { key: "years", label: "Years weaving", kind: "number" },
      { key: "quote", label: "Quote", kind: "textarea" },
      { key: "image", label: "Portrait URL" },
    ],
  },
  {
    key: "processSteps",
    label: "Process steps",
    fields: [
      { key: "step", label: "Step name" },
      { key: "body", label: "Body", kind: "textarea" },
    ],
  },
  {
    key: "campaignCards",
    label: "Campaign cards",
    fields: [
      { key: "title", label: "Title" },
      { key: "body", label: "Body", kind: "textarea" },
      { key: "href", label: "Link" },
      { key: "image", label: "Image URL" },
    ],
  },
];

const COLUMN: Record<keyof HomepageContent, string> = {
  heroSlides: "hero_slides",
  valuePillars: "value_pillars",
  weaverSpotlights: "weaver_spotlights",
  processSteps: "process_steps",
  campaignCards: "campaign_cards",
};

type Row = Record<string, unknown>;

function AdminHomepage() {
  const { data, isLoading } = useAdminHomepage();
  const queryClient = useQueryClient();
  const [content, setContent] = useState<Record<string, Row[]>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const source = data ?? MOCK_HOMEPAGE;
    setContent({
      heroSlides: source.heroSlides as unknown as Row[],
      valuePillars: source.valuePillars as unknown as Row[],
      weaverSpotlights: source.weaverSpotlights as unknown as Row[],
      processSteps: source.processSteps as unknown as Row[],
      campaignCards: source.campaignCards as unknown as Row[],
    });
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
          <p className="mt-1 text-sm text-muted-foreground">
            Everything below renders live on the storefront homepage.
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
        </TabsList>
        {SECTIONS.map((section) => {
          const items = content[section.key] ?? [];
          const update = (next: Row[]) =>
            setContent({ ...content, [section.key]: next });
          return (
            <TabsContent key={section.key} value={section.key} className="space-y-4 pt-6">
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
                          className={`space-y-2 ${field.kind === "textarea" ? "sm:col-span-2" : ""}`}
                        >
                          <Label>{field.label}</Label>
                          {field.kind === "textarea" ? (
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
      </Tabs>
      <p className="text-xs text-muted-foreground">
        Stored in the {Object.values(COLUMN).length}-section homepage content record.
      </p>
    </div>
  );
}
