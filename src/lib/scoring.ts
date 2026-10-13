import type { Candidat, Proposition } from '@/schemas/dataset';

export type VoteValue = -2 | -1 | 0 | 1 | 2;

// En dessous, le score d'un candidat est affiché mais pas classé.
export const MIN_VOTES_PER_CANDIDAT = 2;

export interface CandidateScore {
  candidat: Candidat;
  /** 0-100, null tant qu'aucune proposition du candidat n'a été votée. */
  score: number | null;
  totalVotes: number;
  ranked: boolean;
}

export function scoreCandidat(
  candidat: Candidat,
  propositions: readonly Proposition[],
  votes: Record<string, VoteValue>
): CandidateScore {
  const voted = propositions.filter((p) => p.candidatId === candidat.id && votes[p.id] !== undefined);
  if (voted.length === 0) {
    return { candidat, score: null, totalVotes: 0, ranked: false };
  }

  const sum = voted.reduce((acc, p) => acc + votes[p.id], 0);
  const max = voted.length * 2;
  const score = Math.round(((sum + max) / (max * 2)) * 100);

  return { candidat, score, totalVotes: voted.length, ranked: voted.length >= MIN_VOTES_PER_CANDIDAT };
}

/**
 * Classés d'abord (score décroissant), puis non classés, puis non évalués.
 * Les égalités suivent `tieOrder` (ordre tiré au hasard), jamais l'alphabet.
 */
export function computeScores(
  candidats: readonly Candidat[],
  propositions: readonly Proposition[],
  votes: Record<string, VoteValue>,
  tieOrder: ReadonlyMap<string, number> = new Map()
): CandidateScore[] {
  const group = (s: CandidateScore) => (s.ranked ? 0 : s.score !== null ? 1 : 2);
  const tie = (s: CandidateScore) => tieOrder.get(s.candidat.id) ?? 0;
  return candidats
    .map((c) => scoreCandidat(c, propositions, votes))
    .sort((a, b) => group(a) - group(b) || (b.score ?? 0) - (a.score ?? 0) || tie(a) - tie(b));
}

/** Rang « olympique » : deux scores égaux partagent le même rang (1, 1, 3...). */
export function competitionRanks(scores: readonly CandidateScore[]): number[] {
  return scores.map((s) => 1 + scores.filter((o) => (o.score ?? -1) > (s.score ?? -1)).length);
}
