import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { StreakBadge } from '@/components/StreakBadge';
import { ThemedText } from '@/components/themed-text';
import { Checkbox } from '@/components/ui/Checkbox';
import { CardShadow, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Habit } from '@/types/database';

type HabitRowProps = {
  habit: Habit;
  doneToday: boolean;
  streak: number;
  onToggle: () => void;
  onPress: () => void;
};

export function HabitRow({ habit, doneToday, streak, onToggle, onPress }: HabitRowProps) {
  const theme = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
          CardShadow,
        ]}>
        <Checkbox checked={doneToday} onToggle={onToggle} />
        <View style={styles.textContainer}>
          <ThemedText type="default" numberOfLines={1}>
            {habit.title}
          </ThemedText>
        </View>
        <StreakBadge streak={streak} />
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
  textContainer: { flex: 1 },
});
