import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { MARKER_IDS, Markers } from '@/constants/theme';
import { fisherYates } from '@/lib/shuffle';
import { frameSides, polyline } from '@/lib/stroke';

const AnimatedPath = Animated.createAnimatedComponent(Path);
export const FRAME_DRAW_MS = 650;
// Place des traits qui dépassent aux coins.
const PAD = 16;

// Question commune : la feuille encadrée à la main aux quatre surligneurs, toujours 4 traits (ils ne comptent pas les candidats).
// Exception assumée à la règle du surligneur, comme le logo : un dessin fixe, pas une marque.
export function EnjeuFrame({ animate, children }: { animate: boolean; children: React.ReactNode }) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [colors] = useState(() => fisherYates(MARKER_IDS).map((id) => Markers[id].solid));
  // Tirage figé : la feuille qui grandit (« En savoir plus ») garde le même cadre.
  const [draws] = useState(() => Array.from({ length: 12 }, Math.random));
  const progress = useSharedValue(animate ? 0 : 1);
  useEffect(() => {
    if (animate && size) {
      progress.value = withTiming(1, { duration: FRAME_DRAW_MS, easing: Easing.out(Easing.quad) });
    }
  }, [animate, size, progress]);

  let k = 0;
  const sides = size ? frameSides(size.width + 8, size.height + 8, () => draws[k++ % draws.length]) : [];
  return (
    <View onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}>
      {children}
      {size && (
        <View pointerEvents="none" style={styles.svg} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Svg width={size.width + 8 + PAD * 2} height={size.height + 8 + PAD * 2}>
            {sides.map((side, i) => (
              <Side key={i} points={side} color={colors[i]} index={i} progress={progress} />
            ))}
          </Svg>
        </View>
      )}
    </View>
  );
}

function Side({ points, color, index, progress }: { points: [number, number][]; color: string; index: number; progress: SharedValue<number> }) {
  const { d, length } = polyline(points.map(([x, y]) => [x + PAD, y + PAD]));
  const animatedProps = useAnimatedProps(() => {
    const drawn = Math.min(1, Math.max(0, progress.value * 4 - index));
    return { strokeDashoffset: length * (1 - drawn), strokeOpacity: drawn > 0 ? 1 : 0 };
  });
  return (
    <AnimatedPath
      d={d}
      stroke={color}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      strokeDasharray={[length, length]}
      animatedProps={animatedProps}
    />
  );
}

const styles = StyleSheet.create({
  svg: {
    position: 'absolute',
    left: -4 - PAD,
    top: -4 - PAD,
  },
});
