/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#15171A',
    background: '#FFFFFF',
    backgroundElement: '#F6F6F8',
    backgroundSelected: '#ECEDF1',
    textSecondary: '#6B7280',
    border: '#E5E6EB',
    accent: '#3B82F6',
    danger: '#EF4444',
    streak: '#F59E0B',
    success: '#22C55E',
  },
  dark: {
    text: '#F3F4F6',
    background: '#0B0B0D',
    backgroundElement: '#1A1B1E',
    backgroundSelected: '#242529',
    textSecondary: '#9CA3AF',
    border: '#2A2B2F',
    accent: '#5B8DFF',
    danger: '#F87171',
    streak: '#FBBF24',
    success: '#4ADE80',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const AccentPalettes = {
  blue: { light: '#3B82F6', dark: '#5B8DFF' },
  purple: { light: '#8B5CF6', dark: '#A78BFA' },
  pink: { light: '#EC4899', dark: '#F472B6' },
  teal: { light: '#0D9488', dark: '#2DD4BF' },
  orange: { light: '#F97316', dark: '#FB923C' },
  red: { light: '#EF4444', dark: '#F87171' },
} as const;

export type AccentColor = keyof typeof AccentPalettes;

// Mixes a hex color toward black (amount < 0) or white (amount > 0), amount in [-1, 1].
function mixColor(hex: string, amount: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const target = amount < 0 ? 0 : 255;
  const ratio = Math.abs(amount);
  const num = parseInt(hex.slice(1), 16);
  const r = clamp(((num >> 16) & 0xff) + (target - ((num >> 16) & 0xff)) * ratio);
  const g = clamp(((num >> 8) & 0xff) + (target - ((num >> 8) & 0xff)) * ratio);
  const b = clamp((num & 0xff) + (target - (num & 0xff)) * ratio);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// A 6-step tonal preview strip for an accent color: muted/dark shades on top,
// pale tints on the bottom — used for the accent swatch picker in Settings.
export function accentTonalRamp(hex: string): string[] {
  return [-0.55, -0.35, -0.15, 0.55, 0.75, 0.9].map((amount) => mixColor(hex, amount));
}

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const Radius = {
  small: 8,
  medium: 12,
  large: 16,
  pill: 999,
} as const;

export const CardShadow = Platform.select({
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  android: { elevation: 1 },
  default: {},
}) as object;
