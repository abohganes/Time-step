import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import { AuthProvider } from '@/lib/auth/AuthProvider';
import { initI18n } from '@/lib/i18n';
import { ensureAndroidChannel } from '@/lib/notifications';
import { queryClient } from '@/lib/queryClient';
import { ThemePreferenceProvider, useThemePreference } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <RootLayoutInner />
    </ThemePreferenceProvider>
  );
}

function RootLayoutInner() {
  const { effectiveScheme } = useThemePreference();
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    ensureAndroidChannel();
    initI18n().then(() => {
      setI18nReady(true);
      SplashScreen.hideAsync();
    });
  }, []);

  return (
    <ThemeProvider value={effectiveScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{i18nReady ? <Slot /> : null}</AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
