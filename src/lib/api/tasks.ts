import type { Category } from '@/constants/categories';
import { supabase } from '@/lib/supabase';
import type { Task } from '@/types/database';

export async function listTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export type CreateTaskInput = {
  title: string;
  description?: string | null;
  due_date?: string | null;
  category?: Category;
};

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { data, error } = await supabase.from('tasks').insert(input).select().single();
  if (error) throw error;
  return data;
}

export type UpdateTaskInput = Partial<CreateTaskInput> & {
  is_completed?: boolean;
};

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const payload = { ...input } as UpdateTaskInput & { completed_at?: string | null };
  if (input.is_completed !== undefined) {
    payload.completed_at = input.is_completed ? new Date().toISOString() : null;
  }
  const { data, error } = await supabase.from('tasks').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}
