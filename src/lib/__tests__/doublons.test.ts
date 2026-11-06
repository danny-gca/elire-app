import { closeQuestions } from '@/lib/doublons';

const items = [
  { ref: 'L-18', text: "Faut-il ratifier l'accord commercial entre l'Union européenne et le Canada ?" },
  { ref: 'L-32', text: "Faut-il ratifier l'accord commercial entre l'Union européenne et le Canada ?" },
  { ref: 'P-100', text: 'Construire des places de prison supplémentaires' },
  { ref: 'P-200', text: 'Baisser la TVA sur les produits de première nécessité' },
];

describe('closeQuestions', () => {
  it('signale deux questions identiques, pas deux sujets différents', () => {
    expect(closeQuestions(items)).toEqual([{ a: 'L-18', b: 'L-32', score: expect.closeTo(1) }]);
  });

  it('ignore une paire relue et gardée, dans un sens ou dans l’autre', () => {
    expect(closeQuestions(items, [['L-32', 'L-18']])).toEqual([]);
  });
});
