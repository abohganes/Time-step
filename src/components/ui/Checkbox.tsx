import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type CheckboxProps = {
  checked: boolean;
  onToggle: () => void;
  size?: number;
};

export function Checkbox({ checked, onToggle, size = 24 }: CheckboxProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 4,
          borderColor: checked ? '#3c87f7' : theme.textSecondary,
          backgroundColor: checked ? '#3c87f7' : 'transparent',
        },
      ]}>
      {checked ? <Ionicons name="checkmark" size={size * 0.7} color="#ffffff" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
