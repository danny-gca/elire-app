// Sigles des textes lus à l'aveugle : partagé par l'app et scripts/build-data.ts (aucun import d'alias).

/** Mots du quotidien admis tels quels dans un titre ou une question ; les autres s'écrivent en clair. */
export const EVERYDAY_ACRONYMS = ['TVA', 'SMIC', 'RSA', 'SNCF', 'RATP', 'EDF', 'IVG'];

const ACRONYM = /(?<![\p{L}\p{N}])\p{Lu}{2,}\p{N}*(?![\p{L}\p{N}])/gu;

/** Sigles d'un texte, dans l'ordre de première apparition, sans doublon. */
export function acronymsIn(...texts: (string | undefined)[]): string[] {
  const found = new Set<string>();
  for (const text of texts) {
    for (const match of (text ?? '').matchAll(ACRONYM)) {
      found.add(match[0]);
    }
  }
  return [...found];
}

/** Sigles d'un titre qui ne sont ni du quotidien ni développés (le sigle entre parenthèses suit sa forme claire). */
export function unexplainedInTitle(title: string): string[] {
  const outsideParentheses = title.replace(/\([^)]*\)/g, ' ');
  return acronymsIn(outsideParentheses).filter((a) => !EVERYDAY_ACRONYMS.includes(a));
}
