import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initSmoothScroll } from "./lib/smoothScroll";
import { initReveal } from "./lib/reveal";
import { initHeroParallax } from "./lib/parallax";

// Umami analytics: only load when both settings are configured, so local
// builds don't request a placeholder URL and log a 404.
const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
const analyticsWebsiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;
if (analyticsEndpoint && analyticsWebsiteId) {
  const script = document.createElement("script");
  script.defer = true;
  script.src = `${analyticsEndpoint}/umami`;
  script.dataset.websiteId = analyticsWebsiteId;
  document.head.appendChild(script);
}

createRoot(document.getElementById("root")!).render(<App />);

// Smooth wheel scrolling and reveal-on-scroll, started right after the first render.
// (setTimeout rather than requestAnimationFrame, so it also starts in a tab opened in the background.)
setTimeout(() => {
  initSmoothScroll();
  initReveal();
  initHeroParallax();
}, 0);
