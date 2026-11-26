/*
 * REVEAL ON SCROLL
 *
 * Content glides up and fades in as it scrolls into view (one shared
 * IntersectionObserver, transform + opacity only, so it stays on the GPU and
 * doesn't cause layout work while scrolling).
 *
 * - Elements with a `data-reveal` attribute in the JSX (the hero) are hidden from
 *   the very first paint, because index.html adds `reveal-on` to <html> early.
 * - Below-the-fold content is tagged here by selector after the page mounts, so
 *   section components don't need to change. Anything already on screen when it is
 *   tagged is shown at once, so nothing flickers.
 * - Items in a group (rows, cards, FAQ items…) get a small stagger.
 * - Reduced motion: nothing is hidden or animated.
 * - Safety net: CSS shows everything after 3s if this script never starts
 *   (it adds .reveal-ready to <html>, which switches the safety net off).
 */

/*
 * Variants (styles in index.css, "Reveal on scroll"):
 *   "heading" big titles: rise + clear from a soft blur, like a camera focusing
 *   "text"    paragraphs: shorter rise + light blur
 *   ""        default: rise and fade
 *   "zoom"    cards and tiles: rise from 94% scale
 *   "wipe"    photos: uncover upward while settling from a slight zoom
 *   "fade"    small UI (tabs): fade only
 * stagger: delay each item by its position among siblings (50ms apart, max 8);
 * row: stagger by column instead (60ms per column), so each grid row ripples left to right.
 */
const AUTO_TARGETS: { selector: string; stagger?: boolean; row?: number; variant?: string }[] = [
  // section headings + intro lines
  { selector: "section h2.section-title", variant: "heading" },
  { selector: "section h2.section-title + p", variant: "text" },
  // products: tabs, then the grid row by row
  { selector: "#products .category-tab", stagger: true, variant: "fade" },
  { selector: "#products .product-card", row: 4, variant: "zoom" },
  // delivery
  { selector: "#delivery .delivery-row", stagger: true },
  { selector: "#delivery dl > div", stagger: true, variant: "text" },
  // order
  { selector: "#order > div > *" },
  // reviews
  { selector: "#reviews .reviews-track", variant: "zoom" },
  // about
  { selector: "#about img", variant: "wipe" },
  { selector: "#about h3:not(.sr-only), #about h4:not(.sr-only)", variant: "heading" },
  { selector: "#about .grid > div", stagger: true, variant: "zoom" },
  // faq
  { selector: "#faq .space-y-3 > *, #faq [data-state]", stagger: true },
  // contact + footer
  { selector: "#contact .grid > *", stagger: true, variant: "zoom" },
  { selector: "footer .grid > *", stagger: true },
];

let observer: IntersectionObserver | null = null;
const watched = new WeakSet<Element>();

function watch(el: Element) {
  if (watched.has(el) || el.hasAttribute("data-revealed")) return;
  watched.add(el);
  observer?.observe(el);
}

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Revealed state is a data attribute, not a class: React rewrites `className` whenever a
// component re-renders (e.g. a product card opening its size tray), which used to wipe a
// class and hide the card again. React never touches attributes it didn't set.
function show(el: Element) {
  el.setAttribute("data-revealed", "");
  observer?.unobserve(el);
}

function inViewport(el: Element) {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
}

function tag(root: ParentNode) {
  // Elements tagged in JSX (the hero) that React has rendered since the last pass
  root.querySelectorAll("[data-reveal]").forEach(watch);
  const fresh: HTMLElement[] = [];
  for (const { selector, stagger, row, variant } of AUTO_TARGETS) {
    const els = Array.from(root.querySelectorAll<HTMLElement>(selector));
    els.forEach((el, i) => {
      if (el.hasAttribute("data-reveal")) return watch(el);
      if (inViewport(el)) return; // already visible: leave it alone, no flicker
      // hide instantly (no fade-out transition) before it gets its reveal
      el.classList.add("reveal-skip");
      el.setAttribute("data-reveal", variant ?? "");
      fresh.push(el);
      if (stagger || row) {
        // position among siblings that share the same parent
        const siblings = el.parentElement ? Array.from(el.parentElement.children).filter((c) => c.matches(selector)) : [];
        const idx = Math.max(0, siblings.indexOf(el));
        const cols = row ? Math.max(1, Math.round((el.parentElement?.clientWidth ?? 0) / Math.max(1, el.offsetWidth)) || row) : 0;
        const step = row ? idx % cols : Math.min(idx, 8);
        el.style.setProperty("--reveal-delay", `${step * (row ? 60 : 50)}ms`);
      }
      watch(el);
    });
  }
  if (fresh.length) {
    void document.body.offsetHeight; // apply the hidden state now…
    fresh.forEach((el) => el.classList.remove("reveal-skip")); // …then re-enable the reveal transition
  }
}

/**
 * Show every hidden reveal element between two page positions at once, with no animation.
 * Used by menu jumps so the sections you glide past and land on don't animate in again.
 */
export function revealInstantly(top: number, bottom: number) {
  const y = window.scrollY;
  document.querySelectorAll("[data-reveal]:not([data-revealed])").forEach((el) => {
    const r = el.getBoundingClientRect();
    const elTop = r.top + y;
    if (elTop < bottom && elTop + r.height > top) {
      el.classList.add("reveal-skip");
      show(el);
    }
  });
}

export function initReveal() {
  const html = document.documentElement;
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    html.classList.remove("reveal-on");
    return;
  }
  html.classList.add("reveal-on", "reveal-ready");

  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) show(e.target);
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
  );

  // First pass now, then again whenever React adds content (the MutationObserver below)
  tag(document);

  // Content that appears later (product filter changes, language switch, etc.)
  let queued = false;
  const mo = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    // setTimeout (not requestAnimationFrame) so tagging also happens in a background tab
    setTimeout(() => {
      queued = false;
      tag(document);
    }, 0);
  });
  mo.observe(document.getElementById("root") ?? document.body, { childList: true, subtree: true });
}
