import { format } from 'date-fns';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { Page } from '@/types/database';

export function NoteRow({ note, onPress }: { note: Page; onPress: () => void }) {
  const snippet = note.content.trim().slice(0, 80);

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.textContainer}>
        <ThemedText type="default" numberOfLines={1}>
          {note.title || 'Untitled'}
        </ThemedText>
        {snippet ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {snippet}
          </ThemedText>
        ) : null}
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {format(new Date(note.updated_at), 'MMM d')}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  textContainer: { flex: 1, gap: 2 },
});
