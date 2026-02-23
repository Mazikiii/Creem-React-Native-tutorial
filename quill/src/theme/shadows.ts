import { Platform } from "react-native";

// shadows, ios uses shadow props, android uses elevation

const isIOS = Platform.OS === "ios";

const ios = (opacity: number, radius: number, offsetY: number) => ({
  shadowColor: "#000",
  shadowOffset: { width: 0, height: offsetY },
  shadowOpacity: opacity,
  shadowRadius: radius,
});

const android = (elevation: number) => ({
  elevation,
});

const shadow = (
  iosOpacity: number,
  iosRadius: number,
  iosOffsetY: number,
  androidElevation: number,
) =>
  isIOS ? ios(iosOpacity, iosRadius, iosOffsetY) : android(androidElevation);

export const shadows = {
  sm: shadow(0.08, 4, 1, 2),
  md: shadow(0.12, 8, 4, 6),
  lg: shadow(0.18, 16, 8, 12),
  none: {},
} as const;

export type ShadowKey = keyof typeof shadows;
