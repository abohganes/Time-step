import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type MiniBarChartProps = {
  data: { label: string; value: number }[];
  color: string;
  trackColor: string;
};

export function MiniBarChart({ data, color, trackColor }: MiniBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <View style={styles.row}>
      {data.map((d, index) => (
        <View key={`${d.label}-${index}`} style={styles.column}>
          <ThemedText type="small" themeColor="textSecondary">
            {d.value}
          </ThemedText>
          <View style={[styles.track, { backgroundColor: trackColor }]}>
            <View style={[styles.bar, { height: `${(d.value / max) * 100}%`, backgroundColor: color }]} />
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {d.label}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    gap: Spacing.two,
  },
  column: { flex: 1, alignItems: 'center', gap: Spacing.one, height: '100%', justifyContent: 'flex-end' },
  track: { width: 18, flex: 1, borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 8 },
});
