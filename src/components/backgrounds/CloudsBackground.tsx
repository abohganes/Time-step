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

type CloudConfig = {
  size: number;
  top: number;
  duration: number;
  delay: number;
  opacity: number;
};

const CLOUDS: CloudConfig[] = [
  { size: 70, top: 60, duration: 34000, delay: 0, opacity: 0.9 },
  { size: 46, top: 160, duration: 26000, delay: 4000, opacity: 0.75 },
  { size: 90, top: 250, duration: 42000, delay: 9000, opacity: 0.65 },
  { size: 54, top: 340, duration: 30000, delay: 2000, opacity: 0.8 },
];

function CloudPuff({ size, color }: { size: number; color: string }) {
  return (
    <View style={styles.puffRow}>
      <View
        style={[styles.puff, { width: size * 0.6, height: size * 0.6, backgroundColor: color, marginRight: -size * 0.2 }]}
      />
      <View style={[styles.puff, { width: size, height: size, backgroundColor: color }]} />
      <View
        style={[styles.puff, { width: size * 0.7, height: size * 0.7, backgroundColor: color, marginLeft: -size * 0.25 }]}
      />
    </View>
  );
}

function Cloud({ config, color, screenWidth }: { config: CloudConfig; color: string; screenWidth: number }) {
  const x = useSharedValue(-config.size * 2);

  useEffect(() => {
    x.value = withDelay(
      config.delay,
      withRepeat(
        withTiming(screenWidth + config.size * 2, {
          duration: config.duration,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );
  }, [config.delay, config.duration, config.size, screenWidth, x]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    top: config.top,
    opacity: config.opacity,
  }));

  return (
    <Animated.View style={[styles.cloudWrap, style]}>
      <CloudPuff size={config.size} color={color} />
    </Animated.View>
  );
}

export function CloudsBackground({ dark }: { dark: boolean }) {
  const { width } = useWindowDimensions();
  const skyColor = dark ? '#0F1B2E' : '#DCEEFF';
  const cloudColor = dark ? '#33445E' : '#FFFFFF';

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: skyColor }]} pointerEvents="none">
      {CLOUDS.map((config, index) => (
        <Cloud key={index} config={config} color={cloudColor} screenWidth={width} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cloudWrap: { position: 'absolute' },
  puffRow: { flexDirection: 'row', alignItems: 'flex-end' },
  puff: { borderRadius: 999 },
});
