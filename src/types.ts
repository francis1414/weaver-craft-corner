export type ProductCategory =
  | "sculpture"
  | "lampshade"
  | "fans"
  | "storage"
  | "planter"
  | "tote"
  | "pet-bed";

export type ProductStatus = "active" | "draft" | "archived";

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: ProductCategory | string;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  status: ProductStatus;
  featured: boolean;
  primaryImage: string;
  images: string[];
  description: string;
  dimensions: string;
  material: string;
  artisanStory: string;
  careInstructions: string;
  color: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  weightKg: number;
  capacity: string;
  handle: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  featured: boolean;
  sortOrder: number;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  isApproved: boolean;
  isFeatured: boolean;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type FulfillmentStatus = "unfulfilled" | "processing" | "shipped" | "delivered";

export interface Order {
  id: string;
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  customerNotes: string | null;
  currency: string;
  createdAt: string;
}

export interface Subscriber {
  id: string;
  email: string;
  status: string;
  source: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  readTime: number;
  publishedAt: string;
  tags: string[];
}

export type CurrencyCode = "USD" | "EUR" | "GBP" | "GHS" | "CAD";

export interface StoreSettings {
  currencyRates: Record<CurrencyCode, number>;
  taxRate: number;
  shippingDomestic: number;
  shippingInternational: number;
  freeShippingThreshold: number;
  announcement: string;
  supportEmail: string;
  supportPhone: string;
}

export interface HeroSlide {
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface ValuePillar {
  title: string;
  body: string;
}

export interface WeaverSpotlight {
  name: string;
  village: string;
  years: number;
  quote: string;
  image: string;
}

export interface ProcessStep {
  step: string;
  body: string;
}

export interface CampaignCard {
  title: string;
  body: string;
  href: string;
  image: string;
}

export interface HomepageContent {
  heroSlides: HeroSlide[];
  valuePillars: ValuePillar[];
  weaverSpotlights: WeaverSpotlight[];
  processSteps: ProcessStep[];
  campaignCards: CampaignCard[];
}

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stockQuantity: number;
}

export interface WishlistEntry {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
}
