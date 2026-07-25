import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DueDateField } from '@/components/DueDateField';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Spacing } from '@/constants/theme';
import { useCreateTask } from '@/hooks/useTasks';

export default function NewTaskScreen() {
  const router = useRouter();
  const createTask = useCreateTask();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);

  async function handleSave() {
    if (!title.trim()) return;
    await createTask.mutateAsync({
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate ? dueDate.toISOString() : null,
    });
    router.back();
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ThemedView style={styles.form}>
            <TextField label="Title" value={title} onChangeText={setTitle} autoFocus />
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
              loading={createTask.isPending}
              disabled={!title.trim()}
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
