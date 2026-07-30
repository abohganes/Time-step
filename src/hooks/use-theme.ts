/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { AccentPalettes, Colors } from '@/constants/theme';
import { useThemePreference } from '@/lib/theme';

export function useTheme() {
  const { effectiveScheme, accentKey } = useThemePreference();
  return { ...Colors[effectiveScheme], accent: AccentPalettes[accentKey][effectiveScheme] };
}
