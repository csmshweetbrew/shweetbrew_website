/*
 * SHWEETBREW FOOTER
 * Design: Dark charcoal background, red accents, horizontal layout
 * Logo left, description, social links, and two columns right
 */

import { Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/config/languages";
import { SOCIAL_LINKS, CONTACT_INFO, NAV_LINKS } from "@/config/constants";
import { getPrimaryColor } from "@/config/colors";

export default function Footer() {
  const { language } = useLanguage();
  const navLinks = language === "en" ? NAV_LINKS.en : NAV_LINKS.he;

  const handleNavClick = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer
      style={{ backgroundColor: "oklch(0.10 0.005 60)", borderTop: "1px solid oklch(1 0 0 / 0.08)" }}
    >
      {/* Main footer */}
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left: Brand Section */}
          <div className="flex flex-col items-start">
            {/* Logo */}
            <div className="mb-4 w-40">
              <svg
                viewBox="0 0 600 602"
                className="w-full h-auto"
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
            </div>

            {/* Description */}
            <p
              className="font-body text-sm leading-relaxed mb-4"
              style={{ color: "oklch(0.60 0.015 75)" }}
            >
              {translations.footer.tagline[language]}
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
                {/* Instagram */}
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded flex items-center justify-center border transition-all hover:scale-110"
                  style={{
                    backgroundColor: "oklch(0.18 0.006 60)",
                    borderColor: "oklch(1 0 0 / 0.12)",
                    color: "oklch(0.70 0.015 75)",
                  }}
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a
                  href={SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded flex items-center justify-center border transition-all hover:scale-110"
                  style={{
                    backgroundColor: "oklch(0.18 0.006 60)",
                    borderColor: "oklch(1 0 0 / 0.12)",
                    color: "oklch(0.70 0.015 75)",
                  }}
                  aria-label="Facebook"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded flex items-center justify-center border transition-all hover:scale-110"
                  style={{
                    backgroundColor: "oklch(0.18 0.006 60)",
                    borderColor: "oklch(1 0 0 / 0.12)",
                    color: "oklch(0.70 0.015 75)",
                  }}
                  aria-label="LinkedIn"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                  </svg>
                </a>
                {/* Twitter */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded flex items-center justify-center border transition-all hover:scale-110"
                  style={{
                    backgroundColor: "oklch(0.18 0.006 60)",
                    borderColor: "oklch(1 0 0 / 0.12)",
                    color: "oklch(0.70 0.015 75)",
                  }}
                  aria-label="Twitter"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417a9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
          </div>

          {/* Center: Quick Links */}
          <div>
            <h4
              className="font-display text-lg mb-4 tracking-wider"
              style={{ fontFamily: "'Bebas Neue', sans-serif", color: "oklch(0.94 0.025 75)", letterSpacing: "0.1em" }}
            >
              {language === "en" ? "Quick Links" : "קישורים מהירים"}
            </h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="font-body text-sm transition-colors hover:text-fire"
                    style={{ color: "oklch(0.60 0.015 75)" }}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Contact */}
          <div>
            <h4
              className="font-display text-lg mb-4 tracking-wider"
              style={{ fontFamily: "'Bebas Neue', sans-serif", color: "oklch(0.94 0.025 75)", letterSpacing: "0.1em" }}
            >
              {language === "en" ? "Contact" : "צור קשר"}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--accent)" }} />
                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsapp.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm transition-colors hover:text-fire"
                  style={{ color: "oklch(0.60 0.015 75)" }}
                >
                  {CONTACT_INFO.whatsappDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--accent)" }} />
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="font-body text-sm transition-colors hover:text-fire"
                  style={{ color: "oklch(0.60 0.015 75)" }}
                >
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--accent)" }} />
                <span
                  className="font-body text-sm"
                  style={{ color: "oklch(0.60 0.015 75)" }}
                >
                  {language === "en" ? "Based in Modiin, Israel" : "ממוקומים במודיעין, ישראל"}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-8 pt-6 border-t flex flex-col md:flex-row items-center justify-between"
          style={{ borderColor: "oklch(1 0 0 / 0.08)" }}
        >
          <p
            className="font-body text-xs"
            style={{ color: "oklch(0.40 0.010 75)" }}
          >
            © {new Date().getFullYear()} Shweet Brew. {language === "en" ? "All rights reserved. Made with 🇿🇦 love in 🇮🇱 Israel." : "כל הזכויות שמורות. עשוי באהבה 🇿🇦 בישראל 🇮🇱."}
          </p>
          <div className="flex items-center gap-1 mt-4 md:mt-0">
            <span className="font-body text-xs" style={{ color: "oklch(0.35 0.010 75)" }}>
              {language === "en" ? "Am Yisrael Chai" : "עם ישראל חי"}
            </span>
            <span className="text-sm">✡</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
