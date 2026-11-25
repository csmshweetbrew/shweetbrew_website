/*
 * The steel braai at the bottom of the home page. Its sky is the page's own background, and it fades into the footer.
 * A still picture of it shows first; the live one fades in over it once its pictures (0.15–0.2 MB) are
 * here and the device has it ready (a few seconds). Without WebGL the still stays. Decoration only.
 * See lib/fire/braai.ts.
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
    // Prepared when you come near it (so nobody downloads it who doesn't scroll down). It only draws on screen.
    const near = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && begin(), { rootMargin: "1800px" });
    near.observe(el);
    return () => {
      gone = true;
      near.disconnect();
      stop?.();
    };
  }, []);

  return (
    <div ref={root} className="braai" aria-hidden="true">
      <picture>
        <source media="(max-width: 551px)" srcSet="/images/fire/phone.webp" />
        <img src="/images/fire/wide.webp" alt="" loading="lazy" decoding="async" />
      </picture>
      <canvas ref={canvas} />
    </div>
  );
}
