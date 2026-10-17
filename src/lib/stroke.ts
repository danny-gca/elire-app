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

/** Épaisseur du gribouillis, en pixels. */
export const SCRIBBLE_WIDTH = 16;

/**
 * Gribouillis d'un seul geste sur un encart, de gauche à droite : des hachures serrées et penchées
 * (une montée en biais, une descente qui revient presque au même endroit) qui couvrent tout le texte, pointes arrondies.
 */
export function scribblePath(width: number, height: number, random: () => number = Math.random): { d: string; length: number } {
  const inset = SCRIBBLE_WIDTH;
  const clampY = (y: number) => Math.min(height - inset / 2, Math.max(inset / 2, y));
  const top = () => clampY(between(random, 0.02, 0.14) * height);
  const bottom = () => clampY(between(random, 0.86, 0.98) * height);
  const points: [number, number][] = [];
  let x = inset + between(random, 0, 4);
  points.push([x, bottom()]);
  while (true) {
    // La montée penche à droite, la descente revient : on avance de 7 à 11 px par hachure, le trait de 16 px se recouvre.
    const slant = between(random, 0.3, 0.42) * height;
    if (x + slant > width - inset) {
      // Dernière montée jusqu'au bord droit : rien ne reste blanc au bout.
      points.push([width - inset, top()]);
      break;
    }
    points.push([x + slant, top()]);
    x += between(random, 7, 11);
    points.push([x, bottom()]);
  }
  // Pointes arrondies au bout : on coupe chaque coin d'un sixième de segment par une courbe.
  const toward = (a: [number, number], b: [number, number], f: number): [number, number] => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  const fmt = ([px, py]: [number, number]) => `${px.toFixed(1)} ${py.toFixed(1)}`;
  let d = `M${fmt(points[0])}`;
  let length = 0;
  let from = points[0];
  const lineTo = (to: [number, number]) => {
    d += ` L${fmt(to)}`;
    length += Math.hypot(to[0] - from[0], to[1] - from[1]);
    from = to;
  };
  for (let i = 1; i < points.length - 1; i++) {
    const tip = points[i];
    const enter = toward(tip, points[i - 1], 0.16);
    const leave = toward(tip, points[i + 1], 0.16);
    lineTo(enter);
    d += ` Q${fmt(tip)} ${fmt(leave)}`;
    let prev = from;
    for (let k = 1; k <= 6; k++) {
      const t = k / 6;
      const u = 1 - t;
      const pt: [number, number] = [u * u * enter[0] + 2 * u * t * tip[0] + t * t * leave[0], u * u * enter[1] + 2 * u * t * tip[1] + t * t * leave[1]];
      length += Math.hypot(pt[0] - prev[0], pt[1] - prev[1]);
      prev = pt;
    }
    from = leave;
  }
  lineTo(points[points.length - 1]);
  return { d, length };
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Marge du trait autour de l'élément entouré, en pixels. */
export const LOOP_PAD = 14;

/**
 * Le trait d'un tuto : part du message (`from`), descend vers l'élément et l'entoure d'une boucle à main levée.
 * La boucle épouse un rectangle arrondi (super-ellipse), fait un peu plus d'un tour et reste dans `bounds`.
 */
export function loopPath(
  from: [number, number],
  box: Box,
  bounds: { width: number; height: number },
  random: () => number = Math.random,
): { d: string; length: number } {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const rx = box.width / 2 + LOOP_PAD;
  const ry = box.height / 2 + LOOP_PAD;
  const phase = random() * Math.PI * 2;
  const phase2 = random() * Math.PI * 2;
  const turns = between(random, 1.08, 1.18);
  const start = Math.atan2((from[1] - cy) / ry, (from[0] - cx) / rx);
  const edge = 4;
  const clamp = ([x, y]: [number, number]): [number, number] => [
    Math.min(bounds.width - edge, Math.max(edge, x)),
    Math.min(bounds.height - edge, Math.max(edge, y)),
  ];
  // Super-ellipse d'exposant 10 : presque un rectangle, qui ne coupe pas les coins de l'élément.
  const at = (a: number, t: number): [number, number] => {
    // Une main, pas un compas : le rayon ondule et la boucle s'écarte en se refermant.
    const wobble = 1 + 0.035 * Math.sin(2 * a + phase) + 0.02 * Math.sin(5 * a + phase2) + 0.07 * t;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return clamp([cx + rx * wobble * Math.sign(c) * Math.abs(c) ** 0.2, cy + ry * wobble * Math.sign(s) * Math.abs(s) ** 0.2]);
  };
  const p0 = at(start, 0);
  // Approche en S : le trait quitte le message en biais, puis plonge vers la boucle.
  const dy = p0[1] - from[1];
  const side = from[0] > cx ? 1 : -1;
  const c1: [number, number] = [from[0] + side * between(random, 24, 48), from[1] + dy * 0.35];
  const c2: [number, number] = [p0[0] - side * between(random, 12, 32), p0[1] - dy * 0.3];
  const points: [number, number][] = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const u = 1 - t;
    points.push([
      u ** 3 * from[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t ** 3 * p0[0],
      u ** 3 * from[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t ** 3 * p0[1],
    ]);
  }
  const steps = 72;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    points.push(at(start + t * turns * Math.PI * 2, t));
  }
  let length = 0;
  points.forEach(([px, py], i) => {
    if (i > 0) {
      length += Math.hypot(px - points[i - 1][0], py - points[i - 1][1]);
    }
  });
  const d = points.map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ');
  return { d, length };
}
