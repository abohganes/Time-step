import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export function ErrorState({ message }: { message: string }) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="default" style={styles.text}>
        Something went wrong: {message}
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
