import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { clearChatMessages, listChatMessages, sendChatMessage } from '@/lib/api/assistant';

const CHAT_KEY = ['chat_messages'];

export function useChatMessages() {
  return useQuery({ queryKey: CHAT_KEY, queryFn: listChatMessages });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendChatMessage,
    onSettled: () => queryClient.invalidateQueries({ queryKey: CHAT_KEY }),
  });
}

export function useClearChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearChatMessages,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAT_KEY }),
  });
}
