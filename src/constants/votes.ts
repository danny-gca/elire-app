import { VoteColors } from '@/constants/theme';
import type { VoteValue } from '@/lib/scoring';

export interface VoteChoice {
  value: VoteValue;
  label: string;
  /** Valeur signée affichée (typographie : vrai signe moins). */
  sign: string;
  color: string;
}

export const VOTE_CHOICES: VoteChoice[] = [
  { value: -2, label: 'Impossible', sign: '−2', color: VoteColors['-2'] },
  { value: -1, label: 'Contre', sign: '−1', color: VoteColors['-1'] },
  { value: 0, label: 'Neutre', sign: '0', color: VoteColors['0'] },
  { value: 1, label: 'Pour', sign: '+1', color: VoteColors['1'] },
  { value: 2, label: 'Parfait', sign: '+2', color: VoteColors['2'] },
];

export function voteChoice(value: VoteValue | undefined): VoteChoice | undefined {
  return VOTE_CHOICES.find((c) => c.value === value);
}
