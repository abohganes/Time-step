import { supabase } from '@/lib/supabase';

export type ChatMessage = {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

export async function listChatMessages(): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function sendChatMessage(message: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ reply?: string; error?: string }>(
    'assistant',
    { body: { message } }
  );
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data?.reply ?? '';
}

export async function clearChatMessages(): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;
  const { error } = await supabase.from('chat_messages').delete().eq('user_id', userData.user.id);
  if (error) throw error;
}
