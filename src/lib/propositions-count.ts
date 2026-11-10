// Nombre de propositions visé par candidat (CONTRIBUTING, Neutralité) : partagé par scripts/build-data.ts, la fiche et les tests (aucun import d'alias).

/** À relever quand chaque candidat a une proposition de plus. */
export const NB_PROPOSITIONS_PAR_CANDIDAT = 8;

/** Le manque d'un candidat sous le nombre visé, ou null s'il l'atteint. */
export function manquePropositions(count: number, cible = NB_PROPOSITIONS_PAR_CANDIDAT): string | null {
  if (count >= cible) {
    return null;
  }
  return `${count} proposition${count > 1 ? 's' : ''} sur les ${cible} retenues pour chaque candidat, pour l’instant.`;
}
