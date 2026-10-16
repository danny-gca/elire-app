import { competitionRanks, computeScores, loiPoints, reliabilityOf, scoreCandidat, scoreDetail, type LoiBallot, type VoteValue } from '@/lib/scoring';
import type { Candidat, Loi, Proposition, VoteCandidatLoi } from '@/schemas/dataset';

const candidat = (id: string, nom = id): Candidat => ({
  id,
  nom,
  partiId: 'p',
  avatar: 'XX',
  candidature: { statut: 'declaree', date: '2026-01-01', sourceUrl: 'https://exemple.fr' },
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

describe('fiabilité', () => {
  it('compte une proposition ou un vote personnel pour 1, un vote de groupe pour ½', () => {
    const lois = [
      { id: 'l1', votes: { a: { position: 'pour', typeVote: 'individuel' } } },
      { id: 'l2', votes: { a: { position: 'contre', typeVote: 'groupe_parti' } } },
    ] as unknown as Loi[];
    const s = scoreCandidat(candidat('a'), props, { a1: 1, a2: 0 }, { lois, votes: { l1: 'pour', l2: 'pour' } });
    expect(s.evidence).toBe(2.5);
    expect(s.reliability).toBeNull();
  });

  it('passe de fragile à fiable, atteignable avec le programme seul', () => {
    expect([2, 3, 4.5, 5, 6].map(reliabilityOf)).toEqual(['fragile', 'moyen', 'moyen', 'fiable', 'fiable']);
  });
});

describe('scoreCandidat', () => {
  it('renvoie null sans vote', () => {
    expect(scoreCandidat(candidat('a'), props, {})).toMatchObject({ score: null, totalVotes: 0, ranked: false });
  });

  it('ramène -2..+2 sur 0..100', () => {
    expect(scoreCandidat(candidat('a'), props, { a1: 2, a2: 2 }).score).toBe(100);
    expect(scoreCandidat(candidat('a'), props, { a1: -2, a2: -2 }).score).toBe(0);
    expect(scoreCandidat(candidat('a'), props, { a1: 1, a2: -1 }).score).toBe(50);
    expect(scoreCandidat(candidat('a'), props, { a1: 1 }).score).toBe(75);
  });

  it('ne compte pas « Je ne sais pas », ni dans le score ni pour être classé', () => {
    expect(scoreCandidat(candidat('a'), props, { a1: 0, a2: 0 })).toMatchObject({ score: null, totalVotes: 0, ranked: false });
    expect(scoreCandidat(candidat('a'), props, { a1: 2, a2: 0 })).toMatchObject({ score: 100, ranked: false });
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

  it('à score égal, laisse le hasard décider, même face à un score plus fiable', () => {
    const more = [...props, prop('b3', 'b')];
    const votes = { a1: 2, a2: 2, b1: 2, b2: 2, b3: 2 } as const;
    const tie = new Map([['a', 0], ['b', 1]]);
    const scores = computeScores([candidat('a'), candidat('b')], more, votes, tie);
    expect(scores.map((s) => s.candidat.id)).toEqual(['a', 'b']);
    expect(competitionRanks(scores)).toEqual([1, 1]);
  });

  it('donne le même rang aux scores égaux', () => {
    const scores = computeScores([candidat('a'), candidat('b'), candidat('c')], props, { a1: 2, a2: 2, b1: 2, b2: 2, c1: -2 });
    expect(competitionRanks(scores)).toEqual([1, 1, 3]);
  });
});

const loi = (id: string, votes: Record<string, Pick<VoteCandidatLoi, 'position' | 'typeVote'>>): Loi => ({
  id,
  ref: 'L-01',
  thematiqueId: 't',
  nature: 'projet_loi',
  titre: 'titre',
  question: 'question ?',
  enjeu: 'enjeu',
  resume: 'resume',
  chambre: 'assemblee_nationale',
  dateVote: '2024-01-01',
  statut: 'adoptee',
  sourceOfficielleUrl: 'https://exemple.fr/scrutin',
  votes: Object.fromEntries(Object.entries(votes).map(([k, v]) => [k, { ...v, sourceUrl: 'https://exemple.fr/scrutin' }])),
});

const lois = [
  loi('l1', { a: { position: 'pour', typeVote: 'individuel' }, b: { position: 'contre', typeVote: 'groupe_parti' } }),
  loi('l2', { a: { position: 'abstention', typeVote: 'individuel' } }),
];

describe('votes sur les lois', () => {
  it('donne +2 à la même position, -2 à l\'inverse, 0 avec une abstention', () => {
    expect(loiPoints('pour', 'pour')).toBe(2);
    expect(loiPoints('contre', 'pour')).toBe(-2);
    expect(loiPoints('abstention', 'pour')).toBe(0);
    expect(loiPoints('pour', 'abstention')).toBe(0);
  });

  it('combine propositions et scrutins dans un seul score', () => {
    const s = scoreCandidat(candidat('a'), props, { a1: 1, a2: -1 }, { lois, votes: { l1: 'pour' } });
    // (0 + 2) sur un maximum de 4 + 2 : 67 %
    expect(s.score).toBe(67);
    expect(s.programme).toEqual({ score: 50, count: 2 });
    expect(s.parlement).toMatchObject({ score: 100, count: 1, groupCount: 0 });
  });

  it('compte un vote de groupe à moitié', () => {
    const s = scoreCandidat(candidat('b'), props, { b1: 2, b2: 2 }, { lois, votes: { l1: 'pour' } });
    // (4 - 1) sur un maximum de 4 + 1 : 80 %
    expect(s.score).toBe(80);
    expect(s.parlement.groupCount).toBe(1);
  });

  it("n'enlève aucun point à un candidat qui n'a pas voté le scrutin", () => {
    const s = scoreCandidat(candidat('c'), props, { c1: 2 }, { lois, votes: { l1: 'contre', l2: 'pour' } });
    expect(s.score).toBe(100);
    expect(s.parlement.count).toBe(0);
    expect(s.seated).toBe(false);
  });

  it("ne compte pas l'abstention du lecteur, ni dans le score ni dans la fiabilité", () => {
    const s = scoreCandidat(candidat('a'), props, { a1: 2, a2: 2 }, { lois, votes: { l1: 'abstention' } });
    expect(s.score).toBe(100);
    expect(s.parlement.count).toBe(0);
    expect(s.evidence).toBe(2);
  });

  it('plafonne la part du Parlement à la moitié du score', () => {
    const many = Array.from({ length: 6 }, (_, i) => loi(`m${i}`, { a: { position: 'pour', typeVote: 'individuel' } }));
    const votes = Object.fromEntries(many.map((l) => [l.id, 'pour' as const]));
    const s = scoreCandidat(candidat('a'), props, { a1: -2, a2: -2 }, { lois: many, votes });
    // Programme 0 %, Parlement 100 % : au nombre, le Parlement pèserait 12 sur 16 (75 %) ; plafonné, moitié chacun.
    expect(s.score).toBe(50);
  });

  it('ne classe pas un candidat sur ses seuls votes au Parlement', () => {
    const s = scoreCandidat(candidat('a'), props, {}, { lois, votes: { l1: 'pour', l2: 'pour' } });
    expect(s.score).toBe(75);
    expect(s.ranked).toBe(false);
  });
});

describe('scoreDetail', () => {
  it('détaille le même score que scoreCandidat', () => {
    const cases: { c: string; votes: Record<string, VoteValue>; ballot?: LoiBallot }[] = [
      { c: 'a', votes: { a1: 1, a2: -1 }, ballot: { lois, votes: { l1: 'pour' as const, l2: 'pour' as const } } },
      { c: 'b', votes: { b1: 2, b2: 2 }, ballot: { lois, votes: { l1: 'pour' as const } } },
      { c: 'a', votes: {}, ballot: { lois, votes: { l1: 'contre' as const } } },
      { c: 'c', votes: { c1: 2 } },
    ];
    for (const { c, votes, ballot } of cases) {
      expect(scoreDetail(candidat(c), props, votes, ballot).score).toBe(scoreCandidat(candidat(c), props, votes, ballot).score);
    }
  });

  it('regroupe les notes et les scrutins par points', () => {
    const d = scoreDetail(candidat('a'), props, { a1: 2, a2: 2 }, { lois, votes: { l1: 'pour', l2: 'pour' } });
    expect(d.programme).toEqual({ rows: [{ value: 2, count: 2 }], sum: 4, max: 4 });
    expect(d.parlement).toEqual({ rows: [{ points: 2, weight: 1, count: 1 }, { points: 0, weight: 1, count: 1 }], sum: 2, max: 4 });
    expect(d.share).toBe(0.5);
  });

  it('compte un vote de groupe à moitié', () => {
    const d = scoreDetail(candidat('b'), props, { b1: 2 }, { lois, votes: { l1: 'pour' } });
    expect(d.parlement).toEqual({ rows: [{ points: -2, weight: 0.5, count: 1 }], sum: -1, max: 1 });
  });
});
