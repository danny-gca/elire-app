import { MIN_VOTES_PER_CANDIDAT, UNSURE, type LoiVoteValue, type VoteValue } from '@/lib/scoring';
import type { Proposition } from '@/schemas/dataset';

/** Le Classement s'ouvre à ce nombre d'avis ; ensuite, une pause tous les PAUSE_EVERY avis. */
export const CLASSEMENT_THRESHOLD = 10;
export const PAUSE_EVERY = 10;

/** Avis posés : « Je ne sais pas » ne compte pas. */
export function opinionCount(votes: Record<string, VoteValue>, loiVotes: Record<string, LoiVoteValue>): number {
  return Object.values(votes).filter((v) => v !== UNSURE).length + Object.keys(loiVotes).length;
}

/** Propositions notées (hors « Je ne sais pas ») de chaque candidat, du plus au moins noté. */
export function notesPerCandidat(propositions: readonly Proposition[], votes: Record<string, VoteValue>, candidatIds: readonly string[]): number[] {
  const perCandidat = new Map<string, number>(candidatIds.map((id) => [id, 0]));
  for (const p of propositions) {
    if (votes[p.id] !== undefined && votes[p.id] !== UNSURE && perCandidat.has(p.candidatId)) {
      perCandidat.set(p.candidatId, (perCandidat.get(p.candidatId) ?? 0) + 1);
    }
  }
  return [...perCandidat.values()].sort((a, b) => b - a);
}

/** Candidats classés : au moins MIN_VOTES_PER_CANDIDAT de leurs propositions notées. */
export function rankedCount(propositions: readonly Proposition[], votes: Record<string, VoteValue>): number {
  const ids = [...new Set(propositions.map((p) => p.candidatId))];
  return notesPerCandidat(propositions, votes, ids).filter((n) => n >= MIN_VOTES_PER_CANDIDAT).length;
}

/** Moyenne de propositions notées par candidat, en écriture française (« 0,6 »). */
export function averageText(notes: readonly number[]): string {
  const average = notes.length > 0 ? notes.reduce((a, b) => a + b, 0) / notes.length : 0;
  return String(Math.round(average * 10) / 10).replace('.', ',');
}

export interface Milestone {
  /** Le palier visé, puis le chiffre mis en avant, puis l'unité : « Bilan dans 7 votes ». */
  lead: string;
  value: number;
  text: string;
  /** Info d'appoint, sous le palier (candidats classés). */
  side?: string;
  ratio: number;
}

// Le prochain palier plutôt que le total : d'abord le Classement, puis chaque bilan de dix votes.
export function nextMilestone(opinions: number, ranked: number, candidats: number): Milestone {
  if (opinions < CLASSEMENT_THRESHOLD) {
    const left = CLASSEMENT_THRESHOLD - opinions;
    return { lead: 'Classement dans', value: left, text: left > 1 ? 'votes' : 'vote', ratio: opinions / CLASSEMENT_THRESHOLD };
  }
  const done = opinions % PAUSE_EVERY;
  const left = PAUSE_EVERY - done;
  const classes = `${ranked} ${ranked > 1 ? 'candidats classés' : 'candidat classé'} sur ${candidats}`;
  return { lead: 'Bilan dans', value: left, text: left > 1 ? 'votes' : 'vote', side: classes, ratio: done / PAUSE_EVERY };
}

/** Une pause courte à chaque dizaine d'avis, dès l'ouverture du Classement. */
export function isPause(opinions: number): boolean {
  return opinions >= CLASSEMENT_THRESHOLD && opinions % PAUSE_EVERY === 0;
}
