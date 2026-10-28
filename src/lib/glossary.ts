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

/** Un mot du glossaire et ses formes fléchies (data/mots.json). */
export interface WordEntry {
  mot: string;
  variantes?: string[];
}

/** Un mot repéré dans un texte : position et entrée du glossaire. */
export interface WordSpan {
  start: number;
  end: number;
  mot: string;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Toutes les formes, la plus longue d'abord (« clause miroir » avant « clause »), en mot entier et sans casse.
function formsOf(words: readonly WordEntry[]) {
  return words
    .flatMap((w) => [w.mot, ...(w.variantes ?? [])].map((form) => ({ form, mot: w.mot })))
    .sort((a, b) => b.form.length - a.form.length)
    .map(({ form, mot }) => ({ mot, re: new RegExp(`(?<![\\p{L}\\p{N}-])${escape(form)}(?![\\p{L}\\p{N}-])`, 'giu') }));
}

/** Mots du glossaire dans un texte, première occurrence de chacun, sans chevauchement, dans l'ordre du texte. */
export function wordSpans(text: string, words: readonly WordEntry[]): WordSpan[] {
  const spans: WordSpan[] = [];
  for (const { mot, re } of formsOf(words)) {
    if (spans.some((s) => s.mot === mot)) {
      continue;
    }
    for (const m of text.matchAll(re)) {
      const start = m.index ?? 0;
      const end = start + m[0].length;
      if (!spans.some((s) => start < s.end && end > s.start)) {
        spans.push({ start, end, mot });
        break;
      }
    }
  }
  return spans.sort((a, b) => a.start - b.start);
}

/** Mots du glossaire présents dans des textes, dans l'ordre de première apparition, sans doublon. */
export function wordsIn(texts: readonly (string | undefined)[], words: readonly WordEntry[]): string[] {
  const found = new Set<string>();
  for (const text of texts) {
    wordSpans(text ?? '', words).forEach((s) => found.add(s.mot));
  }
  return [...found];
}
