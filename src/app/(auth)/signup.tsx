import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function SignupScreen() {
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
              Create account
            </ThemedText>

            {confirmationSent ? (
              <ThemedText type="default">
                Check your email to confirm your account, then log in.
              </ThemedText>
            ) : (
              <ThemedView style={styles.form}>
                <TextField
                  label="Email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                />
                <TextField
                  label="Password"
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                  value={password}
                  onChangeText={setPassword}
                  error={error ?? undefined}
                />
                <Button title="Sign up" onPress={handleSignup} loading={loading} />
              </ThemedView>
            )}

            <Link href="/(auth)/login" style={styles.link}>
              <ThemedText type="linkPrimary">Already have an account? Log in</ThemedText>
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
  link: { alignSelf: 'center' },
});
