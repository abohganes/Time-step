import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import {
  AccentPalettes,
  accentTonalRamp,
  BottomTabInset,
  CardShadow,
  Radius,
  Spacing,
  type AccentColor,
} from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth/AuthProvider';
import { changeLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { BACKGROUND_SCENES, useThemePreference, type BackgroundScene, type ThemePreference } from '@/lib/theme';

const ACCENT_COLORS = Object.keys(AccentPalettes) as AccentColor[];

const BACKGROUND_ICONS: Record<BackgroundScene, keyof typeof Ionicons.glyphMap> = {
  none: 'close-circle-outline',
  clouds: 'cloud-outline',
  rain: 'rainy-outline',
  trees: 'leaf-outline',
};

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  it: 'Italiano',
  pt: 'Português',
  nl: 'Nederlands',
  pl: 'Polski',
  ru: 'Русский',
  zh: '中文',
  ja: '日本語',
  ar: 'العربية',
};

const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  es: '🇪🇸',
  it: '🇮🇹',
  pt: '🇵🇹',
  nl: '🇳🇱',
  pl: '🇵🇱',
  ru: '🇷🇺',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ar: '🇸🇦',
};

const THEME_OPTIONS: ThemePreference[] = ['light', 'dark', 'system'];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { session } = useAuth();
  const {
    preference,
    setPreference,
    effectiveScheme,
    accentKey,
    setAccentKey,
    backgroundScene,
    setBackgroundScene,
  } = useThemePreference();
  const [notifStatus, setNotifStatus] = useState<Notifications.PermissionStatus | null>(null);
  const [changingLanguage, setChangingLanguage] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  useEffect(() => {
    Notifications.getPermissionsAsync().then((res) => setNotifStatus(res.status));
  }, []);

  async function requestNotifPermission() {
    const res = await Notifications.requestPermissionsAsync();
    setNotifStatus(res.status);
  }

  async function handleLanguageSelect(language: SupportedLanguage) {
    setLanguageModalVisible(false);
    if (language === i18n.language || changingLanguage) return;
    setChangingLanguage(true);
    await changeLanguage(language);
    setChangingLanguage(false);
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container}>
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
            <Pressable
              onPress={() => setLanguageModalVisible(true)}
              disabled={changingLanguage}
              style={[styles.languageSelector, { backgroundColor: theme.background }]}>
              <ThemedText type="default">{LANGUAGE_FLAGS[i18n.language as SupportedLanguage]}</ThemedText>
              <ThemedText type="default" style={styles.languageSelectorLabel}>
                {LANGUAGE_LABELS[i18n.language as SupportedLanguage]}
              </ThemedText>
              <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
            </Pressable>
          </ThemedView>

          <Modal
            visible={languageModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setLanguageModalVisible(false)}>
            <Pressable style={styles.modalBackdrop} onPress={() => setLanguageModalVisible(false)}>
              <Pressable
                style={[styles.modalCard, { backgroundColor: theme.background }]}
                onPress={(e) => e.stopPropagation()}>
                <ThemedText type="smallBold" style={styles.modalTitle}>
                  {t('settings.language')}
                </ThemedText>
                <FlatList
                  data={SUPPORTED_LANGUAGES}
                  keyExtractor={(item) => item}
                  style={styles.modalList}
                  renderItem={({ item: language }) => {
                    const selected = language === i18n.language;
                    return (
                      <Pressable
                        onPress={() => handleLanguageSelect(language)}
                        style={[
                          styles.modalRow,
                          { backgroundColor: selected ? theme.backgroundElement : 'transparent' },
                        ]}>
                        <ThemedText type="default">{LANGUAGE_FLAGS[language]}</ThemedText>
                        <ThemedText type="default" style={styles.languageSelectorLabel}>
                          {LANGUAGE_LABELS[language]}
                        </ThemedText>
                        {selected ? (
                          <Ionicons name="checkmark" size={18} color={theme.accent} />
                        ) : null}
                      </Pressable>
                    );
                  }}
                />
              </Pressable>
            </Pressable>
          </Modal>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="small" themeColor="textSecondary">
              {t('settings.appearance')}
            </ThemedText>
            <ThemedView style={styles.languageRow}>
              {THEME_OPTIONS.map((option) => {
                const selected = option === preference;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setPreference(option)}
                    style={[
                      styles.languagePill,
                      {
                        borderColor: theme.accent,
                        backgroundColor: selected ? theme.accent : 'transparent',
                      },
                    ]}>
                    <ThemedText type="small" style={selected ? { color: '#ffffff' } : undefined}>
                      {t(`settings.theme${option.charAt(0).toUpperCase()}${option.slice(1)}`)}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ThemedView>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="small" themeColor="textSecondary">
              {t('settings.color')}
            </ThemedText>
            <ThemedView style={styles.colorRow}>
              {ACCENT_COLORS.map((key) => {
                const selected = key === accentKey;
                const ramp = accentTonalRamp(AccentPalettes[key][effectiveScheme]);
                return (
                  <Pressable
                    key={key}
                    onPress={() => setAccentKey(key)}
                    hitSlop={4}
                    style={[styles.colorPill, { borderColor: selected ? theme.text : 'transparent' }]}>
                    {ramp.map((band, index) => (
                      <View key={index} style={[styles.colorBand, { backgroundColor: band }]} />
                    ))}
                    {selected ? (
                      <View style={styles.colorCheckWrap}>
                        <View style={styles.colorCheck}>
                          <Ionicons name="checkmark" size={16} color="#15171A" />
                        </View>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </ThemedView>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="small" themeColor="textSecondary">
              {t('settings.background')}
            </ThemedText>
            <ThemedView style={[styles.languageRow, styles.languageRowWrap]}>
              {BACKGROUND_SCENES.map((scene) => {
                const selected = scene === backgroundScene;
                return (
                  <Pressable
                    key={scene}
                    onPress={() => setBackgroundScene(scene)}
                    style={[
                      styles.languagePill,
                      {
                        borderColor: theme.accent,
                        backgroundColor: selected ? theme.accent : 'transparent',
                      },
                    ]}>
                    <Ionicons
                      name={BACKGROUND_ICONS[scene]}
                      size={16}
                      color={selected ? '#ffffff' : theme.text}
                    />
                    <ThemedText type="small" style={selected ? { color: '#ffffff' } : undefined}>
                      {t(`settings.background${scene.charAt(0).toUpperCase()}${scene.slice(1)}`)}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ThemedView>
          </ThemedView>

          <Button title={t('settings.signOut')} variant="danger" onPress={() => supabase.auth.signOut()} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.four,
  },
  title: { fontSize: 32, lineHeight: 38 },
  card: { padding: Spacing.four, borderRadius: Radius.large, gap: Spacing.two, ...CardShadow },
  languageRow: { flexDirection: 'row', gap: Spacing.two },
  languageRowWrap: { flexWrap: 'wrap' },
  languagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
  },
  languageSelectorLabel: { flex: 1 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.four,
    maxHeight: '70%',
  },
  modalTitle: { marginBottom: Spacing.two },
  modalList: { marginBottom: Spacing.five },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.medium,
  },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  colorPill: {
    width: 44,
    height: 108,
    borderRadius: Radius.pill,
    borderWidth: 2,
    overflow: 'hidden',
  },
  colorBand: { flex: 1 },
  colorCheckWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCheck: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    ...CardShadow,
  },
});
