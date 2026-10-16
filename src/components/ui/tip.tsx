import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Colors, DEFAULT_MARKER, Markers, Spacing, Type, type MarkerId } from '@/constants/theme';
import { SCRIBBLE_WIDTH, scribblePath } from '@/lib/stroke';

interface TipProps {
  /** Une ou deux phrases ; chacune sur sa ligne. */
  lines: string[];
  icon?: keyof typeof Ionicons.glyphMap;
  /** Surligneur du gribouillis. */
  marker?: MarkerId;
}

const SCRIBBLE_MS = 900;
const AnimatedPath = Animated.createAnimatedComponent(Path);

// Encart d'aide des premières questions : un gribouillis de surligneur derrière le texte, tracé à son arrivée.
export function Tip({ lines, icon = 'bulb-outline', marker = DEFAULT_MARKER }: TipProps) {
  return (
    <View style={styles.root} accessible accessibilityLabel={`Astuce : ${lines.join(' ')}`}>
      <Scribble color={Markers[marker].soft} />
      <View style={styles.icon}>
        <Ionicons name={icon} size={18} color={Colors.ink} />
      </View>
      <View style={styles.text}>
        {lines.map((line, i) => (
          <Text key={line} style={[i === 0 ? Type.labelStrong : Type.label, styles.ink]}>
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}

// Un gribouillis de feutre derrière le texte, tracé d'un geste de gauche à droite.
function Scribble({ color }: { color: string }) {
  const [path, setPath] = useState<ReturnType<typeof scribblePath> | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(reducedMotion ? 1 : 0);
  const length = path?.length ?? 0;

  useEffect(() => {
    if (path && !reducedMotion) {
      progress.value = withTiming(1, { duration: SCRIBBLE_MS, easing: Easing.inOut(Easing.quad) });
    }
  }, [path, reducedMotion, progress]);

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - progress.value) }));

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (!path) {
          setPath(scribblePath(width, height));
        }
        setSize({ width, height });
      }}>
      {size && path && (
        <Svg width={size.width} height={size.height}>
          <AnimatedPath
            d={path.d}
            stroke={color}
            strokeWidth={SCRIBBLE_WIDTH}
            strokeLinecap="round"
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
  root: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.sheet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: Spacing.half,
    justifyContent: 'center',
    minHeight: 32,
  },
  ink: {
    color: Colors.ink,
  },
});
