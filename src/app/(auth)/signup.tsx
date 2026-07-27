import { Link } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton';
import { TextField } from '@/components/ui/TextField';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

export default function SignupScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSignup() {
    setError(null);
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    // If "Confirm email" is enabled in the Supabase project, there's no session yet.
    if (!data.session) setConfirmationSent(true);
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>
              {t('auth.createAccount')}
            </ThemedText>

            {confirmationSent ? (
              <ThemedText type="default">{t('auth.checkEmail')}</ThemedText>
            ) : (
              <ThemedView style={styles.form}>
                <TextField
                  label={t('auth.email')}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                />
                <TextField
                  label={t('auth.password')}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                  value={password}
                  onChangeText={setPassword}
                  error={error ?? undefined}
                />
                <Button title={t('auth.signUp')} onPress={handleSignup} loading={loading} />
              </ThemedView>
            )}

            {!confirmationSent ? (
              <>
                <ThemedView style={styles.dividerRow}>
                  <ThemedView style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                  <ThemedText type="small" themeColor="textSecondary">
                    {t('auth.or')}
                  </ThemedText>
                  <ThemedView style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                </ThemedView>

                <GoogleSignInButton onError={setError} />
              </>
            ) : null}

            <Link href="/(auth)/login" style={styles.link}>
              <ThemedText type="linkPrimary">{t('auth.haveAccount')}</ThemedText>
            </Link>
          </ThemedView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
  },
  title: { fontSize: 32, lineHeight: 38 },
  form: { gap: Spacing.three },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  link: { alignSelf: 'center' },
});
