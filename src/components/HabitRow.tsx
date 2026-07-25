import { Pressable, StyleSheet, View } from 'react-native';

import { StreakBadge } from '@/components/StreakBadge';
import { ThemedText } from '@/components/themed-text';
import { Checkbox } from '@/components/ui/Checkbox';
import { Spacing } from '@/constants/theme';
import type { Habit } from '@/types/database';

type HabitRowProps = {
  habit: Habit;
  doneToday: boolean;
  streak: number;
  onToggle: () => void;
  onPress: () => void;
};

export function HabitRow({ habit, doneToday, streak, onToggle, onPress }: HabitRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Checkbox checked={doneToday} onToggle={onToggle} />
      <View style={styles.textContainer}>
        <ThemedText type="default" numberOfLines={1}>
          {habit.title}
        </ThemedText>
      </View>
      <StreakBadge streak={streak} />
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
  textContainer: { flex: 1 },
});
