import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { HabitRow } from '@/components/HabitRow';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { computeStreak, todayKey, useHabitLogs, useToggleHabitToday } from '@/hooks/useHabitLogs';
import { useHabits } from '@/hooks/useHabits';

export default function HabitsScreen() {
  const { t } = useTranslation();
  const { data: habits, isLoading, isError, error, refetch, isRefetching } = useHabits();
  const { data: logs } = useHabitLogs();
  const toggleToday = useToggleHabitToday();
  const router = useRouter();

  const today = todayKey();

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {t('habits.title')}
          </ThemedText>
          <Link href="/(app)/habits/new" asChild>
            <Pressable hitSlop={8}>
              <Ionicons name="add-circle" size={32} color="#3c87f7" />
            </Pressable>
          </Link>
        </ThemedView>

        {isLoading ? (
          <ActivityIndicator style={styles.loading} />
        ) : isError ? (
          <ErrorState error={error} />
        ) : (
          <FlatList
            data={habits}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.list, habits?.length === 0 && styles.flex]}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={<EmptyState message={t('habits.empty')} />}
            renderItem={({ item }) => {
              const doneToday = (logs ?? []).some(
                (log) => log.habit_id === item.id && log.completed_date === today
              );
              return (
                <HabitRow
                  habit={item}
                  doneToday={doneToday}
                  streak={computeStreak(logs ?? [], item.id)}
                  onToggle={() => toggleToday.mutate({ habitId: item.id, isDoneToday: doneToday })}
                  onPress={() => router.push(`/(app)/habits/${item.id}`)}
                />
              );
            }}
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
