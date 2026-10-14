// Geste du surligneur sur un bouton de vote : forme tirée au hasard, toujours tracée de gauche à droite.

export type StrokeKind = 'droit' | 'diagonal' | 'ondule' | 'diagonal-ondule';

export interface StrokeShape {
  kind: StrokeKind;
  /** Points du tracé, en fractions de la largeur et de la hauteur du bouton (peuvent sortir de 0..1). */
  points: [number, number][];
  /** Épaisseur du trait, en fraction de la hauteur. */
  thickness: number;
}

const KINDS: StrokeKind[] = ['droit', 'diagonal', 'ondule', 'diagonal-ondule'];
const SAMPLES = 28;

const between = (random: () => number, min: number, max: number) => min + random() * (max - min);

export function strokeShape(random: () => number = Math.random): StrokeShape {
  const kind = KINDS[Math.floor(random() * KINDS.length)];
  const diagonal = kind === 'diagonal' || kind === 'diagonal-ondule';
  const wavy = kind === 'ondule' || kind === 'diagonal-ondule';
  // Un geste sur quatre dépasse franchement du bouton.
  const overshoot = random() < 0.25;
  const x0 = between(random, -0.06, 0.04) - (overshoot ? 0.06 : 0);
  const x1 = between(random, 0.94, 1.04) + (overshoot ? 0.06 : 0);
  const yc = between(random, 0.46, 0.6);
  // Pente montante vers la droite, en hauteur par largeur (le bouton est environ 1,5 fois plus large que haut).
  const slope = diagonal ? between(random, 0.12, 0.3) : between(random, -0.03, 0.03);
  const amplitude = wavy ? between(random, 0.035, 0.07) : 0;
  const waves = between(random, 1.2, 2.4);
  const phase = random() * Math.PI * 2;

  const points: [number, number][] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const x = x0 + (x1 - x0) * t;
    const y = yc - slope * (t - 0.5) + amplitude * Math.sin(phase + t * waves * Math.PI * 2);
    points.push([x, y]);
  }
  return { kind, points, thickness: between(random, 0.34, 0.46) };
}

/** Chemin SVG et longueur, en pixels, pour un bouton de `width` x `height`. */
export function strokePath({ points }: StrokeShape, width: number, height: number): { d: string; length: number } {
  let length = 0;
  const px = points.map(([x, y]) => [x * width, y * height] as const);
  px.forEach(([x, y], i) => {
    if (i > 0) {
      length += Math.hypot(x - px[i - 1][0], y - px[i - 1][1]);
    }
  });
  const d = px.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return { d, length };
}
