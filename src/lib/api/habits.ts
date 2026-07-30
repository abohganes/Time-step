import type { Category } from '@/constants/categories';
import { supabase } from '@/lib/supabase';
import type { Habit } from '@/types/database';

export async function listHabits(): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export type CreateHabitInput = {
  title: string;
  description?: string | null;
  reminder_time?: string | null;
  category?: Category;
};

export async function createHabit(input: CreateHabitInput): Promise<Habit> {
  const { data, error } = await supabase.from('habits').insert(input).select().single();
  if (error) throw error;
  return data;
}

export type UpdateHabitInput = Partial<CreateHabitInput> & {
  is_active?: boolean;
};

export async function updateHabit(id: string, input: UpdateHabitInput): Promise<Habit> {
  const { data, error } = await supabase.from('habits').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteHabit(id: string): Promise<void> {
  const { error } = await supabase.from('habits').delete().eq('id', id);
  if (error) throw error;
}
