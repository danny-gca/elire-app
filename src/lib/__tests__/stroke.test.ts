import { strokePath, strokeShape } from '@/lib/stroke';

describe('strokeShape', () => {
  it('trace toujours de gauche à droite, à travers tout le bouton, sans sortir loin en hauteur', () => {
    const kinds = new Set<string>();
    for (let run = 0; run < 500; run++) {
      const { kind, points, thickness } = strokeShape();
      kinds.add(kind);
      expect(points[0][0]).toBeLessThanOrEqual(0.04);
      expect(points[points.length - 1][0]).toBeGreaterThanOrEqual(0.94);
      points.forEach(([x, y], i) => {
        if (i > 0) {
          expect(x).toBeGreaterThan(points[i - 1][0]);
        }
        expect(y).toBeGreaterThan(0.25);
        expect(y).toBeLessThan(0.82);
      });
      expect(thickness).toBeLessThan(0.5);
    }
    expect(kinds.size).toBe(4);
  });

  it('donne un chemin SVG et sa longueur', () => {
    const { d, length } = strokePath(strokeShape(), 100, 60);
    expect(d.startsWith('M')).toBe(true);
    expect(length).toBeGreaterThan(90);
  });
});
