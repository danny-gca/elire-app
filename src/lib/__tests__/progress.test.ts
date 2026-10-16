import type { Proposition } from '@/schemas/dataset';

import { averageText, isPause, nextMilestone, notesPerCandidat, opinionCount, rankedCount } from '../progress';

const prop = (id: string, candidatId: string) => ({ id, candidatId }) as Proposition;
const props = [prop('a1', 'a'), prop('a2', 'a'), prop('b1', 'b'), prop('b2', 'b')];

describe('progress', () => {
  it('ne compte pas « Je ne sais pas » comme un avis', () => {
    expect(opinionCount({ a1: 2, a2: 0 }, { l1: 'pour' })).toBe(2);
  });

  it('classe un candidat dès 2 propositions notées, hors « Je ne sais pas »', () => {
    expect(rankedCount(props, { a1: 1, a2: -1, b1: 2, b2: 0 })).toBe(1);
  });

  it('compte les propositions notées de chaque candidat, même sans note', () => {
    expect(notesPerCandidat(props, { a1: 1, b1: 2, b2: -1 }, ['a', 'b', 'c'])).toEqual([2, 1, 0]);
    expect(averageText([2, 1, 0])).toBe('1');
    expect(averageText([1, 0, 0])).toBe('0,3');
  });

  it('annonce le Classement, puis le bilan de dix votes', () => {
    expect(nextMilestone(6, 0, 17)).toEqual({ lead: 'Classement dans', value: 4, text: 'votes', ratio: 0.6 });
    expect(nextMilestone(9, 0, 17).text).toBe('vote');
    expect(nextMilestone(13, 9, 17)).toEqual({ lead: 'Bilan dans', value: 7, text: 'votes', side: '9 candidats classés sur 17', ratio: 0.3 });
    expect(nextMilestone(20, 1, 17)).toMatchObject({ lead: 'Bilan dans', value: 10, text: 'votes', side: '1 candidat classé sur 17', ratio: 0 });
  });

  it('marque une pause à chaque dizaine dès 10 avis', () => {
    expect([9, 10, 15, 20].map(isPause)).toEqual([false, true, false, true]);
  });
});
