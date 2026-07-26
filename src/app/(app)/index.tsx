import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { HabitRow } from '@/components/HabitRow';
import { TaskRow } from '@/components/TaskRow';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, CardShadow, Radius, Spacing } from '@/constants/theme';
import { computeStreak, todayKey, useToggleHabitToday } from '@/hooks/useHabitLogs';
import { useTodayData } from '@/hooks/useTodayData';
import { useUpdateTask } from '@/hooks/useTasks';
import { useTheme } from '@/hooks/use-theme';
import { useDateLocale } from '@/lib/i18n/dateLocale';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const dateLocale = useDateLocale();
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
  const updateTask = useUpdateTask();
  const toggleToday = useToggleHabitToday();
  const router = useRouter();

  const today = todayKey();

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
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              {t('dashboard.title')}
            </ThemedText>
            <ThemedText type="default" themeColor="textSecondary">
              {format(new Date(), 'EEEE, MMM d', { locale: dateLocale })}
            </ThemedText>
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: Spacing.four, paddingBottom: BottomTabInset, gap: Spacing.five },
  header: { paddingTop: Spacing.three, gap: Spacing.one },
  title: { fontSize: 32, lineHeight: 38 },
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
});
