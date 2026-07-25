import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function StreakBadge({ streak }: { streak: number }) {
  const theme = useTheme();
  if (streak <= 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: `${theme.streak}1F` }]}>
      <Ionicons name="flame" size={13} color={theme.streak} />
      <ThemedText type="small" style={{ color: theme.streak }}>
        {streak}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginStart: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
});
