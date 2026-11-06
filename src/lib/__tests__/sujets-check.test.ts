import { sujetGaps } from '@/lib/sujets-check';

const sujet = (over: object = {}) => ({
  aujourdhui: 'La loi de 2023 fixe la règle.',
  aJour: '2026-11-06',
  liens: [{}],
  ...over,
});

describe('sujetGaps', () => {
  it('ne dit rien d’un sujet complet', () => {
    expect(sujetGaps(sujet(), '2026-11-06')).toEqual([]);
  });

  it('demande un fait daté, une source visible et une relecture récente', () => {
    expect(sujetGaps(sujet({ aujourdhui: 'La règle existe.', liens: [], aJour: '2026-01-01' }), '2026-11-06')).toEqual([
      '« Aujourd\'hui » sans année : un fait daté attendu',
      'aucune source (liens)',
      'à jour au 2026-01-01, plus de 180 jours : à relire',
    ]);
    expect(sujetGaps(sujet({ liens: [{ aveugle: false }] }), '2026-11-06')).toEqual([
      'aucune source lisible pendant le vote (toutes en aveugle: false)',
    ]);
  });
});
