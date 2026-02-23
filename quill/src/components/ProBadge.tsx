import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, typography, spacing, radius } from "../theme";

export function ProBadge() {
  return (
    <View style={styles.badge}>
      <Text style={styles.icon}>✦</Text>
      <Text style={styles.label}>Pro</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["1"],
    backgroundColor: colors.accentSubtle,
    paddingHorizontal: spacing["2"],
    paddingVertical: spacing["1"],
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
  icon: {
    fontSize: typography.sizes.xs,
    color: colors.accent,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.semibold,
    color: colors.accent,
    letterSpacing: typography.tracking.wider,
    textTransform: "uppercase",
  },
});
