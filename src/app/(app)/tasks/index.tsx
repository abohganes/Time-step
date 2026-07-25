import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TaskRow } from '@/components/TaskRow';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTasks, useUpdateTask } from '@/hooks/useTasks';

export default function TasksScreen() {
  const { data: tasks, isLoading, isError, error, refetch, isRefetching } = useTasks();
  const updateTask = useUpdateTask();
  const router = useRouter();

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Tasks
          </ThemedText>
          <Link href="/(app)/tasks/new" asChild>
            <Pressable hitSlop={8}>
              <Ionicons name="add-circle" size={32} color="#3c87f7" />
            </Pressable>
          </Link>
        </ThemedView>

        {isLoading ? (
          <ActivityIndicator style={styles.loading} />
        ) : isError ? (
          <ErrorState message={error.message} />
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.list, tasks?.length === 0 && styles.flex]}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={<EmptyState message="No tasks yet. Tap + to add one." />}
            renderItem={({ item }) => (
              <TaskRow
                task={item}
                onToggle={() =>
                  updateTask.mutate({ id: item.id, input: { is_completed: !item.is_completed } })
                }
                onPress={() => router.push(`/(app)/tasks/${item.id}`)}
              />
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
  list: { paddingHorizontal: Spacing.four, paddingBottom: BottomTabInset, gap: Spacing.one },
});
