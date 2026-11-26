/*
 * HERO SCROLL EFFECT
 *
 * As you scroll away from the top, the hero photo drifts down slower than the page
 * (gentle parallax depth) and the hero content drifts up a little and fades, so the
 * page "hands over" to the products instead of just sliding away.
 *
 * Cheap by design: one passive scroll listener, at most one update per frame,
 * transform/opacity only, and it stops working once the hero is off screen.
 * Reduced motion: off.
 */

export function initHeroParallax() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let ticking = false;
  let last = -1;

  const update = () => {
    ticking = false;
    const hero = document.getElementById("hero");
    if (!hero) return;
    const photo = hero.querySelector<HTMLElement>(".hero-photo");
    const inner = hero.querySelector<HTMLElement>(".hero-shop-inner");
    const h = hero.offsetHeight || window.innerHeight;
    const y = Math.min(window.scrollY, h);
    if (y === last) return;
    last = y;
    const p = y / h; // 0 at the top, 1 once the hero has scrolled away

    if (photo) photo.style.transform = `translate3d(0, ${y * 0.2}px, 0) scale(1.04)`;
    if (inner) {
      inner.style.transform = `translate3d(0, ${y * -0.04}px, 0)`;
      inner.style.opacity = String(Math.max(0, 1 - p * 0.8));
    }
  };

  const onScroll = () => {
    if (ticking) return;
    if (window.scrollY > window.innerHeight * 1.6 && last >= (document.getElementById("hero")?.offsetHeight ?? 0)) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
}
