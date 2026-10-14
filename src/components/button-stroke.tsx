import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { strokePath, strokeShape } from '@/lib/stroke';

export const BUTTON_STROKE_MS = 220;

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Trait de surligneur posé à la main sur le bouton choisi : toujours de gauche à droite, forme tirée à chaque vote.
export function ButtonStroke({ color }: { color: string }) {
  const [shape] = useState(() => strokeShape());
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(reducedMotion ? 1 : 0);
  const path = size ? strokePath(shape, size.width, size.height) : null;
  const length = path?.length ?? 0;

  useEffect(() => {
    if (size && !reducedMotion) {
      progress.value = withTiming(1, { duration: BUTTON_STROKE_MS, easing: Easing.out(Easing.exp) });
    }
  }, [size, reducedMotion, progress]);

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - progress.value) }));

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.under]}
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}>
      {size && path && (
        <Svg width={size.width} height={size.height} style={styles.svg}>
          <AnimatedPath
            d={path.d}
            stroke={color}
            strokeWidth={shape.thickness * size.height}
            strokeLinecap="butt"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={[length, length]}
            animatedProps={animatedProps}
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
