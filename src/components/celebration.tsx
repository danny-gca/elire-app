import { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useReducedMotion, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { MARKER_IDS, Markers } from '@/constants/theme';
import { useCelebrationStore, type CelebrationHost, type CelebrationPoint, type CelebrationVariant } from '@/store/celebration-store';

const FADE = 420;

const AnimatedPath = Animated.createAnimatedComponent(Path);

type Point = [number, number];

interface Stroke {
  points: Point[];
  color: string;
  width: number;
  /** En ms depuis le début : tracé de `start` à `start + dur`, effacé à partir de `fadeAt`. */
  start: number;
  dur: number;
  fadeAt: number;
  opacity?: number;
}

const between = (min: number, max: number) => min + Math.random() * (max - min);
function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

// Les 4 surligneurs à chaque fois (dès 4 traits), en proportions et dans un ordre tirés au hasard, sans deux voisins pareils.
function palette(n: number, tone: 'solid' | 'band' = 'solid'): string[] {
  const ids = shuffle([...MARKER_IDS]);
  const out = ids.slice(0, n);
  const cap = Math.ceil(n / 2);
  while (out.length < n) {
    const id = ids[Math.floor(Math.random() * ids.length)];
    if (out.filter((c) => c === id).length < cap) {
      out.push(id);
    }
  }
  for (let k = 0; k < 20; k++) {
    shuffle(out);
    if (out.every((c, i) => i === 0 || c !== out[i - 1])) {
      break;
    }
  }
  return out.map((id) => Markers[id][tone]);
}

function sample(n: number, at: (t: number) => Point): Point[] {
  return Array.from({ length: n + 1 }, (_, i) => at(i / n));
}

// Gerbe : des traits jaillissent du bas, en éventail.
function gerbe(w: number, h: number): Stroke[] {
  const n = 16;
  const colors = palette(n);
  return Array.from({ length: n }, (_, i) => {
    const angle = ((i / (n - 1)) * 2 - 1) * 1.15 + between(-0.08, 0.08);
    const length = h * between(0.42, 0.78);
    const bend = between(-40, 40);
    const ox = w / 2 + between(-24, 24);
    const dx = Math.sin(angle);
    const dy = -Math.cos(angle);
    const start = Math.floor(Math.random() * 6) * 30;
    return {
      points: sample(16, (t) => [ox + dx * length * t - dy * bend * Math.sin(Math.PI * t), h + 8 + dy * length * t + dx * bend * Math.sin(Math.PI * t)]),
      color: colors[i],
      width: between(6, 10),
      start,
      dur: 520,
      fadeAt: start + 620,
    };
  });
}

// Fusées : des traînées ondulées montent, puis éclatent en petits traits.
function fusees(w: number, h: number): Stroke[] {
  const strokes: Stroke[] = [];
  const n = 7;
  const trails = palette(n);
  for (let i = 0; i < n; i++) {
    const x = w * ((i + 0.5) / n) + between(-14, 14);
    const top = h * between(0.14, 0.48);
    const start = i * 85 + between(0, 40);
    const wave = between(4, 8);
    strokes.push({
      points: sample(18, (t) => [x + wave * Math.sin(t * Math.PI * 3), h + 8 - (h + 8 - top) * t]),
      color: trails[i],
      width: 4,
      start,
      dur: 480,
      fadeAt: start + 520,
    });
    const sparks = palette(7);
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2 + between(-0.2, 0.2);
      const r0 = 6;
      const r1 = between(18, 30);
      strokes.push({
        points: [
          [x + Math.cos(a) * r0, top + Math.sin(a) * r0],
          [x + Math.cos(a) * r1, top + Math.sin(a) * r1],
        ],
        color: sparks[k],
        width: 3,
        start: start + 440,
        dur: 220,
        fadeAt: start + 760,
      });
    }
  }
  return strokes;
}

// Surlignage : de larges coups de surligneur montent l'écran, toujours de gauche à droite.
function surlignage(w: number, h: number): Stroke[] {
  const n = 6;
  const colors = palette(n, 'band');
  return Array.from({ length: n }, (_, i) => {
    const y = h * (0.88 - (i / (n - 1)) * 0.62) + between(-10, 10);
    const tilt = between(-0.06, 0.02) * w;
    const wave = between(2, 5);
    const start = i * 90;
    return {
      points: sample(20, (t) => [-20 + (w + 40) * t, y - tilt * (t - 0.5) + wave * Math.sin(t * Math.PI * 2 + i)]),
      color: colors[i],
      width: between(26, 34),
      start,
      dur: 260,
      fadeAt: n * 90 + 420,
      opacity: 0.8,
    };
  });
}

// Boucles : des traits d'écriture montent en faisant des boucles.
function boucles(w: number, h: number): Stroke[] {
  const n = 5;
  const colors = palette(n);
  return Array.from({ length: n }, (_, i) => {
    const x0 = w * ((i + 0.5) / n) + between(-10, 10);
    const rise = h * between(0.45, 0.7);
    const a = between(12, 15);
    const b = between(13, 17);
    const turns = rise / (a * Math.PI * 2);
    const phi = turns * Math.PI * 2;
    const start = i * 110;
    return {
      points: sample(Math.ceil(phi * 5), (t) => {
        const p = phi * t;
        return [x0 + b * Math.sin(p), h + 10 - a * p + b * (1 - Math.cos(p)) * 0.6];
      }),
      color: colors[i],
      width: 5,
      start,
      dur: 760,
      fadeAt: start + 860,
    };
  });
}

// Étincelles : une petite gerbe courte autour du bouton touché (sinon en bas, au-dessus des onglets).
function etincelles(w: number, h: number, origin?: CelebrationPoint): Stroke[] {
  const n = 10;
  const colors = palette(n);
  const ox = origin?.x ?? w / 2;
  const oy = origin?.y ?? h - 76;
  // Depuis un bouton, la gerbe fait presque le tour ; depuis le bas, elle monte.
  const spread = origin ? 2.4 : 0.9;
  return Array.from({ length: n }, (_, i) => {
    const angle = ((i / (n - 1)) * 2 - 1) * spread + between(-0.1, 0.1);
    const r0 = between(18, 30);
    const r1 = r0 + between(30, 60);
    const start = between(0, 60);
    return {
      points: [
        [ox + Math.sin(angle) * r0, oy - Math.cos(angle) * r0],
        [ox + Math.sin(angle) * r1, oy - Math.cos(angle) * r1],
      ],
      color: colors[i],
      width: 5,
      start,
      dur: 260,
      fadeAt: start + 340,
    };
  });
}

// Traits : quatre coups de surligneur rapides qui montent en biais, depuis le bouton touché ou le bas.
function traits(w: number, h: number, origin?: CelebrationPoint): Stroke[] {
  const colors = palette(4);
  return Array.from({ length: 4 }, (_, i) => {
    const x = origin ? origin.x + (i - 1.5) * 34 : w * (0.15 + i * 0.23);
    const y0 = origin ? origin.y + 12 : h + 6;
    const length = origin ? between(70, 110) : h * between(0.18, 0.28);
    const start = i * 60;
    return {
      points: sample(10, (t) => [x - 20 + 40 * t + 5 * Math.sin(t * Math.PI * 2), y0 - length * t]),
      color: colors[i],
      width: 7,
      start,
      dur: 280,
      fadeAt: start + 380,
    };
  });
}

// Entouré : le bouton touché cerclé à la main, comme une bonne réponse au cahier, puis trois petits traits d'emphase.
function entoure(w: number, h: number, origin?: CelebrationPoint): Stroke[] {
  const [ring, ...ticks] = palette(4);
  const ox = origin?.x ?? w / 2;
  const oy = origin?.y ?? h - 76;
  const rx = between(58, 72);
  const ry = between(30, 38);
  const tilt = between(-0.12, 0.05);
  const a0 = between(-2.5, -1.9);
  // Un peu plus d'un tour, qui s'écarte en finissant : le trait ne se referme jamais pile.
  const loop: Point[] = sample(40, (t) => {
    const a = a0 + Math.PI * 2 * 1.12 * t;
    const r = 1 + 0.07 * t + 0.03 * Math.sin(t * 9);
    const x = Math.cos(a) * rx * r;
    const y = Math.sin(a) * ry * r;
    return [ox + x * Math.cos(tilt) - y * Math.sin(tilt), oy + x * Math.sin(tilt) + y * Math.cos(tilt)];
  });
  return [
    { points: loop, color: ring, width: 5, start: 0, dur: 420, fadeAt: 780 },
    ...ticks.map((color, i) => {
      const a = -1.25 + i * 0.45 + between(-0.08, 0.08);
      const r0 = 12;
      const r1 = r0 + between(14, 22);
      const start = 380 + i * 50;
      return {
        points: [
          [ox + Math.cos(a) * (rx + r0), oy + Math.sin(a) * (ry + r0)],
          [ox + Math.cos(a) * (rx + r1), oy + Math.sin(a) * (ry + r1)],
        ] as Point[],
        color,
        width: 4,
        start,
        dur: 160,
        fadeAt: 780,
      };
    }),
  ];
}

// Cadre : le bouton touché encadré à la main, quatre côtés qui dépassent aux coins, chacun d'un surligneur.
function cadre(w: number, h: number, origin?: CelebrationPoint): Stroke[] {
  const colors = palette(4);
  const ox = origin?.x ?? w / 2;
  const oy = origin?.y ?? h - 76;
  const hw = between(58, 70);
  const hh = between(28, 34);
  const tilt = between(-0.06, 0.04);
  const at = (dx: number, dy: number): Point => [ox + dx * Math.cos(tilt) - dy * Math.sin(tilt), oy + dx * Math.sin(tilt) + dy * Math.cos(tilt)];
  const corners: Point[] = [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ];
  return corners.map(([x0, y0], i) => {
    const [x1, y1] = corners[(i + 1) % 4];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const [ux, uy] = [(x1 - x0) / len, (y1 - y0) / len];
    const [o0, o1] = [between(6, 12), between(6, 12)];
    const bow = between(-3, 3);
    const start = i * 110;
    return {
      points: sample(8, (t) => {
        const d = -o0 + (len + o0 + o1) * t;
        const b = bow * Math.sin(Math.PI * t);
        return at(x0 + ux * d - uy * b, y0 + uy * d + ux * b);
      }),
      color: colors[i],
      width: 4,
      start,
      dur: 180,
      fadeAt: 780,
    };
  });
}

const BUILD: Record<CelebrationVariant, (w: number, h: number, origin?: CelebrationPoint) => Stroke[]> = { gerbe, fusees, surlignage, boucles, etincelles, traits, entoure, cadre };

function pathOf(points: Point[]) {
  let length = 0;
  points.forEach(([x, y], i) => {
    if (i > 0) {
      length += Math.hypot(x - points[i - 1][0], y - points[i - 1][1]);
    }
  });
  const d = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
  return { d, length };
}

function StrokePath({ stroke, clock }: { stroke: Stroke; clock: SharedValue<number> }) {
  const [{ d, length }] = useState(() => pathOf(stroke.points));
  const { start, dur, fadeAt, opacity = 1 } = stroke;
  const animatedProps = useAnimatedProps(() => {
    const t = clock.value;
    const drawn = Math.min(1, Math.max(0, (t - start) / dur));
    const eased = 1 - Math.pow(1 - drawn, 3);
    const fade = t < fadeAt ? 1 : Math.max(0, 1 - (t - fadeAt) / FADE);
    return { strokeDashoffset: length * (1 - eased), strokeOpacity: drawn > 0 ? fade * opacity : 0 };
  });
  return (
    <AnimatedPath
      d={d}
      stroke={stroke.color}
      strokeWidth={stroke.width}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      strokeDasharray={[length, length]}
      animatedProps={animatedProps}
    />
  );
}

function Burst({ id, variant, origin, width, height }: { id: number; variant: CelebrationVariant; origin?: CelebrationPoint; width: number; height: number }) {
  const done = useCelebrationStore((s) => s.done);
  const [strokes] = useState(() => BUILD[variant](width, height, origin));
  const total = Math.max(...strokes.map((s) => s.fadeAt + FADE));
  const clock = useSharedValue(0);

  useEffect(() => {
    clock.value = withTiming(total, { duration: total, easing: Easing.linear });
    const timer = setTimeout(() => done(id), total + 50);
    // Coupée avant la fin (feuille fermée) : elle est finie, elle ne rejoue pas à la réouverture.
    return () => {
      clearTimeout(timer);
      done(id);
    };
  }, [clock, total, done, id]);

  return (
    <Svg width={width} height={height}>
      {strokes.map((s, i) => (
        <StrokePath key={i} stroke={s} clock={clock} />
      ))}
    </Svg>
  );
}

// Fête un moment (bilan, fin, bienvenue, vote modifié) : des traits des 4 surligneurs jaillissent du bas puis s'effacent.
export function CelebrationLayer({ host }: { host: CelebrationHost }) {
  const current = useCelebrationStore((s) => s.current);
  const reducedMotion = useReducedMotion();
  const { width, height } = useWindowDimensions();
  if (!current || current.host !== host || reducedMotion) {
    return null;
  }
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Burst key={current.id} id={current.id} variant={current.variant} origin={current.origin} width={width} height={height} />
    </View>
  );
}
