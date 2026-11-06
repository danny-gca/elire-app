// Questions du paquet trop proches (« j'y ai déjà répondu ») : partagé par scripts/build-data.ts et les tests (imports relatifs).
import { cosine, normalize } from './similarity.ts';

/** Seuil de rapprochement : au-dessus, deux questions se lisent comme la même (relevé du 2026-11-06). */
export const SEUIL_DOUBLON = 0.45;

export interface QuestionInput {
  /** Référence affichée (P-224, L-03, E-11). */
  ref: string;
  text: string;
}

export interface Doublon {
  a: string;
  b: string;
  score: number;
}

/** Paires de questions au-dessus du seuil, de la plus proche à la moins proche, hors paires relues et gardées (`distinctes`). */
export function closeQuestions(items: readonly QuestionInput[], distinctes: readonly [string, string][] = [], seuil = SEUIL_DOUBLON): Doublon[] {
  const words = items.map((i) => normalize(i.text));
  // Rareté de chaque racine : un mot présent partout ne rapproche rien.
  const df = new Map<string, number>();
  words.forEach((ws) => new Set(ws).forEach((w) => df.set(w, (df.get(w) ?? 0) + 1)));
  const idf = new Map([...df].map(([w, n]) => [w, Math.log(items.length / n)]));
  const kept = new Set(distinctes.map(([a, b]) => [a, b].sort().join('|')));
  const pairs: Doublon[] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const score = cosine(words[i], words[j], idf);
      if (score >= seuil && !kept.has([items[i].ref, items[j].ref].sort().join('|'))) {
        pairs.push({ a: items[i].ref, b: items[j].ref, score });
      }
    }
  }
  return pairs.sort((x, y) => y.score - x.score);
}
