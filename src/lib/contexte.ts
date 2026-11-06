// Contexte lu avant le vote, rapporté aux autres questions du même type : partagé par scripts/build-data.ts et les tests.

/** Sous cette part de la médiane de son type, les « Précisions » d'une question sont signalées comme maigres. */
export const PART_MIN_CONTEXTE = 0.5;

export type Kind = 'P' | 'L' | 'E';

export interface ContexteInput {
  ref: string;
  kind: Kind;
  /** Proposition : son contexte ; scrutin ou question commune : son enjeu. */
  precisions: string;
  /** Repère rattaché (« Aujourd'hui » et « En débat »), s'il y en a un. */
  repere?: string;
}

export interface ContexteStat {
  ref: string;
  kind: Kind;
  /** Caractères utiles des « Précisions » : sans la première phrase d'une proposition, qui ne nomme que le document. */
  precisions: number;
  repere: number;
  /** Précisions rapportées à la médiane de son type, en %. */
  part: number;
}

// Fin de la première phrase, sans couper « p. 8 » ni « chap. 9 ».
const DOC_END = /(?<!\b(?:p|pp|chap|art|vol|env))\.\s+(?=[\p{Lu}«])/u;

// Au-delà, la première phrase décrit déjà la mesure ou la circonstance, pas seulement le document.
const DOC_MAX = 40;

/** Ce que le contexte d'une proposition dit de la mesure, sans la référence du document (première phrase, 40 caractères au plus). */
export function usefulContext(contexte: string): string {
  const match = DOC_END.exec(contexte);
  const end = match ? match.index + match[0].length : contexte.length;
  return contexte.slice(Math.min(end, DOC_MAX)).trim();
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length === 0 ? 0 : sorted[Math.floor(sorted.length / 2)];
}

/** Mesure de chaque question, sa part rapportée à la médiane de son type. */
export function contexteStats(items: readonly ContexteInput[]): ContexteStat[] {
  const lengths = items.map((i) => (i.kind === 'P' ? usefulContext(i.precisions) : i.precisions).trim().length);
  const medians = new Map<Kind, number>();
  for (const kind of ['P', 'L', 'E'] as const) {
    medians.set(kind, median(lengths.filter((_, n) => items[n].kind === kind)));
  }
  return items.map((i, n) => {
    const m = medians.get(i.kind) || 1;
    return { ref: i.ref, kind: i.kind, precisions: lengths[n], repere: i.repere?.length ?? 0, part: Math.round((lengths[n] / m) * 100) };
  });
}

/** Questions aux « Précisions » maigres, de la plus pauvre à la moins pauvre. */
export function thinContexte(stats: readonly ContexteStat[], part = PART_MIN_CONTEXTE): ContexteStat[] {
  return stats.filter((s) => s.part < part * 100).sort((a, b) => a.part - b.part);
}
