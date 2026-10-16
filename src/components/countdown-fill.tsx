import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

// Fond qui se retire de droite à gauche : la part restante du temps, posée derrière le contenu.
export function CountdownFill({ remaining, color }: { remaining: SharedValue<number>; color: string }) {
  const style = useAnimatedStyle(() => ({ width: `${remaining.value * 100}%` }));
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: color, right: undefined }, style]} />;
}
