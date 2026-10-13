import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Colors, Numeric, Radius, Spacing, Type } from '@/constants/theme';
import { VOTE_CHOICES } from '@/constants/votes';
import type { VoteValue } from '@/lib/scoring';

interface VoteScaleProps {
  value?: VoteValue;
  onVote: (value: VoteValue) => void;
  disabled?: boolean;
}

// Cinq niveaux égaux, d’Impossible à Parfait.
export function VoteScale({ value, onVote, disabled }: VoteScaleProps) {
  // Sous 380 pt, « Impossible » ne tient plus à 13 pt dans un cinquième de largeur.
  const narrow = useWindowDimensions().width < 380;
  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Votre avis">
      {VOTE_CHOICES.map((choice) => {
        const selected = value === choice.value;
        return (
          <Pressable
            key={choice.value}
            onPress={() => onVote(choice.value)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityLabel={`${choice.label}, ${choice.sign}`}
            accessibilityState={{ selected, disabled: !!disabled }}
            style={({ pressed }) => [
              styles.option,
              selected && { borderColor: choice.color, borderWidth: 2, backgroundColor: Colors.sheet },
              pressed && { backgroundColor: Colors.pressed },
            ]}>
            <Text style={[Type.bodyStrong, Numeric, { color: choice.color }]}>{choice.sign}</Text>
            <Text style={[Type.label, styles.label, narrow && styles.labelNarrow]} numberOfLines={1}>
              {choice.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  option: {
    flex: 1,
    minWidth: 0,
    minHeight: 60,
    paddingVertical: Spacing.one,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderColor: Colors.rule,
    backgroundColor: Colors.sheet,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    color: Colors.ink,
  },
  labelNarrow: {
    fontSize: 12,
    letterSpacing: -0.1,
  },
});
