import { supabase } from "@/integrations/supabase/client";
import type {
  Category,
  HomepageContent,
  JournalEntry,
  LookbookContent,
  Order,
  Product,
  Review,
  StoreSettings,
  Subscriber,
} from "@/types";

/* ------------------------------------------------------------------ mappers */

type Row = Record<string, unknown>;

const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback);
const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "string" ? Number.parseFloat(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
};
const bool = (v: unknown, fallback = false): boolean =>
  typeof v === "boolean" ? v : fallback;
const arr = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

export function mapProduct(row: Row): Product {
  return {
    id: str(row["id"]),
    name: str(row["name"]),
    slug: str(row["slug"]),
    sku: str(row["sku"]),
    category: str(row["category"]),
    price: num(row["price"]),
    salePrice: row["sale_price"] == null ? null : num(row["sale_price"]),
    stockQuantity: num(row["stock_quantity"]),
    lowStockThreshold: num(row["low_stock_threshold"], 3),
    status: (str(row["status"], "active") as Product["status"]) ?? "active",
    featured: bool(row["featured"]),
    primaryImage: str(row["primary_image"]),
    images: arr(row["images"]),
    description: str(row["description"]),
    dimensions: str(row["dimensions"]),
    material: str(row["material"]),
    artisanStory: str(row["artisan_story"]),
    careInstructions: str(row["care_instructions"]),
    color: arr(row["color"]),
    tags: arr(row["tags"]),
    rating: num(row["rating"]),
    reviewCount: num(row["review_count"]),
    weightKg: num(row["weight_kg"]),
    capacity: str(row["capacity"]),
    handle: str(row["handle"]),
    lengthCm: row["length_cm"] == null ? null : num(row["length_cm"]),
    widthCm: row["width_cm"] == null ? null : num(row["width_cm"]),
    heightCm: row["height_cm"] == null ? null : num(row["height_cm"]),
    diameterCm: row["diameter_cm"] == null ? null : num(row["diameter_cm"]),
    colorDescription: str(row["color_description"]),
    videoUrl: str(row["video_url"]),
    videoLoop: row["video_loop"] === true,
    createdAt: str(row["created_at"]),
    updatedAt: str(row["updated_at"]),

  };
}

export function mapCategory(row: Row): Category {
  return {
    id: str(row["id"]),
    name: str(row["name"]),
    slug: str(row["slug"]),
    description: str(row["description"]),
    image: str(row["image"]),
    productCount: num(row["product_count"]),
    featured: bool(row["featured"]),
    sortOrder: num(row["sort_order"]),
  };
}

export function mapReview(row: Row): Review {
  return {
    id: str(row["id"]),
    productId: str(row["product_id"]),
    customerName: str(row["customer_name"]),
    rating: num(row["rating"]),
    title: str(row["title"]),
    comment: str(row["comment"]),
    isApproved: bool(row["is_approved"]),
    isFeatured: bool(row["is_featured"]),
    isVerifiedPurchase: bool(row["is_verified_purchase"]),
    createdAt: str(row["created_at"]),
  };
}

export function mapOrder(row: Row): Order {
  const customer = (row["customer"] ?? {}) as Order["customer"];
  const items = Array.isArray(row["items"]) ? (row["items"] as Order["items"]) : [];
  return {
    id: str(row["id"]),
    orderNumber: str(row["order_number"]),
    customer,
    items,
    subtotal: num(row["subtotal"]),
    shippingCost: num(row["shipping_cost"]),
    tax: num(row["tax"]),
    discount: num(row["discount"]),
    total: num(row["total"]),
    paymentMethod: str(row["payment_method"]),
    paymentStatus: str(row["payment_status"], "pending") as Order["paymentStatus"],
    fulfillmentStatus: str(
      row["fulfillment_status"],
      "unfulfilled",
    ) as Order["fulfillmentStatus"],
    trackingNumber: row["tracking_number"] == null ? null : str(row["tracking_number"]),
    trackingCarrier: row["tracking_carrier"] == null ? null : str(row["tracking_carrier"]),
    customerNotes: row["customer_notes"] == null ? null : str(row["customer_notes"]),
    currency: str(row["currency"], "USD"),
    createdAt: str(row["created_at"]),
  };
}

export function mapJournal(row: Row): JournalEntry {
  return {
    id: str(row["id"]),
    title: str(row["title"]),
    slug: str(row["slug"]),
    excerpt: str(row["excerpt"]),
    content: str(row["content"]),
    coverImage: str(row["cover_image"]),
    author: str(row["author"], "Veta Vera Studio"),
    readTime: num(row["read_time"], 4),
    publishedAt: str(row["published_at"]),
    tags: arr(row["tags"]),
  };
}

export function mapSubscriber(row: Row): Subscriber {
  return {
    id: str(row["id"]),
    email: str(row["email"]),
    status: str(row["status"], "subscribed"),
    source: str(row["source"]),
    createdAt: str(row["created_at"]),
  };
}

export function mapSettings(row: Row): StoreSettings {
  const rates = (row["currency_rates"] ?? {}) as StoreSettings["currencyRates"];
  return {
    currencyRates: rates,
    taxRate: num(row["tax_rate"], 0.05),
    shippingDomestic: num(row["shipping_domestic"], 12),
    shippingInternational: num(row["shipping_international"], 68),
    shippingLabel: str(row["shipping_label"], "Worldwide Express Shipping"),
    shippingAdditionalItem: num(row["shipping_additional_item"], 40),
    shippingCarrier: str(
      row["shipping_carrier"],
      "Tracked air courier via DHL Express / FedEx",
    ),
    shippingTransitTime: str(row["shipping_transit_time"], "7 - 10 Business Days"),
    freeShippingThreshold: num(row["free_shipping_threshold"], 700),
    announcement: str(row["announcement"]),
    supportEmail: str(row["support_email"]),
    supportPhone: str(row["support_phone"]),
  };
}

export function mapHomepage(row: Row): HomepageContent {
  const list = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
  return {
    heroSlides: list(row["hero_slides"]),
    valuePillars: list(row["value_pillars"]),
    weaverSpotlights: list(row["weaver_spotlights"]),
    processSteps: list(row["process_steps"]),
    campaignCards: list(row["campaign_cards"]),
    instagramPosts: list(row["instagram_posts"]),
  };
}

export function mapLookbook(row: Row): LookbookContent {
  const overrides = row["product_overrides"];
  return {
    title: str(row["title"], "Trade Lookbook"),
    edition: str(row["edition"], "Handwoven in Ghana"),
    companyProfile: str(row["company_profile"]),
    coverImage: str(row["cover_image"]),
    logoImage: str(row["logo_image"]),
    weaverImage: str(row["weaver_image"]),
    contactEmail: str(row["contact_email"]),
    contactPhone: str(row["contact_phone"]),
    contactAddress: str(row["contact_address"]),
    productOverrides:
      overrides && typeof overrides === "object" && !Array.isArray(overrides)
        ? (overrides as LookbookContent["productOverrides"])
        : {},
    productOrder: arr(row["product_order"]),
    excludedProductIds: arr(row["excluded_product_ids"]),
  };
}

/* ------------------------------------------------------------------ queries */

const db = supabase as unknown as {
  rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
  from: (table: string) => {
    select: (cols?: string) => any;
    insert: (values: unknown) => any;
    update: (values: unknown) => any;
    upsert: (values: unknown) => any;
    delete: () => any;
  };
};

async function rows(query: Promise<{ data: unknown; error: unknown }>): Promise<Row[]> {
  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? (data as Row[]) : [];
}

export async function fetchProducts(): Promise<Product[]> {
  return (
    await rows(
      db.from("products").select("*").eq("status", "active").order("created_at", {
        ascending: false,
      }),
    )
  ).map(mapProduct);
}

export async function fetchAllProducts(): Promise<Product[]> {
  return (
    await rows(db.from("products").select("*").order("created_at", { ascending: false }))
  ).map(mapProduct);
}

export async function fetchCategories(): Promise<Category[]> {
  return (
    await rows(db.from("categories").select("*").order("sort_order", { ascending: true }))
  ).map(mapCategory);
}

export async function fetchApprovedReviews(): Promise<Review[]> {
  return (
    await rows(
      db
        .from("reviews")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false }),
    )
  ).map(mapReview);
}

export async function fetchAllReviews(): Promise<Review[]> {
  return (
    await rows(db.from("reviews").select("*").order("created_at", { ascending: false }))
  ).map(mapReview);
}

export async function fetchOrders(): Promise<Order[]> {
  return (
    await rows(db.from("orders").select("*").order("created_at", { ascending: false }))
  ).map(mapOrder);
}

export async function fetchJournal(): Promise<JournalEntry[]> {
  return (
    await rows(db.from("journal").select("*").order("published_at", { ascending: false }))
  ).map(mapJournal);
}

export async function fetchSubscribers(): Promise<Subscriber[]> {
  return (
    await rows(db.from("subscribers").select("*").order("created_at", { ascending: false }))
  ).map(mapSubscriber);
}

export async function fetchSettings(): Promise<StoreSettings> {
  const { data, error } = await db
    .from("store_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("No store settings");
  return mapSettings(data as Row);
}

export async function fetchHomepage(): Promise<HomepageContent> {
  const { data, error } = await db
    .from("cms_homepage")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("No homepage content");
  return mapHomepage(data as Row);
}

export async function fetchLookbook(): Promise<LookbookContent | null> {
  const { data, error } = await db
    .from("cms_lookbook")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  if (error) throw error;
  return data ? mapLookbook(data as Row) : null;
}

/* ---------------------------------------------------------------- mutations */

export async function subscribeEmail(email: string): Promise<void> {
  const { error } = await db
    .from("subscribers")
    .insert({ email: email.toLowerCase(), source: "footer_newsletter" });
  if (error && !String((error as { message?: string }).message ?? "").includes("duplicate")) {
    throw error;
  }
}

export async function submitReview(input: {
  productId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
}): Promise<void> {
  const { error } = await db.from("reviews").insert({
    product_id: input.productId,
    customer_name: input.customerName,
    rating: input.rating,
    title: input.title,
    comment: input.comment,
    is_approved: false,
  });
  if (error) throw error;
}

export interface OrderDraft {
  customer: Order["customer"];
  cart: Array<{ productId: string; quantity: number }>;
  shippingMethod: "standard" | "express";
  paymentMethod: string;
  currency: string;
  promoCode: string;
  customerNotes: string;
}

export async function createOrder(draft: OrderDraft): Promise<{
  orderNumber: string;
  checkoutToken: string;
}> {
  const { data, error } = await db.rpc("create_secure_order", {
    _customer: draft.customer,
    _cart: draft.cart,
    _shipping_method: draft.shippingMethod,
    _payment_method: draft.paymentMethod,
    _promo_code: draft.promoCode,
    _currency: draft.currency,
    _customer_notes: draft.customerNotes,
  });
  if (error) throw error;
  const order = Array.isArray(data) ? (data[0] as Row | undefined) : undefined;
  if (!order) throw new Error("The order could not be created");
  const orderNumber = str(order["order_number"]);
  const checkoutToken = str(order["checkout_token"]);
  if (!orderNumber || !checkoutToken) throw new Error("The order could not be created");
  return { orderNumber, checkoutToken };
}

export async function upsertProduct(values: Row & { id?: string }): Promise<void> {
  const { id, ...rest } = values;

  // Duplicate slug/SKU is the most common upload snag — retry once with a
  // unique suffix so the admin never loses a filled-in form.
  const attempt = async (payload: Row) =>
    id
      ? await db.from("products").update(payload).eq("id", id)
      : await db.from("products").insert(payload);

  let { error } = await attempt(rest);

  if (error && /duplicate key|unique/i.test(error.message)) {
    const suffix = Date.now().toString(36).slice(-4);
    const retry = { ...rest } as Row;
    if (typeof retry["slug"] === "string") retry["slug"] = `${retry["slug"]}-${suffix}`;
    if (typeof retry["sku"] === "string") retry["sku"] = `${retry["sku"]}-${suffix}`;
    ({ error } = await attempt(retry));
  }

  if (error) throw error;
}


export async function deleteRow(table: string, id: string): Promise<void> {
  const { error } = await db.from(table).delete().eq("id", id);
  if (error) throw error;
}

export async function updateRow(table: string, id: string, values: Row): Promise<void> {
  const { error } = await db.from(table).update(values).eq("id", id);
  if (error) throw error;
}

export async function insertRow(table: string, values: Row): Promise<void> {
  const { error } = await db.from(table).insert(values);
  if (error) throw error;
}

export async function upsertSingleton(table: string, values: Row): Promise<void> {
  const { error } = await db.from(table).upsert({ id: "default", ...values });
  if (error) throw error;
}
