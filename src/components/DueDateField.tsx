import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useDateLocale } from '@/lib/i18n/dateLocale';

type DueDateFieldProps = {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
};

export function DueDateField({ label, value, onChange }: DueDateFieldProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dateLocale = useDateLocale();
  const [step, setStep] = useState<'closed' | 'date' | 'time'>('closed');
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  function openPicker() {
    setPendingDate(value ?? new Date());
    setStep('date');
  }

  function handleDateChange(event: { type: string }, selected?: Date) {
    if (event.type === 'dismissed') {
      setStep('closed');
      return;
    }
    if (!selected) return;
    if (Platform.OS === 'ios') {
      onChange(selected);
      setStep('closed');
      return;
    }
    setPendingDate(selected);
    setStep('time');
  }

  function handleTimeChange(event: { type: string }, selected?: Date) {
    if (event.type === 'dismissed' || !selected || !pendingDate) {
      setStep('closed');
      return;
    }
    const combined = new Date(pendingDate);
    combined.setHours(selected.getHours(), selected.getMinutes());
    onChange(combined);
    setStep('closed');
  }

  return (
    <View style={styles.container}>
      <ThemedText type="small">{label}</ThemedText>
      <View style={styles.row}>
        <Pressable
          onPress={openPicker}
          style={[styles.field, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="default">
            {value ? format(value, 'MMM d, yyyy · h:mm a', { locale: dateLocale }) : t('tasks.noDueDate')}
          </ThemedText>
        </Pressable>
        {value ? (
          <Pressable onPress={() => onChange(null)} hitSlop={8}>
            <ThemedText type="link" style={{ color: theme.danger }}>
              {t('common.clear')}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>

      {step === 'date' ? (
        <DateTimePicker
          value={pendingDate ?? new Date()}
          mode={Platform.OS === 'ios' ? 'datetime' : 'date'}
          onChange={handleDateChange}
        />
      ) : null}
      {step === 'time' ? (
        <DateTimePicker value={pendingDate ?? new Date()} mode="time" onChange={handleTimeChange} />
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
    borderRadius: Radius.medium,
  },
});
