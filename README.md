# Artisan Gold

Create a full-stack, luxury e-commerce platform and comprehensive administrative back-office named "Vetastudio", dedicated to authentic handmade Bolgatanga baskets and indigenous Ghanaian elephant grass crafts. 

The application must combine a high-end, editorial storefront with a robust multi-module merchant back-office, powered by React 18, TypeScript, Tailwind CSS, Lucide icons, Motion animations, and Supabase real-time connection. Use real Bolga baskets like the photo attached

---

 1. DESIGN PHILOSOPHY & VISUAL SYSTEM

- **Palette**: Warm artisanal neutrals (`#FAF8F5` background, `#1F1D1A` charcoal primary text, `#C29B38` / `#A87C38` Savannah gold accents, `#4A5D4E` sage green earth tones, `#EFEBE4` warm stone borders).

- **Typography**: Editorial serif headings paired with clean sans-serif UI typography.

- **Image Performance**: Zero layout shifts with pre-allocated aspect ratios (`aspect-4/5`, `aspect-4/3`), blur-up placeholders with shimmering loading states, and fallback images for products and categories.

- **Responsive Architecture**: Fluid desktop-first navigation, sticky contextual mobile action drawers, slide-over filter panels, and intuitive touch targets (≥44px).

---

### 2. FIRESTORE DATABASE & SCHEMA ARCHITECTURE

Persist all application state in Firestore with the following core collections:

1. `products`: `id`, `name`, `slug`, `sku`, `category` (sculpture, lampshade, fans, storage, planter, tote, pet-bed), `price`, `salePrice`, `stockQuantity`, `lowStockThreshold`, `status` (`active` | `draft` | `archived`), `featured` (boolean), `primaryImage`, `images` (array), `description`, `dimensions`, `artisanStory`, `careInstructions`, `color` (array), `tags` (array), `rating`, `reviewCount`, `weightKg`, `createdAt`, `updatedAt`.

2. `orders`: `id`, `orderNumber`, `customer` (`name`, `email`, `phone`, `address`, `city`, `postalCode`, `country`), `items` (array with `productId`, `name`, `price`, `quantity`, `image`), `subtotal`, `shippingCost`, `tax`, `total`, `paymentMethod`, `paymentStatus` (`pending` | `paid` | `failed` | `refunded`), `fulfillmentStatus` (`unfulfilled` | `processing` | `shipped` | `delivered`), `trackingNumber`, `trackingCarrier`, `currency`, `createdAt`.

3. `categories`: `id`, `name`, `slug`, `description`, `image`, `productCount`, `featured`.

4. `subscribers`: `id`, `email`, `createdAt`, `status` (`subscribed`), `source` (`footer_newsletter`).

5. `reviews`: `id`, `productId`, `customerName`, `rating` (1–5), `title`, `comment`, `createdAt`, `isApproved`, `isVerifiedPurchase`.

6. `journal`: `id`, `title`, `slug`, `excerpt`, `content`, `coverImage`, `author`, `readTime`, `publishedAt`, `tags`.

7. `store_settings`: Global currency rates (USD, EUR, GBP, GHS, CAD), tax rates, flat-rate shipping tiers, free shipping threshold ($150+), and store announcements.

8. `cms_homepage`: Configurable hero carousel slides, brand values banner, weaver spotlights, process steps, and seasonal campaign cards.

---

### 3. STOREFRONT FEATURES & PAGES

#### A. Header, Navigation & Global Utilities

- **Announcement Banner**: Real-time ticker with currency toggle, free worldwide shipping countdown, and customer care contact info.

- **Header**: Responsive logo, navigation links with active state indicators, real-time live search with instant product suggestions dropdown, currency switcher (USD $, EUR €, GBP £, GHS ₵), Wishlist badge, Product Comparison tray counter, and Shopping Cart drawer trigger.

- **Persistent Bottom Bar (Mobile)**: Quick bottom navigation for Shop, Search, Wishlist, Compare, and Cart.

#### B. Homepage (`/`)

- **Hero Section**: Editorial split-screen featuring authentic photography, artisanal badges, and direct "Shop Collection" / "Artisan Story" CTA buttons.

- **Value Pillars**: 100% Sustainable Veta Vera Grass, Fair-Wage Artisan Certified, Carbon-Neutral Shipping, Free Reshaping Guide.

- **Curated Category Grid**: Interactive visual cards with product counts and hover zoom effects.

- **Featured Collection**: Tabbed showcase (All, Sculptural Baskets, Lampshades, Woven Fans, Sale Items) with skeleton loading screens.

- **Artisan Craftsmanship & Weaving Guide**: Step-by-step interactive timeline explaining Harvesting, Dyeing, Weaving, Leather Trimming, and Reshaping.

- **Newly Added Arrivals**: Live feed of latest active products.

- **Collector Testimonials & Video Stories**: Reviews carousel with star ratings and verified buyer badges.

#### C. Shop Catalog & Dynamic Filtering (`/shop`)

- **Multi-Dimensional Filter Sidebar & Mobile Drawer**:

  - Craft Categories with live product count badges.

  - Price Range Slider + quick-select budget presets ($0–$50, $50–$100, $100–$200, $200+).

  - Natural Dye Palette color swatches (Ochre, Indigo, Terracotta, Natural Straw, Charcoal, Forest).

  - Toggles: "In Stock Only" and "On Sale Only".

  - Active Filter Chips with individual remove and "Clear All" action.

- **Sort Dropdown with Directional Indicators**:

  - Featured, Newest (↓), Price: Low to High (↑), Price: High to Low (↓), Highest Rated (★ ↓), Alphabetical: A–Z (↑), and Alphabetical: Z–A (↓).

- **Empty State**: Friendly "No products found" container with a one-click "Reset Filters" button.

#### D. Product Detail Page (`/product/:slug`)

- **Image Gallery**: Multi-image thumbnail selector, full-resolution zoom on hover, and secondary image preview.

- **Purchase Panel**: Dynamic sale badges, real-time stock availability warning ("Only X left in stock"), quantity selector, "Add to Cart" with bounce confirmation, "Buy Now" instant checkout, "Add to Wishlist", and "Compare".

- **Artisan & Materials Accordion**: Dimensions, weaving technique, natural dye origin, elephant grass care & water spray reshaping manual.

- **Live Customer Reviews Section**:

  - Overall rating summary breakdown (1 to 5 stars).

  - List of verified collector reviews with dates and comments.

  - Interactive Review Submission Form allowing authenticated users to select star ratings, enter headlines, and submit feedback directly saved to Firestore.

- **Related Products Carousel**: Algorithmic recommendations based on category and style.

#### E. Cart Drawer, Wishlist, Product Compare & Checkout

- **Slide-Over Cart**: Real-time line item quantity increment/decrement, free shipping progress bar, promo code engine, and express checkout button.

- **Wishlist Modal / Page**: Saved favorites with 1-click transfer to cart.

- **Side-by-Side Product Comparison Modal**: Compares dimensions, material, capacity, handle leather, and price.

- **Full Checkout Flow**: Multi-step checkout with address validation, shipping method selection, discount coupon application, tax calculation, and order confirmation summary screen.

#### F. Supporting Pages & Footer

- **Artisan Story / About Page**: Mission, Bolgatanga cooperative background, fair-trade transparency.

- **Care & Reshaping Guide**: Step-by-step instructions with illustrations on how to reshape folded Bolga baskets using warm water spray.

- **Journal / Blog**: Educational articles on sustainable decor and African craftsmanship.

- **Footer**: Multi-column footer navigation, social links, store certifications, copyright, and an **Email Newsletter Subscription Component** that validates emails and stores them in the Firestore `subscribers` collection.

---

### 4. COMPREHENSIVE ADMIN DASHBOARD & BACK-OFFICE (`/admin`)

Provide a secure, PIN/password-protected administrative management suite with a dedicated sidebar navigation:

1. **Dashboard Overview**:

   - Total Gross Revenue, Total Orders, Active Product Count, Low Stock Alerts, and Newsletter Subscriber Count.

   - Revenue & Order Volume dynamic charts.

   - Recent Orders feed with instant fulfillment status updates.

2. **Product Catalog Manager**:

   - Tabular view with instant search, category filtering, and status filters (`All`, `Active`, `Draft`, `Low Stock`, `Archived`).

   - Create & Edit Product Modal: Product Name, SKU generator, Category, Price, Sale Price, Stock Quantity, Low Stock Alert Level, Featured toggle, Image URLs (primary & secondary gallery), Description, Dimensions, Material, Colors, and Tags.

   - One-click Duplicate, Archive, and Delete actions.

3. **Orders & Fulfillment Center**:

   - Filter orders by payment and fulfillment statuses (`Pending`, `Paid`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).

   - Order detail drawer: Line items, customer shipping address, payment method, customer notes.

   - Update tracking number and carrier (DHL Express, FedEx, Ghana Post), with instant status sync.

4. **Categories & Collections Manager**:

   - Create, edit, reorder, or delete craft categories with custom fallback banner images.

5. **Customer Reviews Moderation**:

   - Approve, feature, or remove submitted customer product reviews.

6. **Newsletter Subscribers List**:

   - View email subscribers, subscription date, and export to CSV.

7. **Homepage CMS Manager**:

   - Live editor for Hero Carousel slides, announcement bar text, weaver spotlight bios, and promotional banners.

8. **Store Settings & Currency**:

   - Configure global exchange rates, tax percentages, domestic/international shipping flat rates, and store contact info.

---

### 5. TECHNICAL CONSTRAINTS & STABILITY

- Complete TypeScript strict typing throughout all models, context hooks, and UI props.

- Client-side optimistic UI updates backed by Firestore listeners (`onSnapshot` / `getDocs` / `setDoc`).

- Resilient fallback mock data to ensure the entire application functions even during offline or restricted preview states.

- Clean modular component structure (`/src/components`, `/src/pages`, `/src/context`, `/src/hooks`, `/src/lib`, `/src/types.ts`).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://weaver-craft-corner.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dce0de66-0646-4c69-a17f-ba8fcbb0b794).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
