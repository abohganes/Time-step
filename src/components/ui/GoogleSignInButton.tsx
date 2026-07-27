import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { signInWithGoogle } from '@/lib/auth/googleSignIn';

export function GoogleSignInButton({ onError }: { onError: (message: string) => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  async function handlePress() {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      onError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading}
      style={({ pressed }) => [
        styles.base,
        { borderColor: theme.border, opacity: pressed || loading ? 0.7 : 1 },
      ]}>
      {loading ? (
        <ActivityIndicator color={theme.text} />
      ) : (
        <>
          <Ionicons name="logo-google" size={18} color={theme.text} />
          <ThemedText type="smallBold">{t('auth.continueWithGoogle')}</ThemedText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
});
