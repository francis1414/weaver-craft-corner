import heroAsset from "@/assets/bolga-hero.jpg.asset.json";
import sculptureAsset from "@/assets/product-sculpture.jpg.asset.json";
import lampshadeAsset from "@/assets/product-lampshade.jpg.asset.json";
import fanAsset from "@/assets/product-fan.jpg.asset.json";
import storageAsset from "@/assets/product-storage.jpg.asset.json";
import planterAsset from "@/assets/planter.jpg.asset.json";
import toteAsset from "@/assets/tote.jpg.asset.json";
import petbedAsset from "@/assets/petbed.jpg.asset.json";
import weavingCircleAsset from "@/assets/story-weaving-circle.jpg.asset.json";
import artisanBaseAsset from "@/assets/story-artisan-base.jpg.asset.json";
import artisanCoilAsset from "@/assets/story-artisan-coil.png.asset.json";
import weaverPortraitAsset from "@/assets/story-weaver-veta.png.asset.json";
import basketInteriorAsset from "@/assets/story-basket-interior.png.asset.json";
import storyFilmAsset from "@/assets/story-film.mp4.asset.json";

import type {
  Category,
  HomepageContent,
  JournalEntry,
  Product,
  Review,
  StoreSettings,
} from "@/types";

import { assetUrl } from "@/lib/asset-url";

export { assetUrl } from "@/lib/asset-url";

export const IMAGES = {
  hero: assetUrl(heroAsset.url),
  sculpture: assetUrl(sculptureAsset.url),
  lampshade: assetUrl(lampshadeAsset.url),
  fan: assetUrl(fanAsset.url),
  storage: assetUrl(storageAsset.url),
  planter: assetUrl(planterAsset.url),
  tote: assetUrl(toteAsset.url),
  petbed: assetUrl(petbedAsset.url),
  artisan: assetUrl(weavingCircleAsset.url),
  weavingCircle: assetUrl(weavingCircleAsset.url),
  artisanBase: assetUrl(artisanBaseAsset.url),
  artisanCoil: assetUrl(artisanCoilAsset.url),
  weaverPortrait: assetUrl(weaverPortraitAsset.url),
  basketInterior: assetUrl(basketInteriorAsset.url),
  storyFilm: assetUrl(storyFilmAsset.url),
};

export const FALLBACK_IMAGE = IMAGES.hero;


const now = new Date().toISOString();

function product(partial: Partial<Product> & { name: string; slug: string }): Product {
  return {
    id: partial.slug,
    sku: "VS-DEMO",
    category: "sculpture",
    price: 180,
    salePrice: null,
    stockQuantity: 6,
    lowStockThreshold: 3,
    status: "active",
    featured: false,
    primaryImage: IMAGES.hero,
    images: [IMAGES.hero],
    description: "Handwoven elephant grass craft from Bolgatanga, Ghana.",
    dimensions: "40cm H x 40cm W",
    material: "Veta Vera elephant grass",
    artisanStory: "Woven by hand in a Bolgatanga cooperative.",
    careInstructions: "Mist with warm water and reshape by hand.",
    color: ["Natural Straw"],
    tags: [],
    rating: 4.8,
    reviewCount: 0,
    weightKg: 1.2,
    capacity: "",
    handle: "",
    lengthCm: null,
    widthCm: null,
    heightCm: null,
    diameterCm: null,
    colorDescription: "",
    videoUrl: "",
    videoLoop: true,

    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export const MOCK_PRODUCTS: Product[] = [
  product({
    name: "Zebra Fringe Sculpture Basket",
    slug: "zebra-fringe-sculpture-basket",
    price: 245,
    salePrice: 198,
    featured: true,
    primaryImage: IMAGES.hero,
    images: [IMAGES.hero, IMAGES.sculpture],
    color: ["Charcoal", "Natural Straw"],
    rating: 4.9,
    reviewCount: 3,
    stockQuantity: 4,
  }),
  product({
    name: "Sahel Vase Sculpture",
    slug: "sahel-vase-sculpture",
    price: 210,
    featured: true,
    primaryImage: IMAGES.sculpture,
    images: [IMAGES.sculpture, IMAGES.hero],
    color: ["Charcoal", "Natural Straw"],
  }),
  product({
    name: "Savannah Pendant Lampshade",
    slug: "savannah-pendant-lampshade",
    category: "lampshade",
    price: 185,
    featured: true,
    primaryImage: IMAGES.lampshade,
    images: [IMAGES.lampshade],
    color: ["Ochre", "Terracotta"],
    stockQuantity: 9,
  }),
  product({
    name: "Terracotta Sunburst Fan",
    slug: "terracotta-sunburst-fan",
    category: "fans",
    price: 68,
    featured: true,
    primaryImage: IMAGES.fan,
    images: [IMAGES.fan],
    color: ["Terracotta"],
    stockQuantity: 18,
  }),
  product({
    name: "Midnight Stripe Storage Basket",
    slug: "midnight-stripe-storage-basket",
    category: "storage",
    price: 158,
    featured: true,
    primaryImage: IMAGES.storage,
    images: [IMAGES.storage],
    color: ["Indigo", "Natural Straw"],
    stockQuantity: 11,
  }),
  product({
    name: "Sage Band Grass Planter",
    slug: "sage-band-grass-planter",
    category: "planter",
    price: 124,
    primaryImage: IMAGES.planter,
    images: [IMAGES.planter],
    color: ["Forest"],
  }),
  product({
    name: "Golden Check Market Tote",
    slug: "golden-check-market-tote",
    category: "tote",
    price: 132,
    featured: true,
    primaryImage: IMAGES.tote,
    images: [IMAGES.tote],
    color: ["Ochre"],
  }),
  product({
    name: "Charcoal Stripe Pet Nest",
    slug: "charcoal-stripe-pet-nest",
    category: "pet-bed",
    price: 118,
    primaryImage: IMAGES.petbed,
    images: [IMAGES.petbed],
    color: ["Charcoal"],
  }),
];

export const MOCK_CATEGORIES: Category[] = [
  {
    id: "sculpture",
    name: "Sculptural Baskets",
    slug: "sculpture",
    description: "Wild-fringed statement forms woven as living sculpture.",
    image: IMAGES.hero,
    productCount: 3,
    featured: true,
    sortOrder: 1,
  },
  {
    id: "lampshade",
    name: "Lampshades",
    slug: "lampshade",
    description: "Hand-coiled pendant shades that filter light into pattern.",
    image: IMAGES.lampshade,
    productCount: 2,
    featured: true,
    sortOrder: 2,
  },
  {
    id: "fans",
    name: "Woven Fans",
    slug: "fans",
    description: "Leather-trimmed hand fans in natural dye palettes.",
    image: IMAGES.fan,
    productCount: 2,
    featured: true,
    sortOrder: 3,
  },
  {
    id: "storage",
    name: "Storage Baskets",
    slug: "storage",
    description: "Deep, sturdy baskets for blankets, firewood and market days.",
    image: IMAGES.storage,
    productCount: 3,
    featured: true,
    sortOrder: 4,
  },
  {
    id: "planter",
    name: "Planters",
    slug: "planter",
    description: "Grass planters that soften architectural greenery.",
    image: IMAGES.planter,
    productCount: 2,
    featured: false,
    sortOrder: 5,
  },
  {
    id: "tote",
    name: "Market Totes",
    slug: "tote",
    description: "Leather-handled shoppers built for a lifetime of errands.",
    image: IMAGES.tote,
    productCount: 1,
    featured: true,
    sortOrder: 6,
  },
  {
    id: "pet-bed",
    name: "Pet Beds",
    slug: "pet-bed",
    description: "Round woven nests with washable cushions.",
    image: IMAGES.petbed,
    productCount: 1,
    featured: false,
    sortOrder: 7,
  },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    productId: "zebra-fringe-sculpture-basket",
    customerName: "Marguerite L.",
    rating: 5,
    title: "A living sculpture",
    comment:
      "It arrived folded, I misted it, and within an hour it opened into the most extraordinary object in my house.",
    isApproved: true,
    isFeatured: true,
    isVerifiedPurchase: true,
    createdAt: now,
  },
  {
    id: "r2",
    productId: "savannah-pendant-lampshade",
    customerName: "Ingrid S.",
    rating: 5,
    title: "Warm woven shadows",
    comment: "At night the pattern spills across the ceiling. Total transformation.",
    isApproved: true,
    isFeatured: true,
    isVerifiedPurchase: true,
    createdAt: now,
  },
  {
    id: "r3",
    productId: "midnight-stripe-storage-basket",
    customerName: "Rachel V.",
    rating: 5,
    title: "Handles are serious",
    comment: "Carried firewood all winter, still perfect.",
    isApproved: true,
    isFeatured: true,
    isVerifiedPurchase: true,
    createdAt: now,
  },
];

export const MOCK_JOURNAL: JournalEntry[] = [
  {
    id: "j1",
    title: "How a Bolga basket is born",
    slug: "how-a-bolga-basket-is-born",
    excerpt:
      "From the harmattan harvest of veta vera grass to the leather-bound rim, a basket passes through five sets of hands.",
    content:
      "Elephant grass is cut at the end of the rainy season, split by thumbnail, twisted into cord and dried in the sun before dyeing and weaving.",
    coverImage: IMAGES.artisan,
    author: "Veta Vera Studio",
    readTime: 6,
    publishedAt: now,
    tags: ["craft", "process"],
  },
  {
    id: "j2",
    title: "Reshaping a folded basket",
    slug: "reshaping-a-folded-basket",
    excerpt: "Your basket travels flat. Here is the ten-minute ritual that returns it to shape.",
    content: "Mist with warm water, press the walls outward, stuff loosely and leave overnight.",
    coverImage: IMAGES.hero,
    author: "Veta Vera Studio",
    readTime: 4,
    publishedAt: now,
    tags: ["care", "guide"],
  },
];

export const MOCK_SETTINGS: StoreSettings = {
  currencyRates: { USD: 1, EUR: 0.92, GBP: 0.79, GHS: 15.4, CAD: 1.36 },
  taxRate: 0.05,
  shippingDomestic: 12,
  shippingInternational: 68,
  shippingLabel: "Worldwide Express Shipping",
  shippingAdditionalItem: 40,
  shippingCarrier: "Tracked air courier via DHL Express / FedEx",
  shippingTransitTime: "7 - 10 Business Days",
  freeShippingThreshold: 700,
  announcement:
    "Free worldwide shipping on orders over $700 — every basket woven by us",
  supportEmail: "care@vetastudio.com",
  supportPhone: "+233 20 411 8802",
};

export const MOCK_HOMEPAGE: HomepageContent = {
  heroSlides: [
    {
      title: "Woven wild in Bolgatanga",
      subtitle:
        "Sculptural elephant grass baskets, made by hand and left unfinished where the weaver wanted it wild.",
      image: IMAGES.hero,
      badge: "2026 Harvest Collection",
      ctaLabel: "Shop Collection",
      ctaHref: "/shop",
    },
  ],
  valuePillars: [
    { title: "100% Veta Vera Grass", body: "Rain-fed, hand-cut, never synthetic." },
    { title: "Fair-Wage Certified", body: "Per-piece rates published, paid at collection." },
    { title: "Carbon-Neutral Shipping", body: "Every parcel offset at source." },
    { title: "Free Reshaping Guide", body: "Ten minutes and a spray bottle." },
  ],
  weaverSpotlights: [
    {
      name: "Ayamga Atinga",
      village: "Sumbrungu",
      years: 22,
      quote: "I leave the ends wild so you can see my hand in it.",
      image: IMAGES.weaverPortrait,
    },
  ],
  processSteps: [
    { step: "Harvesting", body: "Veta vera grass cut at the close of the rains and sun-dried." },
    { step: "Dyeing", body: "Roots, bark and indigo simmered in shared pots." },
    { step: "Weaving", body: "Started flat on the knee, counted from memory." },
    { step: "Leather Trimming", body: "Rims and handles stitched with waxed thread." },
    { step: "Reshaping", body: "Folded for travel, misted and shaped by you at home." },
  ],
  campaignCards: [
    {
      title: "Sale: Collector Sculptures",
      body: "Up to 20% off selected fringe pieces.",
      href: "/shop",
      image: IMAGES.sculpture,
    },
  ],
};

export const DYE_COLORS = [
  { name: "Ochre", swatch: "oklch(0.72 0.13 78)" },
  { name: "Indigo", swatch: "oklch(0.36 0.09 265)" },
  { name: "Terracotta", swatch: "oklch(0.6 0.13 40)" },
  { name: "Natural Straw", swatch: "oklch(0.88 0.05 88)" },
  { name: "Charcoal", swatch: "oklch(0.28 0.008 70)" },
  { name: "Forest", swatch: "oklch(0.44 0.028 154)" },
];
