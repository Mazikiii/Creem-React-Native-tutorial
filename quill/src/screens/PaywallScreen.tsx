import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, radius, shadows } from "../theme";
import { BACKEND_URL } from "../config";
import type { PaywallScreenProps } from "../types/navigation";

const FEATURES_FREE = [
  "3 AI actions per day",
  "Improve, summarize, rephrase",
  "Unlimited documents",
];

const FEATURES_PRO = [
  "Unlimited AI actions",
  "All 5 AI tools",
  "Priority processing",
  "Unlimited documents",
];

type FeatureRowProps = {
  label: string;
  included: boolean;
  isPro?: boolean;
};

function FeatureRow({ label, included, isPro = false }: FeatureRowProps) {
  return (
    <View style={featureStyles.row}>
      <View
        style={[
          featureStyles.iconBox,
          included && isPro && featureStyles.iconBoxPro,
          included && !isPro && featureStyles.iconBoxFree,
          !included && featureStyles.iconBoxMuted,
        ]}
      >
        <Text
          style={[
            featureStyles.icon,
            included && isPro && featureStyles.iconPro,
            included && !isPro && featureStyles.iconFree,
            !included && featureStyles.iconMuted,
          ]}
        >
          {included ? "✓" : "–"}
        </Text>
      </View>
      <Text
        style={[featureStyles.label, !included && featureStyles.labelMuted]}
      >
        {label}
      </Text>
    </View>
  );
}

const featureStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["3"],
    paddingVertical: spacing["2"],
  },
  iconBox: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxPro: {
    backgroundColor: colors.accentSubtle,
  },
  iconBoxFree: {
    backgroundColor: colors.bgDark,
  },
  iconBoxMuted: {
    backgroundColor: colors.bgDark,
  },
  icon: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  iconPro: {
    color: colors.accent,
  },
  iconFree: {
    color: colors.textSecondary,
  },
  iconMuted: {
    color: colors.textMuted,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.sans,
    color: colors.textPrimary,
    fontWeight: typography.weights.regular,
  },
  labelMuted: {
    color: colors.textMuted,
  },
});

export function PaywallScreen({ navigation }: PaywallScreenProps) {
  const cardScale = useRef(new Animated.Value(0.96)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardScale, cardOpacity]);

  async function handleUpgrade() {
    console.log("[paywall] handleUpgrade called, BACKEND_URL:", BACKEND_URL);
    try {
      const response = await fetch(`${BACKEND_URL}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      console.log("[paywall] response status:", response.status);
      const data = await response.json();
      console.log("[paywall] response data:", JSON.stringify(data));

      if (data.checkoutUrl) {
        navigation.navigate("Checkout", { checkoutUrl: data.checkoutUrl });
      } else {
        console.warn("[paywall] no checkoutUrl in response");
      }
    } catch (err) {
      console.error("[paywall] fetch error:", err);
      // fallback for demo without a backend running
      navigation.navigate("Checkout", {
        checkoutUrl: "https://checkout.creem.io/demo",
      });
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Nav */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.heroIconWrap}>
              <Text style={styles.heroIcon}>✦</Text>
            </View>
            <Text style={styles.heroTitle}>Upgrade to Pro</Text>
            <Text style={styles.heroSubtitle}>
              You have used all your free AI actions for today.{"\n"}
              Go Pro for unlimited access.
            </Text>
          </View>

          {/* Plan cards */}
          <Animated.View
            style={[
              styles.cardsRow,
              { opacity: cardOpacity, transform: [{ scale: cardScale }] },
            ]}
          >
            {/* Free card */}
            <View style={styles.planCard}>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>Free</Text>
                <Text style={styles.planPrice}>$0</Text>
                <Text style={styles.planPeriod}>forever</Text>
              </View>
              <View style={styles.planDivider} />
              <View style={styles.featureList}>
                {FEATURES_FREE.map((f) => (
                  <FeatureRow key={f} label={f} included isPro={false} />
                ))}
              </View>
            </View>

            {/* Pro card */}
            <View style={[styles.planCard, styles.planCardPro]}>
              <View style={styles.proBadgeRow}>
                <View style={styles.popularPill}>
                  <Text style={styles.popularText}>Most Popular</Text>
                </View>
              </View>
              <View style={styles.planHeader}>
                <Text style={[styles.planName, styles.planNamePro]}>Pro</Text>
                <Text style={[styles.planPrice, styles.planPricePro]}>$9</Text>
                <Text style={[styles.planPeriod, styles.planPeriodPro]}>
                  per month
                </Text>
              </View>
              <View style={[styles.planDivider, styles.planDividerPro]} />
              <View style={styles.featureList}>
                {FEATURES_PRO.map((f) => (
                  <FeatureRow key={f} label={f} included isPro />
                ))}
              </View>
            </View>
          </Animated.View>

          {/* CTA */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleUpgrade}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaIcon}>✦</Text>
              <Text style={styles.ctaText}>Get Quill Pro</Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              Secure checkout powered by Creem.{"\n"}
              Cancel anytime. No hidden fees.
            </Text>
          </View>
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
  navBar: {
    alignItems: "flex-end",
    paddingHorizontal: spacing["5"],
    paddingVertical: spacing["3"],
  },
  closeText: {
    fontSize: typography.sizes.base,
    color: colors.textMuted,
    fontFamily: typography.fonts.sans,
  },
  scrollContent: {
    paddingHorizontal: spacing["5"],
    paddingBottom: spacing["12"],
    gap: spacing["8"],
  },

  hero: {
    alignItems: "center",
    gap: spacing["3"],
    paddingTop: spacing["4"],
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    backgroundColor: colors.accentSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing["1"],
    ...shadows.sm,
  },
  heroIcon: {
    fontSize: typography.sizes.xl,
    color: colors.accent,
  },
  heroTitle: {
    fontSize: typography.sizes["2xl"],
    fontFamily: typography.fonts.serif,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: typography.tracking.tight,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.sans,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },

  cardsRow: {
    flexDirection: "row",
    gap: spacing["3"],
  },
  planCard: {
    flex: 1,
    backgroundColor: colors.bgDefault,
    borderRadius: radius.lg,
    padding: spacing["4"],
    gap: spacing["3"],
    ...shadows.md,
  },
  planCardPro: {
    backgroundColor: colors.bgLight,
    borderWidth: 1.5,
    borderColor: colors.accent,
    ...shadows.lg,
  },
  proBadgeRow: {
    alignItems: "flex-start",
  },
  popularPill: {
    backgroundColor: colors.accentSubtle,
    paddingHorizontal: spacing["2"],
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  popularText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.semibold,
    color: colors.accent,
    letterSpacing: typography.tracking.wide,
  },
  planHeader: {
    gap: 2,
  },
  planName: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    letterSpacing: typography.tracking.wider,
    textTransform: "uppercase",
  },
  planNamePro: {
    color: colors.accent,
  },
  planPrice: {
    fontSize: typography.sizes["2xl"],
    fontFamily: typography.fonts.serif,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: typography.tracking.tight,
  },
  planPricePro: {
    color: colors.textPrimary,
  },
  planPeriod: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.sans,
    color: colors.textMuted,
  },
  planPeriodPro: {
    color: colors.textSecondary,
  },
  planDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
  },
  planDividerPro: {
    backgroundColor: colors.borderDefault,
  },
  featureList: {
    gap: 0,
  },

  ctaSection: {
    gap: spacing["4"],
    alignItems: "center",
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
    backgroundColor: colors.accent,
    paddingVertical: spacing["4"],
    paddingHorizontal: spacing["8"],
    borderRadius: radius.lg,
    width: "100%",
    ...shadows.lg,
  },
  ctaIcon: {
    fontSize: typography.sizes.base,
    color: colors.textInverse,
  },
  ctaText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.semibold,
    color: colors.textInverse,
    letterSpacing: typography.tracking.wide,
  },
  disclaimer: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.sans,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: typography.sizes.xs * typography.lineHeights.relaxed,
  },
});
