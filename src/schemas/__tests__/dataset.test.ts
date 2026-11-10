import raw from '@/data/dataset.json';
import { CandidatSourceSchema, DatasetSchema } from '@/schemas/dataset';
import { enjeux, getSujet, lois, propositions } from '@/services/dataset';

describe('dataset.json', () => {
  it('respecte le schéma (régénérer avec npm run build:data)', () => {
    expect(() => DatasetSchema.parse(raw)).not.toThrow();
  });

  it('donne un onglet « Contexte » à chaque proposition, scrutin et question commune', () => {
    const sansSujet = [...propositions, ...lois, ...enjeux].filter((x) => !getSujet(x.id)).map((x) => x.id);
    expect(sansSujet).toEqual([]);
  });

  it('accepte un candidat sans parti', () => {
    const candidat = {
      id: 'sans-parti',
      nom: 'Sans Parti',
      avatar: 'SP',
      biographie: 'Bio.',
      candidature: { statut: 'annoncee', date: '2026-11-09', sourceUrl: 'https://exemple.fr' },
      programme: { statut: 'aucun' },
    };
    expect(CandidatSourceSchema.safeParse(candidat).success).toBe(true);
  });
});
