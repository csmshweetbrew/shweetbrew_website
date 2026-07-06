/**
 * SHWEETBREW COLOR CONFIGURATION
 * Centralized color definitions for easy management and theming
 * Update these values to change colors throughout the entire site
 */

export const BRAND_COLORS = {
  // Primary brand color - used for accents, buttons, badges
  primary: "var(--accent)",
  primaryBright: "#e63946",
  
  // Background and text
  charcoal: "oklch(0.15 0.005 60)",
  charcoalMid: "oklch(0.20 0.005 60)",
  charcoalLight: "oklch(0.28 0.008 60)",
  cream: "oklch(0.94 0.025 75)",
  creamDim: "oklch(0.80 0.020 75)",
  
  // Accent colors
  israeliBlue: "oklch(0.35 0.15 260)",
  israeliBlueLightish: "oklch(0.50 0.18 260)",
  gold: "oklch(0.75 0.15 75)",
  red: "oklch(0.48 0.20 25)",
};

// Helper function to get primary color
export const getPrimaryColor = () => BRAND_COLORS.primary;

// Helper function to get primary bright color
export const getPrimaryBrightColor = () => BRAND_COLORS.primaryBright;
