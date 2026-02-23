import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Pressable,
  ScrollView,
} from "react-native";
import { colors, typography, spacing, radius, shadows } from "../theme";
import type { AIAction } from "../types";

type Props = {
  visible: boolean;
  actions: AIAction[];
  onSelect: (action: AIAction) => void;
  onClose: () => void;
  disabled?: boolean;
};

export function AIActionSheet({
  visible,
  actions,
  onSelect,
  onClose,
  disabled = false,
}: Props) {
  const translateY = useRef(new Animated.Value(300)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 300,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacity, translateY]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Actions</Text>
          {disabled && (
            <View style={styles.limitPill}>
              <Text style={styles.limitText}>Limit reached</Text>
            </View>
          )}
        </View>

        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {actions.map((action, index) => (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.actionRow,
                index < actions.length - 1 && styles.actionRowBorder,
                disabled && styles.actionRowDisabled,
              ]}
              onPress={() => {
                if (!disabled) {
                  onSelect(action);
                }
              }}
              activeOpacity={disabled ? 1 : 0.6}
            >
              <View style={[styles.iconBox, disabled && styles.iconBoxDisabled]}>
                <Text style={[styles.icon, disabled && styles.iconDisabled]}>
                  {action.icon}
                </Text>
              </View>
              <View style={styles.actionText}>
                <Text
                  style={[styles.actionLabel, disabled && styles.textDisabled]}
                >
                  {action.label}
                </Text>
                <Text style={styles.actionDescription}>
                  {action.description}
                </Text>
              </View>
              {!disabled && (
                <Text style={styles.chevron}>›</Text>
              )}
            </TouchableOpacity>
          ))}

          <View style={styles.bottomPad} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgLight,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadows.lg,
    minHeight: 320,
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: spacing["3"],
    paddingBottom: spacing["2"],
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.borderDefault,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing["5"],
    paddingBottom: spacing["3"],
  },
  headerTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.semibold,
    color: colors.textMuted,
    letterSpacing: typography.tracking.wider,
    textTransform: "uppercase",
  },
  limitPill: {
    backgroundColor: colors.errorSubtle,
    paddingHorizontal: spacing["2"],
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  limitText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.medium,
    color: colors.error,
  },
  list: {
    paddingHorizontal: spacing["4"],
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["3"],
    paddingVertical: spacing["3"],
  },
  actionRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  actionRowDisabled: {
    opacity: 0.45,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxDisabled: {
    backgroundColor: colors.bgDark,
  },
  icon: {
    fontSize: typography.sizes.base,
    color: colors.accent,
  },
  iconDisabled: {
    color: colors.textMuted,
  },
  actionText: {
    flex: 1,
    gap: 2,
  },
  actionLabel: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.sans,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  actionDescription: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fonts.sans,
    color: colors.textMuted,
  },
  textDisabled: {
    color: colors.textMuted,
  },
  chevron: {
    fontSize: typography.sizes.lg,
    color: colors.textMuted,
    fontWeight: typography.weights.regular,
  },
  bottomPad: {
    height: spacing["8"],
  },
});
