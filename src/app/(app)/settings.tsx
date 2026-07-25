import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { BottomTabInset, CardShadow, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth/AuthProvider';
import { changeLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
};

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { session } = useAuth();
  const [notifStatus, setNotifStatus] = useState<Notifications.PermissionStatus | null>(null);
  const [changingLanguage, setChangingLanguage] = useState(false);

  useEffect(() => {
    Notifications.getPermissionsAsync().then((res) => setNotifStatus(res.status));
  }, []);

  async function requestNotifPermission() {
    const res = await Notifications.requestPermissionsAsync();
    setNotifStatus(res.status);
  }

  async function handleLanguageSelect(language: SupportedLanguage) {
    if (language === i18n.language || changingLanguage) return;
    setChangingLanguage(true);
    await changeLanguage(language);
    setChangingLanguage(false);
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            {t('settings.title')}
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="small" themeColor="textSecondary">
              {t('settings.signedInAs')}
            </ThemedText>
            <ThemedText type="default">{session?.user.email}</ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="small" themeColor="textSecondary">
              {t('settings.notifications')}
            </ThemedText>
            <ThemedText type="default">
              {notifStatus === 'granted'
                ? t('settings.enabled')
                : notifStatus === 'denied'
                  ? t('settings.denied')
                  : t('settings.notRequested')}
            </ThemedText>
            {notifStatus !== 'granted' ? (
              <Button
                title={t('settings.enableNotifications')}
                variant="secondary"
                onPress={requestNotifPermission}
              />
            ) : null}
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="small" themeColor="textSecondary">
              {t('settings.language')}
            </ThemedText>
            <ThemedView style={styles.languageRow}>
              {SUPPORTED_LANGUAGES.map((language) => {
                const selected = language === i18n.language;
                return (
                  <Pressable
                    key={language}
                    onPress={() => handleLanguageSelect(language)}
                    disabled={changingLanguage}
                    style={[
                      styles.languagePill,
                      {
                        borderColor: theme.accent,
                        backgroundColor: selected ? theme.accent : 'transparent',
                      },
                    ]}>
                    <ThemedText type="small" style={selected ? { color: '#ffffff' } : undefined}>
                      {LANGUAGE_LABELS[language]}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ThemedView>
          </ThemedView>

          <Button title={t('settings.signOut')} variant="danger" onPress={() => supabase.auth.signOut()} />
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: BottomTabInset,
    gap: Spacing.four,
  },
  title: { fontSize: 32, lineHeight: 38 },
  card: { padding: Spacing.four, borderRadius: Radius.large, gap: Spacing.two, ...CardShadow },
  languageRow: { flexDirection: 'row', gap: Spacing.two },
  languagePill: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
});
