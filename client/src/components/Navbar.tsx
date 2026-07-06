/*
 * SHWEETBREW NAVBAR
 * Design: "Braai Fire & Blue Star" — dark charcoal base, Israeli blue accents, fire orange CTA
 * Sticky navigation with smooth scroll links and WhatsApp CTA
 */

import { useState, useEffect } from "react";
import { Menu, X, Globe } from "lucide-react";
import { useLocation } from "wouter";
import { SITE_CONFIG, getWhatsAppLink } from "@/config/site";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/config/languages";
import { getPrimaryColor } from "@/config/colors";

type NavLink = {
  key: string;
  href: string;
  isPage: boolean;
};

const navLinks: NavLink[] = [
  { key: "products", href: "#products", isPage: false },
  { key: "delivery", href: "#delivery", isPage: false },
  { key: "order", href: "#order", isPage: false },
  { key: "reviews", href: "#reviews", isPage: false },
  { key: "about", href: "#about", isPage: false },
  { key: "faq", href: "#faq", isPage: false },
  { key: "contact", href: "#contact", isPage: false },
];

const WHATSAPP_URL = getWhatsAppLink("Hi Shweet Brew! I'd like to place an order 🥩");

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [, navigate] = useLocation();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string, isPage: boolean) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[oklch(0.13_0.005_60/0.97)] backdrop-blur-md shadow-lg shadow-black/40 border-b border-white/10"
          : "bg-transparent"
      }`}
      style={{ direction: "ltr" }}
    >
      <div className="container flex items-center justify-between h-14 sm:h-16 md:h-20" style={{ direction: "ltr" }}>
        {/* Logo */}
        <button
          onClick={() => handleNavClick("#landing", false)}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <svg
            viewBox="0 0 600.000000 602.000000"
            className="w-auto h-24 sm:h-32 md:h-36 lg:h-48 group-hover:scale-105 transition-transform"
            style={{ fill: getPrimaryColor() }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="translate(0.000000,602.000000) scale(0.100000,-0.100000)" fill={getPrimaryColor()} stroke="none">
              <path d="M2247 4011 c-54 -16 -99 -30 -102 -32 -2 -3 5 -38 16 -79 27 -98 36 -229 19 -270 -26 -64 -84 -84 -173 -59 -62 17 -70 38 -62 186 3 70 8 152 11 182 l6 54 -89 -8 c-48 -4 -91 -10 -95 -13 -4 -4 2 -110 13 -237 14 -166 19 -292 17 -450 l-3 -220 45 -3 46 -3 11 147 c8 100 17 152 26 161 20 21 93 35 135 27 104 -19 126 -56 127 -212 l0 -113 47 2 c73 4 73 3 60 118 -21 183 -8 416 38 708 22 138 23 143 13 142 -5 0 -52 -13 -106 -28z"/>
              <path d="M1305 4010 c-16 -5 -53 -33 -81 -62 -44 -46 -53 -63 -68 -126 -21 -84 -17 -134 18 -207 55 -116 121 -175 242 -215 110 -37 145 -91 129 -197 -24 -163 -234 -122 -262 52 l-5 34 -88 3 c-141 5 -142 3 -76 -86 55 -73 99 -109 173 -144 52 -24 70 -27 163 -27 125 0 156 13 196 80 50 86 40 220 -22 294 -14 17 -53 40 -91 56 -154 61 -231 126 -258 219 -36 122 -1 226 81 242 70 13 148 -40 158 -109 22 -142 16 -129 71 -144 86 -22 89 -21 82 39 -8 66 -42 168 -70 209 -35 52 -117 91 -195 95 -37 2 -80 -1 -97 -6z"/>
              <path d="M3475 4004 c-66 -8 -121 -16 -122 -18 -2 -2 3 -36 12 -77 22 -109 45 -332 45 -429 0 -109 -24 -271 -50 -350 -12 -34 -19 -65 -16 -67 3 -3 42 0 86 6 63 10 106 9 196 0 131 -15 133 -14 135 59 1 23 2 48 3 54 1 10 -18 12 -71 10 -88 -4 -153 20 -177 67 -20 37 -21 140 -2 166 14 20 82 33 179 34 l57 1 0 43 c0 23 3 60 7 81 l6 39 -74 -6 c-84 -6 -154 4 -175 24 -7 8 -16 48 -20 94 -8 95 6 159 39 176 12 7 71 15 132 18 l109 6 7 35 c4 19 5 37 3 39 -11 12 -200 8 -309 -5z"/>
              <path d="M4026 4005 c-140 -18 -137 -16 -125 -57 5 -18 19 -89 31 -158 41 -240 27 -529 -34 -684 l-19 -49 63 9 c78 11 157 11 269 0 l86 -9 6 39 c4 22 7 53 7 70 l0 32 -62 -5 c-72 -6 -140 9 -168 37 -42 42 -49 155 -12 200 15 18 33 22 125 27 l107 6 0 63 c0 34 3 69 6 78 5 14 -8 16 -104 16 -154 0 -157 2 -157 149 0 150 3 153 157 161 l112 5 10 33 c5 18 6 36 2 40 -13 13 -187 11 -300 -3z"/>
              <path d="M2424 3988 c48 -171 89 -456 121 -838 3 -30 8 -57 13 -61 4 -3 37 -9 75 -12 l67 -6 0 33 c0 93 69 412 110 502 20 46 46 57 69 30 38 -46 85 -252 101 -440 5 -65 10 -120 12 -121 2 -2 27 -6 55 -10 40 -5 54 -4 57 7 2 7 20 117 40 243 41 254 87 493 117 600 10 38 19 73 19 77 0 5 -22 8 -49 8 l-49 0 -6 -37 c-3 -21 -8 -67 -11 -103 -9 -89 -45 -361 -51 -382 -7 -23 -36 -23 -57 0 -10 10 -47 129 -83 263 -36 134 -67 250 -70 257 -3 9 -21 12 -61 10 l-58 -3 -11 -179 -12 -180 -56 -54 c-75 -72 -93 -69 -125 18 -22 59 -25 81 -25 227 -1 184 5 173 -90 173 -45 0 -48 -1 -42 -22z"/>
              <path d="M4427 4003 c-2 -4 -2 -36 1 -70 4 -63 4 -63 36 -63 17 0 60 5 95 11 46 7 67 7 75 -1 7 -7 11 -139 13 -411 1 -221 4 -403 7 -407 3 -3 32 -1 63 4 l58 9 5 378 c6 445 -7 407 136 407 51 0 104 4 118 10 24 9 26 15 26 64 0 30 -3 57 -7 59 -5 3 -57 0 -118 -5 -100 -8 -376 2 -472 18 -17 2 -33 1 -36 -3z"/>
              <path d="M2454 2838 c31 -112 40 -215 40 -478 1 -151 -3 -317 -8 -368 l-8 -93 78 3 79 3 5 208 c6 232 4 227 77 227 48 0 43 8 72 -129 32 -144 84 -247 143 -277 17 -9 63 -18 102 -21 l73 -6 12 87 c6 48 10 90 7 95 -3 4 -34 11 -70 14 -104 10 -132 26 -165 97 -34 72 -49 154 -31 175 6 8 34 21 61 30 27 9 63 28 78 41 27 22 30 32 36 109 20 237 -83 305 -463 305 -124 0 -124 0 -118 -22z m313 -53 c83 -25 124 -86 124 -183 0 -68 -31 -119 -93 -151 -34 -19 -52 -22 -81 -17 -77 14 -110 76 -123 233 -7 70 -6 72 24 102 35 36 70 39 149 16z"/>
              <path d="M3293 2846 c-56 -6 -104 -14 -107 -17 -3 -3 1 -37 9 -75 40 -196 56 -462 35 -609 -13 -89 -39 -192 -56 -227 -8 -15 -11 -29 -6 -31 4 -3 46 2 94 9 74 12 103 12 200 0 62 -8 117 -10 122 -6 4 5 10 37 13 72 l5 63 -90 0 c-102 0 -132 14 -165 76 -27 52 -19 135 17 166 24 21 37 23 122 23 67 0 96 4 99 13 2 6 5 44 8 83 l4 71 -109 -1 c-107 -1 -110 0 -133 26 -44 51 -44 205 0 256 21 24 28 26 138 30 l117 4 6 34 c3 18 3 37 -1 43 -8 14 -186 12 -322 -3z"/>
              <path d="M4086 2823 c-3 -21 -8 -94 -11 -163 -9 -169 -15 -190 -74 -239 -50 -42 -81 -51 -98 -28 -5 6 -18 35 -29 62 -16 42 -19 76 -19 215 0 98 -4 168 -10 172 -11 9 -125 11 -125 3 0 -3 9 -45 19 -93 45 -203 86 -500 99 -727 l7 -110 67 -9 c92 -11 98 -8 98 57 0 111 65 403 108 486 28 55 58 53 83 -3 40 -91 89 -341 89 -455 0 -70 6 -81 45 -81 57 0 83 15 89 52 61 378 120 688 154 810 11 37 17 70 14 73 -9 8 -90 6 -96 -3 -3 -5 -12 -67 -21 -138 -9 -71 -22 -184 -31 -251 -8 -68 -17 -129 -20 -138 -7 -19 -48 -20 -63 -2 -10 13 -102 341 -131 467 -15 67 -30 80 -91 80 -47 0 -47 0 -53 -37z"/>
              <path d="M1867 2843 c-15 -4 -18 -11 -13 -36 16 -93 16 -150 1 -332 -19 -238 -49 -479 -70 -554 -15 -59 -12 -76 13 -66 9 3 91 21 182 40 216 46 320 78 349 109 28 30 40 85 41 186 0 92 -16 123 -85 160 -28 15 -51 33 -53 41 -1 8 20 26 49 42 65 36 82 74 77 172 -3 59 -8 78 -29 106 -61 79 -224 140 -368 138 -42 -1 -84 -3 -94 -6z m253 -95 c38 -19 48 -31 63 -73 46 -131 -14 -243 -137 -253 -65 -5 -60 -16 -77 177 -11 136 -11 145 6 158 28 20 95 16 145 -9z m-11 -414 c125 -37 188 -163 127 -256 -21 -32 -119 -85 -173 -94 -57 -9 -84 20 -117 125 -33 103 -35 192 -6 221 25 25 94 27 169 4z"/>
            </g>
          </svg>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href, link.isPage)}
              className="font-body text-sm font-700 tracking-widest uppercase transition-colors hover:text-fire"
              style={{ color: "oklch(0.80 0.020 75)", letterSpacing: "0.12em" }}
            >
              {translations.navbar[link.key as keyof typeof translations.navbar][language]}
            </button>
          ))}
        </div>

        {/* Language Toggle & WhatsApp CTA */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === "en" ? "he" : "en")}
            className="p-2 rounded transition-all hover:scale-110 hover:bg-white/10"
            style={{
              color: "var(--accent)",
            }}
            title={language === "en" ? "Switch to Hebrew" : "Switch to English"}
            aria-label="Toggle language"
          >
            <Globe className="w-5 h-5" />
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded font-body font-bold text-sm tracking-wide transition-all hover:scale-105 whatsapp-pulse"
            style={{
              backgroundColor: "#25D366",
              color: "#fff",
              boxShadow: "0 0 15px rgba(37,211,102,0.35)",
            }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {translations.navbar.orderOnWhatsApp[language]}
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded transition-colors"
          style={{ color: "oklch(0.94 0.025 75)" }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t border-white/10"
          style={{ backgroundColor: "oklch(0.13 0.005 60/0.98)" }}
        >
          <div className="container py-4 flex flex-col gap-1">
            {/* Language Toggle Mobile */}
            <button
              onClick={() => setLanguage(language === "en" ? "he" : "en")}
              className="py-3 px-2 font-body font-bold tracking-widest uppercase text-sm border-b border-white/5 transition-colors hover:text-fire flex items-center gap-2"
              style={{ color: "oklch(0.80 0.020 75)", letterSpacing: "0.12em" }}
              title={language === "en" ? "Switch to Hebrew" : "Switch to English"}
            >
              <Globe className="w-4 h-4" />
              {language === "en" ? "עברית" : "English"}
            </button>
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href, link.isPage)}
                className="text-left py-3 px-2 font-body font-bold tracking-widest uppercase text-sm border-b border-white/5 transition-colors hover:text-fire"
                style={{ color: "oklch(0.80 0.020 75)", letterSpacing: "0.12em" }}
              >
                {translations.navbar[link.key as keyof typeof translations.navbar][language]}
              </button>
            ))}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 py-3 rounded font-body font-bold text-sm tracking-wide"
              style={{ backgroundColor: "#25D366", color: "#fff" }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {translations.navbar.orderOnWhatsApp[language]}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
