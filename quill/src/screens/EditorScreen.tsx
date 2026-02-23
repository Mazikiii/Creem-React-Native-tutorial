import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, radius, shadows } from "../theme";
import { AIActionSheet } from "../components/AIActionSheet";
import { UsageCounter } from "../components/UsageCounter";
import { useAppStore } from "../store/useAppStore";
import { AI_ACTIONS } from "../types";
import type { AIAction } from "../types";
import type { EditorScreenProps } from "../types/navigation";

// mocked ai — not a real llm, just enough to show the payment flow

const MOCK_RESULTS: Record<string, (text: string) => string> = {
  improve: (text) =>
    text
      .replace(/\b(very|really|quite)\b/gi, "")
      .replace(/  +/g, " ")
      .trim() +
    " The argument is clear, the language precise, and the structure sound.",
  summarize: (text) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
    return sentences.slice(0, 2).join(" ").trim();
  },
  rephrase: (text) =>
    "Here is a fresh perspective: " +
    text
      .split(" ")
      .reverse()
      .slice(0, Math.ceil(text.split(" ").length * 0.6))
      .reverse()
      .join(" ") +
    ".",
  expand: (text) =>
    text +
    "\n\nTo expand on this further: the implications are broader than they first appear. Consider the second-order effects, the edge cases, and the assumptions baked into the framing. Each of these deserves its own line of inquiry.",
  fix: (text) =>
    text
      .replace(/\bi\b/g, "I")
      .replace(/\s{2,}/g, " ")
      .replace(
        /([a-z])\s*\.\s*([a-z])/g,
        (_, a, b) => `${a}. ${b.toUpperCase()}`,
      )
      .trim(),
};

function runMockAI(actionId: string, text: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fn = MOCK_RESULTS[actionId];
      resolve(fn ? fn(text) : text);
    }, 1200);
  });
}

export function EditorScreen({ navigation, route }: EditorScreenProps) {
  const { documentId } = route.params;
  const {
    documents,
    isPro,
    dailyUsageCount,
    hasReachedLimit,
    incrementUsage,
    upsertDocument,
  } = useAppStore();

  const existingDoc = documents.find((d) => d.id === documentId);

  const [title, setTitle] = useState(existingDoc?.title ?? "");
  const [body, setBody] = useState(existingDoc?.body ?? "");
  const [sheetVisible, setSheetVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<AIAction | null>(null);

  const resultOpacity = useRef(new Animated.Value(0)).current;

  function saveDocument(updatedBody?: string) {
    const now = Date.now();
    upsertDocument({
      id: documentId,
      title: title.trim() || "Untitled",
      body: updatedBody ?? body,
      createdAt: existingDoc?.createdAt ?? now,
      updatedAt: now,
    });
  }

  async function handleActionSelect(action: AIAction) {
    if (hasReachedLimit) return;

    const textToProcess = body.trim();
    if (!textToProcess) {
      setSheetVisible(false);
      return;
    }

    setSheetVisible(false);
    setIsLoading(true);
    setResult(null);
    setActiveAction(action);
    resultOpacity.setValue(0);

    incrementUsage();

    const output = await runMockAI(action.id, textToProcess);

    setResult(output);
    setIsLoading(false);

    Animated.timing(resultOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }

  function handleApplyResult() {
    if (!result) return;
    setBody(result);
    saveDocument(result);
    setResult(null);
    setActiveAction(null);
    resultOpacity.setValue(0);
  }

  function handleDiscardResult() {
    setResult(null);
    setActiveAction(null);
    resultOpacity.setValue(0);
  }

  function handleAIButtonPress() {
    if (hasReachedLimit) {
      navigation.navigate("Paywall");
      return;
    }
    setSheetVisible(true);
  }

  const hasText = body.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Nav bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => {
              saveDocument();
              navigation.goBack();
            }}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          {!isPro && <UsageCounter used={dailyUsageCount} />}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title input */}
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor={colors.textMuted}
            onBlur={() => saveDocument()}
            multiline={false}
            returnKeyType="next"
          />

          {/* Body input */}
          <TextInput
            style={styles.bodyInput}
            value={body}
            onChangeText={setBody}
            placeholder="Start writing…"
            placeholderTextColor={colors.textMuted}
            onBlur={() => saveDocument()}
            multiline
            textAlignVertical="top"
            scrollEnabled={false}
          />

          {/* Loading indicator */}
          {isLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={styles.loadingText}>
                {activeAction?.label ?? "Processing"}…
              </Text>
            </View>
          )}

          {/* AI Result card */}
          {result && !isLoading && (
            <Animated.View
              style={[styles.resultCard, { opacity: resultOpacity }]}
            >
              <View style={styles.resultHeader}>
                <Text style={styles.resultLabel}>
                  {activeAction?.icon} {activeAction?.label}
                </Text>
              </View>
              <Text style={styles.resultBody}>{result}</Text>
              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApplyResult}
                  activeOpacity={0.75}
                >
                  <Text style={styles.applyText}>Apply</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.discardButton}
                  onPress={handleDiscardResult}
                  activeOpacity={0.75}
                >
                  <Text style={styles.discardText}>Discard</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* AI button — fixed to bottom */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.aiButton,
              !hasText && styles.aiButtonDisabled,
              hasReachedLimit && styles.aiButtonLocked,
            ]}
            onPress={handleAIButtonPress}
            disabled={!hasText || isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.aiButtonIcon}>✦</Text>
            <Text style={styles.aiButtonText}>
              {hasReachedLimit ? "Upgrade for AI" : "Ask AI"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <AIActionSheet
        visible={sheetVisible}
        actions={AI_ACTIONS}
        onSelect={handleActionSelect}
        onClose={() => setSheetVisible(false)}
        disabled={hasReachedLimit}
      />
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
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing["5"],
    paddingVertical: spacing["3"],
  },
  backButton: {
    flexShrink: 0,
  },
  backText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.medium,
    color: colors.accent,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing["5"],
    paddingBottom: spacing["16"],
    gap: spacing["4"],
  },
  titleInput: {
    fontSize: typography.sizes["2xl"],
    fontFamily: typography.fonts.serif,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: typography.tracking.tight,
    paddingVertical: spacing["2"],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  bodyInput: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.serif,
    fontWeight: typography.weights.regular,
    color: colors.textPrimary,
    lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
    minHeight: 220,
    paddingTop: spacing["3"],
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
    paddingVertical: spacing["3"],
  },
  loadingText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.sans,
    color: colors.textMuted,
  },
  resultCard: {
    backgroundColor: colors.bgDefault,
    borderRadius: radius.lg,
    padding: spacing["4"],
    gap: spacing["3"],
    ...shadows.md,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.semibold,
    color: colors.accent,
    letterSpacing: typography.tracking.wider,
    textTransform: "uppercase",
  },
  resultBody: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.serif,
    color: colors.textPrimary,
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },
  resultActions: {
    flexDirection: "row",
    gap: spacing["2"],
    paddingTop: spacing["2"],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  applyButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: spacing["3"],
    borderRadius: radius.md,
    alignItems: "center",
    ...shadows.sm,
  },
  applyText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.semibold,
    color: colors.textInverse,
  },
  discardButton: {
    flex: 1,
    backgroundColor: colors.bgDark,
    paddingVertical: spacing["3"],
    borderRadius: radius.md,
    alignItems: "center",
  },
  discardText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  bottomBar: {
    paddingHorizontal: spacing["5"],
    paddingBottom: spacing["6"],
    paddingTop: spacing["3"],
    backgroundColor: colors.bgDark,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
    backgroundColor: colors.accent,
    paddingVertical: spacing["4"],
    borderRadius: radius.lg,
    ...shadows.md,
  },
  aiButtonDisabled: {
    backgroundColor: colors.borderDefault,
  },
  aiButtonLocked: {
    backgroundColor: colors.textSecondary,
  },
  aiButtonIcon: {
    fontSize: typography.sizes.base,
    color: colors.textInverse,
  },
  aiButtonText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.semibold,
    color: colors.textInverse,
    letterSpacing: typography.tracking.wide,
  },
});
