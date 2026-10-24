import { UNSURE, type VoteValue } from '@/lib/scoring';
import type { Thematique } from '@/schemas/dataset';

export interface ThemeAverage {
  thematique: Thematique;
  /** Moyenne -2..+2 des notes du lecteur, null sans note. */
  average: number | null;
  count: number;
}

/** « +1,4 », « -0,5 », « 0 » : une décimale, en écriture française. */
export function signedAverage(average: number): string {
  const rounded = Math.round(average * 10) / 10;
  return `${rounded > 0 ? '+' : ''}${String(rounded).replace('.', ',')}`;
}

/** Moyenne des notes par thème, une par question (« Je ne sais pas » exclu) ; sans note en bas, égalités par nom. */
export function themeAverages(
  thematiques: readonly Thematique[],
  questions: readonly { id: string; thematiqueId: string }[],
  votes: Record<string, VoteValue>
): ThemeAverage[] {
  const sums = new Map<string, { sum: number; count: number }>();
  for (const p of questions) {
    const v = votes[p.id];
    if (v === undefined || v === UNSURE) {
      continue;
    }
    const s = sums.get(p.thematiqueId) ?? { sum: 0, count: 0 };
    sums.set(p.thematiqueId, { sum: s.sum + v, count: s.count + 1 });
  }
  return thematiques
    .map((t) => {
      const s = sums.get(t.id);
      return { thematique: t, average: s ? s.sum / s.count : null, count: s?.count ?? 0 };
    })
    .sort((a, b) => {
      if (a.average !== b.average) {
        return a.average === null ? 1 : b.average === null ? -1 : b.average - a.average;
      }
      return a.thematique.titre.localeCompare(b.thematique.titre, 'fr');
    });
}
