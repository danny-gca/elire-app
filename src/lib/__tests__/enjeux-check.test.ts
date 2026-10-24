import { checkEnjeux, type EnjeuInput } from '@/lib/enjeux-check';

const props = [
  { id: 'p1', candidatId: 'a', thematiqueId: 'env' },
  { id: 'p2', candidatId: 'b', thematiqueId: 'env' },
  { id: 'p3', candidatId: 'a', thematiqueId: 'env' },
  { id: 'p4', candidatId: 'c', thematiqueId: 'eco' },
];
const themes = new Set(['env', 'eco']);
const enjeu = (id: string, positions: [string, 'pour' | 'contre'][], thematiqueId = 'env'): EnjeuInput => ({
  id,
  thematiqueId,
  positions: positions.map(([propositionId, sens]) => ({ propositionId, sens })),
});

describe('checkEnjeux', () => {
  it('accepte un enjeu à deux candidats', () => {
    expect(checkEnjeux([enjeu('ok', [['p1', 'pour'], ['p2', 'contre']])], props, themes)).toEqual([]);
  });

  it.each([
    ['proposition inconnue', [enjeu('e1', [['p1', 'pour'], ['px', 'pour']])]],
    ['une seule position', [enjeu('e1', [['p1', 'pour']])]],
    ['deux positions du même candidat', [enjeu('e1', [['p1', 'pour'], ['p3', 'pour'], ['p2', 'pour']])]],
    ['thème différent', [enjeu('e1', [['p1', 'pour'], ['p4', 'pour']])]],
    ['thème inconnu', [enjeu('e1', [['p1', 'pour'], ['p2', 'pour']], 'zzz')]],
  ])('refuse : %s', (_, enjeux) => {
    const errors = checkEnjeux(enjeux, props, themes);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.every((e) => e.includes('e1'))).toBe(true);
  });

  it('refuse une proposition dans deux enjeux', () => {
    const errors = checkEnjeux([enjeu('e1', [['p1', 'pour'], ['p2', 'pour']]), enjeu('e2', [['p1', 'pour'], ['p2', 'contre']])], props, themes);
    expect(errors.some((e) => e.includes('e2') && e.includes('p1'))).toBe(true);
  });
});
