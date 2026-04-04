// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme'; // Add theme support
import { Colors } from '@/constants/theme'; // Ensure design system integration

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

// Mapping of SF Symbols to Material Icons
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android/web.
 * This ensures a consistent look across platforms and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight, // Not applicable for Material Icons but kept for SF Symbols compatibility
}: {
  name: IconSymbolName;
  size?: number;
  color?: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const theme = useColorScheme() ?? 'light'; // Determine theme (light/dark)
  const iconColor =
    color ??
    (theme === 'light' ? Colors.light.icon : Colors.dark.icon); // Default icon color based on theme

  if (!MAPPING[name]) {
    console.warn(`IconSymbol: "${name}" is not mapped to a Material Icon. Please update MAPPING.`); // Warn if unmapped icon
    return null;
  }

  return (
    <MaterialIcons
      color={iconColor}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}