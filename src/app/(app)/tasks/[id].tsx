import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DueDateField } from '@/components/DueDateField';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Spacing } from '@/constants/theme';
import { useDeleteTask, useTasks, useUpdateTask } from '@/hooks/useTasks';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: tasks } = useTasks();
  const task = tasks?.find((t) => t.id === id);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? '');
    setDueDate(task.due_date ? new Date(task.due_date) : null);
  }, [task]);

  if (!task) {
    return (
      <ThemedView style={styles.flex}>
        <ActivityIndicator style={styles.flex} />
      </ThemedView>
    );
  }

  async function handleSave() {
    if (!title.trim()) return;
    await updateTask.mutateAsync({
      id: task!.id,
      input: {
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate ? dueDate.toISOString() : null,
      },
    });
    router.back();
  }

  async function handleDelete() {
    await deleteTask.mutateAsync(task!.id);
    router.back();
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ThemedView style={styles.form}>
            <TextField label="Title" value={title} onChangeText={setTitle} />
            <TextField
              label="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              style={styles.multiline}
            />
            <DueDateField label="Due date" value={dueDate} onChange={setDueDate} />
            <Button
              title="Save"
              onPress={handleSave}
              loading={updateTask.isPending}
              disabled={!title.trim()}
            />
            <Button title="Delete task" variant="danger" onPress={handleDelete} loading={deleteTask.isPending} />
          </ThemedView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { padding: Spacing.four, gap: Spacing.four },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
});
