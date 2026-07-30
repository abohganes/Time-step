import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, CardShadow, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type MenuItem = {
  key: string;
  href: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  color: 'accent' | 'streak' | 'danger' | 'success';
};

const ITEMS: MenuItem[] = [
  { key: 'habits', href: '/(app)/habits', icon: 'flame-outline', color: 'streak' },
  { key: 'pomodoro', href: '/(app)/pomodoro', icon: 'timer-outline', color: 'accent' },
  { key: 'assistant', href: '/(app)/assistant', icon: 'sparkles-outline', color: 'success' },
  { key: 'planner', href: '/(app)/planner', icon: 'list-outline', color: 'accent' },
  { key: 'reminders', href: '/(app)/reminders', icon: 'alarm-outline', color: 'streak' },
  { key: 'statistics', href: '/(app)/statistics', icon: 'stats-chart-outline', color: 'success' },
];

export default function MoreScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {t('tabs.more')}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.list}>
          {ITEMS.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => router.push(item.href as never)}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
                CardShadow,
              ]}>
              <Ionicons name={item.icon} size={22} color={theme[item.color]} />
              <ThemedText type="default" style={styles.rowText}>
                {t(`tabs.${item.key}`)}
              </ThemedText>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </Pressable>
          ))}
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, paddingBottom: BottomTabInset },
  header: { paddingTop: Spacing.three, paddingHorizontal: Spacing.four, gap: Spacing.one },
  title: { fontSize: 32, lineHeight: 38 },
  list: { padding: Spacing.four, gap: Spacing.three },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radius.large,
  },
  rowText: { flex: 1 },
});
