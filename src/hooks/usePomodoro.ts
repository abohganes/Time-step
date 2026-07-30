import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isToday } from 'date-fns';

import { listPomodoroSessions, logPomodoroSession } from '@/lib/api/pomodoro';

const POMODORO_KEY = ['pomodoro_sessions'];

export function usePomodoroSessions() {
  return useQuery({ queryKey: POMODORO_KEY, queryFn: listPomodoroSessions });
}

export function useLogPomodoroSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logPomodoroSession,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: POMODORO_KEY }),
  });
}

export function countTodaySessions(sessions: { completed_at: string }[]): number {
  return sessions.filter((s) => isToday(new Date(s.completed_at))).length;
}
