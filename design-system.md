# Shweet Brew — Visual Design System

The look is called **"Braai Fire & Blue Star"**: a near-black, warm charcoal background (braai coals), **Shweet Red** as the brand color, **Israeli Blue** as the second color, and warm cream text. Headlines use condensed, uppercase **Bebas Neue**.

The site is **dark-only**. This document is the standard: follow it for every new page or component. The [Design decisions](#design-decisions-2026-11-17) section at the end records which value won wherever the code used to disagree with itself.

*Checked against the rendered site on 2026-11-17* (Playwright, Chromium, 1440px and 390px wide, OS set to dark and to light). There are no console errors.

**Where things live**

| What | File |
|---|---|
| Theme tokens, utility classes, animations | `client/src/index.css` |
| Color constants for inline styles | `client/src/config/colors.ts` |
| Google Fonts link | `client/index.html` |
| shadcn/ui primitives (New York style, `neutral` base) | `client/src/components/ui/*` |
| Site sections | `client/src/components/*Section.tsx`, `Navbar.tsx`, `Footer.tsx`, `ProductCard.tsx`, `OrderForm.tsx`, `CartPanel.tsx` |

There is no `tailwind.config.js`. The project uses **Tailwind v4**, so the theme lives in the `@theme inline` block in `index.css`.

> **How styling is done in practice:** most components set colors with **inline `style={{ ... }}`**, using `var(--accent)` and `var(--card)` plus the few `oklch()` values listed below. When you build something new, prefer the tokens (`var(--accent)`, `var(--card)`, `var(--foreground)`, `bg-background`) and the `.section-title` / `.section-eyebrow` classes. Only use a raw `oklch()` value if it appears in this document.

---

## 1. Color palette

The hex values are converted from the `oklch()` values in the code, which is what the browser renders.

### Brand colors

| Name | Code value | Hex | Used for |
|---|---|---|---|
| **Shweet Red** (`--accent`, `--brand-red`, `--brand-fire`, `--ring`) | `#cd2027` | `#cd2027` | **The brand color.** Logo fill, first word of the hero headline ("PLAY"), the accent half of the Reviews title ("HAVE SPOKEN"), primary buttons (Add to Cart, Complete Order), the floating cart button, prices, category labels, eyebrow labels, card left-borders, input borders, the focus ring. |
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

The fonts are loaded from Google Fonts in `client/index.html`.

| Role | Font | Weights loaded | How it's applied |
|---|---|---|---|
| **Display / headings** | **Bebas Neue** (all caps, condensed) | 400 (the only weight it has) | Every `h1`–`h6` through the base layer, plus `.font-display`. Letter spacing `0.04em`. Many components also set `fontFamily: "'Bebas Neue'"` inline. |
| **Body / UI** | **Lato** | 300, 400, 700, 900 (+ italic 300/400) | `body` default, plus `.font-body`. |
| **Quotes** | **Playfair Display italic** | 400, 600 | `.font-quote`, used for review quotes. |
| **Hebrew** | **Open Sans** | 400–900 | When `html[lang="he"]`, *everything* is forced to Open Sans with `!important`. Body becomes **700**, `h1` **900**, `h2`–`h6` **800**. |

Bebas Neue has only one weight. `font-synthesis-weight: none` is set on `h1`–`h6` and `.font-display`, so a stray `font-bold` can't make the browser draw a fake bold. In the browser only Lato 400/700, Bebas 400 and Playfair 400 italic actually load.

### Type scale in use

| Element | Size | Notes |
|---|---|---|
| Hero `h1` | `clamp(3.5rem, 10vw, 9rem)` (56–144px) | Leading `none`, text-shadow `0 4px 30px black/80%`. Words colored red / cream / blue / cream. |
| Hero wordmark "SHWEET BREW" | `clamp(1.5rem, 4vw, 3rem)` | Red, letter spacing `0.3em`, red glow. |
| **Section `h2`** | **`.section-title`**: Bebas, `clamp(2.5rem, 6vw, 5rem)` (40–80px), weight 400, line-height 1, letter spacing `0.04em`, cream | Every section uses it. In a two-tone title the accent words are **red**, or **blue** only when they're about Israel ("Across Israel"). |
| Card title `h3` | `text-lg` Bebas (product), `text-xl` (order summary) | |
| **Eyebrow label** | **`.section-eyebrow`**: Lato `text-xs`, uppercase, letter spacing `0.25em`, red | Optional, above a section title, written as `— LABEL —` (Products, Delivery, Reviews, FAQ). The About section uses the same class for its "WHO WE ARE" sub-label. |
| Stat number | `text-3xl md:text-4xl` Bebas, red | Hero stats row. |
| Body | `text-base`–`text-lg`, cream dim, `leading-relaxed` | |
| Small / labels | `text-xs`–`text-sm`, **bold**, letter spacing `0.05em` | Form labels, category labels. |
| Nav links | `text-sm` **bold**, uppercase, letter spacing `0.12em`, cream dim → red on hover | The same on desktop and in the mobile menu. |

The most common sizes are `text-sm`, `text-xs`, `text-lg` and `text-xl`. Lato is `font-bold` for anything emphasized and regular otherwise; avoid `font-semibold` and `font-medium`.

---

## 3. Spacing, radius and shadows

### Layout and spacing

- **Container** (`.container`, overridden in `index.css`): full width with a **1280px** max from `lg` up. Side padding is 12px, then 16px (≥480), 24px (≥640) and 32px (≥1024).
- **Section padding:** standard `py-20 md:py-28`. Contact (`py-20 md:py-32`) and About (`py-24 md:py-40`) get extra room on purpose; Order is tighter (`py-16`) because it follows the product grid.
- **Section header:** centered, eyebrow then title then intro, `mb-12` (Contact and About use more). Intro paragraph `max-w-xl`/`max-w-2xl mx-auto`.
- **Card padding:** `p-4` (product), `p-5` (delivery zone), `p-6` (order and checkout panels).
- **Grid gaps:** `gap-4` for card grids, `gap-3` for form rows, `space-y-4`/`space-y-6` for stacks.
- **Navbar height:** `h-24 → sm:h-28 → md:h-32 → lg:h-40` (96–160px). The logo is 72–120px tall.

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
| Scrolled navbar | `shadow-lg shadow-black/40` + `backdrop-blur-md` | The navbar after scrolling 60px. |
| WhatsApp glow | `0 0 15px rgba(37,211,102,.35)` (small), `0 0 30px rgba(37,211,102,.4), 0 4px 20px rgba(0,0,0,.4)` (hero) | WhatsApp buttons. |
| Red glow | `0 0 20–40px color-mix(in oklab, var(--accent) 20–60%, transparent)` | Modals, the hero wordmark, the About callout, the cart. |
| Blue glow | `0 0 20px oklch(0.35 0.15 260 / .2)` | The highlighted (HQ) delivery zone. |
| Modal | `0 30px 80px black/60%` | Product modal. |
| `.fire-glow` / `.fire-glow-hover` | red glow at 40%/20% (hover 60%/30%) | Ready-made classes for the red glow. |

### Motion

- Hover: `hover:scale-105` on buttons, logo and images (`hover:scale-110` on icon buttons). `transition-all` at the 150ms default.
- `.whatsapp-pulse`: scales 1 → 1.08 → 1 every **2s**, forever, on the main WhatsApp CTAs.
- The hero content fades up 40px over **0.9s** after a 200ms delay. `.animate-fade-up` / `.animate-fade-in` move 30px over 0.6–0.8s.
- The navbar background fades in over 300ms when you scroll.

### Decorative motifs

- **Diagonal section edge**: the bottom of the hero is cut at an angle (`clip-path: polygon(0 60%, 100% 0, 100% 100%, 0 100%)`).
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
| **WhatsApp (green)** | `#25D366` bg, white text, WhatsApp icon, green glow, `rounded`, `whatsapp-pulse` (navbar and hero) | Every "Order on WhatsApp" CTA. Hero size: `px-8 py-4 text-lg`, min width 220px. Navbar size: `px-5 py-2.5 text-sm`. |
| **Outline / ghost** | Transparent, `border-2` cream at 50%, cream text, same size as the hero CTA | "Browse Products" in the hero. |
| **Secondary dark** | Card background, 1px white/20% border, cream bold text, `px-6 py-3`, hover `scale-105` | "Be the next happy customer →" (Reviews). |
| **Icon button** | `p-2 rounded`, red icon, `hover:bg-white/10 hover:scale-110` | Language toggle (globe). |
| **Round icon** | `rounded-full p-2`, red at 90%, cream icon | ⓘ on product images. |
| shadcn `<Button>` | `ui/button.tsx` (variants default/destructive/outline/secondary/ghost/link) | Not used by the site sections. Its default variant is Israeli Blue Deep, so for a brand button use the red primary style above. |

Focus uses the global `outline-ring/50` (red at 50%). Disabled states aren't designed yet.

### Cards

All cards use `var(--card)` (`#1a1816`).

- **Product card**: card background, `rounded-lg`, **4px red left-border**, `shadow-lg` → `hover:shadow-2xl`. A 192px image on top (`object-cover`, hover lowers opacity to 80%, clicking opens the info modal). The body is `p-4`: a red category label, a Bebas title in cream, an italic grey tagline, the spice level, a 2-line clamped description, a size `<select>` and a full-width red Add to Cart button.
- **Delivery-zone card**: 1px white/10% border, `p-5`, `rounded-lg`, with the price in large red Bebas. The highlighted (HQ) zone gets a blue tint and border, a blue glow, a blue price and a blue "HQ" chip with cream text.
- **Panel** (order summary, checkout, empty cart, delivery notice): `p-6`, `rounded-lg`, 1px **red at 50%** border.
- **FAQ item**: token colors (`border-border`, `bg-card`), `rounded-lg`, hover border `accent/50`. The question turns red when open, and the chevron rotates 180°.
- **Review card**: 1px white/10% border, `rounded-lg`, `p-6`, in an auto-scrolling row with faded edges. It has gold ★ stars, a Playfair italic quote in `#d6ccc0`, the reviewer's name in bold, and a small product **chip** (charcoal background, red text, `rounded`). Hover: `scale-105`.
- **Contact option row**: a 3px red left-border, an emoji icon and a label. The **contact card** next to it has a **2px red border**, `rounded-lg`, and a big WhatsApp button.
- **About callouts**: `rounded-2xl` with a 3px red border and a red glow; value cards with a 2px red-at-30% border.
- **Product filter tabs** (above the product grid): plain text links separated by `|`. The active one is red; the rest are cream.

### Forms

The inputs live in `OrderForm.tsx` and the size select in `ProductCard.tsx`. They're plain `<input>`, `<select>` and `<textarea>` elements styled inline; the shadcn `Input` isn't used.

- Background: charcoal `#090706`. Border: **1px solid red** `#cd2027`, all the time. Text: cream. Shape: `rounded` (4px), `px-3 py-2 text-sm`.
- Focus: a 2px red-at-60% outline, 2px offset (`:focus-visible`, set globally in `index.css`).
- Label: `text-xs font-bold`, cream dim, letter spacing `0.05em`, placed above the field. Required fields have a ` *` added to the label.
- Layout: a 2-column grid from `sm` up (`gap-3`); a single column on mobile.
- Validation is done with `alert()` pop-ups. There are no inline error styles yet.
- Help text: `text-sm` in success green (`#849b11`) under the delivery-area select.

### Navigation

- **Fixed** to the top, `z-50`. **Transparent** over the hero. After scrolling 60px it becomes page black at 97%, with `backdrop-blur-md`, `shadow-lg shadow-black/40` and a bottom border at white/10%.
- Left: the **Shweet Brew SVG logo** in red (72–120px tall, `hover:scale-105`), which scrolls to the top. The navbar is always LTR, even in Hebrew.
- Center (≥`lg`): 7 anchor links (Products · Delivery · Order · Reviews · About · FAQ · Contact) in uppercase bold Lato `text-sm`, letter spacing `0.12em`, cream dim, **turning red on hover**, `gap-8`. Clicking smooth-scrolls to the section. Each section id exists exactly once.
- Right: the **Holy Land Jerky** logo image (scrolls to the top), a red **globe** icon that switches between English and Hebrew, and the green **Order on WhatsApp** button.
- Mobile (<`lg`): a cream hamburger icon opens a full-width panel underneath (page black at 98%). It holds a language row, the links as rows with `border-white/5` dividers, and a full-width WhatsApp button.

### Other

- **Stamp badges** (hero): blue "Made in Israel", red "SA roots", gold "Kosher options".
- **Floating WhatsApp button** (`FloatingWhatsApp.tsx`) and **floating cart button** (red circle, bottom right).
- **Toasts** use `sonner`.
- **Footer**: hero-black background with a 1px white/8% top border, in 3 columns: the logo with a tagline and square social icons (warm card, white/12% border), Quick Links (a Bebas heading, grey links) and Contact (red icons). The bottom row is tiny grey copyright text.
- **Cart panel** (`CartPanel.tsx`): a charcoal drawer with a 2px red border. It repeats the checkout fields with the same red-bordered inputs.
- **404 page** (`pages/NotFound.tsx`): a charcoal page with a centered card (4px red left-border), a `— OOPS —` eyebrow, a big red Bebas "404", a cream title, cream-dim text and the red "Go Home" button. It's bilingual.

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
| 8 | Section headings | **`.section-title` + `.section-eyebrow`** on every section, with no fake bold. Accent words are red, or blue only for Israel-related words. | Seven sections now share one size and style. |
| 9 | Background shades | `index.css` is the source of truth; `colors.ts` and the comments now match it. | |
| 10 | Reds | Brand red `#cd2027`; `#b30018` is renamed `destructive`. | |
| 11 | Small fixes | Nav links are bold on desktop too; form fields have a visible focus outline; duplicate section ids removed. | |
| 12 | 404 page | Rebuilt in the brand style. | |

**Errors fixed at the same time:**
- The hero used a `<div>` inside a `<p>`, which made React log an error.
- The Umami analytics script was requested from a literal `%VITE_ANALYTICS_ENDPOINT%` URL, giving a 404 whenever the analytics settings weren't configured. It now loads from `main.tsx`, and only when both `VITE_ANALYTICS_ENDPOINT` and `VITE_ANALYTICS_WEBSITE_ID` are set.

**Still open (not design-system issues):**
- `About.tsx`, `Contact.tsx` and `ProductDetail.tsx` under `pages/` aren't routed. They've been updated to the new colors anyway.
- The "Added to cart" toast shows two check marks.
