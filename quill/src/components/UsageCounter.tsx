import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, typography, spacing, radius } from "../theme";
import { FREE_DAILY_LIMIT } from "../types";

type Props = {
  used: number;
};

export function UsageCounter({ used }: Props) {
  const remaining = Math.max(0, FREE_DAILY_LIMIT - used);
  const isLow = remaining <= 1;
  const isEmpty = remaining === 0;

  return (
    <View style={[styles.container, isEmpty && styles.containerEmpty]}>
      <View style={styles.dots}>
        {Array.from({ length: FREE_DAILY_LIMIT }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < used ? styles.dotUsed : styles.dotFree]}
          />
        ))}
      </View>
      <Text
        style={[
          styles.label,
          isLow && !isEmpty && styles.labelLow,
          isEmpty && styles.labelEmpty,
        ]}
      >
        {isEmpty
          ? "No free uses left"
          : `${remaining} free use${remaining === 1 ? "" : "s"} remaining`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
    backgroundColor: colors.bgDefault,
    paddingHorizontal: spacing["3"],
    paddingVertical: spacing["2"],
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
  containerEmpty: {
    backgroundColor: colors.errorSubtle,
  },
  dots: {
    flexDirection: "row",
    gap: spacing["1"],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  dotFree: {
    backgroundColor: colors.accent,
  },
  dotUsed: {
    backgroundColor: colors.borderDefault,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  labelLow: {
    color: colors.warning,
  },
  labelEmpty: {
    color: colors.error,
  },
});
