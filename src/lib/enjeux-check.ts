// Cohérence de data/enjeux.json avec les propositions : partagé par scripts/build-data.ts et les tests (aucun import d'alias).

export interface EnjeuInput {
  id: string;
  thematiqueId: string;
  positions: { propositionId: string; sens: 'pour' | 'contre' }[];
}

interface PropositionInput {
  id: string;
  candidatId: string;
  thematiqueId: string;
}

/** Messages d'erreur, chacun nommant l'enjeu : une proposition dans un enjeu au plus, 2 candidats au moins, un thème commun. */
export function checkEnjeux(enjeux: readonly EnjeuInput[], propositions: readonly PropositionInput[], thematiqueIds: ReadonlySet<string>): string[] {
  const errors: string[] = [];
  const byId = new Map(propositions.map((p) => [p.id, p]));
  const linked = new Map<string, string>();
  for (const enjeu of enjeux) {
    const where = `enjeux.json ${enjeu.id}`;
    if (!thematiqueIds.has(enjeu.thematiqueId)) {
      errors.push(`${where} : thématique inconnue "${enjeu.thematiqueId}"`);
    }
    const candidats = new Set<string>();
    for (const { propositionId } of enjeu.positions) {
      const p = byId.get(propositionId);
      if (!p) {
        errors.push(`${where} : proposition inconnue "${propositionId}"`);
        continue;
      }
      if (linked.has(propositionId)) {
        errors.push(`${where} : "${propositionId}" est déjà dans l'enjeu ${linked.get(propositionId)}`);
      }
      linked.set(propositionId, enjeu.id);
      if (candidats.has(p.candidatId)) {
        errors.push(`${where} : deux positions de ${p.candidatId}`);
      }
      candidats.add(p.candidatId);
      if (p.thematiqueId !== enjeu.thematiqueId) {
        errors.push(`${where} : "${propositionId}" est dans le thème ${p.thematiqueId}`);
      }
    }
    if (candidats.size < 2) {
      errors.push(`${where} : au moins 2 candidats attendus`);
    }
    // Que des « contre » : la question est posée à l'envers, personne ne la porte.
    if (!enjeu.positions.some((p) => p.sens === 'pour')) {
      errors.push(`${where} : au moins une position « pour » attendue`);
    }
  }
  return errors;
}
