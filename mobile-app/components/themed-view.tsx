import { View, type ViewProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'card'; // Add variant for default or card styling
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  variant = 'default',
  ...otherProps
}: ThemedViewProps) {
  // Use theme colors or defaults
  const backgroundColor = useThemeColor(
    {
      light: lightColor || (variant === 'card' ? '#FFFFFF' : '#F9FAFB'),
      dark: darkColor || (variant === 'card' ? '#1F2937' : '#111827'),
    },
    'background'
  );

  return (
    <View
      style={[
        { backgroundColor },
        variant === 'card' ? styles.card : undefined,
        style,
      ]}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12, // Rounded corners for cards
    shadowColor: '#000', // Subtle shadow for depth
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, // Slight shadow offset
  },
});