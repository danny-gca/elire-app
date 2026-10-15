import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Rect } from 'react-native-svg';

import { SweepText } from '@/components/sweep-text';
import { ThemeMark } from '@/components/theme-mark';
import { Colors, MarginWidth, Numeric, Radius, Spacing, Type, type MarkerId } from '@/constants/theme';
import type { Proposition, Thematique } from '@/schemas/dataset';

interface PropositionSheetProps {
  /** Une proposition (titre, citation), ou un scrutin présenté de la même façon (question seule). */
  proposition: Pick<Proposition, 'ref' | 'thematiqueId' | 'titre'> & { description?: string };
  kind?: 'Proposition' | 'Scrutin';
  /** Citation en entier (« En savoir plus » ouvert) ; sinon coupée à 2 lignes pour garder les boutons visibles. */
  quoteOpen?: boolean;
  /** Scrutin : chambre et année, à droite de « Scrutin réel ». */
  banner?: string;
  /** Pendant le geste du vote : le surligneur balaie le titre. */
  sweep?: MarkerId;
  thematique?: Thematique;
  children?: React.ReactNode;
}

const VERTICAL_LABEL_LENGTH = 220;
const VERTICAL_TOP = Spacing.three + 18 + Spacing.one + 32 + Spacing.two;
// Largeur moyenne d'une capitale à 13 pt espacée : sert à réserver la hauteur du thème vertical.
const CAPS_CHAR_WIDTH = 9;
const CONTOUR_MS = 700;

const AnimatedRect = Animated.createAnimatedComponent(Rect);

// Petit hémicycle (3 rangs de sièges en demi-cercle) : signe d'un vrai scrutin.
function HemicycleMark() {
  const seats: [number, number][] = [];
  [[5, 4], [9, 7], [13, 10]].forEach(([r, n]) => {
    for (let i = 0; i < n; i++) {
      const a = Math.PI - (Math.PI * i) / (n - 1);
      seats.push([15 + r * Math.cos(a), 15 - r * Math.sin(a)]);
    }
  });
  return (
    <Svg width={30} height={17} viewBox="0 0 30 17">
      {seats.map(([x, y]) => (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.5} fill={Colors.ink} />
      ))}
    </Svg>
  );
}

// Contour d'encre tracé une fois à l'arrivée du scrutin, puis gardé.
function Contour() {
  const reducedMotion = useReducedMotion();
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const progress = useSharedValue(reducedMotion ? 1 : 0);
  const perimeter = size ? 2 * (size.width + size.height) : 0;
  useEffect(() => {
    if (size && !reducedMotion) {
      progress.value = withTiming(1, { duration: CONTOUR_MS, easing: Easing.out(Easing.cubic) });
    }
  }, [size, reducedMotion, progress]);
  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: perimeter * (1 - progress.value) }));
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={(e) => setSize(e.nativeEvent.layout)}>
      {size && (
        <Svg width={size.width} height={size.height}>
          <AnimatedRect
            x={0.5}
            y={0.5}
            width={size.width - 1}
            height={size.height - 1}
            rx={Radius.large}
            fill="none"
            stroke={Colors.graphite}
            strokeWidth={1}
            strokeDasharray={[perimeter, perimeter]}
            animatedProps={animatedProps}
          />
        </Svg>
      )}
    </View>
  );
}

// La feuille du cahier : marge graphite (numéro, thème) et corps de la proposition.
export function PropositionSheet({ proposition, kind = 'Proposition', quoteOpen = false, banner, sweep, thematique, children }: PropositionSheetProps) {
  const scrutin = kind === 'Scrutin';
  const row = (
    <View style={[styles.row, thematique && { minHeight: VERTICAL_TOP + thematique.titre.length * CAPS_CHAR_WIDTH + Spacing.three }]}>
      <View style={styles.margin} accessible accessibilityLabel={`${kind} ${proposition.ref}, thème ${thematique?.titre ?? ''}`}>
        <Text style={[Type.label, Numeric, styles.ref]}>{proposition.ref}</Text>
        <ThemeMark thematiqueId={proposition.thematiqueId} />
        {thematique && (
          <View style={styles.verticalBox} pointerEvents="none">
            <Text style={[Type.caps, styles.verticalText]} numberOfLines={1}>
              {thematique.titre}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <SweepText marker={sweep} style={[Type.display, styles.title]}>
          {proposition.titre}
        </SweepText>
        {proposition.description ? (
          <Text style={[Type.body, styles.description]} numberOfLines={quoteOpen ? undefined : 2}>
            {proposition.description}
          </Text>
        ) : null}
        {children}
      </View>
    </View>
  );
  if (!scrutin) {
    return <View style={styles.sheet}>{row}</View>;
  }
  // Un vrai scrutin se distingue d'une proposition : en-tête à l'hémicycle et contour tracé ; la salle est dans le fond de Voter.
  return (
    <View style={styles.sheet}>
      <View style={styles.banner}>
        <HemicycleMark />
        <Text style={[Type.caps, styles.ink]}>Scrutin réel</Text>
        {banner && (
          <Text style={[Type.label, Numeric, styles.bannerMeta]} numberOfLines={1}>
            {banner}
          </Text>
        )}
      </View>
      {row}
      <Contour />
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: Colors.sheet,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.rule,
  },
  bannerMeta: {
    flex: 1,
    textAlign: 'right',
    color: Colors.graphite,
  },
  ink: {
    color: Colors.ink,
  },
  margin: {
    width: MarginWidth,
    borderRightWidth: 1,
    borderRightColor: Colors.graphite,
    alignItems: 'center',
    paddingTop: Spacing.three,
    gap: Spacing.one,
    paddingHorizontal: 2,
  },
  ref: {
    color: Colors.graphite,
  },
  verticalBox: {
    position: 'absolute',
    top: VERTICAL_TOP + VERTICAL_LABEL_LENGTH / 2 - 9,
    left: MarginWidth / 2 - VERTICAL_LABEL_LENGTH / 2,
    width: VERTICAL_LABEL_LENGTH,
    height: 18,
    transform: [{ rotate: '-90deg' }],
  },
  verticalText: {
    color: Colors.graphite,
    textAlign: 'right',
  },
  body: {
    flex: 1,
    padding: Spacing.three,
    paddingLeft: Spacing.two,
    gap: Spacing.two,
  },
  title: {
    color: Colors.ink,
  },
  description: {
    color: Colors.inkSoft,
  },
});
