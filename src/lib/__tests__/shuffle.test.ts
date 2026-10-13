import { balancedOrder, fisherYates } from '@/lib/shuffle';
import { propositions } from '@/services/dataset';

describe('fisherYates', () => {
  it('garde les mêmes éléments', () => {
    const items = [1, 2, 3, 4, 5];
    expect(fisherYates(items).sort()).toEqual(items);
  });

  it('ne modifie pas le tableau source', () => {
    const items = [1, 2, 3];
    fisherYates(items);
    expect(items).toEqual([1, 2, 3]);
  });
});

describe('balancedOrder', () => {
  it('contient chaque proposition une fois', () => {
    const order = balancedOrder(propositions);
    expect(new Set(order).size).toBe(propositions.length);
  });

  it("n'enchaîne jamais deux propositions du même candidat", () => {
    const byId = new Map(propositions.map((p) => [p.id, p]));
    for (let run = 0; run < 500; run++) {
      const order = balancedOrder(propositions);
      for (let i = 1; i < order.length; i++) {
        expect(byId.get(order[i])!.candidatId).not.toBe(byId.get(order[i - 1])!.candidatId);
      }
    }
  });
});
