import { revealOffset } from '@/lib/sheet-reveal';

describe('défilement de la feuille', () => {
  const base = { offset: 0, seen: 500, airBelow: 24, airAbove: 8 };

  it("ne bouge pas quand l'élément est déjà visible", () => {
    expect(revealOffset({ ...base, top: 100, height: 200 })).toBeNull();
  });

  it('descend juste assez pour montrer le bas', () => {
    expect(revealOffset({ ...base, top: 400, height: 100 })).toBe(24);
  });

  it("un élément plus haut que la feuille : s'arrête sur son haut", () => {
    expect(revealOffset({ ...base, top: 300, height: 900 })).toBe(292);
  });

  it('jamais au-dessus du début', () => {
    expect(revealOffset({ ...base, seen: 100, top: 4, height: 400 })).toBe(0);
  });
});
