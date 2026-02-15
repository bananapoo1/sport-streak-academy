export const designTokens = {
  spacing: { base: 8, xs: 8, sm: 16, md: 24, lg: 32 },
  radius: { card: 12, button: 999 },
  typography: {
    h1: { size: 36, weight: 700 },
    h2: { size: 24, weight: 700 },
    body: { size: 16, weight: 400 },
    small: { size: 13, weight: 400 },
  },
  colors: {
    primary: "#06b6d4",
    accent: "#34d399",
    bg: "#ffffff",
    cardBg: "#f8fafc",
    text: "#0f172a",
    muted: "#94a3b8",
  },
  motion: {
    fast: 120,
    normal: 300,
    celebrate: 800,
    easing: "cubic-bezier(.2,.8,.2,1)",
  },
} as const;

export type DesignTokens = typeof designTokens;
