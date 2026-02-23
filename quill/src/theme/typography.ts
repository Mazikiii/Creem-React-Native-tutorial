import { Platform } from "react-native";

// typography — serif for content, sans for ui chrome

const fontFamily = Platform.select({
  ios: {
    regular: "Georgia",
    sans: "System",
  },
  android: {
    regular: "serif",
    sans: "sans-serif",
  },
  default: {
    regular: "Georgia",
    sans: "System",
  },
});

export const typography = {
  fonts: {
    serif: fontFamily?.regular ?? "Georgia",
    sans: fontFamily?.sans ?? "System",
  },

  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    "2xl": 30,
    "3xl": 36,
  },

  lineHeights: {
    tight: 1.2,
    snug: 1.4,
    normal: 1.6,
    relaxed: 1.75,
  },

  // rn requires string literals for font weights
  weights: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },

  tracking: {
    tight: -0.5,
    normal: 0,
    wide: 0.3,
    wider: 0.6,
    widest: 1.2,
  },
} as const;

// 4pt base grid
export const spacing = {
  "0": 0,
  "1": 4,
  "2": 8,
  "3": 12,
  "4": 16,
  "5": 20,
  "6": 24,
  "8": 32,
  "10": 40,
  "12": 48,
  "16": 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export type SpacingKey = keyof typeof spacing;
export type RadiusKey = keyof typeof radius;
