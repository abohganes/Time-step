import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryDot } from '@/components/CategoryPicker';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, CardShadow, Radius, Spacing } from '@/constants/theme';
import { useHabits } from '@/hooks/useHabits';
import { useTasks } from '@/hooks/useTasks';
import { useTheme } from '@/hooks/use-theme';
import { useDateLocale } from '@/lib/i18n/dateLocale';

function habitTimeMinutes(reminderTime: string): number {
  const [hour, minute] = reminderTime.split(':').map(Number);
  return hour * 60 + minute;
}

export default function RemindersScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const dateLocale = useDateLocale();
  const router = useRouter();
  const tasksQuery = useTasks();
  const habitsQuery = useHabits();

  const upcomingTasks = useMemo(
    () =>
      (tasksQuery.data ?? [])
        .filter((task) => !task.is_completed && task.due_date)
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()),
    [tasksQuery.data]
  );

  const habitReminders = useMemo(
    () =>
      (habitsQuery.data ?? [])
        .filter((habit) => habit.is_active && habit.reminder_time)
        .sort((a, b) => habitTimeMinutes(a.reminder_time!) - habitTimeMinutes(b.reminder_time!)),
    [habitsQuery.data]
  );

  const isLoading = tasksQuery.isLoading || habitsQuery.isLoading;
  const isError = tasksQuery.isError || habitsQuery.isError;

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {t('reminders.title')}
          </ThemedText>
        </ThemedView>

        {isLoading ? (
          <ActivityIndicator style={styles.loading} />
        ) : isError ? (
          <ErrorState error={tasksQuery.error ?? habitsQuery.error} />
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                {t('reminders.tasksSection')}
              </ThemedText>
              {upcomingTasks.length === 0 ? (
                <EmptyState message={t('reminders.noUpcomingTasks')} icon="checkmark-circle-outline" />
              ) : (
                upcomingTasks.map((task) => (
                  <Pressable
                    key={task.id}
                    onPress={() => router.push(`/(app)/tasks/${task.id}`)}
                    style={({ pressed }) => [
                      styles.row,
                      { backgroundColor: theme.backgroundElement, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
                      CardShadow,
                    ]}>
                    <Ionicons name="alarm-outline" size={20} color={theme.accent} />
                    <View style={styles.rowText}>
                      <View style={styles.rowTitle}>
                        <CategoryDot category={task.category} />
                        <ThemedText type="default" numberOfLines={1}>
                          {task.title}
                        </ThemedText>
                      </View>
                      <ThemedText type="small" themeColor="textSecondary">
                        {format(new Date(task.due_date!), 'EEE, MMM d, h:mm a', { locale: dateLocale })}
                      </ThemedText>
                    </View>
                  </Pressable>
                ))
              )}
            </ThemedView>

            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                {t('reminders.habitsSection')}
              </ThemedText>
              {habitReminders.length === 0 ? (
                <EmptyState message={t('reminders.noHabitReminders')} icon="flame-outline" />
              ) : (
                habitReminders.map((habit) => (
                  <Pressable
                    key={habit.id}
                    onPress={() => router.push(`/(app)/habits/${habit.id}`)}
                    style={({ pressed }) => [
                      styles.row,
                      { backgroundColor: theme.backgroundElement, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
                      CardShadow,
                    ]}>
                    <Ionicons name="flame-outline" size={20} color={theme.streak} />
                    <View style={styles.rowText}>
                      <View style={styles.rowTitle}>
                        <CategoryDot category={habit.category} />
                        <ThemedText type="default" numberOfLines={1}>
                          {habit.title}
                        </ThemedText>
                      </View>
                      <ThemedText type="small" themeColor="textSecondary">
                        {t('reminders.dailyAt', {
                          time: new Date(`1970-01-01T${habit.reminder_time}`).toLocaleTimeString(
                            i18n.language,
                            { hour: 'numeric', minute: '2-digit' }
                          ),
                        })}
                      </ThemedText>
                    </View>
                  </Pressable>
                ))
              )}
            </ThemedView>
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingTop: Spacing.three, paddingHorizontal: Spacing.four, gap: Spacing.one },
  title: { fontSize: 32, lineHeight: 38 },
  loading: { flex: 1 },
  content: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: BottomTabInset, gap: Spacing.five },
  section: { gap: Spacing.two },
  sectionTitle: { fontSize: 20, lineHeight: 26 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.large,
    borderWidth: 1,
  },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
