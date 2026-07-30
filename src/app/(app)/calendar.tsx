import { Ionicons } from '@expo/vector-icons';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayAgenda } from '@/components/DayAgenda';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTasks } from '@/hooks/useTasks';
import { useTheme } from '@/hooks/use-theme';
import { useDateLocale } from '@/lib/i18n/dateLocale';

export default function CalendarScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const dateLocale = useDateLocale();
  const { data: tasks = [] } = useTasks();
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { locale: dateLocale });
    const end = endOfWeek(endOfMonth(month), { locale: dateLocale });
    return eachDayOfInterval({ start, end });
  }, [month, dateLocale]);

  const daysWithTasks = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((task) => {
      if (task.due_date) set.add(format(new Date(task.due_date), 'yyyy-MM-dd'));
    });
    return set;
  }, [tasks]);

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {t('calendar.title')}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.monthNav}>
          <Pressable
            onPress={() => setMonth((m) => subMonths(m, 1))}
            style={[styles.navButton, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </Pressable>
          <ThemedText type="smallBold">{format(month, 'MMMM yyyy', { locale: dateLocale })}</ThemedText>
          <Pressable
            onPress={() => setMonth((m) => addMonths(m, 1))}
            style={[styles.navButton, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </Pressable>
        </ThemedView>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.grid}>
            {days.map((day) => {
              const inMonth = isSameMonth(day, month);
              const selected = isSameDay(day, selectedDate);
              const hasTasks = daysWithTasks.has(format(day, 'yyyy-MM-dd'));
              return (
                <Pressable
                  key={day.toISOString()}
                  onPress={() => setSelectedDate(day)}
                  style={[styles.dayCell, { backgroundColor: selected ? theme.accent : 'transparent' }]}>
                  <ThemedText
                    type="small"
                    style={{
                      color: selected ? '#ffffff' : theme.text,
                      opacity: inMonth ? 1 : 0.35,
                    }}>
                    {format(day, 'd')}
                  </ThemedText>
                  <View
                    style={[
                      styles.taskDot,
                      { backgroundColor: hasTasks ? (selected ? '#ffffff' : theme.accent) : 'transparent' },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>

          <DayAgenda date={selectedDate} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingTop: Spacing.three, paddingHorizontal: Spacing.four, gap: Spacing.one },
  title: { fontSize: 32, lineHeight: 38 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: Spacing.four, paddingBottom: BottomTabInset, gap: Spacing.five },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: Radius.medium,
  },
  taskDot: { width: 5, height: 5, borderRadius: 2.5 },
});
