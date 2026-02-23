import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import type { WebViewNavigation } from "react-native-webview";
import { colors, typography, spacing } from "../theme";
import type { CheckoutScreenProps } from "../types/navigation";

// deep link scheme registered in app.json
const DEEP_LINK_SCHEME = "quill://";

export function CheckoutScreen({ navigation, route }: CheckoutScreenProps) {
  const { checkoutUrl } = route.params;
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // creem redirects to quill://payment/success after payment
  // the webview can't navigate to a custom scheme so we intercept it here,
  // parse the query params and push to the success screen manually
  function handleNavigationStateChange(navState: WebViewNavigation) {
    const { url } = navState;

    if (!url.startsWith(DEEP_LINK_SCHEME)) return;

    webViewRef.current?.stopLoading();

    try {
      // e.g. quill://payment/success?checkout_id=ch_xxx&signature=abc
      const queryString = url.includes("?") ? url.split("?")[1] : "";
      const params = Object.fromEntries(
        queryString
          .split("&")
          .filter(Boolean)
          .map((pair) => {
            const [key, value] = pair.split("=");
            return [
              decodeURIComponent(key ?? ""),
              decodeURIComponent(value ?? ""),
            ];
          }),
      );

      navigation.replace("Success", {
        checkoutId: params.checkout_id ?? "",
        orderId: params.order_id ?? null,
        customerId: params.customer_id ?? null,
        subscriptionId: params.subscription_id ?? null,
        productId: params.product_id ?? "",
        requestId: params.request_id ?? null,
        signature: params.signature ?? "",
      });
    } catch {
      // parsing failed, still navigate — webhook is the source of truth anyway
      navigation.replace("Success", {
        checkoutId: "",
        orderId: null,
        customerId: null,
        subscriptionId: null,
        productId: "",
        requestId: null,
        signature: "",
      });
    }
  }

  // allow all https traffic so payment processors, 3ds redirects, etc don't get blocked
  // only thing we explicitly stop is the deep link scheme, we handle that ourselves
  function handleShouldStartLoadWithRequest(
    request: WebViewNavigation,
  ): boolean {
    const { url } = request;

    if (url.startsWith(DEEP_LINK_SCHEME)) {
      return false;
    }

    return true;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.navTitle}>Checkout</Text>

          <View style={styles.navSpacer} />
        </View>

        {isLoading && !hasError && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Loading secure checkout…</Text>
          </View>
        )}

        {hasError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorSubtitle}>
              Unable to load the checkout page.{"\n"}Check your connection and
              try again.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setHasError(false);
                setIsLoading(true);
                webViewRef.current?.reload();
              }}
              activeOpacity={0.75}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!hasError && (
          <WebView
            ref={webViewRef}
            source={{ uri: checkoutUrl }}
            style={styles.webView}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            onNavigationStateChange={handleNavigationStateChange}
            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
            javaScriptEnabled
            incognito={false}
            startInLoadingState={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing["5"],
    paddingVertical: spacing["3"],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.bgLight,
  },
  cancelText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.medium,
    color: colors.accent,
  },
  navTitle: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  navSpacer: {
    width: 48,
  },
  webView: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bgLight,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["3"],
    zIndex: 10,
  },
  loadingText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.sans,
    color: colors.textMuted,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing["8"],
    gap: spacing["4"],
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
  retryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing["6"],
    paddingVertical: spacing["3"],
    borderRadius: spacing["2"],
  },
  retryText: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.semibold,
    color: colors.textInverse,
  },
});
