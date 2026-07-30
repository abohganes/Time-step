import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';

import { listHabitLogs, logHabitCompletion, unlogHabitCompletion } from '@/lib/api/habitLogs';
import type { HabitLog } from '@/types/database';

const HABIT_LOGS_KEY = ['habit_logs'];

export const todayKey = () => format(new Date(), 'yyyy-MM-dd');
export const dateKey = (date: Date) => format(date, 'yyyy-MM-dd');

export function useHabitLogs() {
  return useQuery({ queryKey: HABIT_LOGS_KEY, queryFn: listHabitLogs });
}

export function useToggleHabitOnDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      habitId,
      dateKey: key,
      isDone,
    }: {
      habitId: string;
      dateKey: string;
      isDone: boolean;
    }) => {
      if (isDone) {
        await unlogHabitCompletion(habitId, key);
      } else {
        await logHabitCompletion(habitId, key);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: HABIT_LOGS_KEY }),
  });
}

export function useToggleHabitToday() {
  const toggle = useToggleHabitOnDate();
  return {
    ...toggle,
    mutate: ({ habitId, isDoneToday }: { habitId: string; isDoneToday: boolean }) =>
      toggle.mutate({ habitId, dateKey: todayKey(), isDone: isDoneToday }),
  };
}

// Walks backward day-by-day from today (or yesterday, if today isn't logged yet)
// counting consecutive completed days.
export function computeStreak(logs: HabitLog[], habitId: string): number {
  const completedDates = new Set(
    logs.filter((log) => log.habit_id === habitId).map((log) => log.completed_date)
  );

  let streak = 0;
  let cursor = new Date();
  if (!completedDates.has(format(cursor, 'yyyy-MM-dd'))) {
    cursor = subDays(cursor, 1);
  }

  while (completedDates.has(format(cursor, 'yyyy-MM-dd'))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }

  return streak;
}
