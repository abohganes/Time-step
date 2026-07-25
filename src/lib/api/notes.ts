import { supabase } from '@/lib/supabase';
import type { Page } from '@/types/database';

export async function listNotes(): Promise<Page[]> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createNote(): Promise<Page> {
  const { data, error } = await supabase.from('pages').insert({}).select().single();
  if (error) throw error;
  return data;
}

export type UpdateNoteInput = {
  title?: string;
  content?: string;
};

export async function updateNote(id: string, input: UpdateNoteInput): Promise<Page> {
  const { data, error } = await supabase.from('pages').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from('pages').delete().eq('id', id);
  if (error) throw error;
}
