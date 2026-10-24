import { cosine, normalize, opposedVerbs } from '@/lib/similarity';

describe('similarité des propositions', () => {
  it('garde les racines des mots utiles, sans chiffres ni mots vides', () => {
    const words = normalize('Construire 20 réacteurs nucléaires de nouvelle génération');
    expect(words).toEqual(expect.arrayContaining(['reacte', 'nuclea']));
    expect(words).not.toContain('20');
    expect(words).not.toContain('de');
  });

  it('vaut 1 pour deux textes identiques et 0 sans mot commun', () => {
    const idf = new Map([['reacte', 1], ['nuclea', 1], ['eolien', 1]]);
    expect(cosine(['reacte', 'nuclea'], ['reacte', 'nuclea'], idf)).toBeCloseTo(1);
    expect(cosine(['reacte', 'nuclea'], ['eolien'], idf)).toBe(0);
  });

  it('repère deux verbes opposés, pas deux verbes identiques', () => {
    expect(opposedVerbs(normalize('Construire des réacteurs'), normalize('Fermer des réacteurs'))).toBe(true);
    expect(opposedVerbs(normalize('Construire des réacteurs'), normalize('Construire des éoliennes'))).toBe(false);
  });
});
