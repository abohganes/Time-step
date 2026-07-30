import { Ionicons } from '@expo/vector-icons';
import { format, isToday } from 'date-fns';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedBackground } from '@/components/backgrounds/AnimatedBackground';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { HabitRow } from '@/components/HabitRow';
import { TaskRow } from '@/components/TaskRow';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, CardShadow, Radius, Spacing } from '@/constants/theme';
import { computeStreak, todayKey, useToggleHabitToday } from '@/hooks/useHabitLogs';
import { usePomodoroSessions } from '@/hooks/usePomodoro';
import { useTodayData } from '@/hooks/useTodayData';
import { useUpdateTask } from '@/hooks/useTasks';
import { useTheme } from '@/hooks/use-theme';
import { useDateLocale } from '@/lib/i18n/dateLocale';
import { useThemePreference } from '@/lib/theme';

type QuickAction = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  { key: 'assistant', icon: 'sparkles-outline', href: '/(app)/assistant' },
  { key: 'addTask', icon: 'add-circle-outline', href: '/(app)/tasks/new' },
  { key: 'startPomodoro', icon: 'timer-outline', href: '/(app)/pomodoro' },
  { key: 'viewCalendar', icon: 'calendar-outline', href: '/(app)/calendar' },
];

export default function DashboardScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const dateLocale = useDateLocale();
  const { backgroundScene, effectiveScheme } = useThemePreference();
  const {
    tasks,
    habits,
    habitLogs,
    completedCount,
    pendingCount,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useTodayData();
  const { data: pomodoroSessions = [] } = usePomodoroSessions();
  const updateTask = useUpdateTask();
  const toggleToday = useToggleHabitToday();
  const router = useRouter();

  const today = todayKey();

  const habitsDoneToday = habits.filter((habit) =>
    habitLogs.some((log) => log.habit_id === habit.id && log.completed_date === today)
  ).length;

  const focusMinutesToday = useMemo(
    () =>
      pomodoroSessions
        .filter((session) => isToday(new Date(session.completed_at)))
        .reduce((sum, session) => sum + session.duration_minutes, 0),
    [pomodoroSessions]
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.flex}>
        <ActivityIndicator style={styles.flex} />
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.flex}>
        <ErrorState error={error} />
      </ThemedView>
    );
  }

  return (
    <View style={styles.flex}>
      {backgroundScene !== 'none' ? (
        <AnimatedBackground scene={backgroundScene} dark={effectiveScheme === 'dark'} />
      ) : (
        <ThemedView style={StyleSheet.absoluteFill} />
      )}
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
          <ThemedView style={styles.header}>
            <ThemedView style={styles.headerRow}>
              <ThemedView style={styles.headerTitleGroup}>
                <ThemedText type="title" style={styles.title}>
                  {t('dashboard.title')}
                </ThemedText>
                <ThemedText type="default" themeColor="textSecondary">
                  {format(new Date(), 'EEEE, MMM d', { locale: dateLocale })}
                </ThemedText>
              </ThemedView>
              <Pressable
                onPress={() => router.push('/(app)/more')}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.moreButton,
                  { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
                ]}>
                <Ionicons name="apps-outline" size={22} color={theme.text} />
              </Pressable>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.statsRow}>
            <ThemedView
              type="backgroundElement"
              style={[styles.statCard, CardShadow]}>
              <Ionicons name="checkmark-done-circle" size={26} color={theme.accent} />
              <ThemedText type="title" style={styles.statNumber}>
                {completedCount}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {t('dashboard.completedTasks')}
              </ThemedText>
            </ThemedView>
            <ThemedView
              type="backgroundElement"
              style={[styles.statCard, CardShadow]}>
              <Ionicons name="time-outline" size={26} color={theme.streak} />
              <ThemedText type="title" style={styles.statNumber}>
                {pendingCount}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {t('dashboard.pendingTasks')}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.statsRow}>
            <ThemedView
              type="backgroundElement"
              style={[styles.statCard, CardShadow]}>
              <Ionicons name="flame" size={26} color={theme.streak} />
              <ThemedText type="title" style={styles.statNumber}>
                {habitsDoneToday}/{habits.length}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {t('dashboard.habitsToday')}
              </ThemedText>
            </ThemedView>
            <ThemedView
              type="backgroundElement"
              style={[styles.statCard, CardShadow]}>
              <Ionicons name="timer-outline" size={26} color={theme.accent} />
              <ThemedText type="title" style={styles.statNumber}>
                {t('dashboard.focusMinutes', { count: focusMinutesToday })}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {t('dashboard.focusTimeToday')}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('dashboard.quickActionsTitle')}
            </ThemedText>
            <ThemedView style={styles.quickActionsRow}>
              {QUICK_ACTIONS.map((action) => (
                <Pressable
                  key={action.key}
                  onPress={() => router.push(action.href as never)}
                  style={({ pressed }) => [styles.quickAction, { opacity: pressed ? 0.7 : 1 }]}>
                  <ThemedView
                    type="backgroundElement"
                    style={[styles.quickActionIcon, CardShadow]}>
                    <Ionicons name={action.icon} size={22} color={theme.accent} />
                  </ThemedView>
                  <ThemedText type="small" style={styles.quickActionLabel} numberOfLines={2}>
                    {t(`dashboard.quickActions.${action.key}`)}
                  </ThemedText>
                </Pressable>
              ))}
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('dashboard.tasksSection')}
            </ThemedText>
            {tasks.length === 0 ? (
              <EmptyState message={t('dashboard.noTasksToday')} icon="checkmark-circle-outline" />
            ) : (
              tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={() =>
                    updateTask.mutate({ id: task.id, input: { is_completed: !task.is_completed } })
                  }
                  onPress={() => router.push(`/(app)/tasks/${task.id}`)}
                />
              ))
            )}
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t('dashboard.habitsSection')}
            </ThemedText>
            {habits.length === 0 ? (
              <EmptyState message={t('dashboard.noHabits')} icon="flame-outline" />
            ) : (
              habits.map((habit) => {
                const doneToday = habitLogs.some(
                  (log) => log.habit_id === habit.id && log.completed_date === today
                );
                return (
                  <HabitRow
                    key={habit.id}
                    habit={habit}
                    doneToday={doneToday}
                    streak={computeStreak(habitLogs, habit.id)}
                    onToggle={() => toggleToday.mutate({ habitId: habit.id, isDoneToday: doneToday })}
                    onPress={() => router.push(`/(app)/habits/${habit.id}`)}
                  />
                );
              })
            )}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Spacing.four, paddingBottom: BottomTabInset, gap: Spacing.five },
  header: { paddingTop: Spacing.three, gap: Spacing.one },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitleGroup: { gap: Spacing.one },
  title: { fontSize: 32, lineHeight: 38 },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: Spacing.three },
  statCard: {
    flex: 1,
    padding: Spacing.four,
    borderRadius: Radius.large,
    alignItems: 'flex-start',
    gap: Spacing.one,
  },
  statNumber: { fontSize: 28, lineHeight: 32 },
  section: { gap: Spacing.two },
  sectionTitle: { fontSize: 20, lineHeight: 26 },
  quickActionsRow: { flexDirection: 'row', gap: Spacing.two },
  quickAction: { flex: 1, alignItems: 'center', gap: Spacing.one },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: { textAlign: 'center' },
});
