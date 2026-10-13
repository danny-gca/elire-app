import { StyleSheet, Text, View } from 'react-native';

import { Colors, Numeric, Spacing, Type } from '@/constants/theme';

interface ProgressCounterProps {
  value: number;
  total: number;
  unit: string;
  /** Affiche le filet de progression sous le compteur. */
  track?: boolean;
}

export function ProgressCounter({ value, total, unit, track = false }: ProgressCounterProps) {
  const ratio = total > 0 ? Math.min(1, value / total) : 0;
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${value} sur ${total} ${unit}`}
      accessibilityValue={{ min: 0, max: total, now: value }}>
      <Text style={[Type.label, Numeric, styles.text]}>
        <Text style={[Type.bodyStrong, Numeric, { color: Colors.ink }]}>{value}</Text> sur {total} {unit}
      </Text>
      {track && (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: Colors.graphite,
  },
  track: {
    marginTop: Spacing.half,
    height: 2,
    backgroundColor: Colors.rule,
  },
  fill: {
    height: 2,
    backgroundColor: Colors.ink,
  },
});
