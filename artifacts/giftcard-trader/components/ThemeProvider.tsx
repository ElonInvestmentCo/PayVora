import React from "react";
import { View } from "react-native";
import { useColorScheme } from "nativewind";
import { lightTheme, darkTheme } from "@/constants/theme";

export function NativeWindThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={[{ flex: 1 }, isDark ? darkTheme : lightTheme]}>
      {children}
    </View>
  );
}
