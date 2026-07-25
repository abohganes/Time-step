import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

function extractMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return fallback;
}

export function ErrorState({ error }: { error: unknown }) {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="default" style={styles.text}>
        {t('errors.somethingWrong', { message: extractMessage(error, t('errors.failedToLoad')) })}
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
