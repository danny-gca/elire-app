import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ButtonStroke } from '@/components/button-stroke';
import { Colors, Numeric, Radius, Spacing, Type } from '@/constants/theme';
import { UNSURE_CHOICE, VOTE_CHOICES, type VoteChoice } from '@/constants/votes';
import type { VoteValue } from '@/lib/scoring';
import { pointOf, type CelebrationPoint } from '@/store/celebration-store';

interface VoteScaleProps {
  value?: VoteValue;
  /** `point` : où le doigt a touché, pour y faire partir une fête. */
  onVote: (value: VoteValue, point?: CelebrationPoint) => void;
  disabled?: boolean;
  /** Geste du vote : trait de surligneur sur le niveau choisi. */
  stroke?: { value: VoteValue; color: string };
}

// Quatre niveaux égaux, d'Impossible à Parfait, puis « Je ne sais pas » à part : ce n'est pas un niveau.
export function VoteScale({ value, onVote, disabled, stroke }: VoteScaleProps) {
  // Sous 380 pt, « Impossible » ne tient plus à 13 pt dans un quart de largeur.
  const narrow = useWindowDimensions().width < 380;
  const option = (choice: VoteChoice, wide?: boolean) => {
    const selected = value === choice.value;
    return (
      <Pressable
        key={choice.value}
        onPress={(e) => onVote(choice.value, pointOf(e))}
        disabled={disabled}
        accessibilityRole="radio"
        accessibilityLabel={choice.sign ? `${choice.label}, ${choice.sign}` : choice.label}
        accessibilityHint={wide ? 'Passe la question sans compter dans le score' : undefined}
        accessibilityState={{ selected, disabled: !!disabled }}
        style={({ pressed }) => [
          styles.option,
          wide && styles.unsure,
          selected && { borderColor: wide ? Colors.ink : choice.color, borderWidth: 2, backgroundColor: Colors.sheet },
          pressed && { backgroundColor: Colors.pressed },
          stroke?.value === choice.value && styles.stroked,
        ]}>
        {stroke?.value === choice.value && <ButtonStroke color={stroke.color} />}
        {choice.sign ? <Text style={[Type.bodyStrong, Numeric, { color: choice.color }]}>{choice.sign}</Text> : null}
        <Text style={[wide ? Type.labelStrong : Type.label, styles.label, narrow && !wide && styles.labelNarrow]} numberOfLines={1}>
          {choice.label}
        </Text>
      </Pressable>
    );
  };
  return (
    <View style={styles.root} accessibilityRole="radiogroup" accessibilityLabel="Votre avis">
      <View style={styles.row}>{VOTE_CHOICES.map((choice) => option(choice))}</View>
      {option(UNSURE_CHOICE, true)}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.one,
  },
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
    overflow: 'hidden',
  },
  // Le geste peut dépasser du bouton et passer au-dessus des voisins.
  stroked: {
    overflow: 'visible',
    zIndex: 1,
  },
  unsure: {
    flex: 0,
    minHeight: 44,
  },
  label: {
    color: Colors.ink,
  },
  labelNarrow: {
    fontSize: 12,
    letterSpacing: -0.1,
  },
});
