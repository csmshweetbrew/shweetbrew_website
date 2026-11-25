/*
 * Red tilted ticker under the hero: the range, shouted.
 *
 * Runs forever without pausing on hover. To stay light:
 * - it only renders as many copies of the word list as the screen width needs
 *   (measured once per resize, not every frame);
 * - it moves with a single CSS transform, which the browser animates on the GPU
 *   without re-laying out the page;
 * - it pauses while it is scrolled out of view (and the browser already pauses it
 *   in background tabs);
 * - it stands still for visitors who prefer reduced motion.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const WORDS = {
  en: ["Biltong", "Boerewors", "Drywors", "Holy Land Jerky", "Chicken Jerky", "Shots", "Sauces"],
  he: ["בילטונג", "בוארווורס", "דרייוורס", "ג'רקי ארץ הקודש", "ג'רקי עוף", "שוטס", "רטבים"],
};

const SPEED_PX_PER_SEC = 60;

export default function ProductTicker() {
  const { language } = useLanguage();
  const words = WORDS[language];
  const wrapRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLUListElement>(null);
  const [copies, setCopies] = useState(2);
  const [runWidth, setRunWidth] = useState(0);
  const [inView, setInView] = useState(true);

  // Measure one run of words and render just enough copies to cover the screen twice over
  useLayoutEffect(() => {
    const measure = () => {
      const run = runRef.current?.offsetWidth ?? 0;
      if (!run) return;
      setRunWidth(run);
      setCopies(Math.max(2, Math.ceil((window.innerWidth * 2) / run) + 1));
    };
    measure();
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [language]);

  // Pause while off screen
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const run = (i: number) => (
    <ul
      key={i}
      ref={i === 0 ? runRef : undefined}
      className="flex shrink-0 items-center"
      aria-hidden={i > 0 || undefined}
    >
      {words.map((word) => (
        <li
          key={word}
          className="flex items-center whitespace-nowrap py-3 md:py-4"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(1.75rem, 4vw, 3rem)",
            letterSpacing: "0.04em",
            lineHeight: 1,
            color: "var(--foreground)",
          }}
        >
          <span className="px-5 md:px-8">{word}</span>
          <span
            aria-hidden="true"
            className="inline-block w-2.5 h-2.5 md:w-3 md:h-3 rotate-45"
            style={{ backgroundColor: "oklch(0.13 0.005 60)" }}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="ticker-wrap" ref={wrapRef}>
      <div className="ticker" dir="ltr">
        <div
          className="ticker-track"
          style={{
            ["--ticker-shift" as string]: `-${runWidth}px`,
            animationDuration: runWidth ? `${runWidth / SPEED_PX_PER_SEC}s` : undefined,
            animationPlayState: inView && runWidth ? "running" : "paused",
          }}
        >
          {Array.from({ length: copies }, (_, i) => run(i))}
        </div>
      </div>
    </div>
  );
}
