import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryPicker } from '@/components/CategoryPicker';
import { DueDateField } from '@/components/DueDateField';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Category } from '@/constants/categories';
import { Spacing } from '@/constants/theme';
import { useDeleteTask, useTasks, useUpdateTask } from '@/hooks/useTasks';

export default function EditTaskScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: tasks } = useTasks();
  const task = tasks?.find((item) => item.id === id);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [category, setCategory] = useState<Category>('general');

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? '');
    setDueDate(task.due_date ? new Date(task.due_date) : null);
    setCategory(task.category);
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
        category,
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
            <TextField label={t('common.titleLabel')} value={title} onChangeText={setTitle} />
            <TextField
              label={t('common.descriptionLabel')}
              value={description}
              onChangeText={setDescription}
              multiline
              style={styles.multiline}
            />
            <DueDateField label={t('tasks.dueDate')} value={dueDate} onChange={setDueDate} />
            <CategoryPicker label={t('common.category')} value={category} onChange={setCategory} />
            <Button
              title={t('common.save')}
              onPress={handleSave}
              loading={updateTask.isPending}
              disabled={!title.trim()}
            />
            <Button
              title={t('tasks.deleteTask')}
              variant="danger"
              onPress={handleDelete}
              loading={deleteTask.isPending}
            />
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
