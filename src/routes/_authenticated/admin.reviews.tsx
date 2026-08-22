import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminProducts, useAdminReviews } from "@/hooks/use-store-data";
import { deleteRow, updateRow } from "@/lib/store-api";

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  component: AdminReviews,
});

type Filter = "all" | "pending" | "approved" | "featured";

function AdminReviews() {
  const { data: reviews = [], isLoading } = useAdminReviews();
  const { data: products = [] } = useAdminProducts();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["reviews"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
  };

  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? "Unknown product";

  const visible = reviews.filter((r) =>
    filter === "pending"
      ? !r.isApproved
      : filter === "approved"
        ? r.isApproved
        : filter === "featured"
          ? r.isFeatured
          : true,
  );

  async function patch(id: string, values: Record<string, unknown>) {
    try {
      await updateRow("reviews", id, values);
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteRow("reviews", id);
      toast.success("Review deleted");
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Review moderation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Only approved reviews appear on the storefront.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "approved", "featured"] as Filter[]).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
          >
            {f[0]!.toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading reviews…</p>
      ) : visible.length === 0 ? (
        <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          No reviews in this view.
        </p>
      ) : (
        <ul className="space-y-4">
          {visible.map((review) => (
            <li key={review.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {review.title || "Untitled"}{" "}
                    <span className="text-muted-foreground">— {review.customerName}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {productName(review.productId)} ·{" "}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-sm">
                    {review.rating}
                    <Star className="h-4 w-4 fill-current text-primary" />
                  </span>
                  <Badge variant={review.isApproved ? "secondary" : "outline"}>
                    {review.isApproved ? "approved" : "pending"}
                  </Badge>
                  {review.isFeatured && <Badge>featured</Badge>}
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={review.isApproved ? "outline" : "default"}
                  onClick={() => patch(review.id, { is_approved: !review.isApproved })}
                >
                  <Check className="mr-1 h-4 w-4" />
                  {review.isApproved ? "Unapprove" : "Approve"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => patch(review.id, { is_featured: !review.isFeatured })}
                >
                  {review.isFeatured ? "Unfeature" : "Feature"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    patch(review.id, { is_verified_purchase: !review.isVerifiedPurchase })
                  }
                >
                  {review.isVerifiedPurchase ? "Unmark verified" : "Mark verified"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(review.id)}>
                  <Trash2 className="mr-1 h-4 w-4" /> Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
