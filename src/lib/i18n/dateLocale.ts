import { ar, de, enUS, es, fr, it, ja, nl, pl, pt, ru, zhCN, type Locale } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

import type { SupportedLanguage } from '@/lib/i18n';

const DATE_LOCALES: Record<SupportedLanguage, Locale> = {
  en: enUS,
  fr,
  de,
  es,
  it,
  pt,
  nl,
  pl,
  ru,
  zh: zhCN,
  ja,
  ar,
};

export function useDateLocale(): Locale {
  const { i18n } = useTranslation();
  return DATE_LOCALES[i18n.language as SupportedLanguage] ?? enUS;
}
