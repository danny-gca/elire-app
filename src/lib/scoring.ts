import type { Candidat, Loi, PositionVote, Proposition } from '@/schemas/dataset';

export type VoteValue = -2 | -1 | 0 | 1 | 2;
/** « Je ne sais pas » : enregistré, mais compté nulle part. */
export const UNSURE: VoteValue = 0;
/** Vote de l'utilisateur sur un scrutin, mêmes positions qu'au Parlement. */
export type LoiVoteValue = PositionVote;

// En dessous, le score d'un candidat est affiché mais pas classé.
export const MIN_VOTES_PER_CANDIDAT = 2;
// Un vote de groupe pèse moitié moins qu'un vote personnel.
export const GROUP_VOTE_WEIGHT = 0.5;

/** Fiabilité d'un score classé, selon le nombre d'éléments qui le fondent. */
export type Reliability = 'fragile' | 'moyen' | 'fiable';
// Seuils en éléments (proposition ou vote personnel = 1, vote de groupe = ½) : 6 propositions suffisent à tout candidat.
export const RELIABILITY_FROM = { moyen: 3, fiable: 5 } as const;

export function reliabilityOf(evidence: number): Reliability {
  return evidence >= RELIABILITY_FROM.fiable ? 'fiable' : evidence >= RELIABILITY_FROM.moyen ? 'moyen' : 'fragile';
}

export interface LoiBallot {
  lois: readonly Loi[];
  votes: Record<string, LoiVoteValue>;
}

export interface PartScore {
  /** 0-100, null sans élément voté. */
  score: number | null;
  count: number;
}

export interface CandidateScore {
  candidat: Candidat;
  /** 0-100, null tant qu'aucune proposition ni aucun scrutin du candidat n'a été voté. */
  score: number | null;
  totalVotes: number;
  ranked: boolean;
  programme: PartScore;
  parlement: PartScore & { groupCount: number };
  /** Le candidat a au moins un vote enregistré dans les scrutins suivis. */
  seated: boolean;
  /** Éléments qui fondent le score : propositions notées + scrutins pondérés. */
  evidence: number;
  /** Null tant que le candidat n'est pas classé. */
  reliability: Reliability | null;
}

/** +2 même position, -2 position inverse, 0 si le candidat s'est abstenu (l'abstention du lecteur n'est pas comptée). */
export function loiPoints(user: LoiVoteValue, candidat: PositionVote): -2 | 0 | 2 {
  if (user === 'abstention' || candidat === 'abstention') {
    return 0;
  }
  return user === candidat ? 2 : -2;
}

const toPercent = (sum: number, max: number) => Math.round(((sum + max) / (max * 2)) * 100);

export function scoreCandidat(
  candidat: Candidat,
  propositions: readonly Proposition[],
  votes: Record<string, VoteValue>,
  ballot: LoiBallot = { lois: [], votes: {} }
): CandidateScore {
  const voted = propositions.filter((p) => p.candidatId === candidat.id && votes[p.id] !== undefined && votes[p.id] !== UNSURE);
  const propSum = voted.reduce((acc, p) => acc + votes[p.id], 0);
  const propMax = voted.length * 2;

  // Un scrutin où le candidat n'a pas voté ne compte pas pour lui : ni point en plus, ni point en moins.
  let loiSum = 0;
  let loiMax = 0;
  let loiCount = 0;
  let groupCount = 0;
  for (const loi of ballot.lois) {
    const position = loi.votes[candidat.id];
    const user = ballot.votes[loi.id];
    // Comme « Je ne sais pas » : l'abstention du lecteur ne compte pour aucun candidat.
    if (!position || user === undefined || user === 'abstention') {
      continue;
    }
    const weight = position.typeVote === 'groupe_parti' ? GROUP_VOTE_WEIGHT : 1;
    loiSum += weight * loiPoints(user, position.position);
    loiMax += weight * 2;
    loiCount += 1;
    if (position.typeVote === 'groupe_parti') {
      groupCount += 1;
    }
  }

  const max = propMax + loiMax;
  const ranked = voted.length >= MIN_VOTES_PER_CANDIDAT;
  const evidence = voted.length + loiMax / 2;
  return {
    candidat,
    score: max > 0 ? toPercent(propSum + loiSum, max) : null,
    totalVotes: voted.length + loiCount,
    ranked,
    programme: { score: propMax > 0 ? toPercent(propSum, propMax) : null, count: voted.length },
    parlement: { score: loiMax > 0 ? toPercent(loiSum, loiMax) : null, count: loiCount, groupCount },
    seated: ballot.lois.some((l) => l.votes[candidat.id]),
    evidence,
    reliability: ranked ? reliabilityOf(evidence) : null,
  };
}

/**
 * Classés d'abord (score décroissant), puis non classés, puis non évalués.
 * Les égalités suivent `tieOrder` (ordre tiré au hasard), jamais l'alphabet.
 */
export function computeScores(
  candidats: readonly Candidat[],
  propositions: readonly Proposition[],
  votes: Record<string, VoteValue>,
  tieOrder: ReadonlyMap<string, number> = new Map(),
  ballot?: LoiBallot
): CandidateScore[] {
  const group = (s: CandidateScore) => (s.ranked ? 0 : s.score !== null ? 1 : 2);
  const tie = (s: CandidateScore) => tieOrder.get(s.candidat.id) ?? 0;
  return candidats
    .map((c) => scoreCandidat(c, propositions, votes, ballot))
    .sort((a, b) => group(a) - group(b) || (b.score ?? 0) - (a.score ?? 0) || tie(a) - tie(b));
}

/** Rang « olympique » : deux scores égaux partagent le même rang (1, 1, 3...). */
export function competitionRanks(scores: readonly CandidateScore[]): number[] {
  return scores.map((s) => 1 + scores.filter((o) => (o.score ?? -1) > (s.score ?? -1)).length);
}
