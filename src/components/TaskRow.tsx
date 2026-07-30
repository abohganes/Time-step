import { format, isPast } from 'date-fns';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { CategoryDot } from '@/components/CategoryPicker';
import { ThemedText } from '@/components/themed-text';
import { Checkbox } from '@/components/ui/Checkbox';
import { CardShadow, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useDateLocale } from '@/lib/i18n/dateLocale';
import type { Task } from '@/types/database';

type TaskRowProps = {
  task: Task;
  onToggle: () => void;
  onPress: () => void;
};

export function TaskRow({ task, onToggle, onPress }: TaskRowProps) {
  const theme = useTheme();
  const dateLocale = useDateLocale();
  const overdue = !task.is_completed && task.due_date && isPast(new Date(task.due_date));

  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
            opacity: pressed ? 0.7 : 1,
          },
          !task.is_completed && CardShadow,
        ]}>
        <Checkbox checked={task.is_completed} onToggle={onToggle} />
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <CategoryDot category={task.category} />
            <ThemedText
              type="default"
              style={task.is_completed ? styles.completed : undefined}
              numberOfLines={1}>
              {task.title}
            </ThemedText>
          </View>
          {task.due_date ? (
            <ThemedText
              type="small"
              themeColor={overdue ? undefined : 'textSecondary'}
              style={overdue ? { color: theme.danger } : undefined}>
              {format(new Date(task.due_date), 'MMM d, h:mm a', { locale: dateLocale })}
            </ThemedText>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.large,
    borderWidth: 1,
  },
  textContainer: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  completed: { textDecorationLine: 'line-through', opacity: 0.5 },
});
