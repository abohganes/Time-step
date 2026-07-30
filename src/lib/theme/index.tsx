import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { AccentPalettes, type AccentColor } from '@/constants/theme';

export type ThemePreference = 'light' | 'dark' | 'system';
export const BACKGROUND_SCENES = ['none', 'clouds', 'rain', 'trees'] as const;
export type BackgroundScene = (typeof BACKGROUND_SCENES)[number];
const STORAGE_KEY = 'theme-preference';
const ACCENT_STORAGE_KEY = 'accent-color-preference';
const BACKGROUND_STORAGE_KEY = 'background-scene-preference';

function isAccentColor(value: string | null): value is AccentColor {
  return !!value && value in AccentPalettes;
}

function isBackgroundScene(value: string | null): value is BackgroundScene {
  return !!value && (BACKGROUND_SCENES as readonly string[]).includes(value);
}

type ThemePreferenceContextValue = {
  preference: ThemePreference;
  effectiveScheme: 'light' | 'dark';
  setPreference: (preference: ThemePreference) => void;
  accentKey: AccentColor;
  setAccentKey: (accent: AccentColor) => void;
  backgroundScene: BackgroundScene;
  setBackgroundScene: (scene: BackgroundScene) => void;
};

const ThemePreferenceContext = createContext<ThemePreferenceContextValue>({
  preference: 'system',
  effectiveScheme: 'light',
  setPreference: () => {},
  accentKey: 'blue',
  setAccentKey: () => {},
  backgroundScene: 'none',
  setBackgroundScene: () => {},
});

export function ThemePreferenceProvider({ children }: PropsWithChildren) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [accentKey, setAccentKeyState] = useState<AccentColor>('blue');
  const [backgroundScene, setBackgroundSceneState] = useState<BackgroundScene>('none');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setPreferenceState(stored);
      }
    });
    AsyncStorage.getItem(ACCENT_STORAGE_KEY).then((stored) => {
      if (isAccentColor(stored)) {
        setAccentKeyState(stored);
      }
    });
    AsyncStorage.getItem(BACKGROUND_STORAGE_KEY).then((stored) => {
      if (isBackgroundScene(stored)) {
        setBackgroundSceneState(stored);
      }
    });
  }, []);

  function setPreference(next: ThemePreference) {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }

  function setAccentKey(next: AccentColor) {
    setAccentKeyState(next);
    AsyncStorage.setItem(ACCENT_STORAGE_KEY, next);
  }

  function setBackgroundScene(next: BackgroundScene) {
    setBackgroundSceneState(next);
    AsyncStorage.setItem(BACKGROUND_STORAGE_KEY, next);
  }

  const effectiveScheme: 'light' | 'dark' =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo(
    () => ({
      preference,
      effectiveScheme,
      setPreference,
      accentKey,
      setAccentKey,
      backgroundScene,
      setBackgroundScene,
    }),
    [preference, effectiveScheme, accentKey, backgroundScene]
  );

  return <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>;
}

export function useThemePreference() {
  return useContext(ThemePreferenceContext);
}
