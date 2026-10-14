import { VoteColors } from '@/constants/theme';
import { UNSURE, type LoiVoteValue, type VoteValue } from '@/lib/scoring';

export interface VoteChoice {
  value: VoteValue;
  label: string;
  /** Valeur signée affichée (typographie : vrai signe moins). */
  sign: string;
  color: string;
}

// Les quatre niveaux d'avis, d'Impossible à Parfait.
export const VOTE_CHOICES: VoteChoice[] = [
  { value: -2, label: 'Impossible', sign: '−2', color: VoteColors['-2'] },
  { value: -1, label: 'Contre', sign: '−1', color: VoteColors['-1'] },
  { value: 1, label: 'Pour', sign: '+1', color: VoteColors['1'] },
  { value: 2, label: 'Parfait', sign: '+2', color: VoteColors['2'] },
];

/** Pas un niveau : la question est passée sans compter dans le score. */
export const UNSURE_CHOICE: VoteChoice = { value: UNSURE, label: 'Je ne sais pas', sign: '', color: VoteColors['0'] };

export function voteChoice(value: VoteValue | undefined): VoteChoice | undefined {
  return value === UNSURE ? UNSURE_CHOICE : VOTE_CHOICES.find((c) => c.value === value);
}

export interface LoiChoice {
  value: LoiVoteValue;
  label: string;
  color: string;
}

// Les trois choix de l'hémicycle, dans l'ordre de la rangée.
export const LOI_CHOICES: LoiChoice[] = [
  { value: 'contre', label: 'Contre', color: VoteColors['-1'] },
  { value: 'abstention', label: 'Abstention', color: VoteColors['0'] },
  { value: 'pour', label: 'Pour', color: VoteColors['1'] },
];

export function loiChoice(value: LoiVoteValue | undefined): LoiChoice | undefined {
  return LOI_CHOICES.find((c) => c.value === value);
}
