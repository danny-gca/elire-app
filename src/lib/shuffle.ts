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
 * Ordre de passage neutre, par tours : chaque tour donne une proposition à chaque candidat, dans un ordre tiré au hasard.
 * Après N tours, chacun a N propositions passées ; deux propositions consécutives n'ont jamais le même candidat
 * (sauf s'il est seul à en avoir plus que tous) et, si possible, pas la même thématique.
 */
export function balancedOrder(props: readonly Proposition[], random: () => number = Math.random): string[] {
  const pools = new Map<string, Proposition[]>();
  fisherYates(props, random).forEach((p) => pools.set(p.candidatId, [...(pools.get(p.candidatId) ?? []), p]));
  const result: Proposition[] = [];

  while (pools.size > 0) {
    const round = fisherYates([...pools.keys()], random);
    const last = result[result.length - 1];
    if (last && round.length > 1 && round[0] === last.candidatId) {
      const j = 1 + Math.floor(random() * (round.length - 1));
      [round[0], round[j]] = [round[j], round[0]];
    }
    for (const candidatId of round) {
      const pool = pools.get(candidatId)!;
      const previous = result[result.length - 1];
      const idx = Math.max(0, pool.findIndex((p) => !previous || p.thematiqueId !== previous.thematiqueId));
      result.push(pool.splice(idx, 1)[0]);
      if (pool.length === 0) {
        pools.delete(candidatId);
      }
    }
  }

  return result.map((p) => p.id);
}

/**
 * Intercale les scrutins (mélangés) dans un ordre de propositions, répartis régulièrement et jamais deux de suite.
 * `from` protège le début de l'ordre (déjà voté) ; `existing` signale les scrutins déjà présents dans l'ordre.
 */
export function interleaveLois(
  order: readonly string[],
  loiIds: readonly string[],
  { from = 0, existing = new Set<string>(), random = Math.random }: { from?: number; existing?: ReadonlySet<string>; random?: () => number } = {}
): string[] {
  const pending = fisherYates(loiIds, random);
  const tail = order.slice(from);
  const every = Math.max(1, Math.floor(tail.length / Math.max(1, pending.length)));
  const result = order.slice(0, from);
  tail.forEach((id, i) => {
    result.push(id);
    const next = tail[i + 1];
    if ((i + 1) % every === 0 && pending.length > 0 && !existing.has(id) && (!next || !existing.has(next))) {
      result.push(pending.shift()!);
    }
  });
  return [...result, ...pending];
}
