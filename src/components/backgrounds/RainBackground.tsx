import { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type DropConfig = {
  leftPercent: number;
  duration: number;
  delay: number;
  height: number;
  opacity: number;
};

const DROPS: DropConfig[] = Array.from({ length: 26 }, (_, i) => ({
  leftPercent: (i * 37) % 100,
  duration: 700 + ((i * 53) % 500),
  delay: (i * 90) % 1200,
  height: 16 + (i % 4) * 4,
  opacity: 0.35 + ((i % 5) * 0.1),
}));

function Drop({ config, color, screenHeight }: { config: DropConfig; color: string; screenHeight: number }) {
  const y = useSharedValue(-config.height);

  useEffect(() => {
    y.value = withDelay(
      config.delay,
      withRepeat(
        withTiming(screenHeight + config.height, {
          duration: config.duration,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );
  }, [config.delay, config.duration, config.height, screenHeight, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.drop,
        style,
        {
          left: `${config.leftPercent}%`,
          height: config.height,
          backgroundColor: color,
          opacity: config.opacity,
        },
      ]}
    />
  );
}

export function RainBackground({ dark }: { dark: boolean }) {
  const { height } = useWindowDimensions();
  const skyColor = dark ? '#1F2733' : '#5B6B7A';
  const dropColor = dark ? '#8FA3B8' : '#E5EEF5';

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: skyColor }]} pointerEvents="none">
      {DROPS.map((config, index) => (
        <Drop key={index} config={config} color={dropColor} screenHeight={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  drop: { position: 'absolute', width: 2, borderRadius: 1 },
});
