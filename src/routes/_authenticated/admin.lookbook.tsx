import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, BookOpen, Eye, EyeOff, FileDown, Save } from "lucide-react";
import { toast } from "sonner";

import coverAsset from "@/assets/trade-lookbook-cover.png.asset.json";
import logoAsset from "@/assets/trade-lookbook-logo.png.asset.json";
import weaverAsset from "@/assets/trade-lookbook-master-weaver.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminLookbook, useAdminProducts, useAdminSettings } from "@/hooks/use-store-data";
import { assetUrl } from "@/lib/asset-url";
import { upsertSingleton } from "@/lib/store-api";
import type { LookbookContent, Product } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/lookbook")({
  head: () => ({
    meta: [
      { title: "Trade Lookbook Editor — Veta Vera Studio" },
      { name: "description", content: "Edit and export the Veta Vera Studio wholesale trade lookbook." },
      { property: "og:title", content: "Trade Lookbook Editor — Veta Vera Studio" },
      { property: "og:description", content: "Edit and export the Veta Vera Studio wholesale trade lookbook." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLookbook,
});

const CATEGORY_META = [
  {
    key: "sculpture",
    title: "Sculptural Basket Collection",
    intro: "Singular woven forms shaped by hand in Bolgatanga, where traditional basketry becomes collectible fibre art.",
  },
  {
    key: "lampshade",
    title: "Lampshade Collection",
    intro: "Architectural shades that filter light through intricate elephant-grass patterns, woven without moulds or synthetic frames.",
  },
  {
    key: "wall-fans",
    title: "Wall Fans",
    intro: "Graphic handwoven fans that bring rhythm, colour and the warmth of Ghanaian craft to interior walls.",
  },
] as const;

const DEFAULT_PROFILE =
  "Veta Vera Studio is a Ghanaian craft studio working directly with master weavers and weaving cooperatives across Bolgatanga, Sumbrungu and Winkongo. We translate generations of elephant-grass knowledge into sculptural baskets, lighting and wall pieces for collectors, designers and considered interiors.\n\nEvery work is formed by hand from locally grown veta vera grass. Our trade relationships are built around fair commissions, prompt payment, medical support and long-term investment in the communities where the work begins.";

const DEFAULT_LOOKBOOK: LookbookContent = {
  title: "Trade Lookbook",
  edition: "Handwoven in Ghana · 2026 Collection",
  companyProfile: DEFAULT_PROFILE,
  coverImage: coverAsset.url,
  logoImage: logoAsset.url,
  weaverImage: weaverAsset.url,
  contactEmail: "info@vetaverra.com",
  contactPhone: "+233 20 008 4444",
  contactAddress: "St Louis, USA · Bolgatanga, Ghana",
  productOverrides: {},
  productOrder: [],
  excludedProductIds: [],
};

function shortName(name: string) {
  return name.split("|")[0]?.trim() || name;
}

function conciseDescription(description: string) {
  const clean = description
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const sentence = clean.match(/^.{40,210}?[.!?](?:\s|$)/)?.[0] ?? clean.slice(0, 190);
  return sentence.trim().replace(/[—,:;\s]+$/, "") + (sentence.length < clean.length && !/[.!?]$/.test(sentence) ? "…" : "");
}

function orderedProducts(products: Product[], order: string[]) {
  const index = new Map(order.map((id, position) => [id, position]));
  return [...products].sort((a, b) => {
    const aPosition = index.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const bPosition = index.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    return aPosition - bPosition || a.createdAt.localeCompare(b.createdAt);
  });
}

function chunks<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) pages.push(items.slice(index, index + size));
  return pages;
}

function AdminLookbook() {
  const productsQuery = useAdminProducts();
  const lookbookQuery = useAdminLookbook();
  const settings = useAdminSettings();
  const queryClient = useQueryClient();
  const [content, setContent] = useState<LookbookContent>(DEFAULT_LOOKBOOK);
  const [saving, setSaving] = useState(false);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (lookbookQuery.data) {
      setContent(lookbookQuery.data);
    } else if (!lookbookQuery.isLoading) {
      setContent((current) => ({
        ...current,
        contactEmail: settings.data?.supportEmail || current.contactEmail,
        contactPhone: settings.data?.supportPhone || current.contactPhone,
      }));
    }
  }, [lookbookQuery.data, lookbookQuery.isLoading, settings.data]);

  const activeProducts = useMemo(
    () => (productsQuery.data ?? []).filter((product) => product.status === "active"),
    [productsQuery.data],
  );

  const categoryProducts = useMemo(
    () =>
      CATEGORY_META.map((category) => ({
        ...category,
        products: orderedProducts(
          activeProducts.filter((product) => product.category === category.key),
          content.productOrder,
        ),
      })),
    [activeProducts, content.productOrder],
  );

  function updateProduct(id: string, field: "description" | "dimensions", value: string) {
    setContent((current) => ({
      ...current,
      productOverrides: {
        ...current.productOverrides,
        [id]: { ...current.productOverrides[id], [field]: value },
      },
    }));
  }

  function moveProduct(categoryProductsList: Product[], productId: string, direction: -1 | 1) {
    const ids = categoryProductsList.map((product) => product.id);
    const position = ids.indexOf(productId);
    const target = position + direction;
    if (position < 0 || target < 0 || target >= ids.length) return;
    [ids[position], ids[target]] = [ids[target]!, ids[position]!];
    const categorySet = new Set(ids);
    const remaining = content.productOrder.filter((id) => !categorySet.has(id));
    setContent({ ...content, productOrder: [...remaining, ...ids] });
  }

  function toggleProduct(productId: string) {
    const hidden = content.excludedProductIds.includes(productId);
    setContent({
      ...content,
      excludedProductIds: hidden
        ? content.excludedProductIds.filter((id) => id !== productId)
        : [...content.excludedProductIds, productId],
    });
  }

  async function save() {
    setSaving(true);
    try {
      await upsertSingleton("cms_lookbook", {
        title: content.title,
        edition: content.edition,
        company_profile: content.companyProfile,
        cover_image: content.coverImage,
        logo_image: content.logoImage,
        weaver_image: content.weaverImage,
        contact_email: content.contactEmail,
        contact_phone: content.contactPhone,
        contact_address: content.contactAddress,
        product_overrides: content.productOverrides,
        product_order: content.productOrder,
        excluded_product_ids: content.excludedProductIds,
        updated_at: new Date().toISOString(),
      });
      await queryClient.invalidateQueries({ queryKey: ["admin", "lookbook"] });
      toast.success("Trade lookbook saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The lookbook could not be saved");
    } finally {
      setSaving(false);
    }
  }

  async function printLookbook() {
    setPrinting(true);
    const images = Array.from(document.querySelectorAll<HTMLImageElement>("#trade-lookbook-print img"));
    await Promise.all(
      images.map(
        (image) =>
          image.complete
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                image.addEventListener("load", () => resolve(), { once: true });
                image.addEventListener("error", () => resolve(), { once: true });
              }),
      ),
    );
    setPrinting(false);
    window.print();
  }

  if (productsQuery.isLoading || lookbookQuery.isLoading || settings.isLoading) {
    return <p className="text-sm text-muted-foreground">Preparing the trade lookbook…</p>;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <p className="label-caps text-gold">Trade catalogue</p>
          <h1 className="mt-2 font-serif text-3xl">Trade Lookbook</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Edit the presentation, arrange products, then export a clean A4 PDF without prices.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={save} disabled={saving}>
            <Save /> {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button onClick={printLookbook} disabled={printing}>
            <FileDown /> {printing ? "Loading images…" : "Print / Save PDF"}
          </Button>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)] print:block">
        <div className="space-y-5 print:hidden">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-serif text-xl">Cover &amp; contact</h2>
            <div className="mt-4 space-y-4">
              <MediaUploader label="Lookbook logo" value={content.logoImage ? [content.logoImage] : []} onChange={(images) => setContent({ ...content, logoImage: images[0] ?? "" })} multiple={false} accept="image/*" folder="lookbook" max={1} />
              <MediaUploader label="Cover photograph" value={content.coverImage ? [content.coverImage] : []} onChange={(images) => setContent({ ...content, coverImage: images[0] ?? "" })} multiple={false} accept="image/*" folder="lookbook" max={1} />
              <MediaUploader label="Master-weaver photograph" value={content.weaverImage ? [content.weaverImage] : []} onChange={(images) => setContent({ ...content, weaverImage: images[0] ?? "" })} multiple={false} accept="image/*" folder="lookbook" max={1} />
              <Field label="Document title" value={content.title} onChange={(title) => setContent({ ...content, title })} />
              <Field label="Edition line" value={content.edition} onChange={(edition) => setContent({ ...content, edition })} />
              <Field label="Email" value={content.contactEmail} onChange={(contactEmail) => setContent({ ...content, contactEmail })} />
              <Field label="Phone" value={content.contactPhone} onChange={(contactPhone) => setContent({ ...content, contactPhone })} />
              <Field label="Studio address" value={content.contactAddress} onChange={(contactAddress) => setContent({ ...content, contactAddress })} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-serif text-xl">Company profile</h2>
            <Label className="mt-4 block">Profile copy</Label>
            <Textarea
              className="mt-2 min-h-52"
              value={content.companyProfile}
              onChange={(event) => setContent({ ...content, companyProfile: event.target.value })}
            />
          </div>

          {categoryProducts.map((category) => (
            <div key={category.key} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-serif text-xl">{category.title}</h2>
                <span className="text-xs text-muted-foreground">{category.products.length} products</span>
              </div>
              <div className="mt-4 space-y-3">
                {category.products.map((product, index) => {
                  const hidden = content.excludedProductIds.includes(product.id);
                  const override = content.productOverrides[product.id];
                  return (
                    <div key={product.id} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
                      <div className="flex items-start gap-3">
                        <img src={assetUrl(product.primaryImage)} alt="" className="h-14 w-12 shrink-0 object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-snug">{shortName(product.name)}</p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">{product.sku}</p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button variant="ghost" size="icon" aria-label="Move up" disabled={index === 0} onClick={() => moveProduct(category.products, product.id, -1)}><ArrowUp /></Button>
                          <Button variant="ghost" size="icon" aria-label="Move down" disabled={index === category.products.length - 1} onClick={() => moveProduct(category.products, product.id, 1)}><ArrowDown /></Button>
                          <Button variant="ghost" size="icon" aria-label={hidden ? "Include product" : "Hide product"} onClick={() => toggleProduct(product.id)}>{hidden ? <EyeOff /> : <Eye />}</Button>
                        </div>
                      </div>
                      {!hidden && (
                        <div className="mt-3 space-y-2">
                          <Textarea rows={3} aria-label={`${product.name} lookbook description`} value={override?.description ?? conciseDescription(product.description)} onChange={(event) => updateProduct(product.id, "description", event.target.value)} />
                          <Input aria-label={`${product.name} lookbook size`} value={override?.dimensions ?? product.dimensions} onChange={(event) => updateProduct(product.id, "dimensions", event.target.value)} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="min-w-0 overflow-auto rounded-lg border border-border bg-stone p-4 sm:p-8 print:overflow-visible print:border-0 print:bg-transparent print:p-0">
          <LookbookPages content={content} categories={categoryProducts} />
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function LookbookPages({
  content,
  categories,
}: {
  content: LookbookContent;
  categories: Array<(typeof CATEGORY_META)[number] & { products: Product[] }>;
}) {
  let pageNumber = 2;
  return (
    <div id="trade-lookbook-print" className="mx-auto w-[210mm] max-w-none space-y-6 print:space-y-0">
      <article className="lookbook-page relative isolate h-[297mm] w-[210mm] overflow-hidden bg-foreground text-background shadow-editorial">
        <img src={assetUrl(content.coverImage)} alt="Veta Vera Studio collection" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/15 to-transparent" />
        <div className="absolute inset-x-0 top-0 flex justify-center px-14 pt-12">
          <img src={assetUrl(content.logoImage)} alt="Veta Vera Studio" className="h-auto w-full max-w-[132mm] mix-blend-screen" />
        </div>
        <div className="absolute inset-x-0 bottom-0 px-14 pb-14">
          <p className="label-caps text-gold">Wholesale · Interior trade · Collectors</p>
          <h2 className="mt-4 max-w-[150mm] font-serif text-[42pt] leading-[0.98] text-background">{content.title}</h2>
          <p className="mt-5 text-[10pt] uppercase tracking-[0.18em] text-background/80">{content.edition}</p>
          <div className="mt-9 grid grid-cols-3 gap-6 border-t border-background/35 pt-5 text-[8pt] leading-relaxed text-background/80">
            <p>{content.contactEmail}</p><p>{content.contactPhone}</p><p>{content.contactAddress}</p>
          </div>
        </div>
      </article>

      <article className="lookbook-page grid h-[297mm] w-[210mm] grid-cols-[44%_56%] overflow-hidden bg-background text-foreground shadow-editorial">
        <div className="relative h-full overflow-hidden bg-stone">
          <img src={assetUrl(content.weaverImage)} alt="Master weaver at work" className="h-full w-full object-cover" />
          <div className="absolute bottom-0 left-0 bg-foreground px-6 py-4 text-background">
            <p className="text-[7pt] uppercase tracking-[0.2em] text-gold">Master weaver</p>
            <p className="mt-1 font-serif text-[13pt]">Bolgatanga, Ghana</p>
          </div>
        </div>
        <div className="flex h-full flex-col px-12 py-14">
          <p className="text-[8pt] uppercase tracking-[0.22em] text-gold">Company profile</p>
          <h2 className="mt-7 font-serif text-[34pt] leading-tight">Made by hand.<br />Built on trust.</h2>
          <div className="mt-10 space-y-5 text-[10pt] leading-[1.75] text-muted-foreground">
            {content.companyProfile.split(/\n\n+/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
          <div className="mt-auto border-t border-border pt-6">
            <p className="font-serif text-[16pt] leading-snug">Every basket pays its maker first.</p>
            <p className="mt-2 text-[8pt] leading-relaxed text-muted-foreground">Fair commissions · Medical support · Community investment</p>
          </div>
          <PageFooter page={2} />
        </div>
      </article>

      {categories.flatMap((category) => {
        const visible = category.products.filter((product) => !content.excludedProductIds.includes(product.id));
        const pages = chunks(visible, 2);
        return pages.map((products, pageIndex) => {
          pageNumber += 1;
          const currentPage = pageNumber;
          return (
            <article key={`${category.key}-${pageIndex}`} className="lookbook-page flex h-[297mm] w-[210mm] flex-col overflow-hidden bg-background px-12 py-10 text-foreground shadow-editorial">
              <header className="flex items-end justify-between border-b border-border pb-5">
                <div>
                  <p className="text-[7pt] uppercase tracking-[0.22em] text-gold">Collection {String(CATEGORY_META.findIndex((item) => item.key === category.key) + 1).padStart(2, "0")}</p>
                  <h2 className="mt-2 font-serif text-[25pt]">{category.title}</h2>
                </div>
                <p className="max-w-[62mm] text-right text-[7.5pt] leading-relaxed text-muted-foreground">{pageIndex === 0 ? category.intro : `${category.title} · continued`}</p>
              </header>
              <div className={`mt-8 grid min-h-0 flex-1 gap-7 ${products.length === 1 ? "grid-cols-[58%_42%]" : "grid-cols-2"}`}>
                {products.map((product) => {
                  const override = content.productOverrides[product.id];
                  return (
                    <section key={product.id} className={`min-h-0 ${products.length === 1 ? "contents" : "flex flex-col"}`}>
                      <div className={`${products.length === 1 ? "h-full" : "h-[145mm]"} overflow-hidden bg-stone`}>
                        <img src={assetUrl(product.primaryImage)} alt={shortName(product.name)} className="h-full w-full object-cover" />
                      </div>
                      <div className={products.length === 1 ? "flex min-h-0 flex-col pl-2 pt-8" : "contents"}>
                        <p className="mt-5 text-[7pt] uppercase tracking-[0.18em] text-gold">{product.sku}</p>
                        <h3 className="mt-2 font-serif text-[17pt] leading-tight">{shortName(product.name)}</h3>
                        <p className="mt-3 text-[8pt] leading-[1.55] text-muted-foreground">{override?.description ?? conciseDescription(product.description)}</p>
                        <p className="mt-auto border-t border-border pt-3 text-[8pt] font-medium uppercase tracking-[0.12em]">Size · {(override?.dimensions ?? product.dimensions) || "Made to order"}</p>
                      </div>
                    </section>
                  );
                })}
              </div>
              <PageFooter page={currentPage} />
            </article>
          );
        });
      })}

      <article className="lookbook-page relative flex h-[297mm] w-[210mm] flex-col justify-between overflow-hidden bg-foreground px-14 py-14 text-background shadow-editorial">
        <div>
          <img src={assetUrl(content.logoImage)} alt="Veta Vera Studio" className="h-auto w-[125mm] mix-blend-screen" />
          <p className="mt-20 text-[8pt] uppercase tracking-[0.22em] text-gold">Trade enquiries</p>
          <h2 className="mt-5 max-w-[150mm] font-serif text-[38pt] leading-tight">Bring Ghanaian craft into your collection.</h2>
          <p className="mt-8 max-w-[120mm] text-[11pt] leading-relaxed text-background/70">For wholesale orders, custom colourways, interior projects and collector commissions, speak directly with our studio.</p>
        </div>
        <div className="grid gap-5 border-t border-background/20 pt-8 text-[10pt]">
          <p>{content.contactEmail}</p><p>{content.contactPhone}</p><p>{content.contactAddress}</p><p className="mt-4 text-[8pt] uppercase tracking-[0.18em] text-gold">vetaverastudio.com · @vetaverastudio</p>
        </div>
      </article>
    </div>
  );
}

function PageFooter({ page }: { page: number }) {
  return (
    <footer className="mt-7 flex items-center justify-between border-t border-border pt-3 text-[6.5pt] uppercase tracking-[0.16em] text-muted-foreground">
      <span>Veta Vera Studio · Trade Lookbook</span><span>{String(page).padStart(2, "0")}</span>
    </footer>
  );
}