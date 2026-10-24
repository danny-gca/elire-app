// Partagé avec scripts/simulate-scoring.ts : imports relatifs (l'alias @/ n'existe pas pour Node).
import { UNSURE, type VoteValue } from './scoring.ts';
import type { Enjeu, Proposition } from '../schemas/dataset.ts';

/** Note de chaque proposition : celle de sa question commune (inversée pour un « contre »), sinon la sienne. */
export function effectiveVotes(votes: Record<string, VoteValue>, propositions: readonly Proposition[]): Record<string, VoteValue> {
  const result: Record<string, VoteValue> = {};
  for (const p of propositions) {
    const { key, sign } = voteTarget(p);
    const value = votes[key];
    if (value !== undefined) {
      result[p.id] = (value === UNSURE ? UNSURE : value * sign) as VoteValue;
    }
  }
  return result;
}

/** Où s'écrit le vote d'une proposition : sa question commune (et dans quel sens), ou elle-même. */
export function voteTarget(p: Pick<Proposition, 'id' | 'enjeuId' | 'sens'>): { key: string; sign: 1 | -1 } {
  return p.enjeuId ? { key: p.enjeuId, sign: p.sens === 'contre' ? -1 : 1 } : { key: p.id, sign: 1 };
}

/** Candidats qui pensent comme le lecteur, et à l'inverse ; rien pour « Je ne sais pas ». */
export function enjeuTally(enjeu: Pick<Enjeu, 'positions'>, value: VoteValue): { agree: number; opposite: number } {
  if (value === UNSURE) {
    return { agree: 0, opposite: 0 };
  }
  const agree = enjeu.positions.filter((p) => (p.sens === 'pour') === value > 0).length;
  return { agree, opposite: enjeu.positions.length - agree };
}

/** « 3 pensent comme vous, 2 à l'inverse », sans nom : l'écran juste après le vote. */
export function tallyText({ agree, opposite }: { agree: number; opposite: number }): string {
  const verb = (n: number) => (n > 1 ? 'pensent' : 'pense');
  if (agree === 0) {
    return `${opposite} ${verb(opposite)} l’inverse de vous`;
  }
  return opposite > 0 ? `${agree} ${verb(agree)} comme vous, ${opposite} à l’inverse` : `${agree} ${verb(agree)} comme vous`;
}
