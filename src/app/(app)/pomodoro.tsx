import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CircularTimer } from '@/components/CircularTimer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { countTodaySessions, useLogPomodoroSession, usePomodoroSessions } from '@/hooks/usePomodoro';
import { useTheme } from '@/hooks/use-theme';

const PRESETS = [
  { workMinutes: 25, breakMinutes: 5 },
  { workMinutes: 45, breakMinutes: 7 },
  { workMinutes: 50, breakMinutes: 10 },
];

type Mode = 'work' | 'break';

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function PomodoroScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data: sessions = [] } = usePomodoroSessions();
  const logSession = useLogPomodoroSession();

  const [presetIndex, setPresetIndex] = useState(0);
  const preset = PRESETS[presetIndex];
  const workSeconds = preset.workMinutes * 60;
  const breakSeconds = preset.breakMinutes * 60;

  const [mode, setMode] = useState<Mode>('work');
  const [secondsLeft, setSecondsLeft] = useState(workSeconds);
  const [isRunning, setIsRunning] = useState(false);

  const modeRef = useRef(mode);
  modeRef.current = mode;
  const workSecondsRef = useRef(workSeconds);
  workSecondsRef.current = workSeconds;
  const breakSecondsRef = useRef(breakSeconds);
  breakSecondsRef.current = breakSeconds;

  const todayCount = useMemo(() => countTodaySessions(sessions), [sessions]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        if (modeRef.current === 'work') {
          logSession.mutate(workSecondsRef.current / 60);
          setMode('break');
          return breakSecondsRef.current;
        }
        setMode('work');
        return workSecondsRef.current;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, logSession]);

  const totalSeconds = mode === 'work' ? workSeconds : breakSeconds;
  const progress = secondsLeft / totalSeconds;
  const ringColor = mode === 'work' ? theme.accent : theme.success;

  const toggleRunning = useCallback(() => setIsRunning((prev) => !prev), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSecondsLeft(mode === 'work' ? workSeconds : breakSeconds);
  }, [mode, workSeconds, breakSeconds]);

  const skip = useCallback(() => {
    setIsRunning(false);
    if (mode === 'work') {
      setMode('break');
      setSecondsLeft(breakSeconds);
    } else {
      setMode('work');
      setSecondsLeft(workSeconds);
    }
  }, [mode, workSeconds, breakSeconds]);

  const selectPreset = useCallback((index: number) => {
    setPresetIndex(index);
    setIsRunning(false);
    setMode('work');
    setSecondsLeft(PRESETS[index].workMinutes * 60);
  }, []);

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {t('pomodoro.title')}
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            {mode === 'work' ? t('pomodoro.workMode') : t('pomodoro.breakMode')}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.presetRow}>
          {PRESETS.map((p, index) => {
            const selected = index === presetIndex;
            return (
              <Pressable
                key={`${p.workMinutes}-${p.breakMinutes}`}
                onPress={() => selectPreset(index)}
                style={[
                  styles.presetPill,
                  {
                    backgroundColor: selected ? theme.accent : theme.backgroundElement,
                    borderColor: selected ? theme.accent : theme.border,
                  },
                ]}>
                <ThemedText type="small" style={{ color: selected ? '#ffffff' : theme.text }}>
                  {t('pomodoro.presetLabel', { work: p.workMinutes, break: p.breakMinutes })}
                </ThemedText>
              </Pressable>
            );
          })}
        </ThemedView>

        <ThemedView style={styles.center}>
          <CircularTimer progress={progress} color={ringColor} trackColor={theme.backgroundElement}>
            <ThemedText style={[styles.time, { color: theme.text }]}>{formatTime(secondsLeft)}</ThemedText>
          </CircularTimer>

          <ThemedView style={styles.controls}>
            <Pressable
              onPress={reset}
              style={({ pressed }) => [
                styles.iconButton,
                { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
              ]}>
              <Ionicons name="refresh" size={24} color={theme.text} />
            </Pressable>

            <Pressable
              onPress={toggleRunning}
              style={({ pressed }) => [
                styles.playButton,
                { backgroundColor: ringColor, opacity: pressed ? 0.85 : 1 },
              ]}>
              <Ionicons name={isRunning ? 'pause' : 'play'} size={32} color="#ffffff" />
            </Pressable>

            <Pressable
              onPress={skip}
              style={({ pressed }) => [
                styles.iconButton,
                { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
              ]}>
              <Ionicons name="play-skip-forward" size={22} color={theme.text} />
            </Pressable>
          </ThemedView>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={22} color={theme.streak} />
          <ThemedText type="smallBold">{t('pomodoro.sessionsToday', { count: todayCount })}</ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingTop: Spacing.three, paddingHorizontal: Spacing.four, gap: Spacing.one },
  title: { fontSize: 32, lineHeight: 38 },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  presetPill: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.five },
  time: { fontSize: 48, lineHeight: 56, fontWeight: '600' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.four },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 76,
    height: 76,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginHorizontal: Spacing.four,
    marginBottom: BottomTabInset,
    padding: Spacing.three,
    borderRadius: Radius.large,
  },
});
