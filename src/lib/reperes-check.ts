// Contexte complet de chaque question (onglet « Contexte ») : partagé par scripts/build-data.ts et les tests (aucun import d'alias).

/** Au-delà, un repère est à relire : les faits datés vieillissent. */
export const REPERE_MAX_JOURS = 180;

interface RepereInput {
  id: string;
  aujourdhui: string;
  aJour: string;
  liens: { aveugle?: boolean }[];
  propositions: string[];
  lois: string[];
  enjeux: string[];
}

/** Questions posées (propositions seules, questions communes, scrutins) sans repère, donc sans onglet « Contexte ». */
export function withoutRepere(asked: readonly string[], reperes: readonly RepereInput[]): string[] {
  const covered = new Set(reperes.flatMap((r) => [...r.propositions, ...r.lois, ...r.enjeux]));
  return asked.filter((id) => !covered.has(id));
}

/** Ce qui manque à un repère : un fait daté, une source lisible pendant le vote, une relecture récente (`today` : AAAA-MM-JJ). */
export function repereGaps(r: RepereInput, today: string): string[] {
  const gaps: string[] = [];
  if (!/\b(19|20)\d{2}\b/.test(r.aujourdhui)) {
    gaps.push('« Aujourd\'hui » sans année : un fait daté attendu');
  }
  if (r.liens.length === 0) {
    gaps.push('aucune source (liens)');
  } else if (!r.liens.some((l) => l.aveugle !== false)) {
    gaps.push('aucune source lisible pendant le vote (toutes en aveugle: false)');
  }
  const days = (Date.parse(today) - Date.parse(r.aJour)) / 86_400_000;
  if (days > REPERE_MAX_JOURS) {
    gaps.push(`à jour au ${r.aJour}, plus de ${REPERE_MAX_JOURS} jours : à relire`);
  }
  return gaps;
}
