import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DueDateField } from '@/components/DueDateField';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Spacing } from '@/constants/theme';
import { useCreateTask } from '@/hooks/useTasks';

export default function NewTaskScreen() {
  const { t } = useTranslation();
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
            <TextField label={t('common.titleLabel')} value={title} onChangeText={setTitle} autoFocus />
            <TextField
              label={t('common.descriptionLabel')}
              value={description}
              onChangeText={setDescription}
              multiline
              style={styles.multiline}
            />
            <DueDateField label={t('tasks.dueDate')} value={dueDate} onChange={setDueDate} />
            <Button
              title={t('common.save')}
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
