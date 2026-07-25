import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { HabitRow } from '@/components/HabitRow';
import { TaskRow } from '@/components/TaskRow';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { computeStreak, todayKey, useToggleHabitToday } from '@/hooks/useHabitLogs';
import { useTodayData } from '@/hooks/useTodayData';
import { useUpdateTask } from '@/hooks/useTasks';

export default function TodayScreen() {
  const { tasks, habits, habitLogs, isLoading, isError, error, refetch, isRefetching } = useTodayData();
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
        <ErrorState message={error instanceof Error ? error.message : 'Failed to load'} />
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
              Today
            </ThemedText>
            <ThemedText type="default" themeColor="textSecondary">
              {format(new Date(), 'EEEE, MMM d')}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Tasks
            </ThemedText>
            {tasks.length === 0 ? (
              <EmptyState message="Nothing due today." />
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
              Habits
            </ThemedText>
            {habits.length === 0 ? (
              <EmptyState message="No habits yet." />
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
  section: { gap: Spacing.two },
  sectionTitle: { fontSize: 20, lineHeight: 26 },
});
