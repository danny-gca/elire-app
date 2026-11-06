import { contexteStats, thinContexte, usefulContext } from '@/lib/contexte';

describe('usefulContext', () => {
  it('retire la phrase qui nomme le document, sans couper « p. 8 »', () => {
    expect(usefulContext('Programme présidentiel 2022, p. 8. Concerne aussi la fibre.')).toBe('Concerne aussi la fibre.');
    expect(usefulContext('Programme, chap. 9, p. 73.')).toBe('');
  });

  it('garde une longue première phrase, qui décrit déjà la mesure', () => {
    const contexte = 'Programme 2027, p. 21, mesure pour sortir un million de personnes de la précarité énergétique.';
    expect(usefulContext(contexte)).toBe(contexte.slice(40).trim());
  });
});

describe('contexteStats', () => {
  const stats = contexteStats([
    { ref: 'a', kind: 'P', precisions: 'Programme, p. 2. ' + 'X'.repeat(100) },
    { ref: 'b', kind: 'P', precisions: 'Programme, p. 2. ' + 'X'.repeat(100) },
    { ref: 'c', kind: 'P', precisions: 'Programme, p. 2. ' + 'X'.repeat(20) },
    { ref: 'd', kind: 'L', precisions: 'y'.repeat(50), sujet: 'Aujourd’hui En débat' },
  ]);

  it('rapporte chaque question à la médiane de son type', () => {
    expect(stats.map((s) => [s.ref, s.precisions, s.part])).toEqual([
      ['a', 100, 100],
      ['b', 100, 100],
      ['c', 20, 20],
      ['d', 50, 100],
    ]);
    expect(stats[3].sujet).toBeGreaterThan(0);
  });

  it('signale les précisions sous la moitié de la médiane', () => {
    expect(thinContexte(stats).map((s) => s.ref)).toEqual(['c']);
  });
});
