import { supabase } from '@/lib/supabase';

export type PomodoroSession = {
  id: string;
  user_id: string;
  duration_minutes: number;
  completed_at: string;
};

export async function listPomodoroSessions(): Promise<PomodoroSession[]> {
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .select('*')
    .order('completed_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return data;
}

export async function logPomodoroSession(durationMinutes: number): Promise<PomodoroSession> {
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .insert({ duration_minutes: durationMinutes })
    .select()
    .single();
  if (error) throw error;
  return data;
}
