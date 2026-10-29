import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View, type AccessibilityProps, type StyleProp, type TextLayoutLine, type TextStyle } from 'react-native';
import Animated, { Easing, type SharedValue, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Markers, type MarkerId } from '@/constants/theme';

export const SWEEP_MS = 260;

interface SweepTextProps {
  children: string;
  /** Surligneur qui balaie le texte ; sans valeur, texte simple. */
  marker?: MarkerId;
  style?: StyleProp<TextStyle>;
  /** Faux quand le texte n'est qu'une partie d'un titre déjà annoncé. */
  header?: boolean;
  selectable?: boolean;
  /** Gestes sans bouton visible, offerts au lecteur d'écran. */
  actions?: Pick<AccessibilityProps, 'accessibilityActions' | 'onAccessibilityAction'>;
  textRef?: React.Ref<Text>;
}

// Le trait balaie le texte de gauche à droite, ligne après ligne (web : global.css [data-sweep]).
export function SweepText({ children, marker, style, header = true, selectable, actions, textRef }: SweepTextProps) {
  const role = header ? 'header' : undefined;
  if (!marker) {
    return (
      <Text ref={textRef} style={style} accessibilityRole={role} selectable={selectable} {...actions}>
        {children}
      </Text>
    );
  }
  if (Platform.OS === 'web') {
    return (
      <Text ref={textRef} style={style} accessibilityRole={role} selectable={selectable} {...actions}>
        <Text {...({ dataSet: { sweep: marker } } as object)}>{children}</Text>
      </Text>
    );
  }
  return <NativeSweep marker={marker} style={style} header={header} selectable={selectable} actions={actions} textRef={textRef}>{children}</NativeSweep>;
}

function NativeSweep({ children, marker, style, header, selectable, actions, textRef }: Required<Pick<SweepTextProps, 'marker'>> & SweepTextProps) {
  const role = header ? 'header' : undefined;
  const [lines, setLines] = useState<TextLayoutLine[]>([]);
  const progress = useSharedValue(0);
  const total = lines.reduce((acc, l) => acc + l.width, 0);

  useEffect(() => {
    if (lines.length > 0) {
      progress.value = withTiming(1, { duration: SWEEP_MS, easing: Easing.out(Easing.quad) });
    }
  }, [lines.length, progress]);

  // Part de la largeur totale déjà balayée au début de chaque ligne.
  const starts = lines.map((_, i) => lines.slice(0, i).reduce((acc, l) => acc + l.width, 0));
  return (
    <View>
      {lines.map((line, i) => (
        <Band
          key={i}
          line={line}
          from={total > 0 ? starts[i] / total : 0}
          to={total > 0 ? (starts[i] + line.width) / total : 1}
          progress={progress}
          color={Markers[marker].soft}
        />
      ))}
      <Text ref={textRef} style={style} accessibilityRole={role} selectable={selectable} onTextLayout={(e) => setLines(e.nativeEvent.lines)} {...actions}>
        {children}
      </Text>
    </View>
  );
}

function Band({ line, from, to, progress, color }: { line: TextLayoutLine; from: number; to: number; progress: SharedValue<number>; color: string }) {
  const style = useAnimatedStyle(() => {
    const local = to > from ? (progress.value - from) / (to - from) : 1;
    return { transform: [{ scaleX: Math.min(1, Math.max(0, local)) }] };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.band, { left: line.x - 2, top: line.y + 2, width: line.width + 4, height: line.height - 3, backgroundColor: color }, style]}
    />
  );
}

const styles = StyleSheet.create({
  band: {
    position: 'absolute',
    borderRadius: 2,
    transformOrigin: 'left center',
  },
});
