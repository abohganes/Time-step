import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReminderTimeField } from '@/components/ReminderTimeField';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Spacing } from '@/constants/theme';
import { useCreateHabit } from '@/hooks/useHabits';

export default function NewHabitScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const createHabit = useCreateHabit();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderTime, setReminderTime] = useState<string | null>(null);

  async function handleSave() {
    if (!title.trim()) return;
    await createHabit.mutateAsync({
      title: title.trim(),
      description: description.trim() || null,
      reminder_time: reminderTime,
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
            <ReminderTimeField
              label={t('habits.dailyReminder')}
              value={reminderTime}
              onChange={setReminderTime}
            />
            <Button
              title={t('common.save')}
              onPress={handleSave}
              loading={createHabit.isPending}
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
