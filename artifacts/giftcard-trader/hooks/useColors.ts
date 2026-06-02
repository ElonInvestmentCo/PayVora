import { lightPalette, darkPalette, radius } from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";

export function useColors() {
  const { isDark } = useTheme();
  return { ...(isDark ? darkPalette : lightPalette), radius };
}
