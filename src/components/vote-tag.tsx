import { Text, type StyleProp, type TextStyle } from 'react-native';

import { Numeric, Type } from '@/constants/theme';
import { loiChoice, voteChoice } from '@/constants/votes';
import type { LoiVoteValue, VoteValue } from '@/lib/scoring';

// Valeur d'un vote en toutes lettres, dans sa couleur d'échelle.
export function VoteTag({ value, style }: { value: VoteValue; style?: StyleProp<TextStyle> }) {
  const choice = voteChoice(value);
  if (!choice) {
    return null;
  }
  return (
    <Text style={[Type.labelStrong, Numeric, { color: choice.color }, style]}>
      {choice.sign ? `${choice.label} ${choice.sign}` : choice.label}
    </Text>
  );
}

// Vote sur un scrutin, en toutes lettres dans sa couleur d'échelle.
export function LoiVoteTag({ value, style }: { value: LoiVoteValue; style?: StyleProp<TextStyle> }) {
  const choice = loiChoice(value);
  if (!choice) {
    return null;
  }
  return <Text style={[Type.labelStrong, { color: choice.color }, style]}>{choice.label}</Text>;
}
