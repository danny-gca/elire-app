import { acronymsIn, unexplainedInTitle } from '../glossary';

describe('acronymsIn', () => {
  it('trouve les sigles une fois, dans l\'ordre, avec chiffres et accents', () => {
    expect(acronymsIn('Le CETA et la PAC', 'encore le CETA, 6 EPR2 et l\'ÉTAT')).toEqual(['CETA', 'PAC', 'EPR2', 'ÉTAT']);
  });

  it('ignore les mots en minuscules et les capitales isolées', () => {
    expect(acronymsIn("Sortir de l'Otan à 64 ans, A69")).toEqual([]);
  });
});

describe('unexplainedInTitle', () => {
  it('admet les sigles du quotidien et ceux entre parenthèses', () => {
    expect(unexplainedInTitle('Baisser la TVA et sortir de l\'Alliance atlantique (OTAN)')).toEqual([]);
  });

  it('signale un sigle laissé seul', () => {
    expect(unexplainedInTitle("Sortir de l'OTAN")).toEqual(['OTAN']);
  });
});
