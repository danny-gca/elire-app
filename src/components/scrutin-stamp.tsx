import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Colors } from '@/constants/theme';
import { buzz, playSound } from '@/lib/sound';

/** Le tampon touche la feuille à ce moment après l'arrivée du scrutin : l'en-tête s'imprime. */
export const STAMP_IMPACT_MS = 450;
/** Le tampon se relève : le contour de la feuille se trace. */
export const STAMP_DONE_MS = 700;
const STAMP_MS = 1000;
// Il apparaît au-dessus de la feuille, descend en accélérant, reste appuyé, puis se relève et sort.
const TIMES = [0, 150, 300, STAMP_IMPACT_MS, 520, STAMP_DONE_MS, STAMP_MS].map((t) => t / STAMP_MS);
const LIFT = [-80, -80, -64, 0, 0, -8, -72];
const OPACITY = [0, 0, 1, 1, 1, 1, 0];
const SQUASH = [1, 1, 1, 0.88, 0.88, 1, 1];

const W = 56;
const H = 72;

// Un tampon de bureau de vote, au trait d'encre, qui s'écrase sur le haut d'un scrutin et y laisse l'en-tête.
export function ScrutinStamp({ left }: { left: number }) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);
  useEffect(() => {
    if (!reducedMotion) {
      progress.value = withTiming(1, { duration: STAMP_MS, easing: Easing.linear });
    }
    const timer = setTimeout(
      () => {
        playSound('tampon');
        buzz('light');
      },
      reducedMotion ? 0 : STAMP_IMPACT_MS,
    );
    return () => clearTimeout(timer);
  }, [progress, reducedMotion]);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, TIMES, OPACITY),
    transform: [
      { translateY: interpolate(progress.value, TIMES, LIFT) },
      { rotate: '-9deg' },
      { scaleY: interpolate(progress.value, TIMES, SQUASH) },
    ],
  }));
  if (reducedMotion) {
    return null;
  }
  return (
    <Animated.View pointerEvents="none" style={[styles.stamp, { left }, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Poignée, col, socle, puis le caoutchouc encré. */}
        <Circle cx={28} cy={11} r={8} fill={Colors.sheet} stroke={Colors.ink} strokeWidth={2.5} />
        <Path d="M23 18h10l3 18H20z" fill={Colors.sheet} stroke={Colors.ink} strokeWidth={2.5} strokeLinejoin="round" />
        <Rect x={6} y={36} width={44} height={20} rx={4} fill={Colors.sheet} stroke={Colors.ink} strokeWidth={2.5} />
        <Rect x={9} y={56} width={38} height={9} rx={2} fill={Colors.ink} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Posé pour que le caoutchouc tombe au milieu de l'en-tête (44 pt de haut environ).
  stamp: {
    position: 'absolute',
    top: -H + 30,
    width: W,
    height: H,
    zIndex: 2,
  },
});
