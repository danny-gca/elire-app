import type { GestureResponderEvent } from 'react-native';
import { create } from 'zustand';

import { playSound } from '@/lib/sound';

/** big : un cap franchi (bilan, fin, bienvenue) ; small : un geste confirmé (vote modifié, image partagée). */
export type CelebrationSize = 'big' | 'small';
/** Où jouer : l'app, ou au-dessus de la feuille ouverte (une Modal cache la racine). */
export type CelebrationHost = 'app' | 'sheet';

export const BIG_VARIANTS = ['gerbe', 'fusees', 'surlignage', 'boucles'] as const;
export const SMALL_VARIANTS = ['etincelles', 'traits', 'entoure', 'cadre'] as const;
export type CelebrationVariant = (typeof BIG_VARIANTS)[number] | (typeof SMALL_VARIANTS)[number];

export interface CelebrationPoint {
  x: number;
  y: number;
}

export interface Celebration {
  id: number;
  size: CelebrationSize;
  host: CelebrationHost;
  variant: CelebrationVariant;
  /** Le bouton touché : la fête part de là ; sinon du bas de l'écran. */
  origin?: CelebrationPoint;
}

interface CelebrationState {
  /** Plusieurs fêtes peuvent se chevaucher (série) : aucune ne coupe la précédente. */
  active: Celebration[];
  last: Partial<Record<CelebrationSize, CelebrationVariant>>;
  celebrate: (size: CelebrationSize, host?: CelebrationHost, origin?: CelebrationPoint) => void;
  done: (id: number) => void;
}

// Jamais deux fois la même animation d'affilée, ni deux fois la même dans une série.
function pick(size: CelebrationSize, avoid: readonly (CelebrationVariant | undefined)[]): CelebrationVariant {
  const pool: readonly CelebrationVariant[] = size === 'big' ? BIG_VARIANTS : SMALL_VARIANTS;
  const options = pool.filter((v) => !avoid.includes(v));
  const from = options.length > 0 ? options : pool;
  return from[Math.floor(Math.random() * from.length)];
}

let nextId = 1;

export const useCelebrationStore = create<CelebrationState>((set, get) => ({
  active: [],
  last: {},
  celebrate: (size, host = 'app', origin) => {
    const { active, last } = get();
    const variant = pick(size, [last[size], ...active.map((c) => c.variant)]);
    set({ active: [...active, { id: nextId++, size, host, variant, origin }], last: { ...last, [size]: variant } });
    // Chaque fête a sa gerbe de feutres : longue pour un cap, courte pour un geste ; dans une série, la suite est courte.
    playSound(size === 'big' && !active.some((c) => c.size === 'big') ? 'palier' : 'festif');
  },
  done: (id) => {
    if (get().active.some((c) => c.id === id)) {
      set({ active: get().active.filter((c) => c.id !== id) });
    }
  },
}));

export const celebrate = (size: CelebrationSize, host?: CelebrationHost, origin?: CelebrationPoint) =>
  useCelebrationStore.getState().celebrate(size, host, origin);

/** Plusieurs fêtes espacées (fin de tous les votes) ; renvoie de quoi annuler celles pas encore parties. */
export function celebrateSeries(size: CelebrationSize, count = 3, gapMs = 600): () => void {
  const timers = Array.from({ length: count }, (_, i) => setTimeout(() => celebrate(size), i * gapMs));
  return () => timers.forEach(clearTimeout);
}

/** Point touché, dans la fenêtre (sur le web, pageX compte le défilement : clientX) ; au clavier, aucun. */
export function pointOf(e: GestureResponderEvent): CelebrationPoint | undefined {
  const n = e.nativeEvent as { pageX?: number; pageY?: number; clientX?: number; clientY?: number };
  const x = n.clientX ?? n.pageX ?? 0;
  const y = n.clientY ?? n.pageY ?? 0;
  return x === 0 && y === 0 ? undefined : { x, y };
}
