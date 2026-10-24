import { signedAverage, themeAverages } from '@/lib/themes';
import type { Proposition, Thematique } from '@/schemas/dataset';

const theme = (id: string, titre: string) => ({ id, titre }) as Thematique;
const prop = (id: string, thematiqueId: string) => ({ id, thematiqueId }) as Proposition;

describe('thèmes', () => {
  const thematiques = [theme('a', 'Agriculture'), theme('b', 'Budget'), theme('c', 'Culture'), theme('d', 'Défense')];
  const propositions = [prop('a1', 'a'), prop('a2', 'a'), prop('b1', 'b'), prop('c1', 'c'), prop('d1', 'd')];

  it('trie par moyenne, pas par somme, et ignore « Je ne sais pas »', () => {
    const result = themeAverages(thematiques, propositions, { a1: 1, a2: 1, b1: 2, c1: -1, d1: 0 });
    expect(result.map((t) => [t.thematique.id, t.average, t.count])).toEqual([
      ['b', 2, 1],
      ['a', 1, 2],
      ['c', -1, 1],
      ['d', null, 0],
    ]);
  });

  it('écrit la moyenne avec son signe et une décimale', () => {
    expect([1.44, -0.5, 0, 2].map(signedAverage)).toEqual(['+1,4', '-0,5', '0', '+2']);
  });

  it("départage les égalités par le nom du thème", () => {
    const result = themeAverages(thematiques, propositions, { c1: 1, b1: 1 });
    expect(result.map((t) => t.thematique.id)).toEqual(['b', 'c', 'a', 'd']);
  });
});
