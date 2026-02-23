import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, typography, spacing, radius, shadows } from "../theme";
import type { Document } from "../types";

type Props = {
  document: Document;
  onPress: (id: string) => void;
};

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function getPreview(body: string): string {
  return body.length > 100 ? body.slice(0, 100).trimEnd() + "..." : body;
}

export function DocumentCard({ document, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(document.id)}
      activeOpacity={0.75}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {document.title}
          </Text>
          <Text style={styles.time}>{formatRelativeTime(document.updatedAt)}</Text>
        </View>
        <Text style={styles.preview} numberOfLines={2}>
          {getPreview(document.body)}
        </Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.wordCountPill}>
          <Text style={styles.wordCountText}>
            {document.body.split(/\s+/).filter(Boolean).length} words
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgDefault,
    borderRadius: radius.lg,
    padding: spacing["4"],
    marginBottom: spacing["3"],
    ...shadows.md,
  },
  inner: {
    gap: spacing["2"],
    marginBottom: spacing["3"],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing["2"],
  },
  title: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.serif,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: typography.tracking.tight,
  },
  time: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.sans,
    color: colors.textMuted,
    flexShrink: 0,
  },
  preview: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.serif,
    color: colors.textSecondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  wordCountPill: {
    backgroundColor: colors.bgDark,
    paddingHorizontal: spacing["2"],
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  wordCountText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.sans,
    color: colors.textMuted,
  },
});
