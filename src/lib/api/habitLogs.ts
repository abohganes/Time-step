import { supabase } from '@/lib/supabase';
import type { HabitLog } from '@/types/database';

export async function listHabitLogs(): Promise<HabitLog[]> {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .order('completed_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function logHabitCompletion(habitId: string, date: string): Promise<HabitLog> {
  const { data, error } = await supabase
    .from('habit_logs')
    .insert({ habit_id: habitId, completed_date: date })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function unlogHabitCompletion(habitId: string, date: string): Promise<void> {
  const { error } = await supabase
    .from('habit_logs')
    .delete()
    .eq('habit_id', habitId)
    .eq('completed_date', date);
  if (error) throw error;
}
