import { Text, type StyleProp, type TextStyle } from 'react-native';

import { Numeric, Type } from '@/constants/theme';
import { voteChoice } from '@/constants/votes';
import type { VoteValue } from '@/lib/scoring';

// Valeur d'un vote en toutes lettres, dans sa couleur d'échelle.
export function VoteTag({ value, style }: { value: VoteValue; style?: StyleProp<TextStyle> }) {
  const choice = voteChoice(value);
  if (!choice) {
    return null;
  }
  return (
    <Text style={[Type.labelStrong, Numeric, { color: choice.color }, style]}>
      {choice.label} {choice.sign}
    </Text>
  );
}
