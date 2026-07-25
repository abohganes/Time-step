import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type EmptyStateProps = {
  message: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
};

export function EmptyState({ message, icon = 'sparkles-outline' }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <Ionicons name={icon} size={32} color={theme.textSecondary} style={styles.icon} />
      <ThemedText type="default" themeColor="textSecondary" style={styles.text}>
        {message}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  icon: { opacity: 0.6 },
  text: { textAlign: 'center' },
});
