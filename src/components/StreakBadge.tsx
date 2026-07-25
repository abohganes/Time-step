import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export function StreakBadge({ streak }: { streak: number }) {
  if (streak <= 0) return null;

  return (
    <View style={styles.container}>
      <Ionicons name="flame" size={14} color="#f5a623" />
      <ThemedText type="small">{streak}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 2, marginStart: Spacing.two },
});
