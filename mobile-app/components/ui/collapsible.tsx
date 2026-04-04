import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  // Handle dynamic icon color
  const iconColor = theme === 'light' ? Colors.light.icon : Colors.dark.icon;

  return (
    <ThemedView
      style={[
        styles.container,
        { borderColor: theme === 'light' ? '#D1D5DB' : '#374151' }, // Border light/dark
      ]}>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={iconColor}
          style={{
            transform: [{ rotate: isOpen ? '90deg' : '0deg' }],
            transition: 'transform 0.2s ease', // Smooth animation
          }}
        />
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && (
        <ThemedView style={styles.content}>
          {children}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1, // Add border for separation
    borderRadius: 12, // Rounded corners
    marginVertical: 10, // Space between elements
    padding: 12, // Internal padding
    backgroundColor: '#1F2937', // Dark surface background
    shadowColor: '#000', // Subtle shadow for depth
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Spacing between icon and text
    padding: 8, // Improve spacing for the heading section
  },
  content: {
    marginTop: 12, // Spacing from heading
    marginLeft: 24, // Indent for nested content
    padding: 8, // Internal content padding
    backgroundColor: '#111827', // Nested surface background
    borderRadius: 8, // Rounded corners for nested section
  },
});