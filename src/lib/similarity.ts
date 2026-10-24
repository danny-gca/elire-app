// Rapprochement grossier de propositions par leurs mots (scripts/find-enjeux.ts) : un tri pour la relecture, jamais une décision.

const ROOT = 6;
const STOP = new Set(
  'les des une aux pour par sur dans avec sans plus moins qui que dont est sont ses son leur leurs tout tous toute toutes cette ces aussi entre lors comme fait faire etre avoir ont elle nous vous ils mais donc'.split(' ')
);

/** Racines des mots utiles : minuscules, sans accents, chiffres ni mots de moins de 3 lettres ou vides. */
export function normalize(text: string): string[] {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length >= 3 && !STOP.has(w))
    .map((w) => w.slice(0, ROOT));
}

/** Cosinus de deux sacs de racines pondérées par leur rareté (TF-IDF). */
export function cosine(a: string[], b: string[], idf: Map<string, number>): number {
  const vector = (words: string[]) => {
    const v = new Map<string, number>();
    words.forEach((w) => v.set(w, (v.get(w) ?? 0) + (idf.get(w) ?? 0)));
    return v;
  };
  const va = vector(a);
  const vb = vector(b);
  let dot = 0;
  va.forEach((x, w) => {
    dot += x * (vb.get(w) ?? 0);
  });
  const norm = (v: Map<string, number>) => Math.sqrt([...v.values()].reduce((s, x) => s + x * x, 0));
  const denominator = norm(va) * norm(vb);
  return denominator === 0 ? 0 : dot / denominator;
}

export const OPPOSED_VERBS: [string, string][] = [
  ['creer', 'supprimer'],
  ['construire', 'fermer'],
  ['augmenter', 'baisser'],
  ['developper', 'arreter'],
  ['rester', 'quitter'],
  ['autoriser', 'interdire'],
  ['retablir', 'abolir'],
];
const OPPOSED_ROOTS = OPPOSED_VERBS.map(([x, y]) => [x.slice(0, ROOT), y.slice(0, ROOT)]);

/** Vrai si l'un emploie un verbe et l'autre son contraire (« construire » et « fermer »). */
export function opposedVerbs(a: string[], b: string[]): boolean {
  return OPPOSED_ROOTS.some(([x, y]) => (a.includes(x) && b.includes(y)) || (a.includes(y) && b.includes(x)));
}
