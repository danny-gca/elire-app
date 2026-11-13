import { manquePropositions, NB_PROPOSITIONS_PAR_CANDIDAT } from '../propositions-count';

describe('manquePropositions', () => {
  it('ne dit rien quand le nombre visé est atteint', () => {
    expect(manquePropositions(NB_PROPOSITIONS_PAR_CANDIDAT)).toBeNull();
    expect(manquePropositions(9, 8)).toBeNull();
  });

  it('dit le manque sous le nombre visé', () => {
    expect(manquePropositions(3, 8)).toBe('3 propositions sur les 8 retenues pour chaque candidat, pour l’instant.');
    expect(manquePropositions(0, 8)).toBe('0 proposition sur les 8 retenues pour chaque candidat, pour l’instant.');
  });
});
