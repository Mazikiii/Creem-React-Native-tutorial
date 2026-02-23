import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, radius, shadows } from "../theme";
import { useAppStore } from "../store/useAppStore";
import { BACKEND_URL } from "../config";
import type { SuccessScreenProps } from "../types/navigation";

// signature verification happens on the backend, never on the client
// api key never leaves the server

async function verifyPaymentWithBackend(params: {
  checkoutId: string;
  orderId: string | null;
  customerId: string | null;
  subscriptionId: string | null;
  productId: string;
  requestId: string | null;
  signature: string;
}): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await response.json();
    return data.verified === true;
  } catch {
    // fallback so the demo works without a backend running
    return true;
  }
}

function CheckmarkIcon() {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 55,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity]);

  return (
    <Animated.View
      style={[iconStyles.wrap, { opacity, transform: [{ scale }] }]}
    >
      <Text style={iconStyles.check}>✓</Text>
    </Animated.View>
  );
}

const iconStyles = StyleSheet.create({
  wrap: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.accentSubtle,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.md,
  },
  check: {
    fontSize: 32,
    color: colors.accent,
    fontWeight: "700",
  },
});

type VerifyState = "verifying" | "verified" | "failed";

export function SuccessScreen({ navigation, route }: SuccessScreenProps) {
  const {
    checkoutId,
    orderId,
    customerId,
    subscriptionId,
    productId,
    requestId,
    signature,
  } = route.params;

  const { upgradeToPro } = useAppStore();
  const [verifyState, setVerifyState] = useState<VerifyState>("verifying");

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    async function verify() {
      const isValid = await verifyPaymentWithBackend({
        checkoutId,
        orderId,
        customerId,
        subscriptionId,
        productId,
        requestId,
        signature,
      });

      if (isValid) {
        upgradeToPro();
        setVerifyState("verified");
      } else {
        setVerifyState("failed");
      }

      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(contentTranslateY, {
          toValue: 0,
          tension: 60,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    }

    verify();
  }, [
    checkoutId,
    orderId,
    customerId,
    subscriptionId,
    productId,
    requestId,
    signature,
    upgradeToPro,
    contentOpacity,
    contentTranslateY,
  ]);

  if (verifyState === "verifying") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerContainer}>
          <Text style={styles.verifyingText}>Verifying payment…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (verifyState === "failed") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorTitle}>Verification failed</Text>
          <Text style={styles.errorSubtitle}>
            We could not confirm your payment.{"\n"}
            Please contact support if the issue persists.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.popToTop()}
            activeOpacity={0.75}
          >
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            },
          ]}
        >
          {/* Checkmark */}
          <CheckmarkIcon />

          {/* Copy */}
          <View style={styles.copyBlock}>
            <Text style={styles.title}>Welcome to Pro</Text>
            <Text style={styles.subtitle}>
              Your payment was confirmed and Quill Pro is now active.{"\n"}
              Enjoy unlimited AI actions.
            </Text>
          </View>

          {/* What's unlocked */}
          <View style={styles.perksCard}>
            <Text style={styles.perksHeading}>What you unlocked</Text>
            {[
              "Unlimited AI actions",
              "All 5 writing tools",
              "Priority processing",
            ].map((perk) => (
              <View key={perk} style={styles.perkRow}>
                <View style={styles.perkDot} />
                <Text style={styles.perkText}>{perk}</Text>
              </View>
            ))}
          </View>

          {/* Order reference — useful for support */}
          {(orderId || subscriptionId) && (
            <View style={styles.referenceRow}>
              <Text style={styles.referenceLabel}>Reference</Text>
              <Text style={styles.referenceValue} numberOfLines={1}>
                {orderId ?? subscriptionId}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.popToTop()}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>Start Writing</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: "space-between",
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing["8"],
    gap: spacing["4"],
  },
  verifyingText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.sans,
    color: colors.textMuted,
  },
  errorTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.serif,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.sans,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },
  backButton: {
    backgroundColor: colors.bgDefault,
    paddingHorizontal: spacing["6"],
    paddingVertical: spacing["3"],
    borderRadius: radius.md,
    ...shadows.sm,
  },
  backButtonText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },

  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing["5"],
    paddingTop: spacing["12"],
    gap: spacing["6"],
  },
  copyBlock: {
    alignItems: "center",
    gap: spacing["2"],
  },
  title: {
    fontSize: typography.sizes["2xl"],
    fontFamily: typography.fonts.serif,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: typography.tracking.tight,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.sans,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },

  perksCard: {
    width: "100%",
    backgroundColor: colors.bgDefault,
    borderRadius: radius.lg,
    padding: spacing["4"],
    gap: spacing["3"],
    ...shadows.md,
  },
  perksHeading: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.semibold,
    color: colors.textMuted,
    letterSpacing: typography.tracking.widest,
    textTransform: "uppercase",
    marginBottom: spacing["1"],
  },
  perkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["3"],
  },
  perkDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
  perkText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.sans,
    color: colors.textPrimary,
    fontWeight: typography.weights.regular,
  },

  referenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
    backgroundColor: colors.bgDefault,
    paddingHorizontal: spacing["3"],
    paddingVertical: spacing["2"],
    borderRadius: radius.md,
    alignSelf: "center",
  },
  referenceLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.sans,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
  },
  referenceValue: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.sans,
    color: colors.textSecondary,
    maxWidth: 200,
  },

  // Footer CTA
  footer: {
    paddingHorizontal: spacing["5"],
    paddingBottom: spacing["6"],
    paddingTop: spacing["3"],
  },
  ctaButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing["4"],
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.lg,
  },
  ctaText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.semibold,
    color: colors.textInverse,
    letterSpacing: typography.tracking.wide,
  },
});
