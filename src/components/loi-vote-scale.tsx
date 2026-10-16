import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ButtonStroke } from '@/components/button-stroke';
import { Colors, Radius, Spacing, Type } from '@/constants/theme';
import { loiChoice, type LoiChoice } from '@/constants/votes';
import type { LoiVoteValue } from '@/lib/scoring';
import { pointOf, type CelebrationPoint } from '@/store/celebration-store';

interface LoiVoteScaleProps {
  value?: LoiVoteValue;
  /** `point` : où le doigt a touché, pour y faire partir une fête. */
  onVote: (value: LoiVoteValue, point?: CelebrationPoint) => void;
  disabled?: boolean;
  /** Geste du vote : trait de surligneur sur le choix. */
  stroke?: { value: LoiVoteValue; color: string };
}

// Même ordre que les propositions : Contre à gauche, Pour à droite, Abstention dessous comme « Je ne sais pas ».
export function LoiVoteScale({ value, onVote, disabled, stroke }: LoiVoteScaleProps) {
  const option = (choice: LoiChoice, wide = false) => {
    const selected = value === choice.value;
    return (
      <Pressable
        key={choice.value}
        onPress={(e) => onVote(choice.value, pointOf(e))}
        disabled={disabled}
        accessibilityRole="radio"
        accessibilityLabel={choice.label}
        accessibilityState={{ selected, disabled: !!disabled }}
        style={({ pressed }) => [
          styles.option,
          wide && styles.wide,
          selected && { borderColor: choice.color, borderWidth: 2 },
          pressed && { backgroundColor: Colors.pressed },
          stroke?.value === choice.value && styles.stroked,
        ]}>
        {stroke?.value === choice.value && <ButtonStroke color={stroke.color} />}
        <Text style={[Type.bodyStrong, { color: choice.color }, disabled && !selected && styles.dimmed]} numberOfLines={1}>
          {choice.label}
        </Text>
      </Pressable>
    );
  };
  return (
    <View style={styles.root} accessibilityRole="radiogroup" accessibilityLabel="Votre vote sur ce texte">
      <View style={styles.row}>{[CONTRE, POUR].map((c) => option(c))}</View>
      {option(ABSTENTION, true)}
    </View>
  );
}

const CONTRE = loiChoice('contre')!;
const POUR = loiChoice('pour')!;
const ABSTENTION = loiChoice('abstention')!;

const styles = StyleSheet.create({
  root: {
    gap: Spacing.one,
  },
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
  // Abstention en bas, à la hauteur de « Je ne sais pas ».
  wide: {
    flex: 0,
    minHeight: 44,
  },
  stroked: {
    overflow: 'visible',
    zIndex: 1,
  },
  // Seul le libellé s'estompe : le bouton reste opaque sur le fond de Voter.
  dimmed: {
    opacity: 0.45,
  },
});
