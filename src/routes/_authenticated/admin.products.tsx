import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Copy, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAdminCategories, useAdminProducts } from "@/hooks/use-store-data";
import { deleteRow, updateRow, upsertProduct } from "@/lib/store-api";
import type { Product } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

const slugify = (v: string) =>
  v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const DYE_TONES = [
  "Natural Straw",
  "Charcoal Black",
  "Savannah Gold",
  "Indigo Blue",
  "Terracotta Red",
  "Sage Green",
  "Burnt Orange",
  "Dusty Pink",
  "Ochre Yellow",
  "Deep Plum",
];

const emptyDraft = {
  name: "",
  slug: "",
  sku: "",
  category: "sculpture",
  price: 0,
  salePrice: "",
  stockQuantity: 0,
  lowStockThreshold: 3,
  status: "active" as Product["status"],
  featured: false,
  primaryImage: "",
  images: "",
  description: "",
  dimensions: "",
  material: "Veta Vera elephant grass",
  artisanStory: "",
  careInstructions: "",
  color: [] as string[],
  colorDescription: "",
  tags: "",
  weightKg: 1,
  capacity: "",
  handle: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  diameterCm: "",
  videoUrl: "",
  videoLoop: true,
};

type Draft = typeof emptyDraft & { id?: string };


type StatusFilter = "all" | "active" | "draft" | "low" | "archived";

function AdminProducts() {
  const { data: products = [], isLoading } = useAdminProducts();
  const { data: categories = [] } = useAdminCategories();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["products"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
  };

  const visible = useMemo(
    () =>
      products.filter((p) => {
        const q = search.trim().toLowerCase();
        if (q && !`${p.name} ${p.sku} ${p.slug}`.toLowerCase().includes(q)) return false;
        if (category !== "all" && p.category !== category) return false;
        if (status === "low") return p.stockQuantity <= p.lowStockThreshold;
        if (status !== "all" && p.status !== status) return false;
        return true;
      }),
    [products, search, category, status],
  );

  const toDraft = (p: Product): Draft => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    category: p.category,
    price: p.price,
    salePrice: p.salePrice == null ? "" : String(p.salePrice),
    stockQuantity: p.stockQuantity,
    lowStockThreshold: p.lowStockThreshold,
    status: p.status,
    featured: p.featured,
    primaryImage: p.primaryImage,
    images: p.images.join("\n"),
    description: p.description,
    dimensions: p.dimensions,
    material: p.material,
    artisanStory: p.artisanStory,
    careInstructions: p.careInstructions,
    color: p.color,
    colorDescription: p.colorDescription,
    tags: p.tags.join(", "),
    weightKg: p.weightKg,
    capacity: p.capacity,
    handle: p.handle,
    lengthCm: p.lengthCm == null ? "" : String(p.lengthCm),
    widthCm: p.widthCm == null ? "" : String(p.widthCm),
    heightCm: p.heightCm == null ? "" : String(p.heightCm),
    diameterCm: p.diameterCm == null ? "" : String(p.diameterCm),
    videoUrl: p.videoUrl,
    videoLoop: p.videoLoop,
  });


  async function save() {
    if (!draft) return;
    setBusy(true);
    try {
      const list = (v: string, sep: RegExp) =>
        v
          .split(sep)
          .map((s) => s.trim())
          .filter(Boolean);
      await upsertProduct({
        ...(draft.id ? { id: draft.id } : {}),
        name: draft.name,
        slug: draft.slug || slugify(draft.name),
        sku: draft.sku || `VS-${slugify(draft.name).slice(0, 8).toUpperCase()}`,
        category: draft.category,
        price: Number(draft.price) || 0,
        sale_price: draft.salePrice === "" ? null : Number(draft.salePrice),
        stock_quantity: Number(draft.stockQuantity) || 0,
        low_stock_threshold: Number(draft.lowStockThreshold) || 3,
        status: draft.status,
        featured: draft.featured,
        primary_image: draft.primaryImage,
        images: list(draft.images, /\n/),
        description: draft.description,
        dimensions: draft.dimensions,
        material: draft.material,
        artisan_story: draft.artisanStory,
        care_instructions: draft.careInstructions,
        color: list(draft.color, /,/),
        tags: list(draft.tags, /,/),
        weight_kg: Number(draft.weightKg) || 1,
        capacity: draft.capacity,
        handle: draft.handle,
      });
      toast.success(draft.id ? "Product updated" : "Product created");
      setDraft(null);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function duplicate(product: Product) {
    try {
      const copy = toDraft(product);
      delete copy.id;
      await upsertProduct({
        name: `${product.name} (copy)`,
        slug: `${product.slug}-copy-${Date.now().toString(36)}`,
        sku: `${product.sku}-C`,
        category: product.category,
        price: product.price,
        sale_price: product.salePrice,
        stock_quantity: product.stockQuantity,
        low_stock_threshold: product.lowStockThreshold,
        status: "draft",
        featured: false,
        primary_image: product.primaryImage,
        images: product.images,
        description: product.description,
        dimensions: product.dimensions,
        material: product.material,
        artisan_story: product.artisanStory,
        care_instructions: product.careInstructions,
        color: product.color,
        tags: product.tags,
        weight_kg: product.weightKg,
        capacity: product.capacity,
        handle: product.handle,
      });
      toast.success("Duplicated as draft");
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Duplicate failed");
    }
  }

  async function setStatusFor(product: Product, next: Product["status"]) {
    try {
      await updateRow("products", product.id, { status: next });
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  }

  async function remove(product: Product) {
    if (!window.confirm(`Delete “${product.name}” permanently?`)) return;
    try {
      await deleteRow("products", product.id);
      toast.success("Product deleted");
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Product catalogue</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} pieces on file.</p>
        </div>
        <Button onClick={() => setDraft({ ...emptyDraft })}>
          <Plus className="mr-2 h-4 w-4" /> New product
        </Button>
      </header>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search name or SKU"
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2">
          {(["all", "active", "draft", "low", "archived"] as StatusFilter[]).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={status === s ? "default" : "outline"}
              onClick={() => setStatus(s)}
            >
              {s === "low" ? "Low stock" : s[0]!.toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={6}>
                  Loading catalogue…
                </td>
              </tr>
            )}
            {!isLoading && visible.length === 0 && (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={6}>
                  No products match these filters.
                </td>
              </tr>
            )}
            {visible.map((product) => (
              <tr key={product.id}>
                <td className="p-4">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.sku}</p>
                </td>
                <td className="p-4 text-muted-foreground">{product.category}</td>
                <td className="p-4">
                  ${product.price.toFixed(2)}
                  {product.salePrice != null && (
                    <span className="ml-1 text-primary">${product.salePrice.toFixed(2)}</span>
                  )}
                </td>
                <td className="p-4">
                  <span
                    className={
                      product.stockQuantity <= product.lowStockThreshold ? "text-destructive" : ""
                    }
                  >
                    {product.stockQuantity}
                  </span>
                </td>
                <td className="p-4">
                  <Badge variant={product.status === "active" ? "secondary" : "outline"}>
                    {product.status}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-1">
                    <Button variant="outline" size="sm" onClick={() => setDraft(toDraft(product))}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => duplicate(product)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setStatusFor(product, product.status === "archived" ? "active" : "archived")
                      }
                    >
                      {product.status === "archived" ? "Restore" : "Archive"}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(product)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {draft?.id ? "Edit product" : "New product"}
            </DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" className="sm:col-span-2">
                <Input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      name: e.target.value,
                      slug: draft.id ? draft.slug : slugify(e.target.value),
                    })
                  }
                />
              </Field>
              <Field label="Slug">
                <Input
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                />
              </Field>
              <Field label="SKU">
                <Input
                  value={draft.sku}
                  onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
                  placeholder="auto-generated when blank"
                />
              </Field>
              <Field label="Category">
                <Select
                  value={draft.category}
                  onValueChange={(v) => setDraft({ ...draft, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories.length > 0
                      ? categories.map((c) => c.slug)
                      : ["sculpture", "lampshade", "fans", "storage", "planter", "tote", "pet-bed"]
                    ).map((slug) => (
                      <SelectItem key={slug} value={slug}>
                        {slug}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status">
                <Select
                  value={draft.status}
                  onValueChange={(v) => setDraft({ ...draft, status: v as Product["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Price (USD)">
                <Input
                  type="number"
                  step="0.01"
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                />
              </Field>
              <Field label="Sale price (blank = none)">
                <Input
                  type="number"
                  step="0.01"
                  value={draft.salePrice}
                  onChange={(e) => setDraft({ ...draft, salePrice: e.target.value })}
                />
              </Field>
              <Field label="Stock quantity">
                <Input
                  type="number"
                  value={draft.stockQuantity}
                  onChange={(e) => setDraft({ ...draft, stockQuantity: Number(e.target.value) })}
                />
              </Field>
              <Field label="Low stock alert level">
                <Input
                  type="number"
                  value={draft.lowStockThreshold}
                  onChange={(e) =>
                    setDraft({ ...draft, lowStockThreshold: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Primary image URL" className="sm:col-span-2">
                <Input
                  value={draft.primaryImage}
                  onChange={(e) => setDraft({ ...draft, primaryImage: e.target.value })}
                />
              </Field>
              <Field label="Gallery image URLs (one per line)" className="sm:col-span-2">
                <Textarea
                  rows={3}
                  value={draft.images}
                  onChange={(e) => setDraft({ ...draft, images: e.target.value })}
                />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <Textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </Field>
              <Field label="Dimensions">
                <Input
                  value={draft.dimensions}
                  onChange={(e) => setDraft({ ...draft, dimensions: e.target.value })}
                />
              </Field>
              <Field label="Material">
                <Input
                  value={draft.material}
                  onChange={(e) => setDraft({ ...draft, material: e.target.value })}
                />
              </Field>
              <Field label="Capacity">
                <Input
                  value={draft.capacity}
                  onChange={(e) => setDraft({ ...draft, capacity: e.target.value })}
                />
              </Field>
              <Field label="Handle / trim">
                <Input
                  value={draft.handle}
                  onChange={(e) => setDraft({ ...draft, handle: e.target.value })}
                />
              </Field>
              <Field label="Weight (kg)">
                <Input
                  type="number"
                  step="0.1"
                  value={draft.weightKg}
                  onChange={(e) => setDraft({ ...draft, weightKg: Number(e.target.value) })}
                />
              </Field>
              <Field label="Colours (comma separated)">
                <Input
                  value={draft.color}
                  onChange={(e) => setDraft({ ...draft, color: e.target.value })}
                />
              </Field>
              <Field label="Tags (comma separated)" className="sm:col-span-2">
                <Input
                  value={draft.tags}
                  onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
                />
              </Field>
              <Field label="Artisan story" className="sm:col-span-2">
                <Textarea
                  rows={3}
                  value={draft.artisanStory}
                  onChange={(e) => setDraft({ ...draft, artisanStory: e.target.value })}
                />
              </Field>
              <Field label="Care instructions" className="sm:col-span-2">
                <Textarea
                  rows={3}
                  value={draft.careInstructions}
                  onChange={(e) => setDraft({ ...draft, careInstructions: e.target.value })}
                />
              </Field>
              <div className="flex items-center justify-between rounded-md border border-border p-3 sm:col-span-2">
                <Label>Featured on homepage</Label>
                <Switch
                  checked={draft.featured}
                  onCheckedChange={(checked) => setDraft({ ...draft, featured: checked })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={busy}>
              Save product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
