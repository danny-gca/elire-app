import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { Colors, Radius } from '@/constants/theme';

// Voile d'encre d'une feuille qui tourne : elle quitte la lumière, jamais une ombre portée. Sans `turn`, rien.
export function PageVeil({ turn, bound = false }: { turn?: SharedValue<number>; bound?: boolean }) {
  const style = useAnimatedStyle(() => ({ opacity: turn ? 0.14 * turn.get() : 0 }));
  if (!turn) {
    return null;
  }
  return <Animated.View pointerEvents="none" style={[styles.veil, bound && styles.bound, style]} />;
}

const styles = StyleSheet.create({
  veil: {
    ...StyleSheet.absoluteFill,
    borderRadius: Radius.large,
    backgroundColor: Colors.ink,
  },
  // Côté reliure, la feuille qui tourne n'a pas de coins arrondis.
  bound: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
});
