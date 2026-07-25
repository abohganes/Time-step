import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReminderTimeField } from '@/components/ReminderTimeField';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Spacing } from '@/constants/theme';
import { useDeleteHabit, useHabits, useUpdateHabit } from '@/hooks/useHabits';

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: habits } = useHabits();
  const habit = habits?.find((h) => h.id === id);
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderTime, setReminderTime] = useState<string | null>(null);

  useEffect(() => {
    if (!habit) return;
    setTitle(habit.title);
    setDescription(habit.description ?? '');
    setReminderTime(habit.reminder_time);
  }, [habit]);

  if (!habit) {
    return (
      <ThemedView style={styles.flex}>
        <ActivityIndicator style={styles.flex} />
      </ThemedView>
    );
  }

  async function handleSave() {
    if (!title.trim()) return;
    await updateHabit.mutateAsync({
      id: habit!.id,
      input: {
        title: title.trim(),
        description: description.trim() || null,
        reminder_time: reminderTime,
      },
    });
    router.back();
  }

  async function handleDelete() {
    await deleteHabit.mutateAsync(habit!.id);
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
            <ReminderTimeField label="Daily reminder" value={reminderTime} onChange={setReminderTime} />
            <Button
              title="Save"
              onPress={handleSave}
              loading={updateHabit.isPending}
              disabled={!title.trim()}
            />
            <Button
              title="Delete habit"
              variant="danger"
              onPress={handleDelete}
              loading={deleteHabit.isPending}
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
