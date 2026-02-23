// colors — warm cream base + forest green accent

export const colors = {
  // backgrounds (darkest to lightest)
  bgDark: "hsl(45, 15%, 93%)",
  bgDefault: "hsl(45, 20%, 98%)",
  bgLight: "hsl(0, 0%, 100%)",

  // accent — green only for pro stuff and ctas
  accent: "hsl(152, 55%, 32%)",
  accentDark: "hsl(152, 60%, 25%)",
  accentLight: "hsl(152, 45%, 42%)",
  accentSubtle: "hsl(152, 40%, 94%)",

  // text
  textPrimary: "hsl(220, 15%, 10%)",
  textSecondary: "hsl(220, 10%, 40%)",
  textMuted: "hsl(220, 8%, 62%)",
  textInverse: "hsl(0, 0%, 100%)",

  // borders — used sparingly
  borderSubtle: "hsl(45, 12%, 88%)",
  borderDefault: "hsl(45, 10%, 82%)",

  // semantic
  error: "hsl(0, 70%, 50%)",
  errorSubtle: "hsl(0, 80%, 96%)",
  warning: "hsl(38, 95%, 50%)",
  warningSubtle: "hsl(38, 100%, 95%)",

  // misc
  transparent: "transparent",
  overlay: "rgba(10, 10, 20, 0.45)",
  white: "#ffffff",
  black: "#000000",
} as const;

export type ColorKey = keyof typeof colors;
