# Security Hardening

## Goal
Protect orders, payments, administrator access, and public forms without disrupting the storefront or existing checkout experience.

## Changes
- Recalculate every order total from live product prices and store settings in the trusted backend; never accept browser-supplied prices, discounts, tax, shipping, currency rates, names, or images as authoritative.
- Validate product availability, quantities, customer details, notes, shipping choice, payment method, promo code, and currency before creating an order.
- Make order creation atomic and return the trusted order number, secure checkout token, and totals to the checkout page.
- Restrict payment return addresses and cross-site checkout calls to approved Veta Vera Studio, Lovable-hosted, preview, and local development origins.
- Make administrator bootstrap atomic so two simultaneous users cannot both claim the first administrator role; keep all privileged payment and dashboard operations role-checked on the server.
- Tighten newsletter insertion with normalized email validation, fixed source/status values, and duplicate protection at the database boundary.
- Enable leaked-password checks and require the current password for account password changes.
- Add practical response protections for sensitive endpoints, including request-size limits, safer errors, and security headers where applicable.
- Upgrade or override the vulnerable indirect YAML dependency if the framework supports the fixed release; otherwise document the upstream blocker rather than forcing an unsafe framework change.

## Existing public-data findings
- Keep public read access for categories, homepage content, journal articles, products, and storefront settings because visitors need these to use the shop.
- The published studio phone number is intentional contact information, not private customer data.
- Mark those scanner warnings as intentional only after the fixes are verified.

## Verification
- Run the security and dependency scans again.
- Test tampered prices, quantities, promo codes, currencies, checkout origins, and return addresses.
- Verify normal card and contact-to-pay checkout still create correct orders.
- Verify non-admin accounts cannot read or change administrator data.
