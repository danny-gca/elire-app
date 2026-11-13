import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import { Path, type PathProps } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type DrawnPathProps = Omit<PathProps, 'd' | 'strokeDasharray' | 'strokeDashoffset'> & {
  d: string;
  length: number;
  /** De 0 (rien de tracé) à 1 (trait entier). */
  progress: SharedValue<number>;
};

// À monter une fois la longueur connue : Reanimated fige la valeur initiale au premier rendu (sinon trait entier une image sur Android).
export function DrawnPath({ d, length, progress, ...props }: DrawnPathProps) {
  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - progress.value) }));
  return <AnimatedPath d={d} fill="none" strokeDasharray={[length, length]} animatedProps={animatedProps} {...props} />;
}
