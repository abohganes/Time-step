import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { HabitRow } from '@/components/HabitRow';
import { TaskRow } from '@/components/TaskRow';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { computeStreak, dateKey, useToggleHabitOnDate } from '@/hooks/useHabitLogs';
import { useDayAgenda } from '@/hooks/useDayAgenda';
import { useUpdateTask } from '@/hooks/useTasks';

type DayAgendaProps = { date: Date };

export function DayAgenda({ date }: DayAgendaProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { tasks, habits, habitLogs, isLoading, isError, error } = useDayAgenda(date);
  const updateTask = useUpdateTask();
  const toggleHabit = useToggleHabitOnDate();
  const key = dateKey(date);

  if (isLoading) {
    return <ActivityIndicator style={styles.loading} />;
  }

  if (isError) {
    return <ErrorState error={error} />;
  }

  return (
    <ThemedView style={styles.container}>
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
            const doneOnDate = habitLogs.some(
              (log) => log.habit_id === habit.id && log.completed_date === key
            );
            return (
              <HabitRow
                key={habit.id}
                habit={habit}
                doneToday={doneOnDate}
                streak={computeStreak(habitLogs, habit.id)}
                onToggle={() =>
                  toggleHabit.mutate({ habitId: habit.id, dateKey: key, isDone: doneOnDate })
                }
                onPress={() => router.push(`/(app)/habits/${habit.id}`)}
              />
            );
          })
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loading: { paddingVertical: Spacing.six },
  container: { gap: Spacing.five },
  section: { gap: Spacing.two },
  sectionTitle: { fontSize: 20, lineHeight: 26 },
});
