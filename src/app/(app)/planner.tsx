import { Ionicons } from '@expo/vector-icons';
import { addDays, format, isSameDay, subDays } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DayAgenda } from '@/components/DayAgenda';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useDateLocale } from '@/lib/i18n/dateLocale';

export default function PlannerScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const dateLocale = useDateLocale();
  const [date, setDate] = useState(new Date());
  const isToday = isSameDay(date, new Date());

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {t('planner.title')}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.nav}>
          <Pressable
            onPress={() => setDate((d) => subDays(d, 1))}
            style={[styles.navButton, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </Pressable>

          <Pressable onPress={() => setDate(new Date())} disabled={isToday} style={styles.dateLabel}>
            <ThemedText type="smallBold" style={isToday ? { color: theme.accent } : undefined}>
              {isToday ? t('planner.today') : format(date, 'EEEE, MMM d', { locale: dateLocale })}
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => setDate((d) => addDays(d, 1))}
            style={[styles.navButton, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </Pressable>
        </ThemedView>

        <ScrollView contentContainerStyle={styles.content}>
          <DayAgenda date={date} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingTop: Spacing.three, paddingHorizontal: Spacing.four, gap: Spacing.one },
  title: { fontSize: 32, lineHeight: 38 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  dateLabel: { flex: 1, alignItems: 'center' },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: Spacing.four, paddingBottom: BottomTabInset },
});
