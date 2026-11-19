# Shweet Brew — Visual Design System

The look is called **"Braai Fire & Blue Star"**: a near-black, warm charcoal background (braai coals), **Shweet Red** as the brand color, **Israeli Blue** as the second color, and warm cream text. Headlines use condensed, uppercase **Bebas Neue**.

The site is **dark-only**. This document is the standard: follow it for every new page or component. The [Design decisions](#design-decisions-2026-11-17) section at the end records which value won wherever the code used to disagree with itself.

*Checked against the rendered site on 2026-11-17* (Playwright, Chromium, 1440px and 390px wide, OS set to dark and to light). There are no console errors.

**Where things live**

| What | File |
|---|---|
| Theme tokens, utility classes, animations | `client/src/index.css` |
| Color constants for inline styles | `client/src/config/colors.ts` |
| Photos (self-hosted WebP, 2 widths each) | `client/public/images/`, helpers in `client/src/lib/images.ts` |
| Fonts (self-hosted `@font-face` + preloads) | `client/index.html`, files in `client/public/fonts/` |
| shadcn/ui primitives (New York style, `neutral` base) | `client/src/components/ui/*` |
| Site sections | `client/src/components/*Section.tsx`, `Navbar.tsx`, `Footer.tsx`, `ProductCard.tsx`, `OrderForm.tsx`, `CartPanel.tsx` |

There is no `tailwind.config.js`. The project uses **Tailwind v4**, so the theme lives in the `@theme inline` block in `index.css`.

> **How styling is done in practice:** most components set colors with **inline `style={{ ... }}`**, using `var(--accent)` and `var(--card)` plus the few `oklch()` values listed below. When you build something new, prefer the tokens (`var(--accent)`, `var(--card)`, `var(--foreground)`, `bg-background`) and the `.section-title` class. Only use a raw `oklch()` value if it appears in this document.

---

## 1. Color palette

The hex values are converted from the `oklch()` values in the code, which is what the browser renders.

### Brand colors

| Name | Code value | Hex | Used for |
|---|---|---|---|
| **Shweet Red** (`--accent`, `--brand-red`, `--brand-fire`, `--ring`) | `#cd2027` | `#cd2027` | **The brand color.** Logo fill, first word of the hero headline ("PLAY"), the accent half of the Reviews title ("HAVE SPOKEN"), primary buttons (Add to Cart, Complete Order), the floating cart button, prices, category labels, card left-borders, input borders, the focus ring. |
| Shweet Red Bright (`--brand-fire-bright`, `BRAND_COLORS.primaryBright`) | `#e63946` | `#e63946` | Spice level 2 (`.heat-2`). Barely used anywhere else. |
| **Israeli Blue** (`--brand-israeli-blue-light`, `BRAND_COLORS.israeliBlue`) | `oklch(0.50 0.18 260)` | `#195cc7` | **The brand blue** for text and accents: "SNACK" in the hero, the "Made in Israel" badge, Israel-related accent words in titles ("Across Israel", "Israeli pride", "Proud to be Israeli."), the HQ delivery-zone border, price and chip. |
| Israeli Blue Deep (`--primary`, `--brand-israeli-blue`, `BRAND_COLORS.israeliBlueDeep`) | `oklch(0.35 0.15 260)` | `#003286` | Only for **fills and glows**: the highlighted delivery-zone tint (15%), the scrollbar thumb, `.bg-israeli-blue`, `.blue-glow`, shadcn `primary`. Never for text. |
| Gold (`--brand-gold`) | `oklch(0.75 0.15 75)` | `#e49e22` | The "Kosher options" stamp badge, spice level 1 (`.heat-1`), `--chart-3`. |
| WhatsApp Green | `#25D366` | `#25d366` | **Every** WhatsApp button (navbar, hero, FAQ, floating button, mobile menu). White text on top, plus a green glow `rgba(37,211,102,0.35–0.5)`. |

### Neutrals (all warm, hue 60)

| Name | Code value | Hex | Used for |
|---|---|---|---|
| Hero black | `oklch(0.10 0.005 60)` | `#040302` | Hero background and its overlay gradient, the **footer** background. |
| **Charcoal / page background** (`--background`, `--brand-charcoal`) | `oklch(0.13 0.005 60)` | `#090706` | `body` and every section background. Also the background of inputs, selects, order line items and chips that sit on a card. |
| **Card** (`--card`, `--brand-charcoal-mid`, `.bg-charcoal-mid`) | `oklch(0.21 0.006 60)` | `#1a1816` | **Every** card and panel: product cards, delivery-zone cards, review cards, order and checkout panels, contact rows and card, cart items, About cards, footer social icons, the secondary dark button, the 404 card. Inline as `var(--card)`. |
| Secondary / muted (`--secondary`, `--muted`) | `oklch(0.22 0.006 60)` | `#1d1a18` | shadcn secondary/muted backgrounds. |
| Charcoal light (`--brand-charcoal-light`) | `oklch(0.28 0.008 60)` | `#2c2825` | Defined but not used by components. |
| Border (`--border`) | `oklch(1 0 0 / 12%)` | white at 12% | Hairlines, the scrolled navbar's bottom border (`border-white/10`). |

### Text

| Name | Code value | Hex | Used for |
|---|---|---|---|
| **Cream** (`--foreground`, `--accent-foreground`, `.text-cream`) | `oklch(0.94 0.025 75)` | `#f5e9d9` | **The one "white"**: all headings and titles, product names, input text, the text on red buttons, "HARD"/"HARDER" in the hero. (`--primary-foreground`, a cool white `#f3f5f9`, is only for text on blue fills.) |
| Cream dim (`--brand-cream-dim`) | `oklch(0.80 0.020 75)` | `#c5bcb0` | **Used 70×**: paragraphs, nav links, form labels, descriptions. This is the body copy color in practice. |
| Muted text (`--muted-foreground`) | `oklch(0.65 0.015 75)` | `#958e85` | Hero stat labels, section intros (Delivery), the FAQ intro. |
| Other greys | `oklch(0.70 / 0.60 / 0.55 0.015 75)` | `#a49d94` / `#867f77` / `#777068` | Taglines, small print, delivery days. |

### Status and effect colors

| Name | Code value | Hex | Used for |
|---|---|---|---|
| Red tints | `color-mix(in oklab, var(--accent) N%, transparent)` | | Translucent red for panel borders (50%), dividers (30%), glows (20–60%) and the ⓘ button (90%). **Always mix from `--accent`**; don't add new orange or red values. |
| Success green | `oklch(0.65 0.15 120)` | `#849b11` | "FREE" delivery and the "Next available delivery" text in the order form. |
| Destructive (`--destructive`, `BRAND_COLORS.destructive`) | `oklch(0.48 0.20 25)` | `#b30018` | Errors (shadcn destructive), spice level 5. Not a brand color. |
| Unavailable badge | `oklch(0.50 0.05 0)` bg / `oklch(0.70 0.05 0)` text | `#7c5762` / `#ba929d` | The "Not available" badge on product cards. |
| Spice scale `.heat-1…5` | gold → `#e63946` → `#f54d00` → `#d41101` → `#b30018` | | Spice-level coloring. |

### Dark only

There is no light theme. `<html class="dark">` is set in `index.html`, `color-scheme: dark` is set in CSS, and `ThemeContext` uses `defaultTheme="dark"` without looking at the visitor's OS setting. Don't add `prefers-color-scheme` rules.

---

## 2. Typography

The fonts are **self-hosted** (woff2 files from Fontsource in `client/public/fonts/`, declared with `@font-face` inline in `client/index.html`). Every face uses `font-display: block` and the main ones (Bebas 400, Lato 400/700, plus the Hebrew Open Sans faces for visitors whose saved language is Hebrew) are preloaded, so text never flashes in a fallback font and then switches. The saved language is also applied to `<html lang dir>` before the first paint, so Hebrew visitors never see the English page first. Don't add the Google Fonts link back.

| Role | Font | Weights loaded | How it's applied |
|---|---|---|---|
| **Display / headings** | **Bebas Neue** (all caps, condensed) | 400 (the only weight it has) | Every `h1`–`h6` through the base layer, plus `.font-display`. Letter spacing `0.04em`. Many components also set `fontFamily: "'Bebas Neue'"` inline. |
| **Body / UI** | **Lato** | 300, 400, 700, 900 (+ italic 300/400) | `body` default, plus `.font-body`. |
| **Quotes** | **Playfair Display italic** | 400, 600 | `.font-quote`, used for review quotes. |
| **Hebrew** | **Open Sans** | 400, 700, 800 (Hebrew + Latin subsets) | When `html[lang="he"]`, *everything* is forced to Open Sans with `!important`. Body becomes **700**, `h1` **900** (drawn with the 800 file), `h2`–`h6` **800**. The root font size drops to **93.75%** (15px) so all rem sizes shrink ~6%, and `.section-title` caps at `clamp(2.5rem, 6.5vw, 5rem)`. |

Bebas Neue has only one weight. `font-synthesis-weight: none` is set on `h1`–`h6` and `.font-display`, so a stray `font-bold` can't make the browser draw a fake bold.

### Type scale in use

| Element | Size | Notes |
|---|---|---|
| Hero `h1` (`.hero-shop-title`) | `clamp(2.88rem, 8.1vw, 6.3rem)` on phones and `clamp(2.61rem, 7.29vw, 5.67rem)` from 768px up (about 91px at 1440px wide), so the range tiles fit in the first screen; smaller again in Hebrew | Line-height 0.9, text-shadow `0 4px 30px black/80%`. Words colored red / cream / blue / cream. |
| **Section `h2`** | **`.section-title`**: Bebas, `clamp(3rem, 8vw, 6rem)` (48–96px), weight 400, line-height 0.95, letter spacing `0.03em`, cream, `text-wrap: balance` | Every section uses it. In a two-tone title the accent words are **red**, or **blue** only when they're about Israel ("Across Israel"). |
| Card title `h3` | `text-lg` Bebas (product), `text-xl` (order summary) | |
| Body | `text-base`–`text-lg`, cream dim, `leading-relaxed` | |
| Small / labels | `text-xs`–`text-sm`, **bold**, letter spacing `0.05em` | Form labels, category labels. |
| Nav links | `text-sm` **bold**, uppercase, letter spacing `0.12em`, cream dim → red on hover | The same on desktop and in the mobile menu. |

The most common sizes are `text-sm`, `text-xs`, `text-lg` and `text-xl`. Lato is `font-bold` for anything emphasized and regular otherwise; avoid `font-semibold` and `font-medium`.

---

## 3. Spacing, radius and shadows

### Layout and spacing

- **Container** (`.container`, overridden in `index.css`): full width with a **1280px** max from `lg` up. Side padding is 12px, then 16px (≥480), 24px (≥640) and 32px (≥1024).
- **Section padding:** standard `py-20 md:py-28`. Contact (`py-20 md:py-32`) and About (`py-24 md:py-40`) get extra room on purpose; Order is tighter (`py-16`) because it follows the product grid.
- **Section header:** centered, title then intro (no small label above the title), `mb-12` (Contact and About use more). Intro paragraph `max-w-xl`/`max-w-2xl mx-auto`.
- **Card padding:** `p-4` (product), `p-5` (delivery zone), `p-6` (order and checkout panels).
- **Grid gaps:** `gap-4` for card grids, `gap-3` for form rows, `space-y-4`/`space-y-6` for stacks.
- **Navbar height:** `h-16 → sm:h-[72px] → lg:h-20` (64–80px). The logo's SVG viewBox is cropped to the wordmark (`97 188 419 239`; the source file was mostly empty space), drawn 30–40px tall inside an 8px padded button, so the wordmark reads larger than before with breathing room around it. The bar is a 3-column grid (`1fr auto 1fr`) so the links sit exactly centred.

### Border radius

`--radius` is `0.4rem` (6.4px). From it, `rounded-sm` = 2.4px, `rounded-md` = 4.4px, `rounded-lg` = 6.4px and `rounded-xl` = 10.4px.

| Class | Size | Used for |
|---|---|---|
| `rounded` (Tailwind default, **4px**) | 4px | **Buttons, inputs, selects, small badges** (61×). |
| `rounded-lg` | 6.4px | **Cards and panels** (35×). |
| `rounded-full` | ∞ | Icon buttons (the ⓘ button, floating WhatsApp, floating cart). |
| `rounded-xl` / `rounded-2xl` | 10.4px / 16px | The About image, the About callout box and the About badge only. |
| `.stamp-badge` | 3px | Hero badges. |

The look is deliberately **squarish**: nothing large or bubbly.

### Shadows and glows

| Effect | Value | Used for |
|---|---|---|
| Card | `shadow-lg` → `hover:shadow-2xl` | Product cards. |
| Scrolled navbar | `shadow-lg shadow-black/40` | The navbar after scrolling 8px. |
| WhatsApp glow | `0 0 15px rgba(37,211,102,.35)` (small), `0 0 30px rgba(37,211,102,.4), 0 4px 20px rgba(0,0,0,.4)` (hero) | WhatsApp buttons. |
| Red glow | `0 0 20–40px color-mix(in oklab, var(--accent) 20–60%, transparent)` | Modals, the hero wordmark, the About callout, the cart. |
| Blue glow | `0 0 20px oklch(0.35 0.15 260 / .2)` | The highlighted (HQ) delivery zone. |
| Modal | `0 30px 80px black/60%` | Product modal. |
| `.fire-glow` / `.fire-glow-hover` | red glow at 40%/20% (hover 60%/30%) | Ready-made classes for the red glow. |

### Motion

- **Smooth scrolling** (`lib/smoothScroll.ts`, Lenis 1.3): mouse-wheel and trackpad scrolling glide with easing (`lerp 0.09`); phones keep native touch scrolling; reduced motion gets plain native scrolling. All in-page jumps (nav links, hero tiles, "See the products", footer links) use `scrollToTarget()`: one continuous ease-in-out glide (no fade or cut, so you always see where you are), lasting 0.9s for a short hop up to 1.8s across the whole page (0.9s + 0.11s per screen). Before it starts, every reveal element between the start and the destination (plus one screen) is shown at once with no animation (`revealInstantly`, `.reveal-skip`), so sections don't animate in again when you land; reveal animations only play during normal scrolling. Reduced motion: plain jumps. Scrollable boxes (cart body, area dropdown, info popup) carry `data-lenis-prevent`; the page is frozen (`lockPageScroll`) while the cart or the info popup is open.
- **Reveal on scroll** (`lib/reveal.ts`, Cluely-inspired, 2026-11-19): content animates in once as it scrolls into view (IntersectionObserver, 10% visible, 10% from the bottom), kept subtle (toned down 2026-11-19), with easing `cubic-bezier(0.22, 1, 0.36, 1)` (0.7s opacity/blur, 0.85s transform). Styles by `data-reveal` value: **heading** (section titles, About headings, hero title) rise 18px and clear from a 6px blur; **text** (intro paragraphs, delivery details, hero sentence) rise 12px from a 3px blur; **zoom** (product cards, hero tiles, review row, About values, contact columns) rise 24px from 97% scale; **wipe** (About photo) is uncovered upward with a 0.9s clip-path while settling from 103% zoom; **fade** (filter tabs) fades only; default (delivery rows, FAQ, footer) rises 22px. Groups stagger 50ms apart; the product grid ripples **row by row** (60ms per column, restarting each row). Below-the-fold content is tagged by selector in `reveal.ts` and hidden instantly (no fade-out); the hero uses `data-reveal` in JSX for its load sequence. Menu jumps show everything on the way at once (`revealInstantly`). `<html class="reveal-on">` is set in `index.html` before first paint; if the script never starts, CSS shows everything after 3s. Reduced motion: nothing hidden or animated.
- **Hero scroll effect** (`lib/parallax.ts`): as you scroll away from the top, the hero photo drifts down at 20% of scroll speed (gentle parallax, fixed 104% zoom), while the hero content drifts up slightly and fades out, handing over to the products. One passive scroll listener, one update per frame, transform/opacity only, idle once the hero is off screen; off for reduced motion.

- Hover: `hover:scale-105` on buttons, logo and images (`hover:scale-110` on icon buttons). `transition-all` at the 150ms default.
- `.whatsapp-pulse`: scales 1 → 1.08 → 1 every **2s**, forever, on the main WhatsApp CTAs.
- `.animate-fade-up` / `.animate-fade-in` move 30px over 0.6–0.8s.
- The navbar background fades in over 300ms when you scroll.

### Decorative motifs

- **Stamp badges** (`.stamp-badge`): Bebas, 2px outline in the text color, 3px radius, **rotated −2°**.
- **Red left-border** (`border-left: 3–4px solid var(--accent)`) on product cards and order line items.
- **Red top-border** (3px) on the Order section.
- `.wood-texture` stripes are available but not currently used.

---

## 4. Components

### Buttons

| Variant | Look | Where |
|---|---|---|
| **Primary (red)** | `bg var(--accent)` `#cd2027`, **cream text**, `rounded` (4px), `py-3`, `font-bold text-sm`, hover `scale-105` | Add to Cart, Complete Order, Add Products, Go Home (404). |
| **WhatsApp (green)** | `#25D366` bg, white text, WhatsApp icon, green glow, `rounded`, `whatsapp-pulse` (hero) | Every "Order on WhatsApp" CTA (hero, FAQ, contact, floating button). Hero size: `px-8 py-4 text-lg`, min width 220px. Not in the navbar any more. |
| **Outline / ghost** | Transparent, `border-2` cream at 50%, cream text, same size as the hero CTA | "Browse Products" in the hero. |
| **Secondary dark** | Card background, 1px white/20% border, cream bold text, `px-6 py-3`, hover `scale-105` | "Be the next happy customer →" (Reviews). |
| **Icon button** | `p-2 rounded`, red icon, `hover:bg-white/10 hover:scale-110` | Language toggle (globe). |
| **Round icon** | `rounded-full p-2`, red at 90%, cream icon | ⓘ on product images. |
| shadcn `<Button>` | `ui/button.tsx` (variants default/destructive/outline/secondary/ghost/link) | Not used by the site sections. Its default variant is Israeli Blue Deep, so for a brand button use the red primary style above. |

Focus uses the global `outline-ring/50` (red at 50%). Disabled states aren't designed yet.

### Cards

All cards use `var(--card)` (`#1a1816`).

- **Product card ("Big Picture", 2026-11-17)**: `ProductCard.tsx`, styled by the `.product-*` classes in `index.css`. The photo leads: a **4:5** image (`.product-shot`, `rounded-lg`, dark shadow) with no card box around it. On the photo: a round **(i)** button top-right (top-left in Hebrew, 32px, solid dark at 88%, red on hover) that opens `ProductInfoModal`; a round red **+** bottom-right (bottom-left in Hebrew). There is no kosher stamp on the card. The + slides a size tray up over the photo (`.product-tray`, sizes as `.size-chip` buttons in a 2-column grid); tapping a size adds it, a red dot flies to the floating cart (`[data-cart-target]` in `CartPanel.tsx`), the cart bumps and the + turns WhatsApp green with a check for 1.3s. Under the photo only: the Bebas name, then the **category** (e.g. "Biltong", "Holy Land Jerky") in bold red 0.85rem (`.product-category`, Hebrew via `getCategoryNameHebrew`) so a flavour name like "Traditional" always says what product it is, then one meta line (red flame icons for heat, or "No Heat", then "from ₪50 / 100g"). Description, tagline and the size dropdown are no longer on the card. Hover (mouse only): the photo lifts 5px, tilts −0.5° and zooms 6%. Cards rise in one after another (40ms apart) when the category changes. Unavailable products grey the photo, show the "Not available" bar and hide the +; with live stock (Supabase) a product whose sizes are all at 0 counts as unavailable. A **sold-out size** (stock 0) stays in the tray as a disabled chip reading "250g · Sold out" / "אזל": hairline white/15% border, muted text, no red hover. All motion stops under `prefers-reduced-motion`.
- **Product grid**: `grid-cols-2` on phones, `lg:grid-cols-4`, `max-w-[1200px]` centred with side padding (`px-1 sm:px-4 lg:px-6`), so desktop cards are about 270px wide, gaps `gap-x-4 gap-y-8` → `md:gap-x-6 md:gap-y-10`.
- **Delivery timetable** (`DeliverySection.tsx`, `.delivery-*` classes): not cards. Area names, towns and days come from `zoneName` / `zoneCities` / `zoneDays` in `config/deliveryZones.ts`, which hold the Hebrew versions (`ZONES_HE`, `DAYS_HE`); add the Hebrew name there whenever a zone or town is added. A table-like list under a 2px cream top rule: one row per zone with the zone name (bold cream) and its towns (small muted) on the left, delivery days in the middle, and the fee right-aligned in red Bebas 1.75rem. Rows are divided by white/10% hairlines. Modiin HQ is the first row, tinted Israeli Blue Deep at 22% with a blue "Free" price. On phones the days drop under the zone name and the fee stays on the right. Practical details (order cutoff, minimum, payment, pickup, rush delivery) sit beside the table as a plain definition list: bold cream term, cream-dim description. The section heading and intro are left-aligned.
- **Panel** (order summary, checkout, empty cart, delivery notice): `p-6`, `rounded-lg`, 1px **red at 50%** border.
- **FAQ item**: token colors (`border-border`, `bg-card`), `rounded-lg`, hover border `accent/50`. The question turns red when open, and the chevron rotates 180°.
- **Review card** (`.review-card`): a link to the review on Google Maps (opens in a new tab), ending in a small round-cornered **"Read on Google Maps"** button with an external-link icon that turns red when the card is hovered; hovering the card lifts it 4px and turns its border red. Each review has its own `link` field in `ReviewsSection.tsx` (currently all point to the Shweet Brew reviews page on Google Maps). 1px white/10% border, `rounded-lg`, `p-6`, in a **scrollable row** with faded edges (`.reviews-track`, scrollbar hidden): visitors can swipe, use the trackpad, drag with the mouse (the drag only starts after 5px of movement, so a click still opens the review), or use the round prev/next arrows (`.reviews-arrow`, dark glass, red on hover). The row drifts slowly on its own (0.4px per frame, looping) and pauses while hovered, focused, touched, dragged or wheel-scrolled, resuming a few seconds later; no drift under reduced motion. It has gold ★ stars, a Playfair italic quote in `#d6ccc0`, the reviewer's name in bold, and a small product **chip** (charcoal background, red text, `rounded`). Hover: `scale-105`.
- **Contact intro**: one plain sentence (orders, product questions, wholesale) instead of the old emoji option rows. The **contact card** next to it has a **2px red border**, `rounded-lg`, and a big WhatsApp button.
- **About values**: four plain statements in one row (stacked on phones), each a cream Bebas 1.75rem title over a cream-dim line, separated by white/10% hairlines. No cards, no emoji. **Mission**: the mission text set large in cream Bebas (`clamp(1.9rem, 3.6vw, 3rem)`), centred, with no box, border or glow. The floating "two nations, one braai" badge on the About photo still uses `rounded-xl`, a 2px red border and a red glow.
- **Product filter tabs** (`.category-tab`, above the product grid): real `<button>`s with `aria-pressed`, in Bebas `clamp(1.25rem, 2.4vw, 1.875rem)` (smaller in Hebrew), cream dim, cream on hover. The active one is red with a 3px red underline. No `|` separators.

### Product info popup

`ProductInfoModal.tsx`, rendered through a portal into `<body>` so it sits above the cards. Max width ~584px (enlarged 30% on 2026-11-17), still fits one screen with no scrolling (about 470px tall on desktop, 620px on a phone): a 104–124px thumbnail beside the category, a Bebas 2.25rem name and a 1.1rem description; nutrition per 100g as one row of four (1.3rem values) on a card-coloured strip; ingredients and allergens as single 1.1rem lines with small red uppercase labels. Page-black background, 1px red-at-60% border, close with the X, a backdrop click or Escape. Fades and rises in over 0.35s.

### Cart (two-step drawer, 2026-11-17)

`CartPanel.tsx`, styled by the `.cart-*` classes in `index.css`. A full-height drawer from the right (26rem wide, full width on phones) over a 55% black scrim. It slides in over 0.45s and closes only on the X, a press outside the drawer, or Escape; presses on anything inside it (including buttons that disappear when pressed, like a removed row) never close it.

- **Header:** "Your bag" / "Your details" / "Order placed" in cream Bebas 2rem, with the item count in small muted Lato.
- **Steps:** "1. Bag" and "2. Details" as two tabs with a 3px underline (red for the current step).
- **Bag:** one block per product (56px photo, bold cream name, product total in Bebas). No category labels. **Every pack is its own row** with its own size dropdown (size and price) and an × to remove it, so 1.5kg can be 1kg + 500g. Under the name, a round **− [number] +** box sets how many packs there are: + or typing a bigger number adds rows (same size as the last row), − or a smaller number removes rows from the end, 0 removes the product. Rows slide in.
- **Details:** a **searchable delivery-area picker** (type a town or area; matching ignores case, spaces and punctuation, so "raanana" finds Ra'anana, and it searches English and Hebrew town names in either language). Results show the area, the matching town or the delivery days, and the fee. The field starts empty with no area chosen; clicking or focusing it opens the full list of areas (with a caret on the right), and typing filters it. Once chosen it collapses to one line with a "Change" link, which clears it again. Then the next delivery date, a red-tinted note if the order is under the ₪80 delivery minimum (Modiin pickup has no minimum), name and phone side by side, a **Delivery address** block (City and Street and number side by side, then an optional Apartment, floor, entrance field; the whole block may be left empty for Modiin pickup), and an always-visible note box marked optional. Missing fields show a short message under the field instead of a browser alert.
- **Next available delivery:** shown only once an area is chosen, directly under the area picker, exactly like the Order section: success green (`oklch(0.65 0.15 120)`), 0.875rem, "Next available delivery: **<date>**" using `getNextDeliveryDate` + `formatDeliveryDate` (which says "Today" / "היום" when the date is today, e.g. Modiin); for "Somewhere else" it says delivery is by arrangement.
- **Footer (pinned):** subtotal, delivery (step 2), total in Bebas 1.9rem, and one full-width red button: "Continue" on step 1, "Place order" on step 2, with a "Back to bag" link under it.
- **Order placed:** a green check, the order reference (e.g. SB-1234) in Bebas, a line saying we'll call or message to confirm, the total, and "Back to the shop".
- **Ordering:** "Place order" calls `submitOrder` in `client/src/lib/orders.ts`. With Supabase configured it saves the order in the database and the placed screen shows the database reference and total; while it waits the button reads "Placing your order…" (70% opacity, progress cursor). If the database refuses the order (sold out, only N left, below minimum, bad phone) a red-tinted note in the `.cart-min` style (`.cart-order-error`) appears above the button in both languages,. WhatsApp is for contacting only and plays no part in ordering.
- The old "Added to cart" toast and the "Clear cart" button are gone; the fly-to-cart dot and the cart bump confirm an add.

### Product ticker

`ProductTicker.tsx`, placed right under the hero in `Home.tsx`. A full-bleed **Shweet Red** band tilted **−1.5°** (like the stamp badges) that overlaps the bottom of the hero, with a dark drop shadow. It scrolls the range in cream Bebas (`clamp(1.75rem, 4vw, 3rem)`) separated by small charcoal diamonds, in English or Hebrew. It scrolls non-stop at **60px/s** (it does not pause on hover). `ProductTicker.tsx` measures one run of words and renders only as many copies as twice the screen width needs, shifts by exactly one run for a seamless loop, animates with a GPU transform only, and pauses while scrolled out of view (IntersectionObserver). It stands still under `prefers-reduced-motion`. Classes: `.ticker-wrap`, `.ticker`, `.ticker-track` in `index.css`. This is the page's one continuous motion besides the WhatsApp pulse; don't add a second ticker.

### About story

**Collapsed by default** (`CollapsibleStory` in `AboutSection.tsx`, `.about-story` in `index.css`): only about the first 5 lines show (max-height 10rem) with a soft fade-out mask, followed by a round-cornered outline button **"Read the full story"** (Hebrew "לסיפור המלא") with an up-right arrow; it turns red on hover. Clicking it opens the **whole story in a popup** styled like the product info popup: rendered into `<body>`, 70% black backdrop, page-black panel up to 42rem wide and 88vh tall with a 1px red-at-60% border, the story title in Bebas, the full formatted story scrolling inside; it fades and rises in, the page behind is frozen, and it closes on the X (focused when it opens), a backdrop click or Escape. If the story is short enough (e.g. the Hebrew version) it shows in full with no button. There is no WhatsApp/chat button in the About section. The photo badge uses the drawn SA and Israeli flags from `Flags.tsx` (emoji flags show as letters on Windows).


The story text in `SITE_CONFIG.about.story` is rendered by `StoryText` in `AboutSection.tsx`, not as one paragraph: blank lines split paragraphs, short lines with no full stop become Bebas sub-heads (cream, `clamp(1.75rem, 3vw, 2.25rem)`), lines starting with `•` or `1.` become list items with a small red diamond and a bold "Title:", and the closing "Everything is good. Everything is Shweet." is set as a big red Bebas line (`clamp(2.5rem, 5vw, 4rem)`). Keep that structure when editing the story copy.

### Forms

The inputs live in `OrderForm.tsx` and the size select in `ProductCard.tsx`. They're plain `<input>`, `<select>` and `<textarea>` elements styled inline; the shadcn `Input` isn't used.

- Background: charcoal `#090706`. Border: **1px solid red** `#cd2027`, all the time. Text: cream. Shape: `rounded` (4px), `px-3 py-2 text-sm`.
- Focus: a 2px red-at-60% outline, 2px offset (`:focus-visible`, set globally in `index.css`).
- Label: `text-xs font-bold`, cream dim, letter spacing `0.05em`, placed above the field. Required fields have a ` *` added to the label.
- Layout: a 2-column grid from `sm` up (`gap-3`); a single column on mobile.
- Validation is done with `alert()` pop-ups. There are no inline error styles yet.
- Help text: `text-sm` in success green (`#849b11`) under the delivery-area select.

### Navigation

- **Fixed** to the top, `z-50`. **Transparent** over the hero. After scrolling 8px it becomes page black at 97% (no backdrop blur: at 97% it was invisible and cost frames while scrolling), with `shadow-lg shadow-black/40` and a bottom border at white/10%.
- Left: the **Shweet Brew SVG logo** in red (48–64px tall, `hover:scale-105`), which scrolls to the top. The navbar is always LTR, even in Hebrew.
- Center (≥`lg`): 7 anchor links (Products · Delivery · Order · Reviews · About · FAQ · Contact) in uppercase bold Lato `0.8rem`, letter spacing `0.1em`, cream dim, **turning red on hover**, `gap-6` (`xl:gap-7`). Clicking smooth-scrolls to the section. Each section id exists exactly once.
- Right: a red **globe** icon that switches between English and Hebrew, and a **Log in** placeholder (cream outline button with a user icon, `0.8rem` bold). It has no accounts behind it yet: clicking shows a toast saying accounts are coming soon. The Holy Land Jerky logo and the WhatsApp button are no longer in the header.
- Mobile (<`lg`): a cream hamburger icon opens a full-width panel underneath (page black at 98%). It holds a language row, the links as rows with `border-white/5` dividers, and a full-width Log in placeholder button.

### Other

- **Hero: "Four ranges" quick-shop landing** (`HeroSection.tsx`, `.hero-*` classes, 2026-11-18). Built so a visitor knows in a second what the shop sells and can jump straight to it. Over the warm-darkened hero photo, centred: the "Play hard. Snack harder." headline; two short sentences, each on its own line, saying what we sell ("**South African biltong, boerewors and American-style jerky.**" / "Made in Modiin and delivered across Israel."), with the words biltong, boerewors and jerky in extra-bold and coloured to match their range tiles (`.hero-word`: biltong blue, boerewors gold, jerky red); **four photo tiles**, one per range (Biltong / blue bar, Jerky / red, Boerewors / gold, Sauces & Shots / orange), each with a 5px coloured top bar, a round arrow in the same colour, the range name in Bebas and a line with its starting price (computed from `products.ts`); then a red **Shop all products** and a green **Contact us** button (chat-bubble icon, scrolls to the Contact section) side by side (stacked on phones); a **trust row** (drawn Israeli flag "Made in Israel", SA flag "SA roots", gold Star of David "Kosher ingredients", from `Flags.tsx`, divided by hairlines). (The "Pick your flavour" strip was removed on 2026-11-18.) Tiles are 4 across on desktop inside a 66rem-wide row (about 243px each at 1440px, set in from the page edges), range names `clamp(1.5rem, 2.3vw, 2.15rem)`, and 2×2 on phones with a little extra side padding. Every tile opens the products section already filtered to that range via `openShop()` in `lib/shopFilter.ts` (groups: `wors` = boerewors + drywors, `extras` = shots + sauces). The old stamp badges, the "SHWEET BREW" wordmark and the diagonal bottom edge are gone; the red ticker still overlaps the hero's bottom.
- **Floating WhatsApp button** (`FloatingWhatsApp.tsx`) and **floating cart button** (red circle, bottom right).
- **Toasts** use `sonner`.
- **Footer**: hero-black background with a 1px white/8% top border, in 3 columns: the logo with a tagline and square social icons (warm card, white/12% border), Quick Links (a Bebas heading, grey links) and Contact (red icons). The bottom row is tiny grey copyright text.
- **404 page** (`pages/NotFound.tsx`): a charcoal page with a centered card (4px red left-border), a big red Bebas "404", a cream title, cream-dim text and the red "Go Home" button. It's bilingual.

---

## Design decisions (2026-11-17)

These are settled. Where the code used to disagree with itself, here is the value that won and why. Don't reintroduce the losing values.

| # | Question | Decision | Why |
|---|---|---|---|
| 1 | Which blue? | **`#195cc7`** for text and accents; **`#003286`** for fills and glows only. `#488bfb` and `#003F8A` are gone. | `#195cc7` is the blue visitors were already seeing in the hero and badges, and it's readable on charcoal. |
| 2 | Which "white"? | **Cream `#f5e9d9`** everywhere. | It's warm like the charcoal background and the braai/fire theme; the blue-tinted white read as a second color. |
| 3 | Card background? | **Warm `var(--card)` `#1a1816`** for every card. | It's the same lightness as the old zinc cards, so the contrast stays the same, but now it matches the other warm neutrals. |
| 4 | Text on red buttons? | **Cream** (`--accent-foreground`). | Contrast is about 5.5:1, versus 3.6:1 for dark text, which failed WCAG AA. |
| 5 | Leftover orange? | Replaced with **`--accent` mixed at the same opacity**. | Red is the brand color; orange edges next to red looked like a mistake. |
| 6 | Light mode? | **Dark-only.** | The whole site was designed dark; light mode only ever changed the FAQ. |
| 7 | `.fire-glow` | Fixed with `color-mix()`. | It was invalid CSS and rendered nothing. |
| 8 | Section headings | **`.section-title`** on every section (the small `.section-eyebrow` labels were removed on 2026-11-17), with no fake bold. Accent words are red, or blue only for Israel-related words. | Seven sections now share one size and style. |
| 9 | Background shades | `index.css` is the source of truth; `colors.ts` and the comments now match it. | |
| 10 | Reds | Brand red `#cd2027`; `#b30018` is renamed `destructive`. | |
| 11 | Small fixes | Nav links are bold on desktop too; form fields have a visible focus outline; duplicate section ids removed. | |
| 12 | 404 page | Rebuilt in the brand style. | |

| 18 | Images (2026-11-19) | All site photos are self-hosted WebP in `client/public/images` instead of remote PNG/JPEG: products at 360 and 720 wide (quality 72), hero at 960/1280 (q62), About at 640/1100. Cards, hero tiles and the About photo use `srcset`/`sizes` so phones and normal screens get the small file; cart and info-popup thumbnails use the 360 version. Total photo weight went from about 4.3MB to 0.6MB (e.g. the biltong photo 1.2MB → 18KB). The hero is a real `<img>` with `fetchpriority="high"`, preloaded in `index.html`. The product (i) button no longer uses a live backdrop blur (14 of them over photos caused scroll stutter). To add a photo: convert it to WebP at the same widths and name it `name-360.webp` / `name-720.webp`. | Fast first load, no image decode jank while scrolling. |
| 17 | Performance (2026-11-19) | Production builds no longer include the Manus editor tooling (a ~360KB inline script with its own copy of React, plus source-location attributes); it now runs on the dev server only (`apply: "serve"` in `vite.config.ts`). Built `index.html` went from 372KB to 6KB. The hero photo is preloaded and image hosts are preconnected in `index.html`; product images decode off the main thread; the reviews drift only runs while the row is on screen; the navbar blur is gone. | Faster first paint and smoother scrolling. |
| 16 | Design pass (frontend-design) | Hero sub-copy is two plain sentences with no coloured phrases; delivery is a timetable instead of 12 cards; About values and mission lose their cards, emoji and glow; contact loses its emoji rows. | Fewer identical boxes and highlights, so the hero headline and the products stay the loudest things on the page. |
| 15 | Hero stats & labels | The four hero stats (7+ products, 100% beef, Israel-wide delivery, SA recipes) and every small label above section titles are gone. | They read as filler; the headings and hero copy carry the page. |
| 14 | Hero overlay | The hero photo has one warm overlay: a radial vignette plus a fade to the page colour at the bottom. The old 20% texture image and the neutral grey linear overlay are gone. | The neutral overlay washed the smoky photo out to grey. |
| 13 | Bolder pass (2026-11-17) | Bigger section titles, Bebas category tabs, the red product ticker under the hero, and a structured About story. | The owner chose to keep this look and asked for more punch within it rather than a new style. |

**Errors fixed at the same time:**
- The hero used a `<div>` inside a `<p>`, which made React log an error.
- The Umami analytics script was requested from a literal `%VITE_ANALYTICS_ENDPOINT%` URL, giving a 404 whenever the analytics settings weren't configured. It now loads from `main.tsx`, and only when both `VITE_ANALYTICS_ENDPOINT` and `VITE_ANALYTICS_WEBSITE_ID` are set.

**Still open (not design-system issues):**
- `About.tsx`, `Contact.tsx` and `ProductDetail.tsx` under `pages/` aren't routed. They've been updated to the new colors anyway.
