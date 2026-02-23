import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, radius, shadows } from "../theme";
import { DocumentCard } from "../components/DocumentCard";
import { ProBadge } from "../components/ProBadge";
import { UsageCounter } from "../components/UsageCounter";
import { useAppStore } from "../store/useAppStore";
import type { HomeScreenProps } from "../types/navigation";

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { documents, isPro, dailyUsageCount } = useAppStore();

  function handleOpenDocument(id: string) {
    navigation.navigate("Editor", { documentId: id });
  }

  function handleNewDocument() {
    const id = Date.now().toString();
    navigation.navigate("Editor", { documentId: id });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.wordmark}>Quill</Text>
            {isPro && <ProBadge />}
          </View>
          <TouchableOpacity
            style={styles.newButton}
            onPress={handleNewDocument}
            activeOpacity={0.75}
          >
            <Text style={styles.newButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {/* Free usage counter — hidden for Pro users */}
        {!isPro && (
          <View style={styles.counterRow}>
            <UsageCounter used={dailyUsageCount} />
          </View>
        )}

        {/* Section label */}
        <Text style={styles.sectionLabel}>Recent</Text>

        {/* Document list */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onPress={handleOpenDocument}
            />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing["5"],
    paddingTop: spacing["4"],
    paddingBottom: spacing["3"],
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
  },
  wordmark: {
    fontSize: typography.sizes["2xl"],
    fontFamily: typography.fonts.serif,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: typography.tracking.tight,
  },
  newButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing["4"],
    paddingVertical: spacing["2"],
    borderRadius: radius.full,
    ...shadows.sm,
  },
  newButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.semibold,
    color: colors.textInverse,
    letterSpacing: typography.tracking.wide,
  },
  counterRow: {
    paddingHorizontal: spacing["5"],
    paddingBottom: spacing["3"],
  },
  sectionLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.semibold,
    color: colors.textMuted,
    letterSpacing: typography.tracking.widest,
    textTransform: "uppercase",
    paddingHorizontal: spacing["5"],
    paddingBottom: spacing["3"],
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing["5"],
    paddingBottom: spacing["8"],
  },
});
