import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DevSettings, I18nManager } from 'react-native';

import ar from './locales/ar.json';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import ja from './locales/ja.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';

export const SUPPORTED_LANGUAGES = [
  'en',
  'fr',
  'de',
  'es',
  'it',
  'pt',
  'nl',
  'pl',
  'ru',
  'zh',
  'ja',
  'ar',
] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
const RTL_LANGUAGES: SupportedLanguage[] = ['ar'];

const LANGUAGE_STORAGE_KEY = 'app-language';

function isSupportedLanguage(value: string | undefined): value is SupportedLanguage {
  return !!value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

async function detectInitialLanguage(): Promise<SupportedLanguage> {
  const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (isSupportedLanguage(stored ?? undefined)) return stored as SupportedLanguage;

  const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? undefined;
  return isSupportedLanguage(deviceLanguage ?? undefined) ? (deviceLanguage as SupportedLanguage) : 'en';
}

export async function initI18n() {
  const language = await detectInitialLanguage();

  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      de: { translation: de },
      es: { translation: es },
      it: { translation: it },
      pt: { translation: pt },
      nl: { translation: nl },
      pl: { translation: pl },
      ru: { translation: ru },
      zh: { translation: zh },
      ja: { translation: ja },
      ar: { translation: ar },
    },
    lng: language,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

  const shouldBeRTL = RTL_LANGUAGES.includes(language);
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
  }

  return language;
}

// Changing RTL direction only takes effect after the JS bundle reloads, so
// this persists the choice, flips I18nManager, and restarts the app.
export async function changeLanguage(language: SupportedLanguage) {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);

  const wasRTL = I18nManager.isRTL;
  const willBeRTL = RTL_LANGUAGES.includes(language);

  await i18n.changeLanguage(language);

  if (wasRTL !== willBeRTL) {
    I18nManager.allowRTL(willBeRTL);
    I18nManager.forceRTL(willBeRTL);
    try {
      const Updates = await import('expo-updates');
      await Updates.reloadAsync();
    } catch {
      DevSettings.reload();
    }
  }
}

export default i18n;
