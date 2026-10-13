import { competitionRanks, computeScores, scoreCandidat } from '@/lib/scoring';
import type { Candidat, Proposition } from '@/schemas/dataset';

const candidat = (id: string, nom = id): Candidat => ({
  id,
  nom,
  partiId: 'p',
  avatar: 'XX',
  biographie: 'bio',
  parti: 'Parti',
  couleurParti: '#000000',
});

const prop = (id: string, candidatId: string): Proposition => ({
  id,
  ref: 'P-100',
  candidatId,
  thematiqueId: 't',
  titre: 'titre',
  description: 'desc',
  sourceUrl: 'https://exemple.fr/doc',
  dateDeclaration: '2024-01-01',
  contexte: 'ctx',
});

const props = [prop('a1', 'a'), prop('a2', 'a'), prop('b1', 'b'), prop('b2', 'b'), prop('c1', 'c')];

describe('scoreCandidat', () => {
  it('renvoie null sans vote', () => {
    expect(scoreCandidat(candidat('a'), props, {})).toMatchObject({ score: null, totalVotes: 0, ranked: false });
  });

  it('ramène -2..+2 sur 0..100', () => {
    expect(scoreCandidat(candidat('a'), props, { a1: 2, a2: 2 }).score).toBe(100);
    expect(scoreCandidat(candidat('a'), props, { a1: -2, a2: -2 }).score).toBe(0);
    expect(scoreCandidat(candidat('a'), props, { a1: 0, a2: 0 }).score).toBe(50);
    expect(scoreCandidat(candidat('a'), props, { a1: 1 }).score).toBe(75);
  });

  it('ne classe pas en dessous de 2 votes', () => {
    expect(scoreCandidat(candidat('a'), props, { a1: 2 }).ranked).toBe(false);
    expect(scoreCandidat(candidat('a'), props, { a1: 2, a2: 1 }).ranked).toBe(true);
  });
});

describe('computeScores', () => {
  it('place les non évalués après les candidats notés, même négatifs', () => {
    const result = computeScores([candidat('c'), candidat('a'), candidat('b')], props, { a1: -2, a2: -2, b1: 2, b2: 1 });
    expect(result.map((s) => s.candidat.id)).toEqual(['b', 'a', 'c']);
  });

  it("départage les égalités par l'ordre fourni, pas par le nom", () => {
    const votes = { a1: 1, a2: 1, b1: 1, b2: 1 } as const;
    const tie = new Map([['b', 0], ['a', 1]]);
    expect(computeScores([candidat('a', 'Alpha'), candidat('b', 'Beta')], props, votes, tie).map((s) => s.candidat.id)).toEqual(['b', 'a']);
  });

  it('donne le même rang aux scores égaux', () => {
    const scores = computeScores([candidat('a'), candidat('b'), candidat('c')], props, { a1: 2, a2: 2, b1: 2, b2: 2, c1: -2 });
    expect(competitionRanks(scores)).toEqual([1, 1, 3]);
  });
});
