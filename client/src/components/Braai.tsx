/*
 * The bushveld fire at the bottom of the home page. Its ground fades into the footer.
 * A still picture of it shows first; the live one fades in over it when the device has it ready, which
 * on a first visit can take anything from 3 to 35 seconds on Windows. Without WebGL the picture stays.
 * If the scene changes, re-render both pictures from it. Decoration only. See lib/fire/braai.ts.
 */

import { useEffect, useRef } from "react";

export default function Braai() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let stop: (() => void) | undefined;
    let gone = false;
    let begun = false;
    const begin = () => {
      if (begun || gone) return;
      begun = true;
      import("@/lib/fire/braai").then(({ startBraai }) => {
        if (!gone && canvas.current) stop = startBraai(el, canvas.current);
      });
    };
    // Prepared in the background a few seconds after the page opens, or sooner if you scroll straight
    // down. It only draws while it is on screen.
    const timer = setTimeout(begin, 4000);
    const near = new IntersectionObserver(([entry]) => entry.isIntersecting && begin(), { rootMargin: "1400px" });
    near.observe(el);
    return () => {
      gone = true;
      clearTimeout(timer);
      near.disconnect();
      stop?.();
    };
  }, []);

  return (
    <div ref={root} className="braai" aria-hidden="true">
      <picture>
        <source media="(max-width: 767px)" srcSet="/images/fire-phone.webp" />
        <img src="/images/fire-wide.webp" alt="" loading="lazy" decoding="async" />
      </picture>
      <canvas ref={canvas} />
    </div>
  );
}
