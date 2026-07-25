import { ar, enUS, fr, type Locale } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

import type { SupportedLanguage } from '@/lib/i18n';

const DATE_LOCALES: Record<SupportedLanguage, Locale> = { en: enUS, fr, ar };

export function useDateLocale(): Locale {
  const { i18n } = useTranslation();
  return DATE_LOCALES[i18n.language as SupportedLanguage] ?? enUS;
}
