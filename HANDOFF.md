# Shweet Brew website — handoff notes

General knowledge for the next agent working on this site. Read this, then `design-system.md` (the visual source of truth) and `PRODUCT.md` (who the site is for). `CLAUDE.md` says to follow `design-system.md` and update it whenever the design changes — keep doing that.

## What it is

A single-page, bilingual (English / Hebrew, RTL) shop for **Shweet Brew**, a small Modiin-based maker of South African biltong, boerewors, drywors, the "Holy Land Jerky" range (beef + chicken), Shweet Brew Shots and sweet chilli sauce, delivered across Israel. Orders currently end in WhatsApp; the owner is moving to **in-website ordering** on **Supabase** (database + auth), with admin phone apps for orders and stock to come. See "Backend (Supabase)" below.

The owner (Caleb) works in short, casual messages ("yo fella", "chop chop"), often several numbered requests at once, and reviews in the browser. He likes to see **options as artifacts** (clickable prototype pages published with the Artifact tool) before picking one to build. He prefers less clutter, bigger photos, clear "what is this" labelling, and motion that is smooth but **not overdone** (he had animations toned down twice). He decided to **keep the original dark "Braai Fire & Blue Star" look** rather than a new visual identity.

## Folders and running it

- Project root: `C:\Users\caleb\Documents\shweetbrew_website\shweetbrew_website` (the git repo). The parent folder only holds `.claude/launch.json`.
- Stack: React 19 + Vite 7 + Tailwind v4 (theme in `client/src/index.css`, no tailwind.config), TypeScript, wouter, lucide-react, sonner, Lenis. Vite root is `client/`; build output `dist/public`.
- Package manager is **pnpm** (lockfile), but pnpm isn't installed globally: use `npx -y pnpm@10.4.1 add <pkg>`.
- Dev server: the Browser tool's `preview_start` with name `shweetbrew-dev` (launch.json in the parent folder runs `vite --config shweetbrew_website/vite.config.ts`). It usually lands on port 3001.
- Checks: `npx tsc --noEmit` and `npx vite build` from the project root.
- Deploy: **Netlify only**, built from `main` (`netlify.toml` → `dist/public`). `npm run deploy` (`scripts/deploy.sh`) checks, builds, lists migrations to run, asks, then fast-forwards `main`. Full steps in `README.md`. The old GitHub Pages workflow was deleted on 2026-11-19 (it published the unbuilt source); the owner unpublishes Pages in repo Settings. `.gitattributes` keeps `*.sh` at LF so bash works on Windows.
- Git: branch `docs/design-system`. A large amount of work in this session is **uncommitted** (see `git status`); commit only when the owner asks.

## Page structure (top to bottom)

`client/src/pages/Home.tsx`: Hero → red product ticker → Products → Delivery → Order → Reviews → About → FAQ → Contact, plus `Navbar`, `Footer` (in `App.tsx`) and the cart (`CartPanel`).

- **Hero** (`HeroSection.tsx`): "Play hard. Snack harder." slogan, a two-line description with *biltong / boerewors / jerky* coloured to match their tiles, four range tiles (Biltong, Jerky, Boerewors, Sauces & Shots) with starting prices computed from product data, "Shop all products" + "Contact us" (scrolls to #contact), and a trust row with drawn flags (`Flags.tsx`).
- **Products** (`ProductsSection.tsx`, `ProductCard.tsx`): Bebas category tabs; 4-column grid (2 on phones). Cards are photo-first: name, category, heat icons, "from ₪X / size"; a round (i) opens `ProductInfoModal` (portal to body); a red + opens a size tray and adds to cart with a fly-to-cart dot.
- **Delivery** (`DeliverySection.tsx`): a timetable (zone, towns, days, fee) plus a facts list.
- **Reviews** (`ReviewsSection.tsx`): scrollable row (drag / swipe / arrows, slow auto-drift that pauses on interaction). Each card links to Google Maps; all currently share the same Shweet Brew reviews URL (individual review links weren't available).
- **About** (`AboutSection.tsx`): story preview (~5 lines) with a "Read the full story" popup; values row; mission line.
- **Cart** (`CartPanel.tsx`): two-step drawer (Bag → Details → Order placed). One row per pack so sizes can be mixed, with a − [n] + box per product; searchable delivery-area combobox; green "Next available delivery" line after an area is chosen (same logic as the Order section, says "Today" when it is today); ₪80 delivery minimum except Modiin pickup.

## Key shared code

- `config/products.ts` — product registry (variants, sizes, prices in ₪, spice 0–5, kosher, nutrition, image). Hebrew names via `getTranslatedProductName` / `getCategoryNameHebrew`.
- `config/deliveryZones.ts` — zones, fees, days, next-delivery-date logic (production day Wednesday 12:00). Hebrew area/town/day names live in `ZONES_HE` / `DAYS_HE` with helpers `zoneName`, `zoneCities`, `zoneDays`.
- `config/languages.ts` — UI translations. Many components also use an inline `L(en, he)` helper.
- `contexts/LanguageContext.tsx` — language read synchronously from `localStorage["shweet-brew-language"]`; `index.html` also sets `<html lang dir>` before first paint to avoid an English flash.
- `contexts/CartContext.tsx` — cart items keyed by id + size; `shippingDetails` holds the street address.
- `lib/orders.ts` — `submitOrder()`: with Supabase configured it calls the `place_order` database function and returns the real `SB-####` reference (or a typed error: out of stock, below minimum…); without Supabase it opens WhatsApp as before. See "Backend (Supabase)".
- `lib/supabase.ts` (lazy-loaded client), `lib/catalog.ts` + `contexts/CatalogContext.tsx` (live products/prices/stock; use `useCatalog()` instead of importing `PRODUCTS` in components).
- `lib/shopFilter.ts` — `openShop(filter)` lets the hero open the products section on a range (groups `wors`, `extras`).
- `lib/smoothScroll.ts` — Lenis smooth wheel scrolling; `scrollToTarget()` for all in-page jumps (one continuous ease-in-out glide, 0.9–1.8s); `lockPageScroll()` while the cart / popups are open; scrollable boxes carry `data-lenis-prevent`.
- `lib/reveal.ts` — scroll reveal (IntersectionObserver). Variants by `data-reveal`: heading, text, zoom, wipe, fade, default. Below-the-fold elements are tagged **by selector** in `AUTO_TARGETS` (components don't need attributes); the hero uses attributes in JSX. `revealInstantly()` shows everything on a menu jump's path so nothing replays.
- `lib/parallax.ts` — gentle hero parallax/fade while scrolling away.
- `lib/images.ts` — self-hosted photo helpers (`productSrcSet`, `productThumb`).

## Backend (Supabase)

Added 2026-11-19. The website talks to Supabase directly with the public anon key; Row Level Security and database functions do the protecting, so there is no server of our own.

**Files**
- `.env` (git-ignored, template in `.env.example`) holds exactly four values from the owner: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (public, used by the site), `SUPABASE_SECRET_KEY` and `SUPABASE_JWKS` (secret: admin scripts / admin app server side only, never `VITE_`). Keep it to these; don't add more config. Restart the dev server after editing `.env` (Vite doesn't pick it up live).
- `supabase/migrations/` — the schema as numbered steps, run in order (each file sets up the security rules for its own tables):
  `0001_foundation` (helpers, plus an index of all files) · `0002_users` · `0003_delivery_zones` · `0004_catalog` · `0005_orders` · `0006_stock` · `0007_order_workflow` · `0008_place_order` · `0009_admin_views` · `0010_realtime` · `0011_product_images` (public `product-images` storage bucket; only admins upload). **New changes go in a new file with the next number (`0012_…`); never edit a file already applied to the live database.** The Supabase CLI accepts these plain numbers as versions.
- `supabase/seed.sql` — generated from `config/products.ts` + `config/deliveryZones.ts` by `npx tsx scripts/generate-supabase-seed.ts`. Insert-only (`on conflict do nothing`), so re-running never overwrites admin edits. Stock starts NULL = not tracked.

**Tables**
- Users: `profiles` (1:1 with `auth.users`, created by a signup trigger; `role` customer/admin). Users can edit only their own name/phone/address/language columns, never `role`. First admin: sign up, then in the SQL editor `update public.profiles set role = 'admin' where email = '…';`. After that admins use `admin_set_role()`.
- Products + stock: `categories` → `products` (id = the variant id used by the site) → `product_sizes` (label, price, `stock` in packs; NULL = untracked). Every stock change, from any source, writes a `stock_movements` row via a trigger (reason: order / order_cancelled / order_restored / restock / adjustment / correction). Admin functions: `admin_adjust_stock(size_id, ±n, reason, note)`, `admin_set_stock(size_id, n|null, note)`. View `stock_overview` (with a `stock_state` of ok / low / out / untracked).
- Orders: `orders` (reference `SB-1001`…, status new → confirmed → preparing → ready_for_pickup / out_for_delivery → delivered, or cancelled; payment status; `source` website/whatsapp/phone/admin), `order_items` (name/price snapshots), `order_status_history` (trigger). Cancelling an order gives its stock back; reopening takes it again (fails if gone). View `order_overview` (adds `item_count`).
- `delivery_zones` holds fee (NULL = to arrange) and minimum order (₪80, Modiin 0). Delivery days and towns stay in `deliveryZones.ts`. **When a zone's fee or minimum changes, update both** (or regenerate the seed for new zones).

**`place_order(p_order jsonb)`** is the only way to create an order from the browser: it ignores browser prices, checks availability and stock (row locks, so two buyers can't take the last pack), applies the zone fee/minimum, takes stock and returns `{reference, subtotal, delivery_fee, total}`. Errors are `INVALID_INPUT:<field>`, `OUT_OF_STOCK:<id>:<size>:<left>`, `UNAVAILABLE:<id>:<size>`, `BELOW_MINIMUM:<min>`, `TOO_MANY_ORDERS` (more than 5 orders per phone in 10 min); `parseOrderError` in `lib/orders.ts` maps them and the cart shows them in both languages. Admins can call it with `source: 'whatsapp'` to log a phone/WhatsApp order (no minimum).

**Security summary**: everyone reads the catalogue; only admins write it. Guests can't read any orders; signed-in customers read only their own. Nobody inserts orders directly. Tested on PGlite (48 checks over the numbered files: RLS, pricing, stock, cancel/restore, flood guard, photo uploads) on 2026-11-19, not yet on a live project.

**Realtime**: `orders`, `order_items`, `products`, `product_sizes` are in the `supabase_realtime` publication. The site refreshes the catalogue on product/stock changes (debounced 400ms); the admin app should subscribe to `orders` (RLS limits what each user receives).

**Not built yet**: the customer login UI (Log in button is still a placeholder; auth backend is ready), the admin phone apps (orders, stock), payments. **WhatsApp is for contacting only, never part of ordering (owner, 2026-11-19).** Orders go only to Supabase; the cart shows an error if Supabase isn't configured. The Order *section* form (`OrderForm.tsx`) still opens WhatsApp and should be moved onto `submitOrder` or removed.

**Testing without real credentials**: a PGlite-backed stand-in for the two REST calls the site makes worked well (point `VITE_SUPABASE_URL` at it in a temporary `.env.local`, restart the dev server, delete the file afterwards).

## Assets

- **Photos**: self-hosted WebP in `client/public/images` (`name-360.webp` + `name-720.webp`; hero 960/1280; about 640/1100). Product data points at the 720 file and `srcset` adds the 360. To add a photo, convert to WebP at those widths (sharp worked: `npm i sharp` in a scratch folder). Several flavours share one photo (all biltong, all jerky).
- **Fonts**: self-hosted in `client/public/fonts`, declared inline in `client/index.html` with `font-display: block` + preloads (no Google Fonts). Bebas Neue (display), Lato (body), Playfair italic (quotes), Open Sans (all Hebrew text, forced in CSS).
- `client/public/jerky-transparent.png` (1.2MB) is no longer used.

## Gotchas learned the hard way

- **Manus leftovers**: `vite.config.ts` has Manus editor plugins. The runtime and jsx-loc plugins are restricted to the dev server (`apply: "serve"`); in production they added a ~360KB inline script. Don't re-enable them for builds.
- **Vite sometimes serves stale CSS** after many edits; if styles look missing, touch `index.css` or restart the dev server.
- **The preview pane often runs hidden**: then the page renders no frames, so requestAnimationFrame, CSS transitions, Lenis glides and IntersectionObserver callbacks don't progress. Verify motion with DOM/computed-style checks, or ask the owner to look. Prefer `setTimeout` over `requestAnimationFrame` for start-up work.
- **Lenis**: `scrollTo` is ignored while stopped (use `force: true`, call `lenis.start()` / `lenis.resize()` first); measure targets from `window.scrollY` and `document.documentElement.scrollHeight`, not Lenis's cached size.
- **Outside-click handlers** must use capture phase + `event.composedPath()`; buttons that remove themselves on click otherwise look like "outside" and close the cart.
- **Stacking**: product cards create stacking contexts (animations), so popups must render via `createPortal(…, document.body)`.
- **Flag emoji don't render on Windows** — use the SVGs in `Flags.tsx`.
- **Artifacts**: never name a top-level function or const `top`, `name`, `status`, etc. — they clash with `window` globals and silently stop the whole script. Artifact pages can't load remote images; publish photos as `files` (or copy them from an earlier artifact with `{artifact, path}`).
- Editing large chunks via heredoc Python in Git Bash can hit quoting errors; writing the script to the scratchpad and running it works reliably.

## Known quirks (not tasks, just so you're not surprised)

- Several Hebrew product *flavour* names still fall back to English (the lookup keys don't match the ids); category names are translated.
- Boerewors and Drywors variants are both called "Classic".
- The Log in button is a placeholder that shows a "coming soon" toast (Supabase auth is ready behind it).

## Previous design artifacts (private, owner's account)

- Products section options: https://claude.ai/artifact/4mJ89BwMv4J1b2DUXDY37f (holds the product photos used by the others)
- Cart options: https://claude.ai/artifact/9nUMbC7dehtKvKTxfHnpBf
- Landing with products (first round): https://claude.ai/artifact/633JTHRuLqvzYWUGmTEWnp
- Quick-shop landing concepts (B was built): https://claude.ai/artifact/HWh7erNLJ5ZNigMH8VKtKY
