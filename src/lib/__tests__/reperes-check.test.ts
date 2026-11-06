import { repereGaps, withoutRepere } from '@/lib/reperes-check';

const repere = (over: object = {}) => ({
  id: 'r',
  aujourdhui: 'La loi de 2023 fixe la règle.',
  aJour: '2026-11-06',
  liens: [{}],
  propositions: ['prop-a'],
  lois: ['loi-b'],
  enjeux: [],
  ...over,
});

describe('withoutRepere', () => {
  it('liste les questions qu’aucun repère ne couvre', () => {
    expect(withoutRepere(['prop-a', 'loi-b', 'enjeu-c'], [repere()])).toEqual(['enjeu-c']);
  });
});

describe('repereGaps', () => {
  it('ne dit rien d’un repère complet', () => {
    expect(repereGaps(repere(), '2026-11-06')).toEqual([]);
  });

  it('demande un fait daté, une source visible et une relecture récente', () => {
    expect(repereGaps(repere({ aujourdhui: 'La règle existe.', liens: [], aJour: '2026-01-01' }), '2026-11-06')).toEqual([
      '« Aujourd\'hui » sans année : un fait daté attendu',
      'aucune source (liens)',
      'à jour au 2026-01-01, plus de 180 jours : à relire',
    ]);
    expect(repereGaps(repere({ liens: [{ aveugle: false }] }), '2026-11-06')).toEqual([
      'aucune source lisible pendant le vote (toutes en aveugle: false)',
    ]);
  });
});
