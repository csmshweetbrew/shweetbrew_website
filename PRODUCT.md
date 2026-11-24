# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A broad mix of people living in Israel, confirmed by the owner:

- Israelis, including people discovering biltong for the first time.
- South African expats who grew up on biltong and boerewors.
- Americans living in Israel (the jerky line speaks to them).
- Gift buyers sending a bag to someone else.
- Gym-goers buying for the protein and nutrition.

No single group dominates, so the site must explain what biltong, boerewors and drywors are for newcomers without talking down to people who already know.

## Product Purpose

Shweet Brew is a small Modiin-based maker of South African cured meats (biltong, boerewors, drywors), American-style beef and chicken jerky (the Holy Land Jerky line), Shweet Brew Shots and sauces, delivered across Israel. The website exists to make people want the product and then order it on the site. Success is a visitor placing an order in the cart with a clear idea of what they bought.

## Positioning

South African cured-meat craft made in Israel by a South African–Israeli maker: real biltong recipes, small weekly batches, delivered nationwide, kosher options. A mass-market snack brand can't truthfully claim the SA roots, the weekly hand-made batch, or the personal WhatsApp ordering.

## Operating Context

- Ordering happens on the website: the cart saves orders in Supabase, tracked in the admin app (owner, 2026-11-19). WhatsApp (+972 58 413 2576) is for contacting us only, not for orders.
- Production day is Wednesday 12:00. Delivery days depend on the zone; Modiin (HQ) is free pickup or same day. Zones and prices live in `client/src/config/deliveryZones.ts`.
- Payment: cash, bank transfer, Bit. Minimum order applies for delivery.
- Product data (variants, sizes, prices in NIS, spice level 1–5, kosher flag, nutrition, availability) lives in `client/src/config/products.ts`.

## Capabilities and Constraints

- Single-page React + Vite + Tailwind v4 site, deployed as a static site on Netlify (GitHub Pages was dropped 2026-11-19).
- Fully bilingual English / Hebrew with RTL; the language toggle must stay.
- Cart, order form, product info modal, delivery-zone logic and FAQ are working features to keep.

## Brand Commitments

- The Shweet Brew logo (red SVG wordmark) stays.
- Hebrew + English with proper RTL stays.
- The current "Braai Fire & Blue Star" look and overall feel stay (owner's decision, 2026-11-17, after seeing replacement directions). Improvements refine this style rather than replace it; `design-system.md` is the visual authority.

## Evidence on Hand

- Real product photos for most lines (some product images are AI-generated or stock and should be replaced over time; the chilli bites image is Unsplash stock).
- A founders-at-a-braai photo used in About.
- Customer reviews in `ReviewsSection.tsx` (verify they are real before featuring them more prominently).
- Nutrition facts per variant in `products.ts`.
- No press, certifications documents, or sales numbers on hand; do not invent them.

## Product Principles

1. The cart is the finish line: every path should lead to a placed order. WhatsApp is there for questions.
2. Explain the meat, not just the mood: newcomers need to know what biltong is, gym-goers need the numbers, gift buyers need sizes.
3. Small-maker truth over big-brand gloss: weekly batches, a real person on the other end.
4. Hebrew is a first-class reader, not a translation.
