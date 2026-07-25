import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { NoteRow } from '@/components/NoteRow';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useCreateNote, useNotes } from '@/hooks/useNotes';

export default function NotesScreen() {
  const { t } = useTranslation();
  const { data: notes, isLoading, isError, error, refetch, isRefetching } = useNotes();
  const createNote = useCreateNote();
  const router = useRouter();

  async function handleCreate() {
    const note = await createNote.mutateAsync();
    router.push(`/(app)/notes/${note.id}`);
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {t('notes.title')}
          </ThemedText>
          <Pressable hitSlop={8} onPress={handleCreate} disabled={createNote.isPending}>
            <Ionicons name="add-circle" size={32} color="#3c87f7" />
          </Pressable>
        </ThemedView>

        {isLoading ? (
          <ActivityIndicator style={styles.loading} />
        ) : isError ? (
          <ErrorState error={error} />
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.list, notes?.length === 0 && styles.flex]}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={<EmptyState message={t('notes.empty')} />}
            renderItem={({ item }) => (
              <NoteRow note={item} onPress={() => router.push(`/(app)/notes/${item.id}`)} />
            )}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  title: { fontSize: 32, lineHeight: 38 },
  loading: { flex: 1 },
  list: { paddingHorizontal: Spacing.four, paddingBottom: BottomTabInset },
});
