import raw from '@/data/dataset.json';
import type { Dataset, Enjeu, Loi, Sujet, VoteCandidatLoi } from '@/schemas/dataset';

// Données publiques embarquées dans le bundle : accès synchrone, déjà validées par build:data.
const dataset = raw as unknown as Dataset;

export const { metadata, partis, thematiques, candidats, propositions, lois, enjeux, glossaire, mots, sujets } = dataset;
/** Propositions posées seules dans Voter ; les autres passent par leur enjeu. */
export const soloPropositions = propositions.filter((p) => !p.enjeuId);
/** Ce qu'on vote dans Voter, hors scrutins : une proposition seule ou un enjeu. */
export const questions: { id: string; thematiqueId: string }[] = [...soloPropositions, ...enjeux];
const enjeuxById = new Map(enjeux.map((e) => [e.id, e]));

export function getEnjeu(id: string): Enjeu | undefined {
  return enjeuxById.get(id);
}

// Chaque proposition, scrutin ou question commune pointe vers son sujet (sujetId, contrôlé au build).
const sujetsById = new Map(sujets.map((s) => [s.id, s]));
// Une proposition d'une question commune prend le sujet de la question.
const sujetIdByItem = new Map<string, string | undefined>([
  ...lois.map((l) => [l.id, l.sujetId] as const),
  ...enjeux.map((e) => [e.id, e.sujetId] as const),
  ...propositions.map((p) => [p.id, p.sujetId ?? (p.enjeuId ? enjeuxById.get(p.enjeuId)?.sujetId : undefined)] as const),
]);

/** Sujet de l'onglet « Contexte » d'une proposition, d'un scrutin ou d'une question commune. */
export function getSujet(itemId: string): Sujet | undefined {
  const sujetId = sujetIdByItem.get(itemId);
  return sujetId ? sujetsById.get(sujetId) : undefined;
}

const candidatsById = new Map(candidats.map((c) => [c.id, c]));
const thematiquesById = new Map(thematiques.map((t) => [t.id, t]));

export function getCandidat(id: string) {
  return candidatsById.get(id);
}

export function getThematique(id: string) {
  return thematiquesById.get(id);
}

export function getPropositionsByCandidat(candidatId: string) {
  return propositions.filter((p) => p.candidatId === candidatId);
}

export function getLoisByCandidat(candidatId: string): { loi: Loi; vote: VoteCandidatLoi }[] {
  return lois.filter((l) => l.votes[candidatId]).map((l) => ({ loi: l, vote: l.votes[candidatId] }));
}
