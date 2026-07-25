import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

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
          borderRadius: size / 3,
          borderColor: checked ? theme.accent : theme.border,
          backgroundColor: checked ? theme.accent : 'transparent',
        },
      ]}>
      {checked ? (
        <Animated.View entering={ZoomIn.duration(150)}>
          <Ionicons name="checkmark" size={size * 0.7} color="#ffffff" />
        </Animated.View>
      ) : null}
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
