import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useDateLocale } from '@/lib/i18n/dateLocale';
import type { Page } from '@/types/database';

// Matches the DB column default (schema.sql) — see notes/[id].tsx UNTITLED_SENTINEL.
const UNTITLED_SENTINEL = 'Untitled';

export function NoteRow({ note, onPress }: { note: Page; onPress: () => void }) {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const snippet = note.content.trim().slice(0, 80);
  const title = note.title && note.title !== UNTITLED_SENTINEL ? note.title : t('notes.untitled');

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.textContainer}>
        <ThemedText type="default" numberOfLines={1}>
          {title}
        </ThemedText>
        {snippet ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {snippet}
          </ThemedText>
        ) : null}
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {format(new Date(note.updated_at), 'MMM d', { locale: dateLocale })}
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
