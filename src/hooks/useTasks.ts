import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createTask, deleteTask, listTasks, updateTask } from '@/lib/api/tasks';
import { cancelTaskNotification, scheduleTaskNotification } from '@/lib/notifications';
import type { Task } from '@/types/database';

const TASKS_KEY = ['tasks'];

export function useTasks() {
  return useQuery({ queryKey: TASKS_KEY, queryFn: listTasks });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: async (task) => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      await scheduleTaskNotification(task);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateTask>[1] }) =>
      updateTask(id, input),
    onSuccess: async (task: Task) => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      if (task.is_completed) {
        await cancelTaskNotification(task.id);
      } else {
        await scheduleTaskNotification(task);
      }
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: async (_data, id) => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      await cancelTaskNotification(id);
    },
  });
}
