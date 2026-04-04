import React, { useCallback } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { hapticMedium } from "@/utils/haptics";

interface GlowButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  testID?: string;
}

export function GlowButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  testID,
}: GlowButtonProps) {
  const colors = useColors();

  const bgColor =
    variant === "primary"
      ? colors.primary
      : variant === "secondary"
        ? colors.secondary
        : colors.destructive;

  const handlePress = useCallback(() => {
    hapticMedium();
    onPress();
  }, [onPress]);

  return (
    <View style={[styles.shadowWrap, { shadowColor: bgColor }]}>
      <TouchableOpacity
        testID={testID}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.button,
          { backgroundColor: disabled ? "#334155" : bgColor },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.primaryForeground} />
        ) : (
          <Text
            style={[
              styles.text,
              { color: disabled ? "#94A3B8" : colors.primaryForeground },
            ]}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    borderRadius: 14,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
});
