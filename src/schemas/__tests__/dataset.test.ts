import raw from '@/data/dataset.json';
import { DatasetSchema } from '@/schemas/dataset';
import { enjeux, getSujet, lois, propositions } from '@/services/dataset';

describe('dataset.json', () => {
  it('respecte le schéma (régénérer avec npm run build:data)', () => {
    expect(() => DatasetSchema.parse(raw)).not.toThrow();
  });

  it('donne un onglet « Contexte » à chaque proposition, scrutin et question commune', () => {
    const sansSujet = [...propositions, ...lois, ...enjeux].filter((x) => !getSujet(x.id)).map((x) => x.id);
    expect(sansSujet).toEqual([]);
  });
});
