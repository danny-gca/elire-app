import { effectiveVotes, enjeuTally, tallyText, voteTarget } from '@/lib/enjeux';
import type { Enjeu, Proposition } from '@/schemas/dataset';

const prop = (id: string, link?: { enjeuId: string; sens: 'pour' | 'contre' }) => ({ id, ...link }) as Proposition;
const props = [prop('p1', { enjeuId: 'e1', sens: 'pour' }), prop('p2', { enjeuId: 'e1', sens: 'contre' }), prop('seule')];
const e1 = {
  id: 'e1',
  positions: [
    { propositionId: 'p1', sens: 'pour' },
    { propositionId: 'p3', sens: 'pour' },
    { propositionId: 'p2', sens: 'contre' },
  ],
} as Enjeu;

describe('enjeux', () => {
  it('donne la note de la question au « pour » et son inverse au « contre »', () => {
    expect(effectiveVotes({ e1: 2, seule: -1 }, props)).toEqual({ p1: 2, p2: -2, seule: -1 });
  });

  it('« Je ne sais pas » sur la question ne compte pour personne', () => {
    expect(effectiveVotes({ e1: 0 }, props)).toEqual({ p1: 0, p2: 0 });
  });

  it("ignore l'ancien vote d'une proposition passée dans un enjeu", () => {
    expect(effectiveVotes({ p2: 1 }, props)).toEqual({});
  });

  it('corrige un vote de proposition par sa question, retournée pour un « contre »', () => {
    expect(voteTarget(props[1])).toEqual({ key: 'e1', sign: -1 });
    expect(voteTarget(props[0])).toEqual({ key: 'e1', sign: 1 });
    expect(voteTarget(props[2])).toEqual({ key: 'seule', sign: 1 });
  });

  it('compte ceux qui pensent comme le lecteur et ceux qui pensent l’inverse', () => {
    expect(enjeuTally(e1, 2)).toEqual({ agree: 2, opposite: 1 });
    expect(enjeuTally(e1, -1)).toEqual({ agree: 1, opposite: 2 });
    expect(enjeuTally(e1, 0)).toEqual({ agree: 0, opposite: 0 });
  });
});

describe('tallyText', () => {
  it('accorde au singulier et au pluriel', () => {
    expect(tallyText({ agree: 3, opposite: 2 })).toBe('3 pensent comme vous, 2 à l’inverse');
    expect(tallyText({ agree: 1, opposite: 0 })).toBe('1 pense comme vous');
    expect(tallyText({ agree: 0, opposite: 2 })).toBe('2 pensent l’inverse de vous');
  });
});
