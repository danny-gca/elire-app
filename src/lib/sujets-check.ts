// Contexte complet de chaque question (onglet « Contexte ») : partagé par scripts/build-data.ts et les tests (aucun import d'alias).

/** Au-delà, un sujet est à relire : les faits datés vieillissent. */
export const SUJET_MAX_JOURS = 180;

interface SujetInput {
  aujourdhui: string;
  aJour: string;
  liens: { aveugle?: boolean }[];
}

/** Ce qui manque à un sujet : un fait daté, une source lisible pendant le vote, une relecture récente (`today` : AAAA-MM-JJ). */
export function sujetGaps(s: SujetInput, today: string): string[] {
  const gaps: string[] = [];
  if (!/\b(19|20)\d{2}\b/.test(s.aujourdhui)) {
    gaps.push('« Aujourd\'hui » sans année : un fait daté attendu');
  }
  if (s.liens.length === 0) {
    gaps.push('aucune source (liens)');
  } else if (!s.liens.some((l) => l.aveugle !== false)) {
    gaps.push('aucune source lisible pendant le vote (toutes en aveugle: false)');
  }
  const days = (Date.parse(today) - Date.parse(s.aJour)) / 86_400_000;
  if (days > SUJET_MAX_JOURS) {
    gaps.push(`à jour au ${s.aJour}, plus de ${SUJET_MAX_JOURS} jours : à relire`);
  }
  return gaps;
}
