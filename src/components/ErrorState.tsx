import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'Failed to load';
}

export function ErrorState({ error }: { error: unknown }) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="default" style={styles.text}>
        Something went wrong: {getErrorMessage(error)}
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
  },
  text: { textAlign: 'center', color: '#e5484d' },
});
