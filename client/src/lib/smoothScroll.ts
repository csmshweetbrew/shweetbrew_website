/*
 * SMOOTH SCROLLING (Lenis)
 *
 * Gives the page the soft, eased scroll feel (wheel and trackpad glide instead of
 * jumping in steps). Touch devices keep their native scrolling, which is already smooth.
 * Visitors who prefer reduced motion get plain native scrolling.
 *
 * Anything that scrolls on its own (cart drawer, popups, dropdowns, the reviews row)
 * carries `data-lenis-prevent`, so the wheel scrolls that box instead of the page.
 */

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { revealInstantly } from "./reveal";

let lenis: Lenis | null = null;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initSmoothScroll() {
  if (lenis || prefersReducedMotion()) return lenis;
  lenis = new Lenis({
    autoRaf: true, // Lenis drives its own requestAnimationFrame loop and idles when nothing moves
    lerp: 0.09, // lower = floatier; ~0.1 matches the "cluely" feel without feeling sluggish
    smoothWheel: true,
    wheelMultiplier: 1,
    syncTouch: false, // keep native momentum on phones
  });
  return lenis;
}

export function getLenis() {
  return lenis;
}

/** Freeze the page behind an open drawer or popup (and release it after) */
export function lockPageScroll(locked: boolean) {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Scroll to a section or element in one continuous glide, so you always see where you are
 * going. It eases in and out, and its length grows gently with the distance
 * (0.9s for a short hop up to 1.8s across the whole page) so long jumps don't whip by.
 * Everything along the way is shown straight away (no reveal animations replaying
 * when you land). Reduced motion or no Lenis: a plain jump / native smooth scroll.
 */
export function scrollToTarget(target: string | Element, offset = 0) {
  const el = (typeof target === "string" ? document.querySelector(target) : target) as HTMLElement | null;
  if (!el) return;

  const from = window.scrollY;
  const vh = window.innerHeight;
  // measure the page directly (Lenis's own size can lag right after load or a layout change)
  const maxScroll = document.documentElement.scrollHeight - vh;
  const to = Math.max(0, Math.min(maxScroll, el.getBoundingClientRect().top + from + offset));

  // content we pass and land on is already "seen": show it now instead of animating it in
  revealInstantly(Math.min(from, to), Math.max(from, to) + vh);

  if (!lenis) {
    el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    return;
  }

  // start/force: still scroll if the page was just frozen by a closing drawer/popup
  lenis.start();
  lenis.resize(); // refresh Lenis's page size so it doesn't clamp the jump short
  const screens = Math.abs(to - from) / vh;
  const duration = Math.min(1.8, 0.9 + screens * 0.11);
  lenis.scrollTo(to, { duration, easing: easeInOutCubic, force: true });
}
