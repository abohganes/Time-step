import { Ionicons } from '@expo/vector-icons';
import { eachDayOfInterval, format, isSameDay, subDays } from 'date-fns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryDot } from '@/components/CategoryPicker';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { MiniBarChart } from '@/components/MiniBarChart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, CardShadow, Radius, Spacing } from '@/constants/theme';
import { computeStreak, useHabitLogs } from '@/hooks/useHabitLogs';
import { useHabits } from '@/hooks/useHabits';
import { usePomodoroSessions } from '@/hooks/usePomodoro';
import { useTasks } from '@/hooks/useTasks';
import { useTheme } from '@/hooks/use-theme';
import { useDateLocale } from '@/lib/i18n/dateLocale';

export default function StatisticsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const dateLocale = useDateLocale();

  const tasksQuery = useTasks();
  const habitsQuery = useHabits();
  const habitLogsQuery = useHabitLogs();
  const pomodoroQuery = usePomodoroSessions();

  const tasks = tasksQuery.data ?? [];
  const habits = habitsQuery.data ?? [];
  const habitLogs = habitLogsQuery.data ?? [];
  const sessions = pomodoroQuery.data ?? [];

  const last7Days = useMemo(() => eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() }), []);

  const taskChartData = useMemo(
    () =>
      last7Days.map((day) => ({
        label: format(day, 'EEEEE', { locale: dateLocale }),
        value: tasks.filter((task) => task.completed_at && isSameDay(new Date(task.completed_at), day))
          .length,
      })),
    [last7Days, tasks, dateLocale]
  );

  const pomodoroChartData = useMemo(
    () =>
      last7Days.map((day) => ({
        label: format(day, 'EEEEE', { locale: dateLocale }),
        value: sessions.filter((s) => isSameDay(new Date(s.completed_at), day)).length,
      })),
    [last7Days, sessions, dateLocale]
  );

  const completedCount = tasks.filter((task) => task.is_completed).length;
  const pendingCount = tasks.length - completedCount;

  const habitStreaks = useMemo(
    () =>
      habits
        .filter((habit) => habit.is_active)
        .map((habit) => ({ habit, streak: computeStreak(habitLogs, habit.id) }))
        .sort((a, b) => b.streak - a.streak),
    [habits, habitLogs]
  );

  const isLoading =
    tasksQuery.isLoading || habitsQuery.isLoading || habitLogsQuery.isLoading || pomodoroQuery.isLoading;
  const isError = tasksQuery.isError || habitsQuery.isError || habitLogsQuery.isError || pomodoroQuery.isError;

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {t('statistics.title')}
          </ThemedText>
        </ThemedView>

        {isLoading ? (
          <ActivityIndicator style={styles.loading} />
        ) : isError ? (
          <ErrorState error={tasksQuery.error ?? habitsQuery.error ?? pomodoroQuery.error} />
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <ThemedView style={styles.statsRow}>
              <ThemedView type="backgroundElement" style={[styles.statCard, CardShadow]}>
                <Ionicons name="checkmark-done-circle" size={22} color={theme.accent} />
                <ThemedText type="title" style={styles.statNumber}>
                  {completedCount}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('dashboard.completedTasks')}
                </ThemedText>
              </ThemedView>
              <ThemedView type="backgroundElement" style={[styles.statCard, CardShadow]}>
                <Ionicons name="time-outline" size={22} color={theme.streak} />
                <ThemedText type="title" style={styles.statNumber}>
                  {pendingCount}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('dashboard.pendingTasks')}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                {t('statistics.tasksCompleted')}
              </ThemedText>
              <ThemedView type="backgroundElement" style={[styles.chartCard, CardShadow]}>
                <MiniBarChart data={taskChartData} color={theme.accent} trackColor={theme.backgroundSelected} />
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                {t('statistics.pomodoroSessions')}
              </ThemedText>
              <ThemedView type="backgroundElement" style={[styles.chartCard, CardShadow]}>
                <MiniBarChart
                  data={pomodoroChartData}
                  color={theme.success}
                  trackColor={theme.backgroundSelected}
                />
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                {t('statistics.habitStreaks')}
              </ThemedText>
              {habitStreaks.length === 0 ? (
                <EmptyState message={t('dashboard.noHabits')} icon="flame-outline" />
              ) : (
                habitStreaks.map(({ habit, streak }) => (
                  <ThemedView
                    key={habit.id}
                    type="backgroundElement"
                    style={[styles.streakRow, CardShadow]}>
                    <View style={styles.streakTitle}>
                      <CategoryDot category={habit.category} />
                      <ThemedText type="default" numberOfLines={1}>
                        {habit.title}
                      </ThemedText>
                    </View>
                    <View style={styles.streakValue}>
                      <Ionicons name="flame" size={16} color={theme.streak} />
                      <ThemedText type="smallBold">{streak}</ThemedText>
                    </View>
                  </ThemedView>
                ))
              )}
            </ThemedView>
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingTop: Spacing.three, paddingHorizontal: Spacing.four, gap: Spacing.one },
  title: { fontSize: 32, lineHeight: 38 },
  loading: { flex: 1 },
  content: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: BottomTabInset, gap: Spacing.five },
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
  chartCard: { padding: Spacing.four, borderRadius: Radius.large },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Radius.large,
  },
  streakTitle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flex: 1 },
  streakValue: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
});
