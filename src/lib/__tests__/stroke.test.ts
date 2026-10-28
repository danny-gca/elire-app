import { frameSides, polyline, LOOP_PAD, loopPath, SCRIBBLE_WIDTH, scribblePath, strokePath, strokeShape } from '@/lib/stroke';

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

describe('scribblePath', () => {
  // Hasard à graine fixe (mulberry32) : le test ne dépend plus du tirage.
  const seeded = (seed: number) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const points = (d: string) => [...d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);

  it("couvre tout l'encart, de haut en bas et de gauche à droite, sans toucher ses bords", () => {
    const random = seeded(2027);
    for (let run = 0; run < 100; run++) {
      const { d, length } = scribblePath(320, 90, random);
      const pts = points(d);
      pts.forEach(([x, y]) => {
        expect(x).toBeGreaterThanOrEqual(SCRIBBLE_WIDTH);
        expect(x).toBeLessThanOrEqual(320 - SCRIBBLE_WIDTH);
        expect(y).toBeGreaterThan(0);
        expect(y).toBeLessThan(90);
      });
      expect(Math.max(...pts.map(([x]) => x))).toBeGreaterThan(320 - SCRIBBLE_WIDTH - 12);
      // Chaque tranche de 20 px reçoit des pointes en haut et en bas : aucun blanc entre les hachures.
      const tips = [...d.matchAll(/Q(-?[\d.]+) (-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
      for (let x = SCRIBBLE_WIDTH + 40; x < 320 - SCRIBBLE_WIDTH - 40; x += 20) {
        const near = tips.filter(([px]) => px >= x && px < x + 20);
        expect(Math.min(...near.map(([, y]) => y))).toBeLessThan(90 * 0.2);
        expect(Math.max(...near.map(([, y]) => y))).toBeGreaterThan(90 * 0.8);
      }
      expect(length).toBeGreaterThan(320 * 8);
    }
  });

  it('penche ses montées : des diagonales, pas des verticales', () => {
    const tips = [...scribblePath(320, 90, seeded(2027)).d.matchAll(/Q(-?[\d.]+) (-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
    for (let i = 0; i + 1 < tips.length; i += 2) {
      // Une pointe haute, puis la pointe basse suivante, nettement à gauche : la montée penchait.
      expect(tips[i][0] - tips[i + 1][0]).toBeGreaterThan(90 * 0.3 - 11 - 1);
    }
  });
});

describe('loopPath', () => {
  const points = (d: string) => d.split(/[ML]/).filter(Boolean).map((p) => p.trim().split(' ').map(Number));

  it('part du message et entoure l\'élément sans toucher ses coins, en restant dans l\'écran', () => {
    const box = { x: 16, y: 600, width: 358, height: 120 };
    for (let run = 0; run < 200; run++) {
      const { d, length } = loopPath([300, 180], box, { width: 390, height: 844 });
      const pts = points(d);
      expect(pts[0]).toEqual([300, 180]);
      expect(length).toBeGreaterThan(900);
      pts.forEach(([x, y]) => {
        expect(x).toBeGreaterThanOrEqual(4);
        expect(x).toBeLessThanOrEqual(386);
        expect(y).toBeLessThanOrEqual(840);
      });
      // La boucle passe hors de l'élément : aucun point de la fin du tracé à l'intérieur.
      pts.slice(17).forEach(([x, y]) => {
        const inside = x > box.x + 2 && x < box.x + box.width - 2 && y > box.y + 2 && y < box.y + box.height - 2;
        expect(inside).toBe(false);
      });
    }
  });

  it('garde une marge autour d\'un petit élément', () => {
    const box = { x: 180, y: 400, width: 40, height: 40 };
    const pts = points(loopPath([200, 100], box, { width: 390, height: 844 }).d).slice(17);
    const near = Math.min(...pts.map(([x, y]) => Math.hypot(x - 200, y - 420)));
    expect(near).toBeGreaterThan(20 + LOOP_PAD * 0.6);
  });
});

describe('frameSides', () => {
  it('trace 4 côtés qui dépassent des coins, du haut dans le sens des aiguilles', () => {
    const sides = frameSides(200, 100, () => 0.5);
    expect(sides).toHaveLength(4);
    const [top, right, bottom, left] = sides;
    expect(top[0][0]).toBeLessThan(0);
    expect(top[top.length - 1][0]).toBeGreaterThan(200);
    expect(right[0][1]).toBeLessThan(0);
    expect(right[right.length - 1][1]).toBeGreaterThan(100);
    expect(bottom[0][0]).toBeGreaterThan(200);
    expect(left[left.length - 1][1]).toBeLessThan(0);
  });

  it('reste dans la marge de dessin (16 px) même sur une feuille très haute', () => {
    for (const random of [() => 0, () => 0.999, Math.random]) {
      for (const [width, height] of [[343, 1400], [720, 2400], [80, 40]]) {
        frameSides(width, height, random).flat().forEach(([x, y]) => {
          expect(x).toBeGreaterThanOrEqual(-16);
          expect(x).toBeLessThanOrEqual(width + 16);
          expect(y).toBeGreaterThanOrEqual(-16);
          expect(y).toBeLessThanOrEqual(height + 16);
        });
      }
    }
  });
});

describe('polyline', () => {
  it('écrit le tracé et mesure sa longueur', () => {
    expect(polyline([[0, 0], [3, 4], [3, 10]])).toEqual({ d: 'M0.0 0.0L3.0 4.0L3.0 10.0', length: 11 });
  });
});
