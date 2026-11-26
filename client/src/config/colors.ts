/**
 * SHWEETBREW COLOR CONFIGURATION
 * Constants for inline styles. These mirror the tokens in client/src/index.css
 * (the source of truth) — keep both in sync. See design-system.md.
 */

export const BRAND_COLORS = {
  // Shweet Red — the brand color: buttons, prices, labels, logo
  primary: "var(--accent)",
  primaryBright: "#e63946",

  // Backgrounds and text
  heroBlack: "oklch(0.10 0.005 60)",
  charcoal: "oklch(0.13 0.005 60)", // page background (--background)
  card: "var(--card)", // oklch(0.21 0.006 60)
  cream: "oklch(0.94 0.025 75)", // headings and strong text (--foreground)
  creamDim: "oklch(0.80 0.020 75)", // body copy

  // Accent colors
  israeliBlue: "oklch(0.50 0.18 260)", // blue for text and accents
  israeliBlueDeep: "oklch(0.35 0.15 260)", // blue for fills and glows (--primary)
  gold: "oklch(0.75 0.15 75)",
  destructive: "oklch(0.48 0.20 25)", // errors / spice level 5 (--destructive)
};

// Helper function to get primary color
export const getPrimaryColor = () => BRAND_COLORS.primary;

// Helper function to get primary bright color
export const getPrimaryBrightColor = () => BRAND_COLORS.primaryBright;
