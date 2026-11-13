import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Easing, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg from 'react-native-svg';

import { DrawnPath } from '@/components/drawn-path';
import { strokePath, strokeShape } from '@/lib/stroke';

export const BUTTON_STROKE_MS = 220;

// Trait de surligneur posé à la main sur le bouton choisi : toujours de gauche à droite, forme tirée à chaque vote.
export function ButtonStroke({ color, delay = 0 }: { color: string; delay?: number }) {
  const [shape] = useState(() => strokeShape());
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(reducedMotion ? 1 : 0);
  const path = size ? strokePath(shape, size.width, size.height) : null;

  useEffect(() => {
    if (size && !reducedMotion) {
      progress.value = withDelay(delay, withTiming(1, { duration: BUTTON_STROKE_MS, easing: Easing.out(Easing.exp) }));
    }
  }, [size, reducedMotion, progress, delay]);

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.under]}
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}>
      {size && path && (
        <Svg width={size.width} height={size.height} style={styles.svg}>
          <DrawnPath
            d={path.d}
            length={path.length}
            progress={progress}
            stroke={color}
            strokeWidth={shape.thickness * size.height}
            strokeLinecap="butt"
            strokeLinejoin="round"
          />
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Sous le texte du bouton, au-dessus de son fond (le bouton tracé crée son propre empilement).
  under: {
    zIndex: -1,
  },
  // Le trait peut sortir du bouton : le SVG ne coupe rien.
  svg: {
    overflow: 'visible',
  },
});
