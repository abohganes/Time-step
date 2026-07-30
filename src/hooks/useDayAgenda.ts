import { isSameDay } from 'date-fns';
import { useMemo } from 'react';

import { useHabitLogs } from '@/hooks/useHabitLogs';
import { useHabits } from '@/hooks/useHabits';
import { useTasks } from '@/hooks/useTasks';

export function useDayAgenda(date: Date) {
  const tasksQuery = useTasks();
  const habitsQuery = useHabits();
  const habitLogsQuery = useHabitLogs();

  const tasks = useMemo(
    () =>
      (tasksQuery.data ?? [])
        .filter((task) => task.due_date && isSameDay(new Date(task.due_date), date))
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()),
    [tasksQuery.data, date]
  );

  const habits = useMemo(
    () => (habitsQuery.data ?? []).filter((habit) => habit.is_active),
    [habitsQuery.data]
  );

  return {
    tasks,
    habits,
    habitLogs: habitLogsQuery.data ?? [],
    isLoading: tasksQuery.isLoading || habitsQuery.isLoading || habitLogsQuery.isLoading,
    isError: tasksQuery.isError || habitsQuery.isError || habitLogsQuery.isError,
    error: tasksQuery.error ?? habitsQuery.error ?? habitLogsQuery.error,
    refetch: () => Promise.all([tasksQuery.refetch(), habitsQuery.refetch(), habitLogsQuery.refetch()]),
    isRefetching: tasksQuery.isRefetching || habitsQuery.isRefetching || habitLogsQuery.isRefetching,
  };
}
