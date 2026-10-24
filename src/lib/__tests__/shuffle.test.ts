import { balancedOrder, fisherYates, interleaveLois, questionOrder } from '@/lib/shuffle';
import type { Proposition } from '@/schemas/dataset';
import { lois, propositions } from '@/services/dataset';

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
  it('donne 2 propositions à chaque candidat dans les premiers tours', () => {
    const byId = new Map(propositions.map((p) => [p.id, p]));
    const candidats = new Set(propositions.map((p) => p.candidatId));
    for (let run = 0; run < 100; run++) {
      const first = balancedOrder(propositions).slice(0, 2 * candidats.size);
      const counts = new Map<string, number>();
      first.forEach((id) => counts.set(byId.get(id)!.candidatId, (counts.get(byId.get(id)!.candidatId) ?? 0) + 1));
      expect([...counts.values()].every((n) => n === 2)).toBe(true);
      expect(counts.size).toBe(candidats.size);
    }
  });
});

describe('interleaveLois', () => {
  const loiIds = new Set(lois.map((l) => l.id));

  it('ajoute chaque scrutin une fois, sans jamais en enchaîner deux', () => {
    for (let run = 0; run < 200; run++) {
      const order = interleaveLois(balancedOrder(propositions), [...loiIds]);
      expect(order).toHaveLength(propositions.length + loiIds.size);
      expect(new Set(order).size).toBe(order.length);
      for (let i = 1; i < order.length; i++) {
        expect(loiIds.has(order[i]) && loiIds.has(order[i - 1])).toBe(false);
      }
    }
  });

  it('ne touche pas au début déjà voté', () => {
    const base = balancedOrder(propositions);
    const order = interleaveLois(base, [...loiIds], { from: 10 });
    expect(order.slice(0, 10)).toEqual(base.slice(0, 10));
  });
});

describe('questionOrder', () => {
  const solo = Array.from({ length: 30 }, (_, i) => ({ id: `p${i}`, candidatId: `c${i % 6}`, thematiqueId: `t${i % 4}` }) as Proposition);
  const enjeuIds = ['e1', 'e2', 'e3', 'e4', 'e5'];
  const loiIds = ['l1', 'l2', 'l3', 'l4', 'l5', 'l6'];

  it('intercale enjeux et scrutins : jamais deux enjeux de suite, jamais un scrutin collé à un enjeu', () => {
    for (let run = 0; run < 50; run++) {
      const order = questionOrder(solo, enjeuIds, loiIds);
      expect([...order].sort()).toEqual([...solo.map((p) => p.id), ...enjeuIds, ...loiIds].sort());
      order.forEach((id, i) => {
        const next = order[i + 1];
        if (enjeuIds.includes(id) && next) {
          expect(enjeuIds.includes(next) || loiIds.includes(next)).toBe(false);
        }
        if (loiIds.includes(id) && next) {
          expect(enjeuIds.includes(next)).toBe(false);
        }
      });
    }
  });

  it('répartit les scrutins sur toute la série, sans les entasser à la fin', () => {
    const many = Array.from({ length: 152 }, (_, i) => ({ id: `p${i}`, candidatId: `c${i % 25}`, thematiqueId: `t${i % 12}` }) as Proposition);
    const enjeux = Array.from({ length: 17 }, (_, i) => `e${i}`);
    const scrutins = Array.from({ length: 42 }, (_, i) => `l${i}`);
    let last20 = 0;
    for (let run = 0; run < 100; run++) {
      last20 += questionOrder(many, enjeux, scrutins).slice(-20).filter((id) => id.startsWith('l')).length;
    }
    // Régulier : 42 scrutins sur 211 questions, environ 4 dans les 20 dernières.
    expect(last20 / 100).toBeLessThan(6);
  });
});
