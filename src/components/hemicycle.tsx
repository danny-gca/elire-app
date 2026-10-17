import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { LoiVoteTag } from '@/components/vote-tag';
import { Colors, DEFAULT_MARKER, Markers, Numeric, Spacing, Type } from '@/constants/theme';
import { plural } from '@/lib/format';
import type { LoiVoteValue } from '@/lib/scoring';
import type { Loi } from '@/schemas/dataset';

type Relation = 'same' | 'neutral' | 'opposite';

const WIDTH = 264;
const RADIUS = 112;
const DOT = 20;
const STAGGER = 45;
const TRAVEL = 420;
const FILL = 180;
const ease = Easing.out(Easing.exp);

function relationOf(user: LoiVoteValue, candidat: LoiVoteValue): Relation {
  if (user === 'abstention' || candidat === 'abstention') {
    return 'neutral';
  }
  return user === candidat ? 'same' : 'opposite';
}

const RANK: Record<Relation, number> = { same: 0, neutral: 1, opposite: 2 };

interface HemicycleProps {
  loi: Loi;
  user: LoiVoteValue;
  /** Couleur du surligneur du lecteur. */
  markColor?: string;
}

// Les candidats qui ont voté ce texte prennent place, sans nom : à votre couleur comme vous, noirs à l'inverse, vides s'ils se sont abstenus.
export function Hemicycle({ loi, user, markColor = Markers[DEFAULT_MARKER].solid }: HemicycleProps) {
  const seats = Object.values(loi.votes)
    .map((v) => relationOf(user, v.position))
    .sort((a, b) => RANK[a] - RANK[b]);
  const count = (r: Relation) => seats.filter((s) => s === r).length;
  const same = count('same');
  const opposite = count('opposite');
  const neutral = count('neutral');

  const summary =
    user === 'abstention'
      ? `Abstention : ce texte ne change aucun score.`
      : [same && `${same} comme vous`, opposite && `${opposite} à l’inverse`, neutral && plural(neutral, 'abstention')]
          .filter(Boolean)
          .join(', ');

  return (
    <View style={styles.root} accessible accessibilityLabel={`Hémicycle : ${seats.length} candidats ont voté ce texte. ${summary}.`}>
      <View style={styles.arc}>
        <View style={styles.base} />
        <Text style={[Type.label, styles.you]}>
          Vous · <LoiVoteTag value={user} />
        </Text>
        {seats.map((relation, i) => (
          <Seat key={i} index={i} total={seats.length} relation={relation} markColor={markColor} />
        ))}
      </View>
      <View style={styles.legend}>
        {user === 'abstention' ? (
          <Text style={[Type.label, styles.soft]}>{summary}</Text>
        ) : (
          <>
            {same > 0 && <Legend relation="same" markColor={markColor} label={`${same} comme vous`} />}
            {opposite > 0 && <Legend relation="opposite" markColor={markColor} label={`${opposite} à l’inverse`} />}
            {neutral > 0 && <Legend relation="neutral" markColor={markColor} label={plural(neutral, 'abstention')} />}
          </>
        )}
      </View>
    </View>
  );
}

function Seat({ index, total, relation, markColor }: { index: number; total: number; relation: Relation; markColor: string }) {
  // De gauche (π) à droite (0), au centre de chaque part de l'arc.
  const angle = Math.PI * (1 - (index + 0.5) / total);
  const x = WIDTH / 2 + RADIUS * Math.cos(angle) - DOT / 2;
  const y = RADIUS - RADIUS * Math.sin(angle);
  // Point de départ : la tribune, au centre bas de l'arc.
  const dx = WIDTH / 2 - DOT / 2 - x;
  const dy = RADIUS - y;

  const travel = useSharedValue(0);
  const fill = useSharedValue(0);
  useEffect(() => {
    travel.value = withDelay(index * STAGGER, withTiming(1, { duration: TRAVEL, easing: ease }));
    fill.value = withDelay(total * STAGGER + TRAVEL - 120, withTiming(1, { duration: FILL, easing: ease }));
  }, [fill, index, total, travel]);

  const seatStyle = useAnimatedStyle(() => ({
    opacity: travel.value,
    transform: [
      { translateX: (1 - travel.value) * dx },
      { translateY: (1 - travel.value) * dy },
      { scale: 0.6 + 0.4 * travel.value },
    ],
  }));
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scale: fill.value }] }));

  return (
    <Animated.View style={[styles.seat, relationStyle[relation], { left: x, top: y }, seatStyle]}>
      {relation === 'same' && <Animated.View style={[styles.fill, { backgroundColor: markColor }, fillStyle]} />}
    </Animated.View>
  );
}

function Legend({ relation, markColor, label }: { relation: Relation; markColor: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.mini, relationStyle[relation], relation === 'same' && { backgroundColor: markColor }]} />
      <Text style={[Type.label, Numeric, styles.ink]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  arc: {
    width: WIDTH,
    height: RADIUS + DOT + Spacing.one,
  },
  // Base de l'hémicycle : les points partent de la place du lecteur, au centre.
  base: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.rule,
  },
  you: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Spacing.one,
    textAlign: 'center',
    color: Colors.ink,
  },
  seat: {
    position: 'absolute',
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    overflow: 'hidden',
  },
  fill: {
    ...StyleSheet.absoluteFill,
    borderRadius: DOT / 2,
  },
  // Les trois sur une ligne d'un téléphone de 390 pt ; sur un écran plus étroit, la légende passe à la ligne.
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: 12,
    rowGap: Spacing.half,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  mini: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  ink: {
    color: Colors.ink,
  },
  soft: {
    color: Colors.inkSoft,
  },
});

// Surligneur (comme vous), encre pleine (à l'inverse), vide (abstention) : trois formes lisibles sans la couleur, et pas de rouge ni de vert.
const relationStyle = StyleSheet.create({
  same: {
    borderWidth: 1.5,
    borderColor: Colors.ink,
  },
  opposite: {
    borderWidth: 1.5,
    borderColor: Colors.ink,
    backgroundColor: Colors.ink,
  },
  neutral: {
    borderWidth: 1.5,
    borderColor: Colors.graphite,
    backgroundColor: Colors.sheet,
  },
});
