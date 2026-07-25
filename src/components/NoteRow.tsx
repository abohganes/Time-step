import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { CardShadow, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useDateLocale } from '@/lib/i18n/dateLocale';
import type { Page } from '@/types/database';

// Matches the DB column default (schema.sql) — see notes/[id].tsx UNTITLED_SENTINEL.
const UNTITLED_SENTINEL = 'Untitled';

export function NoteRow({ note, onPress }: { note: Page; onPress: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dateLocale = useDateLocale();
  const snippet = note.content.trim().slice(0, 80);
  const title = note.title && note.title !== UNTITLED_SENTINEL ? note.title : t('notes.untitled');

  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
          CardShadow,
        ]}>
        <Ionicons name="document-text-outline" size={20} color={theme.textSecondary} />
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
});
