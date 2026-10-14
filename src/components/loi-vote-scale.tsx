import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ButtonStroke } from '@/components/button-stroke';
import { Colors, Radius, Spacing, Type } from '@/constants/theme';
import { LOI_CHOICES } from '@/constants/votes';
import type { LoiVoteValue } from '@/lib/scoring';

interface LoiVoteScaleProps {
  value?: LoiVoteValue;
  onVote: (value: LoiVoteValue) => void;
  disabled?: boolean;
  /** Geste du vote : trait de surligneur sur le choix. */
  stroke?: { value: LoiVoteValue; color: string };
}

// Trois choix comme dans l'hémicycle : plus larges que les quatre niveaux, pour un vote qui tranche.
export function LoiVoteScale({ value, onVote, disabled, stroke }: LoiVoteScaleProps) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Votre vote sur ce texte">
      {LOI_CHOICES.map((choice) => {
        const selected = value === choice.value;
        return (
          <Pressable
            key={choice.value}
            onPress={() => onVote(choice.value)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityLabel={choice.label}
            accessibilityState={{ selected, disabled: !!disabled }}
            style={({ pressed }) => [
              styles.option,
              selected && { borderColor: choice.color, borderWidth: 2 },
              pressed && { backgroundColor: Colors.pressed },
              stroke?.value === choice.value && styles.stroked,
              disabled && !selected && styles.dimmed,
            ]}>
            {stroke?.value === choice.value && <ButtonStroke color={stroke.color} />}
            <Text style={[Type.bodyStrong, { color: choice.color }]} numberOfLines={1}>
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
    gap: Spacing.one,
  },
  option: {
    flex: 1,
    minWidth: 0,
    minHeight: 60,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderColor: Colors.rule,
    backgroundColor: Colors.sheet,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.half,
    overflow: 'hidden',
  },
  stroked: {
    overflow: 'visible',
    zIndex: 1,
  },
  dimmed: {
    opacity: 0.45,
  },
});
