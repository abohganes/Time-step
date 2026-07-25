import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createHabit, deleteHabit, listHabits, updateHabit } from '@/lib/api/habits';
import { cancelHabitReminder, scheduleHabitReminder } from '@/lib/notifications';
import type { Habit } from '@/types/database';

const HABITS_KEY = ['habits'];

export function useHabits() {
  return useQuery({ queryKey: HABITS_KEY, queryFn: listHabits });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createHabit,
    onSuccess: async (habit) => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
      await scheduleHabitReminder(habit);
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateHabit>[1] }) =>
      updateHabit(id, input),
    onSuccess: async (habit: Habit) => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
      await scheduleHabitReminder(habit);
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteHabit,
    onSuccess: async (_data, id) => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
      await cancelHabitReminder(id);
    },
  });
}
