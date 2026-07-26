import { endOfToday } from 'date-fns';

import { useHabitLogs } from '@/hooks/useHabitLogs';
import { useHabits } from '@/hooks/useHabits';
import { useTasks } from '@/hooks/useTasks';

export function useTodayData() {
  const tasksQuery = useTasks();
  const habitsQuery = useHabits();
  const habitLogsQuery = useHabitLogs();

  // Due today or overdue (tasks with no due date at all don't show up here,
  // only in the full Tasks list).
  const todayTasks = (tasksQuery.data ?? []).filter(
    (task) => !task.is_completed && task.due_date && new Date(task.due_date) <= endOfToday()
  );

  const activeHabits = (habitsQuery.data ?? []).filter((habit) => habit.is_active);
  const allTasks = tasksQuery.data ?? [];
  const completedCount = allTasks.filter((task) => task.is_completed).length;
  const pendingCount = allTasks.length - completedCount;

  return {
    tasks: todayTasks,
    habits: activeHabits,
    habitLogs: habitLogsQuery.data ?? [],
    completedCount,
    pendingCount,
    isLoading: tasksQuery.isLoading || habitsQuery.isLoading || habitLogsQuery.isLoading,
    isError: tasksQuery.isError || habitsQuery.isError || habitLogsQuery.isError,
    error: tasksQuery.error ?? habitsQuery.error ?? habitLogsQuery.error,
    refetch: () => Promise.all([tasksQuery.refetch(), habitsQuery.refetch(), habitLogsQuery.refetch()]),
    isRefetching: tasksQuery.isRefetching || habitsQuery.isRefetching || habitLogsQuery.isRefetching,
  };
}
