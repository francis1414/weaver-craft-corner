# Veta Vera Trade Lookbook

## Goal
Add an editable Trade Lookbook workspace to the admin dashboard and generate a clean, print-ready PDF without product prices.

## What will be built
- Add a **Trade Lookbook** item to the admin menu.
- Create an editor for the cover, company profile, contact details, and product catalogue.
- Use the supplied logo, studio portrait, and master-weaver photograph.
- Pull every active shop product into three ordered sections:
  - Sculptural Basket Collection
  - Lampshade Collection
  - Wall Fans
- Show each product’s primary photograph, concise description, size, and SKU; omit all prices.
- Allow product inclusion, order, description, and size to be adjusted before export.
- Add a polished A4 preview and a **Download / Print PDF** action.

## Page design
1. **Cover** — full-page studio photograph, logo, “Trade Lookbook”, and editable email, address, and phone.
2. **Company profile** — concise studio story paired with the master-weaver photograph.
3. **Collection openers and product pages** — editorial grids grouped by category, with consistent image crops and restrained product details.
4. **Closing contact page** — trade enquiry details and studio identity.

## Editable content and persistence
- Store lookbook copy, contact details, product order, visibility, and per-product text overrides in Lovable Cloud.
- Start with all 18 currently active products included.
- New active products can be added from the editor without rebuilding the PDF feature.

## Technical details
- Add a protected `cms_lookbook` table with explicit grants and administrator-only access.
- Reuse existing product data, media URLs, design tokens, and admin controls.
- Use browser print-to-PDF for crisp A4 output and reliable image quality without adding a heavy PDF service.
- Add print-specific styles so only the lookbook pages appear in the exported file.
- Verify the editor and PDF preview at desktop and mobile dashboard sizes, then inspect every exported PDF page for clipping, overlap, image failures, and ordering.
