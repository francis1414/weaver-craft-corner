import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import {
  fetchAllProducts,
  fetchAllReviews,
  fetchApprovedReviews,
  fetchCategories,
  fetchHomepage,
  fetchJournal,
  fetchOrders,
  fetchProducts,
  fetchSettings,
  fetchSubscribers,
} from "@/lib/store-api";
import {
  MOCK_CATEGORIES,
  MOCK_HOMEPAGE,
  MOCK_JOURNAL,
  MOCK_PRODUCTS,
  MOCK_REVIEWS,
  MOCK_SETTINGS,
} from "@/lib/mock-data";
import type {
  Category,
  HomepageContent,
  JournalEntry,
  Order,
  Product,
  Review,
  StoreSettings,
  Subscriber,
} from "@/types";

/**
 * Every storefront read falls back to bundled demo content so the app keeps
 * rendering during offline or restricted preview states.
 */
export function useProducts() {
  const query = useQuery<Product[]>({ queryKey: ["products"], queryFn: fetchProducts });
  return {
    ...query,
    data: query.data && query.data.length > 0 ? query.data : query.isLoading ? [] : MOCK_PRODUCTS,
  };
}

export function useAdminProducts() {
  return useQuery<Product[]>({ queryKey: ["admin", "products"], queryFn: fetchAllProducts });
}

export function useCategories() {
  const query = useQuery<Category[]>({ queryKey: ["categories"], queryFn: fetchCategories });
  return {
    ...query,
    data:
      query.data && query.data.length > 0 ? query.data : query.isLoading ? [] : MOCK_CATEGORIES,
  };
}

export function useReviews() {
  const query = useQuery<Review[]>({ queryKey: ["reviews"], queryFn: fetchApprovedReviews });
  return {
    ...query,
    data: query.data && query.data.length > 0 ? query.data : query.isLoading ? [] : MOCK_REVIEWS,
  };
}

export function useAdminReviews() {
  return useQuery<Review[]>({ queryKey: ["admin", "reviews"], queryFn: fetchAllReviews });
}

export function useOrders() {
  return useQuery<Order[]>({ queryKey: ["admin", "orders"], queryFn: fetchOrders });
}

export function useSubscribers() {
  return useQuery<Subscriber[]>({
    queryKey: ["admin", "subscribers"],
    queryFn: fetchSubscribers,
  });
}

export function useJournal() {
  const query = useQuery<JournalEntry[]>({ queryKey: ["journal"], queryFn: fetchJournal });
  return {
    ...query,
    data: query.data && query.data.length > 0 ? query.data : query.isLoading ? [] : MOCK_JOURNAL,
  };
}

export function useSettings(): StoreSettings {
  const query = useQuery<StoreSettings>({ queryKey: ["settings"], queryFn: fetchSettings });
  return query.data ?? MOCK_SETTINGS;
}

export function useHomepage(): HomepageContent {
  const query = useQuery<HomepageContent>({ queryKey: ["homepage"], queryFn: fetchHomepage });
  const data = query.data;
  if (!data || data.heroSlides.length === 0) return MOCK_HOMEPAGE;
  return data;
}

/** Live database subscription that refreshes cached reads as merchants edit. */
export function useRealtimeStore(tables: string[] = ["products", "orders", "reviews"]) {
  const queryClient = useQueryClient();
  const key = tables.join(",");

  useEffect(() => {
    const channel = supabase.channel(`vetastudio-${key}`);
    for (const table of key.split(",")) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        void queryClient.invalidateQueries({ queryKey: [table] });
        void queryClient.invalidateQueries({ queryKey: ["admin", table] });
      });
    }
    channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [key, queryClient]);
}
