import type { BackgroundScene } from '@/lib/theme';

import { CloudsBackground } from './CloudsBackground';
import { RainBackground } from './RainBackground';
import { TreesBackground } from './TreesBackground';

type AnimatedBackgroundProps = {
  scene: BackgroundScene;
  dark: boolean;
};

export function AnimatedBackground({ scene, dark }: AnimatedBackgroundProps) {
  if (scene === 'clouds') return <CloudsBackground dark={dark} />;
  if (scene === 'rain') return <RainBackground dark={dark} />;
  if (scene === 'trees') return <TreesBackground dark={dark} />;
  return null;
}
