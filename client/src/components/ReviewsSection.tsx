/*
 * SHWEETBREW REVIEWS SECTION
 * Design: Dark background, gold star ratings, Playfair Display italic quotes
 * A scrollable row of reviews: swipe, drag, scroll or use the arrows.
 * It drifts slowly on its own and pauses as soon as the visitor touches it.
 */

import { useRef, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/config/languages";
import { getWhatsAppLink } from "@/config/site";
import { scrollToTarget } from "@/lib/smoothScroll";

type Review = {
  id: number;
  name: string;
  rating: number;
  text: string;
  product?: string;
  flag: string;
  link: string;
};

const GOOGLE_MAPS_LINK = "https://www.google.com/maps/place/Shweet+Brew/@31.903635,34.993301,17z/data=!4m8!3m7!1s0x9658db83fe337bd:0x6a4c755c838010e9!8m2!3d31.903635!4d34.9958759!9m1!1b1!16s%2Fg%2F11kk14r7x7?entry=ttu&g_ep=EgoyMDI2MDcyMC4wIKXMDSoASAFQAw%3D%3D";

const reviews: Review[] = [
  {
    id: 1,
    name: "Hilton Giesenow",
    rating: 5,
    text: "I just finished a bag of Shweet Brew's delicious biltong and it was great, will definitely be buying again! Uri can also make different styles or order however you like it, so might try some different options out as well. Thanks for the great treat! The chilli was fantastic as well, by the way.",
    product: "Biltong",
    flag: "🇮🇱",
    link: GOOGLE_MAPS_LINK,
  },
  {
    id: 2,
    name: "Craig Gerber",
    rating: 5,
    text: "Best biltong in town. Shweet brew chilli sauce is unbelievable and goes with everything",
    product: "Biltong & Sauce",
    flag: "🇮🇱",
    link: GOOGLE_MAPS_LINK,
  },
  {
    id: 3,
    name: "Shmuel Shantall",
    rating: 5,
    text: "Shweet Brew totally enhanced our shabbat experience! Top quality taste and texture awakening the African in me! Look forward to my next biltong binge",
    product: "Biltong",
    flag: "🇮🇱",
    link: GOOGLE_MAPS_LINK,
  },
  {
    id: 4,
    name: "Avi Ettinger",
    rating: 5,
    text: "First time trying these South African snacks - Amazing!! Thanks you Uri!! It was a pleasure meeting you and will definitely be back for more",
    product: "South African Snacks",
    flag: "🇮🇱",
    link: GOOGLE_MAPS_LINK,
  },
  {
    id: 5,
    name: "Akiva Yach",
    rating: 5,
    text: "Amazing biltong, Uri is always full of energy and is dedicated to his art.",
    product: "Biltong",
    flag: "🇮🇱",
    link: GOOGLE_MAPS_LINK,
  },
  {
    id: 6,
    name: "Miriam Gozani",
    rating: 5,
    text: "Best biltong I have tasted in a long time. Totally addictive.",
    product: "Biltong",
    flag: "🇮🇱",
    link: GOOGLE_MAPS_LINK,
  },
  {
    id: 7,
    name: "Moshe Sevitz",
    rating: 5,
    text: "Excellent service, even better biltong. If 10 stars was an option I'd choose 11.",
    product: "Biltong",
    flag: "🇮🇱",
    link: GOOGLE_MAPS_LINK,
  },
  {
    id: 8,
    name: "Avigdor Book",
    rating: 5,
    text: "Great product! Tastes awesome and nothing like service with a smile :)",
    product: "Biltong",
    flag: "🇮🇱",
    link: GOOGLE_MAPS_LINK,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="w-4 h-4"
          style={{
            color: i <= rating ? "oklch(0.75 0.15 75)" : "oklch(0.30 0.005 60)",
            fill: i <= rating ? "oklch(0.75 0.15 75)" : "none",
          }}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <a
      href={review.link}
      draggable={false}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${review.name}'s review on Google Maps (opens in a new tab)`}
      className="review-card flex-shrink-0 w-72 sm:w-80 md:w-96 p-4 sm:p-6 rounded-lg border mx-2 sm:mx-3 flex flex-col cursor-pointer"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "oklch(1 0 0 / 0.10)",
        direction: "ltr",
      }}
    >
      <StarRating rating={review.rating} />
      <p
        className="font-quote mt-3 mb-4 text-sm leading-relaxed"
        style={{
          color: "oklch(0.85 0.020 75)",
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
        }}
      >
        "{review.text}"
      </p>
      <div className="flex items-center justify-between mb-4">
        <div
          className="font-body font-bold text-sm"
          style={{ color: "oklch(0.94 0.025 75)" }}
        >
          {review.flag} {review.name}
        </div>
        {review.product && (
          <span
            className="font-body text-xs px-2 py-1 rounded"
            style={{
              backgroundColor: "oklch(0.13 0.005 60)",
              color: "var(--accent)",
            }}
          >
            {review.product}
          </span>
        )}
      </div>
      <span className="review-card-link">
        Read on Google Maps
        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
      </span>
    </a>
  );
}

export default function ReviewsSection() {
  const { language } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);

  const handleScrollToProducts = () => {
    // Smooth scroll to products section
    const productsSection = document.getElementById("products");
    if (productsSection) {
      scrollToTarget(productsSection);
    }
  };

  // Native horizontal scrolling (swipe, trackpad, wheel+shift, drag, arrows) with a slow
  // auto-drift that stops while the visitor is interacting and resumes a few seconds later.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let pos = track.scrollLeft;
    let pausedUntil = 0;
    let hovering = false;
    let raf = 0;
    const speed = 0.4; // px per frame

    const holdOff = (ms = 4000) => { pausedUntil = performance.now() + ms; };

    // Cache the loop width (reading scrollWidth every frame forces layout work)
    let half = track.scrollWidth / 2;
    const ro = new ResizeObserver(() => { half = track.scrollWidth / 2; });
    ro.observe(track);

    // Only animate while the row is on screen; no frames are spent while it's scrolled away
    let onScreen = false;

    const tick = (t: number) => {
      raf = 0;
      if (!onScreen) return;
      if (!reduced && !hovering && t > pausedUntil && document.visibilityState === "visible") {
        pos += speed;
        if (pos >= half) pos -= half; // seamless loop over the duplicated list
        track.scrollLeft = pos;
      } else {
        pos = track.scrollLeft;
        if (pos >= half) { pos -= half; track.scrollLeft = pos; }
      }
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen && !raf) { pos = track.scrollLeft; raf = requestAnimationFrame(tick); }
    });
    io.observe(track);

    // Mouse drag to scroll (touch already scrolls natively). The pointer is only captured once
    // the mouse has actually moved, so a plain click still reaches the review link.
    let dragX = 0, dragStart = 0, pressed = false, dragging = false, moved = false, pointerId = -1;
    const down = (e: PointerEvent) => {
      holdOff();
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      pressed = true; dragging = false; moved = false; dragX = e.clientX; dragStart = track.scrollLeft; pointerId = e.pointerId;
    };
    const move = (e: PointerEvent) => {
      if (!pressed) return;
      const dx = e.clientX - dragX;
      if (!dragging && Math.abs(dx) > 5) {
        dragging = true; moved = true;
        track.setPointerCapture(pointerId);
        track.classList.add("is-dragging");
      }
      if (!dragging) return;
      track.scrollLeft = dragStart - dx;
      holdOff();
    };
    const up = () => {
      pressed = false;
      if (dragging && track.hasPointerCapture(pointerId)) track.releasePointerCapture(pointerId);
      dragging = false;
      track.classList.remove("is-dragging");
    };
    const clickGuard = (e: MouseEvent) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } };
    const wheel = () => holdOff();
    const enter = () => { hovering = true; };
    const leave = () => { hovering = false; holdOff(1500); };

    track.addEventListener("pointerdown", down);
    track.addEventListener("pointermove", move);
    track.addEventListener("pointerup", up);
    track.addEventListener("pointercancel", up);
    track.addEventListener("click", clickGuard, true);
    track.addEventListener("wheel", wheel, { passive: true });
    track.addEventListener("touchstart", wheel, { passive: true });
    track.addEventListener("focusin", enter);
    track.addEventListener("focusout", leave);
    track.addEventListener("mouseenter", enter);
    track.addEventListener("mouseleave", leave);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      track.removeEventListener("pointerdown", down);
      track.removeEventListener("pointermove", move);
      track.removeEventListener("pointerup", up);
      track.removeEventListener("pointercancel", up);
      track.removeEventListener("click", clickGuard, true);
      track.removeEventListener("wheel", wheel);
      track.removeEventListener("touchstart", wheel);
      track.removeEventListener("focusin", enter);
      track.removeEventListener("focusout", leave);
      track.removeEventListener("mouseenter", enter);
      track.removeEventListener("mouseleave", leave);
    };
  }, []);

  const scrollByCard = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const step = card ? card.getBoundingClientRect().width + 16 : 320;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section
      id="reviews"
      className="py-20 md:py-28 overflow-hidden"
      style={{ backgroundColor: "oklch(0.13 0.005 60)" }}
    >
      <div className="container mb-12">
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
          <h2 className="section-title">
            {translations.reviews.title[language]}{" "}
            <span style={{ color: "var(--accent)" }}>{translations.reviews.haveSpoken[language]}</span>
          </h2>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-5 h-5" style={{ color: "oklch(0.75 0.15 75)", fill: "oklch(0.75 0.15 75)" }} />
              ))}
            </div>
            <span className="font-body font-bold text-lg" style={{ color: "oklch(0.94 0.025 75)" }}>5.0</span>
            <span className="font-body text-sm" style={{ color: "oklch(0.55 0.015 75)" }}>{translations.reviews.happyCustomers[language]}</span>
          </div>
        </div>
      </div>

      {/* Scrollable row */}
      <div className="relative" style={{ direction: "ltr" }}>
        {/* Fade edges */}
        <div
          className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 md:w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, oklch(0.13 0.005 60), transparent)" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 md:w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, oklch(0.13 0.005 60), transparent)" }}
        />

        <button type="button" className="reviews-arrow left-2 md:left-6" onClick={() => scrollByCard(-1)} aria-label={language === "en" ? "Previous reviews" : "ביקורות קודמות"}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button type="button" className="reviews-arrow right-2 md:right-6" onClick={() => scrollByCard(1)} aria-label={language === "en" ? "More reviews" : "עוד ביקורות"}>
          <ChevronRight className="w-5 h-5" />
        </button>

        <div
          ref={trackRef}
          className="reviews-track flex px-2 sm:px-4 md:px-8"
          style={{ direction: "ltr" }}
          tabIndex={0}
          role="region"
          aria-label={language === "en" ? "Customer reviews, scroll sideways" : "ביקורות לקוחות, גללו הצידה"}
        >
          {/* Duplicate for seamless loop */}
          {[...reviews, ...reviews].map((review, i) => (
            <ReviewCard key={`${review.id}-${i}`} review={review} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="container mt-12 text-center">
        <p
          className="font-body text-sm mb-4"
          style={{ color: "oklch(0.55 0.015 75)" }}
        >
          {translations.reviews.joinHundreds[language]}
        </p>
        <button
          onClick={handleScrollToProducts}
          className="inline-flex items-center gap-2 px-6 py-3 rounded font-body font-bold text-sm transition-all hover:scale-105 border cursor-pointer"
          style={{
            color: "oklch(0.94 0.025 75)",
            borderColor: "oklch(1 0 0 / 0.2)",
            backgroundColor: "var(--card)",
          }}
        >
          {translations.reviews.beNext[language]}
        </button>
      </div>
    </section>
  );
}
