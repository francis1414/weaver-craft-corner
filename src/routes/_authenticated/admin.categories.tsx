import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import { MediaUploader } from "@/components/admin/MediaUploader";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SmartImage } from "@/components/SmartImage";
import { useAdminCategories } from "@/hooks/use-store-data";
import { deleteRow, insertRow, updateRow } from "@/lib/store-api";
import type { Category } from "@/types";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: AdminCategories,
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const empty = {
  name: "",
  slug: "",
  description: "",
  image: "",
  productCount: 0,
  featured: false,
  sortOrder: 0,
};

type Draft = typeof empty & { id?: string };

function AdminCategories() {
  const { data: categories = [], isLoading } = useAdminCategories();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["categories"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
  };

  const toDraft = (c: Category): Draft => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    productCount: c.productCount,
    featured: c.featured,
    sortOrder: c.sortOrder,
  });

  async function save() {
    if (!draft) return;
    setBusy(true);
    try {
      const values = {
        name: draft.name,
        slug: draft.slug || slugify(draft.name),
        description: draft.description,
        image: draft.image,
        product_count: Number(draft.productCount) || 0,
        featured: draft.featured,
        sort_order: Number(draft.sortOrder) || 0,
      };
      if (draft.id) await updateRow("categories", draft.id, values);
      else await insertRow("categories", values);
      toast.success(draft.id ? "Category updated" : "Category created");
      setDraft(null);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(category: Category) {
    if (!window.confirm(`Delete “${category.name}”?`)) return;
    try {
      await deleteRow("categories", category.id);
      toast.success("Category deleted");
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  async function move(category: Category, direction: -1 | 1) {
    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sorted.findIndex((c) => c.id === category.id);
    const swap = sorted[index + direction];
    if (!swap) return;
    try {
      await updateRow("categories", category.id, { sort_order: swap.sortOrder });
      await updateRow("categories", swap.id, { sort_order: category.sortOrder });
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reorder failed");
    }
  }

  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Shop by craft</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            These categories drive the homepage “Shop by craft” grid and shop filters.
          </p>
        </div>
        <Button onClick={() => setDraft({ ...empty, sortOrder: sorted.length })}>
          <Plus className="mr-2 h-4 w-4" /> New category
        </Button>
      </header>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading categories…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((category, i) => (
            <div key={category.id} className="rounded-lg border border-border bg-card p-4">
              <SmartImage
                src={category.image}
                alt={category.name}
                ratio="4/3"
                className="rounded-md"
              />
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-serif text-lg">{category.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    /{category.slug} · {category.productCount} pieces
                    {category.featured ? " · featured" : ""}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={i === 0}
                    onClick={() => move(category, -1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={i === sorted.length - 1}
                    onClick={() => move(category, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {category.description}
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setDraft(toDraft(category))}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => remove(category)}>
                  <Trash2 className="mr-1 h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {draft?.id ? "Edit category" : "New category"}
            </DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
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
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Match a product category key (sculpture, lampshade, fans, storage, planter,
                  tote, pet-bed) so shop filters line up.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="sr-only">Banner image</Label>
                <MediaUploader
                  label="Banner image"
                  value={draft.image ? [draft.image] : []}
                  onChange={(next: string[]) => setDraft({ ...draft, image: next[0] ?? "" })}
                  multiple={false}
                  accept="image/*"
                  folder="categories"
                  max={1}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product count badge</Label>
                  <Input
                    type="number"
                    value={draft.productCount}
                    onChange={(e) =>
                      setDraft({ ...draft, productCount: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sort order</Label>
                  <Input
                    type="number"
                    value={draft.sortOrder}
                    onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
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
              Save category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
