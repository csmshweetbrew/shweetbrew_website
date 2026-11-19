# Shweet Brew website — handoff notes

General knowledge for the next agent working on this site. Read this, then `design-system.md` (the visual source of truth) and `PRODUCT.md` (who the site is for). `CLAUDE.md` says to follow `design-system.md` and update it whenever the design changes — keep doing that.

## What it is

A single-page, bilingual (English / Hebrew, RTL) shop for **Shweet Brew**, a small Modiin-based maker of South African biltong, boerewors, drywors, the "Holy Land Jerky" range (beef + chicken), Shweet Brew Shots and sweet chilli sauce, delivered across Israel. Orders currently end in WhatsApp; the owner is moving to **in-website ordering** (a placeholder is in place, see "Ordering" below).

The owner (Caleb) works in short, casual messages ("yo fella", "chop chop"), often several numbered requests at once, and reviews in the browser. He likes to see **options as artifacts** (clickable prototype pages published with the Artifact tool) before picking one to build. He prefers less clutter, bigger photos, clear "what is this" labelling, and motion that is smooth but **not overdone** (he had animations toned down twice). He decided to **keep the original dark "Braai Fire & Blue Star" look** rather than a new visual identity.

## Folders and running it

- Project root: `C:\Users\caleb\Documents\shweetbrew_website\shweetbrew_website` (the git repo). The parent folder only holds `.claude/launch.json`.
- Stack: React 19 + Vite 7 + Tailwind v4 (theme in `client/src/index.css`, no tailwind.config), TypeScript, wouter, lucide-react, sonner, Lenis. Vite root is `client/`; build output `dist/public`.
- Package manager is **pnpm** (lockfile), but pnpm isn't installed globally: use `npx -y pnpm@10.4.1 add <pkg>`.
- Dev server: the Browser tool's `preview_start` with name `shweetbrew-dev` (launch.json in the parent folder runs `vite --config shweetbrew_website/vite.config.ts`). It usually lands on port 3001.
- Checks: `npx tsc --noEmit` and `npx vite build` from the project root.
- Deploy: `netlify.toml` builds `client` with pnpm and publishes `dist/public`. There is also a GitHub Pages workflow (`.github/workflows/static.yml`) that uploads the raw `client` folder (unbuilt) — be aware if touching deployment.
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
- `lib/orders.ts` — **ordering placeholder**: `submitOrder()` builds an order with an `SB-####` reference; while `ORDER_BACKEND_READY = false` it also opens WhatsApp with the full order so no order is lost. Plug the real API in there.
- `lib/shopFilter.ts` — `openShop(filter)` lets the hero open the products section on a range (groups `wors`, `extras`).
- `lib/smoothScroll.ts` — Lenis smooth wheel scrolling; `scrollToTarget()` for all in-page jumps (one continuous ease-in-out glide, 0.9–1.8s); `lockPageScroll()` while the cart / popups are open; scrollable boxes carry `data-lenis-prevent`.
- `lib/reveal.ts` — scroll reveal (IntersectionObserver). Variants by `data-reveal`: heading, text, zoom, wipe, fade, default. Below-the-fold elements are tagged **by selector** in `AUTO_TARGETS` (components don't need attributes); the hero uses attributes in JSX. `revealInstantly()` shows everything on a menu jump's path so nothing replays.
- `lib/parallax.ts` — gentle hero parallax/fade while scrolling away.
- `lib/images.ts` — self-hosted photo helpers (`productSrcSet`, `productThumb`).

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
- The Log in button is a placeholder that shows a "coming soon" toast.

## Previous design artifacts (private, owner's account)

- Products section options: https://claude.ai/artifact/4mJ89BwMv4J1b2DUXDY37f (holds the product photos used by the others)
- Cart options: https://claude.ai/artifact/9nUMbC7dehtKvKTxfHnpBf
- Landing with products (first round): https://claude.ai/artifact/633JTHRuLqvzYWUGmTEWnp
- Quick-shop landing concepts (B was built): https://claude.ai/artifact/HWh7erNLJ5ZNigMH8VKtKY
