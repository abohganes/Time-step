import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CATEGORIES, Category, CategoryColors } from '@/constants/categories';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CategoryPickerProps = {
  label: string;
  value: Category;
  onChange: (category: Category) => void;
};

export function CategoryPicker({ label, value, onChange }: CategoryPickerProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <View style={styles.row}>
        {CATEGORIES.map((category) => {
          const selected = category === value;
          const color = CategoryColors[category];
          return (
            <Pressable
              key={category}
              onPress={() => onChange(category)}
              style={[
                styles.pill,
                {
                  backgroundColor: selected ? color : theme.backgroundElement,
                  borderColor: selected ? color : theme.border,
                },
              ]}>
              <View style={[styles.dot, { backgroundColor: selected ? '#ffffff' : color }]} />
              <ThemedText
                type="small"
                style={{ color: selected ? '#ffffff' : theme.text }}>
                {t(`categories.${category}`)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function CategoryDot({ category }: { category: Category }) {
  return <View style={[styles.dot, { backgroundColor: CategoryColors[category] }]} />;
}

const styles = StyleSheet.create({
  container: { gap: Spacing.two },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
