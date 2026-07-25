import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
};

export function Button({ title, variant = 'primary', loading, disabled, ...rest }: ButtonProps) {
  const theme = useTheme();

  const backgroundColor =
    variant === 'primary'
      ? '#3c87f7'
      : variant === 'danger'
        ? '#e5484d'
        : theme.backgroundElement;
  const textColor = variant === 'secondary' ? theme.text : '#ffffff';

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor, opacity: pressed || disabled || loading ? 0.7 : 1 },
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <ThemedText type="smallBold" style={{ color: textColor }}>
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
