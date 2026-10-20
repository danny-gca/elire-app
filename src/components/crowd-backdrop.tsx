import { useIsFocused } from 'expo-router';
import { memo, useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { Easing, FadeOut, useAnimatedProps, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import Svg, { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';

import { Colors } from '@/constants/theme';
import { useBrouhaha } from '@/lib/sound';

const FADE_MS = 600;
// La salle se remplit rang par rang depuis la tribune, en même temps que la rumeur monte.
export const CROWD_APPEAR_MS = 1400;
const ROW_GAP = 44;
const SEAT_GAP = 30;
const AISLES = 5;
const AISLE_WIDTH = 22;

// Générateur fixe : la même salle à chaque scrutin.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const f = (n: number) => n.toFixed(1);

interface Row {
  desks: string;
  shoulders: string;
  heads: string;
}

const AnimatedG = Animated.createAnimatedComponent(G);

// Plan de l'hémicycle vu de dessus, au trait : pupitres en arcs, allées, chacun tourné vers la tribune (en haut). Un tracé par rang.
function plan(width: number, height: number): Row[] {
  const random = seeded(11);
  const cx = width / 2;
  // Tribune haut placée : la salle occupe presque tout le fond.
  const cy = height * 0.22;
  const rows: Row[] = [];
  for (let r = height * 0.12; r < Math.hypot(width / 2, height - cy) + ROW_GAP; r += ROW_GAP) {
    let desks = '';
    let shoulders = '';
    let heads = '';
    const gap = AISLE_WIDTH / 2 / r;
    // Pupitres : un arc par travée, coupé aux allées, avec un léger tremblé de plume.
    for (let k = 0; k <= AISLES; k++) {
      const a0 = (Math.PI * k) / (AISLES + 1) + (k === 0 ? 0 : gap);
      const a1 = (Math.PI * (k + 1)) / (AISLES + 1) - (k === AISLES ? 0 : gap);
      const rd = r - 15 + (random() - 0.5) * 2;
      const steps = Math.max(4, Math.round(((a1 - a0) * rd) / 24));
      for (let i = 0; i <= steps; i++) {
        const a = a0 + ((a1 - a0) * i) / steps;
        const w = (random() - 0.5) * 1.2;
        desks += `${i === 0 ? 'M' : 'L'}${f(cx + (rd + w) * Math.cos(a))} ${f(cy + (rd + w) * Math.sin(a))}`;
      }
    }
    // Sièges : une tête et des épaules, quelques places vides, rien dans les allées.
    const count = Math.floor((Math.PI * r) / SEAT_GAP);
    for (let i = 0; i <= count; i++) {
      const a = (Math.PI * (i + 0.5)) / (count + 1);
      const sector = (a * (AISLES + 1)) / Math.PI;
      if (Math.abs(sector - Math.round(sector)) * (Math.PI / (AISLES + 1)) * r < AISLE_WIDTH * 0.8 || random() < 0.14) {
        continue;
      }
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      // Pas de siège coupé au bord : il est en entier à l'écran, ou il n'est pas dessiné.
      if (x < 14 || x > width - 14 || y > height - 10) {
        continue;
      }
      // Regard vers la tribune ; épaules en ellipse sous la tête, perpendiculaires au regard.
      const ux = -Math.cos(a);
      const uy = -Math.sin(a);
      const px = -uy;
      const py = ux;
      const sw = 9.5 + random() * 1.5;
      const sh = 5;
      const rot = f((Math.atan2(py, px) * 180) / Math.PI);
      const bx = x - ux * 1.5;
      const by = y - uy * 1.5;
      const left = `${f(bx + px * sw)} ${f(by + py * sw)}`;
      const right = `${f(bx - px * sw)} ${f(by - py * sw)}`;
      shoulders += `M${left}A${f(sw)} ${sh} ${rot} 1 0 ${right}A${f(sw)} ${sh} ${rot} 1 0 ${left}Z`;
      const hr = 4.6 + random() * 0.6;
      const hx = x + ux * 1.5;
      const hy = y + uy * 1.5;
      heads += `M${f(hx - hr)} ${f(hy)}a${f(hr)} ${f(hr)} 0 1 0 ${f(2 * hr)} 0a${f(hr)} ${f(hr)} 0 1 0 ${f(-2 * hr)} 0Z`;
    }
    rows.push({ desks, shoulders, heads });
  }
  return rows;
}

// Un rang apparaît quand la vague venue de la tribune l'atteint.
function CrowdRow({ row, index, count, reveal }: { row: Row; index: number; count: number; reveal: SharedValue<number> }) {
  const animatedProps = useAnimatedProps(() => ({ opacity: Math.min(1, Math.max(0, reveal.value * (count + 2) - index)) }));
  return (
    <AnimatedG animatedProps={animatedProps}>
      <Path d={row.desks} stroke="url(#crowd)" strokeWidth={1.5} strokeLinecap="round" fill="none" />
      <Path d={row.shoulders} stroke="url(#crowd)" strokeWidth={1.2} fill={Colors.paper} />
      <Path d={row.heads} stroke="url(#crowd)" strokeWidth={1.2} fill={Colors.paper} />
    </AnimatedG>
  );
}

// Pendant un scrutin, la salle derrière l'écran : le plan de l'hémicycle au trait de cahier, sans visage ni couleur.
// Mémoïsée : Voter se redessine souvent pendant un scrutin (compte à rebours), la salle ne bouge que si `quiet` change.
export const CrowdBackdrop = memo(function CrowdBackdrop({ quiet = false }: { quiet?: boolean }) {
  // Taille de la fenêtre, pas du conteneur : un conteneur qui suit le contenu ferait des milliers de rangs.
  const size = useWindowDimensions();
  // Vote posé : la salle s'efface derrière le résultat.
  const level = useSharedValue(1);
  // Hors de Voter (onglet quitté), la salle se tait aussi.
  const focused = useIsFocused();
  useBrouhaha(quiet || !focused);
  useEffect(() => {
    level.value = withTiming(quiet ? 0.35 : 1, { duration: FADE_MS });
  }, [quiet, level]);
  const levelStyle = useAnimatedStyle(() => ({ opacity: level.value }));
  const reducedMotion = useReducedMotion();
  const reveal = useSharedValue(reducedMotion ? 1 : 0);
  useEffect(() => {
    reveal.value = withTiming(1, { duration: reducedMotion ? 0 : CROWD_APPEAR_MS, easing: Easing.out(Easing.quad) });
  }, [reveal, reducedMotion]);
  // Le plan ne se recalcule qu'au changement de taille de la fenêtre.
  const rows = useMemo(() => plan(size.width, size.height), [size.width, size.height]);

  return (
    <Animated.View
      exiting={FadeOut.duration(FADE_MS / 2)}
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      {/* Les fondus passent par une texture : le grand dessin n'est pas recalculé à chaque image. */}
      <Animated.View style={[StyleSheet.absoluteFill, levelStyle]} renderToHardwareTextureAndroid shouldRasterizeIOS>
        <Svg width={size.width} height={size.height}>
          {/* La salle s'efface vers le haut : l'en-tête reste net. */}
          <Defs>
            <LinearGradient id="crowd" x1="0" y1="0" x2="0" y2={size.height} gradientUnits="userSpaceOnUse">
              <Stop offset="0.1" stopColor={Colors.ink} stopOpacity={0} />
              <Stop offset="0.45" stopColor={Colors.ink} stopOpacity={0.16} />
              <Stop offset="1" stopColor={Colors.ink} stopOpacity={0.2} />
            </LinearGradient>
          </Defs>
          {rows.map((row, i) => (
            <CrowdRow key={i} row={row} index={i} count={rows.length} reveal={reveal} />
          ))}
        </Svg>
      </Animated.View>
    </Animated.View>
  );
});
