import { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type TreeConfig = {
  leftPercent: number;
  scale: number;
  duration: number;
  delay: number;
  swayDegrees: number;
};

const TREES: TreeConfig[] = [
  { leftPercent: 6, scale: 1.1, duration: 2600, delay: 0, swayDegrees: 3 },
  { leftPercent: 24, scale: 0.8, duration: 2200, delay: 300, swayDegrees: 4 },
  { leftPercent: 46, scale: 1.3, duration: 3000, delay: 600, swayDegrees: 2.5 },
  { leftPercent: 68, scale: 0.9, duration: 2400, delay: 150, swayDegrees: 3.5 },
  { leftPercent: 86, scale: 1.05, duration: 2800, delay: 450, swayDegrees: 3 },
];

function TreeShape({ scale, trunkColor, canopyColor }: { scale: number; trunkColor: string; canopyColor: string }) {
  const canopySize = 70 * scale;
  const trunkWidth = 12 * scale;
  const trunkHeight = 40 * scale;

  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: canopySize,
          height: canopySize,
          borderRadius: canopySize / 2,
          backgroundColor: canopyColor,
        }}
      />
      <View style={{ width: trunkWidth, height: trunkHeight, backgroundColor: trunkColor, borderRadius: 3 }} />
    </View>
  );
}

function Tree({
  config,
  trunkColor,
  canopyColor,
  bottom,
}: {
  config: TreeConfig;
  trunkColor: string;
  canopyColor: string;
  bottom: number;
}) {
  const rotate = useSharedValue(0);

  useEffect(() => {
    rotate.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(config.swayDegrees, { duration: config.duration }),
          withTiming(-config.swayDegrees, { duration: config.duration })
        ),
        -1,
        true
      )
    );
  }, [config.delay, config.duration, config.swayDegrees, rotate]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        styles.tree,
        style,
        { left: `${config.leftPercent}%`, bottom, transformOrigin: 'bottom' as const },
      ]}>
      <TreeShape scale={config.scale} trunkColor={trunkColor} canopyColor={canopyColor} />
    </Animated.View>
  );
}

export function TreesBackground({ dark }: { dark: boolean }) {
  const { height } = useWindowDimensions();
  const skyColor = dark ? '#122018' : '#E4F4E7';
  const groundColor = dark ? '#0C1712' : '#C9E8CD';
  const trunkColor = dark ? '#6B4A2E' : '#8B5E34';
  const canopyColor = dark ? '#2F6B45' : '#5FAE72';

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: skyColor }]} pointerEvents="none">
      <View style={[styles.ground, { backgroundColor: groundColor }]} />
      {TREES.map((config, index) => (
        <Tree
          key={index}
          config={config}
          trunkColor={trunkColor}
          canopyColor={canopyColor}
          bottom={Math.min(120, height * 0.12)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  ground: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '18%' },
  tree: { position: 'absolute' },
});
