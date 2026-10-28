import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { STAMP_DONE_MS, STAMP_IMPACT_MS } from '@/components/scrutin-stamp';

import { GlossaryText } from '@/components/glossary-text';
import { SweepText } from '@/components/sweep-text';
import { ThemeMark } from '@/components/theme-mark';
import { Colors, MarginWidth, Numeric, Radius, Spacing, Type, type MarkerId } from '@/constants/theme';
import type { Proposition, Thematique } from '@/schemas/dataset';
import { useTutoTarget } from '@/store/tuto-store';

interface PropositionSheetProps {
  /** Une proposition (titre, citation), ou un scrutin ou une question commune présentés de la même façon (question seule). */
  proposition: Pick<Proposition, 'ref' | 'thematiqueId' | 'titre'> & { description?: string };
  kind?: 'Proposition' | 'Scrutin' | 'Question commune';
  /** Citation en entier (« En savoir plus » ouvert) ; sinon coupée à 2 lignes pour garder les boutons visibles. */
  quoteOpen?: boolean;
  /** Scrutin : chambre et année, à droite de « Scrutin réel ». */
  banner?: string;
  /** Pendant le geste du vote : le surligneur balaie le titre. */
  sweep?: MarkerId;
  /** Scrutin qui arrive : l'en-tête s'imprime au coup de tampon (ScrutinStamp), puis le contour se trace. */
  stamp?: boolean;
  thematique?: Thematique;
  children?: React.ReactNode;
  /** Bas de la feuille, sur toute sa largeur sous la marge : les onglets d'explications. */
  footer?: React.ReactNode;
  /** Toucher un mot souligné du titre ou de la citation ; sans rappel, rien n'est souligné. */
  onWord?: (mot: string) => void;
}

const VERTICAL_LABEL_LENGTH = 220;
const VERTICAL_TOP = Spacing.three + 18 + Spacing.one + 32 + Spacing.two;
// Largeur moyenne d'une capitale à 13 pt espacée : sert à réserver la hauteur du thème vertical.
const CAPS_CHAR_WIDTH = 9;
const CONTOUR_MS = 700;

const AnimatedRect = Animated.createAnimatedComponent(Rect);

// Petit hémicycle (3 rangs de sièges en demi-cercle) : signe d'un vrai scrutin.
function HemicycleMark({ color }: { color: string }) {
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
        <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.5} fill={color} />
      ))}
    </Svg>
  );
}

const IMPRINT_MS = 240;

// Encre de tampon : bord bas irrégulier qui bave d'un ou deux points, et quelques manques dans l'aplat.
function StampInk() {
  const [ink, setInk] = useState<{ width: number; height: number; edge: string; voids: { x: number; y: number; r: number }[] } | null>(null);
  // Tiré une fois à la mise en page : la même empreinte tant que la feuille reste.
  const draw = (width: number, height: number) => {
    let edge = `M0 ${height}`;
    for (let x = 0; x <= width; x += 5) {
      edge += `L${x} ${(height + Math.random() * 2.2).toFixed(1)}`;
    }
    edge += `L${width} ${height - 1}L0 ${height - 1}Z`;
    const voids = Array.from({ length: Math.round(width / 40) }, () => ({
      x: Math.random() * width,
      y: 3 + Math.random() * (height - 6),
      r: 0.5 + Math.random() * 0.9,
    }));
    setInk({ width, height, edge, voids });
  };
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (!ink || ink.width !== width || ink.height !== height) {
          draw(width, height);
        }
      }}>
      {ink && (
        <Svg width={ink.width} height={ink.height + 3} style={styles.inkLayer}>
          <Path d={ink.edge} fill={Colors.ink} />
          {ink.voids.map((v, i) => (
            <Circle key={i} cx={v.x} cy={v.y} r={v.r} fill={Colors.paper} opacity={0.35} />
          ))}
        </Svg>
      )}
    </View>
  );
}

// Contour d'encre tracé une fois à l'arrivée du scrutin, puis gardé.
function Contour({ delay = 0 }: { delay?: number }) {
  const reducedMotion = useReducedMotion();
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const progress = useSharedValue(reducedMotion ? 1 : 0);
  const perimeter = size ? 2 * (size.width + size.height) : 0;
  useEffect(() => {
    if (size && !reducedMotion) {
      progress.value = withDelay(delay, withTiming(1, { duration: CONTOUR_MS, easing: Easing.out(Easing.cubic) }));
    }
  }, [size, reducedMotion, progress, delay]);
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
export function PropositionSheet({ proposition, kind = 'Proposition', quoteOpen = false, banner, sweep, stamp = false, thematique, children, footer, onWord }: PropositionSheetProps) {
  const scrutin = kind === 'Scrutin';
  const reducedMotion = useReducedMotion();
  const stamped = stamp && !reducedMotion;
  // L'empreinte du tampon : l'en-tête se pose d'un coup, encore un peu gonflé d'encre (valeur animée, sans toucher à la mise en page).
  const imprint = useSharedValue(stamped ? 0 : 1);
  useEffect(() => {
    if (stamped) {
      imprint.value = withDelay(STAMP_IMPACT_MS, withTiming(1, { duration: IMPRINT_MS, easing: Easing.out(Easing.quad) }));
    }
  }, [stamped, imprint]);
  const imprintStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, imprint.value * 3),
    transform: [{ scale: 1.05 - 0.05 * imprint.value }],
  }));
  const bannerTarget = useTutoTarget('scrutin-entete');
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
        {/* Pendant le geste du vote, le surligneur balaie le titre : plus de mots soulignés. */}
        {sweep ? (
          <SweepText marker={sweep} style={[Type.display, styles.title]} selectable>
            {proposition.titre}
          </SweepText>
        ) : (
          <GlossaryText style={[Type.display, styles.title]} onWord={onWord} accessibilityRole="header" selectable>
            {proposition.titre}
          </GlossaryText>
        )}
        {proposition.description ? (
          <GlossaryText style={[Type.body, styles.description]} onWord={onWord} numberOfLines={quoteOpen ? undefined : 2} selectable>
            {proposition.description}
          </GlossaryText>
        ) : null}
        {children}
      </View>
    </View>
  );
  if (!scrutin) {
    return (
      <View style={styles.sheet}>
        {row}
        {footer}
      </View>
    );
  }
  // Un vrai scrutin se distingue d'une proposition : en-tête encre à l'hémicycle et contour tracé ; la salle est dans le fond de Voter.
  return (
    <View style={styles.sheet}>
      <Animated.View {...bannerTarget} style={[styles.banner, imprintStyle]}>
        <StampInk />
        <HemicycleMark color={Colors.paper} />
        <Text style={[Type.caps, styles.bannerTitle]}>Scrutin réel</Text>
        {banner && (
          <Text style={[Type.label, Numeric, styles.bannerMeta]} numberOfLines={1}>
            {banner}
          </Text>
        )}
      </Animated.View>
      {row}
      {footer}
      <Contour delay={stamped ? STAMP_DONE_MS : 0} />
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
    backgroundColor: Colors.ink,
    zIndex: 1,
  },
  // Le bord qui bave dépasse sous l'en-tête.
  inkLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  bannerTitle: {
    color: Colors.paper,
  },
  bannerMeta: {
    flex: 1,
    textAlign: 'right',
    color: Colors.rule,
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
