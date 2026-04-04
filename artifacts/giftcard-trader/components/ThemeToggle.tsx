import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { hapticSelection } from "@/utils/haptics";

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => {
        hapticSelection();
        toggle();
      }}
      activeOpacity={0.7}
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
        borderWidth: 1,
        borderColor: isDark ? "#334155" : "#E2E8F0",
      }}
    >
      <Text style={{ fontSize: 18 }}>{isDark ? "🌙" : "☀️"}</Text>
    </TouchableOpacity>
  );
}
