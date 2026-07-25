import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ReminderTimeFieldProps = {
  label: string;
  value: string | null; // "HH:MM:SS" or null
  onChange: (value: string | null) => void;
};

function timeStringToDate(value: string): Date {
  const [hour, minute] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

function formatTimeLabel(value: string, locale: string): string {
  const date = timeStringToDate(value);
  return date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
}

export function ReminderTimeField({ label, value, onChange }: ReminderTimeFieldProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <ThemedText type="small">{label}</ThemedText>
      <View style={styles.row}>
        <Pressable
          onPress={() => setOpen(true)}
          style={[styles.field, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="default">
            {value ? formatTimeLabel(value, i18n.language) : t('habits.noReminder')}
          </ThemedText>
        </Pressable>
        {value ? (
          <Pressable onPress={() => onChange(null)} hitSlop={8}>
            <ThemedText type="link" style={{ color: '#e5484d' }}>
              {t('common.clear')}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>

      {open ? (
        <DateTimePicker
          value={value ? timeStringToDate(value) : new Date()}
          mode="time"
          onChange={(event, selected) => {
            setOpen(false);
            if (event.type === 'dismissed' || !selected) return;
            const hh = String(selected.getHours()).padStart(2, '0');
            const mm = String(selected.getMinutes()).padStart(2, '0');
            onChange(`${hh}:${mm}:00`);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.one },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  field: {
    flex: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
});
