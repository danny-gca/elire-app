import raw from '@/data/dataset.json';
import type { Dataset, Loi, VoteCandidatLoi } from '@/schemas/dataset';

// Données publiques embarquées dans le bundle : accès synchrone, déjà validées par build:data.
const dataset = raw as unknown as Dataset;

export const { metadata, partis, thematiques, candidats, propositions, lois } = dataset;

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
