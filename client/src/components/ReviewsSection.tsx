/*
 * SHWEETBREW REVIEWS SECTION
 * Design: Dark background, gold star ratings, Playfair Display italic quotes
 * Marquee/ticker animation for reviews, plus static featured reviews
 */

import { useRef, useEffect } from "react";
import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/config/languages";
import { getWhatsAppLink } from "@/config/site";

type Review = {
  id: number;
  name: string;
  location: string;
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
    location: "Modiin",
    rating: 5,
    text: "I just finished a bag of Shweet Brew's delicious biltong and it was great, will definitely be buying again! Uri can also make different styles or order however you like it, so might try some different options out as well. Thanks for the great treat! The chilli was fantastic as well, by the way.",
    product: "Biltong",
    flag: "🇮🇱",
    link: GOOGLE_MAPS_LINK,
  },
  {
    id: 2,
    name: "Craig Gerber",
    location: "Modiin",
    rating: 5,
    text: "Best biltong in town. Shweet brew chilli sauce is unbelievable and goes with everything",
    product: "Biltong & Sauce",
    flag: "🇮🇱",
    link: GOOGLE_MAPS_LINK,
  },
  {
    id: 3,
    name: "Shmuel Shantall",
    location: "Modiin",
    rating: 5,
    text: "Shweet Brew totally enhanced our shabbat experience! Top quality taste and texture awakening the African in me! Look forward to my next biltong binge",
    product: "Biltong",
    flag: "🇮🇱",
    link: GOOGLE_MAPS_LINK,
  },
  {
    id: 4,
    name: "Avi Ettinger",
    location: "Modiin",
    rating: 5,
    text: "First time trying these South African snacks - Amazing!! Thanks you Uri!! It was a pleasure meeting you and will definitely be back for more",
    product: "South African Snacks",
    flag: "🇮🇱",
    link: GOOGLE_MAPS_LINK,
  },
  {
    id: 5,
    name: "Akiva Yach",
    location: "Modiin",
    rating: 5,
    text: "Amazing biltong, Uri is always full of energy and is dedicated to his art.",
    product: "Biltong",
    flag: "🇮🇱",
    link: GOOGLE_MAPS_LINK,
  },
  {
    id: 6,
    name: "Miriam Gozani",
    location: "Modiin",
    rating: 5,
    text: "Best biltong I have tasted in a long time. Totally addictive.",
    product: "Biltong",
    flag: "🇮🇱",
    link: GOOGLE_MAPS_LINK,
  },
  {
    id: 7,
    name: "Moshe Sevitz",
    location: "Modiin",
    rating: 5,
    text: "Excellent service, even better biltong. If 10 stars was an option I'd choose 11.",
    product: "Biltong",
    flag: "🇮🇱",
    link: GOOGLE_MAPS_LINK,
  },
  {
    id: 8,
    name: "Avigdor Book",
    location: "Modiin",
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
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 w-72 sm:w-80 md:w-96 p-4 sm:p-6 rounded-lg border mx-2 sm:mx-3 block transition-all hover:scale-105 hover:shadow-lg cursor-pointer"
      style={{
        backgroundColor: "oklch(0.18 0.006 60)",
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
      <div className="flex items-center justify-between">
        <div>
          <div
            className="font-body font-bold text-sm"
            style={{ color: "oklch(0.94 0.025 75)" }}
          >
            {review.flag} {review.name}
          </div>
          <div
            className="font-body text-xs"
            style={{ color: "oklch(0.55 0.015 75)" }}
          >
            {review.location}
          </div>
        </div>
        {review.product && (
          <span
            className="font-body text-xs px-2 py-1 rounded"
            style={{
              backgroundColor: "oklch(0.22 0.006 60)",
              color: "var(--accent)",
            }}
          >
            {review.product}
          </span>
        )}
      </div>
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
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let pos = 0;
    const speed = 0.5;
    let paused = false;
    let raf: number;

    const animate = () => {
      if (!paused) {
        pos -= speed;
        const halfWidth = track.scrollWidth / 2;
        if (Math.abs(pos) >= halfWidth) pos = 0;
        track.style.transform = `translateX(${pos}px)`;
      }
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    track.addEventListener("mouseenter", pause);
    track.addEventListener("mouseleave", resume);

    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("mouseenter", pause);
      track.removeEventListener("mouseleave", resume);
    };
  }, []);

  return (
    <section
      id="reviews"
      className="py-20 md:py-28 overflow-hidden"
      style={{ backgroundColor: "oklch(0.13 0.005 60)" }}
    >
      <div className="container mb-12">
        <div
          className="font-body text-xs tracking-widest uppercase mb-3"
          style={{ color: "var(--accent)", letterSpacing: "0.25em" }}
        >
          — {translations.reviews.subtitle[language]} —
        </div>
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
          <h2
            className="font-display leading-none"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              color: "oklch(0.94 0.025 75)",
            }}
          >
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

      {/* Marquee */}
      <div className="relative overflow-hidden px-2 sm:px-4 md:px-8" style={{ direction: "ltr" }}>
        {/* Fade edges */}
        <div
          className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 md:w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, oklch(0.13 0.005 60), transparent)" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 md:w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, oklch(0.13 0.005 60), transparent)" }}
        />

        <div ref={trackRef} className="flex" style={{ willChange: "transform", direction: "ltr" }}>
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
            backgroundColor: "oklch(0.18 0.006 60)",
          }}
        >
          {translations.reviews.beNext[language]}
        </button>
      </div>
    </section>
  );
}
