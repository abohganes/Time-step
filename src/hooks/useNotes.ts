import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createNote, deleteNote, listNotes, updateNote } from '@/lib/api/notes';

const NOTES_KEY = ['notes'];

export function useNotes() {
  return useQuery({ queryKey: NOTES_KEY, queryFn: listNotes });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTES_KEY }),
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updateNote>[1] }) =>
      updateNote(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTES_KEY }),
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTES_KEY }),
  });
}
