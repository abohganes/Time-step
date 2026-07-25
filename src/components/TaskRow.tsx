import { format, isPast } from 'date-fns';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Checkbox } from '@/components/ui/Checkbox';
import { Spacing } from '@/constants/theme';
import type { Task } from '@/types/database';

type TaskRowProps = {
  task: Task;
  onToggle: () => void;
  onPress: () => void;
};

export function TaskRow({ task, onToggle, onPress }: TaskRowProps) {
  const overdue = !task.is_completed && task.due_date && isPast(new Date(task.due_date));

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Checkbox checked={task.is_completed} onToggle={onToggle} />
      <View style={styles.textContainer}>
        <ThemedText
          type="default"
          style={task.is_completed ? styles.completed : undefined}
          numberOfLines={1}>
          {task.title}
        </ThemedText>
        {task.due_date ? (
          <ThemedText
            type="small"
            themeColor={overdue ? undefined : 'textSecondary'}
            style={overdue ? styles.overdue : undefined}>
            {format(new Date(task.due_date), 'MMM d, h:mm a')}
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  textContainer: { flex: 1, gap: 2 },
  completed: { textDecorationLine: 'line-through', opacity: 0.5 },
  overdue: { color: '#e5484d' },
});
