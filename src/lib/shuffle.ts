import type { Proposition } from '@/schemas/dataset';

export function fisherYates<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Ordre de passage neutre : mélange uniforme, puis deux propositions consécutives
 * n'ont jamais le même candidat et, si possible, pas la même thématique.
 */
export function balancedOrder(props: readonly Proposition[], random: () => number = Math.random): string[] {
  const pool = fisherYates(props, random);
  const result: Proposition[] = [];

  while (pool.length > 0) {
    const last = result[result.length - 1];
    const remaining = new Map<string, number>();
    pool.forEach((p) => remaining.set(p.candidatId, (remaining.get(p.candidatId) ?? 0) + 1));

    // Un candidat qui occupe plus de la moitié du reste doit passer maintenant, sinon il se répéterait à la fin.
    const [crowded, crowdedCount] = [...remaining.entries()].reduce((a, b) => (b[1] > a[1] ? b : a));
    const allowed = (p: Proposition) =>
      crowdedCount * 2 > pool.length ? p.candidatId === crowded : !last || p.candidatId !== last.candidatId;

    let idx = pool.findIndex((p) => allowed(p) && (!last || p.thematiqueId !== last.thematiqueId));
    if (idx === -1) {
      idx = pool.findIndex(allowed);
    }
    if (idx === -1) {
      idx = 0;
    }
    result.push(pool.splice(idx, 1)[0]);
  }

  return result.map((p) => p.id);
}
