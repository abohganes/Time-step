import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDeleteNote, useNotes, useUpdateNote } from '@/hooks/useNotes';
import { useTheme } from '@/hooks/use-theme';

const AUTOSAVE_DELAY_MS = 800;

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const theme = useTheme();
  const { data: notes } = useNotes();
  const note = notes?.find((n) => n.id === id);
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const hydrated = useRef(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!note || hydrated.current) return;
    hydrated.current = true;
    setTitle(note.title === 'Untitled' ? '' : note.title);
    setContent(note.content);
  }, [note]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={22} color="#e5484d" />
        </Pressable>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  function scheduleSave(nextTitle: string, nextContent: string) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      updateNote.mutate({
        id: id!,
        input: { title: nextTitle.trim() || 'Untitled', content: nextContent },
      });
    }, AUTOSAVE_DELAY_MS);
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    scheduleSave(value, content);
  }

  function handleContentChange(value: string) {
    setContent(value);
    scheduleSave(title, value);
  }

  async function handleDelete() {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    await deleteNote.mutateAsync(id!);
    router.back();
  }

  if (!note) {
    return (
      <ThemedView style={styles.flex}>
        <ActivityIndicator style={styles.flex} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <TextInput
          value={title}
          onChangeText={handleTitleChange}
          placeholder="Untitled"
          placeholderTextColor={theme.textSecondary}
          style={[styles.title, { color: theme.text }]}
        />
        <TextInput
          value={content}
          onChangeText={handleContentChange}
          placeholder="Start writing..."
          placeholderTextColor={theme.textSecondary}
          style={[styles.content, { color: theme.text }]}
          multiline
          textAlignVertical="top"
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: {
    fontSize: 28,
    fontWeight: '600',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  content: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
});
