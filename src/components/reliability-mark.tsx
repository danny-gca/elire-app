import { StyleSheet, Text, View } from 'react-native';

import { Colors, Type } from '@/constants/theme';
import { RELIABILITY_FROM, type Reliability } from '@/lib/scoring';

const LEVEL: Record<Reliability, number> = { fragile: 1, moyen: 2, fiable: 3 };
export const RELIABILITY_LABELS: Record<Reliability, string> = { fragile: 'fragile', moyen: 'assez sûr', fiable: 'fiable' };

/** Une phrase pour la fiche : sur quoi repose le score et ce qui le rend fiable. */
export function reliabilityHint(level: Reliability): string {
  return level === 'fiable'
    ? 'assez de votes pour comparer'
    : `fiable à partir de ${RELIABILITY_FROM.fiable} éléments (proposition ou vote personnel : 1, vote de groupe : ½)`;
}

// Jauge à trois traits, lisible sans la couleur : combien d'éléments fondent ce score.
export function ReliabilityMark({ level, label = true }: { level: Reliability; label?: boolean }) {
  const filled = LEVEL[level];
  return (
    <View style={styles.row} accessible accessibilityLabel={`Score ${RELIABILITY_LABELS[level]}`}>
      <View style={styles.bars}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.bar, { height: 6 + i * 3 }, i < filled && styles.on]} />
        ))}
      </View>
      {label && <Text style={[Type.label, styles.text]}>{RELIABILITY_LABELS[level]}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    width: 4,
    borderRadius: 1,
    backgroundColor: Colors.rule,
  },
  on: {
    backgroundColor: Colors.ink,
  },
  text: {
    color: Colors.graphite,
  },
});
