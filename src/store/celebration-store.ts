import type { GestureResponderEvent } from 'react-native';
import { create } from 'zustand';

/** big : un cap franchi (bilan, fin, bienvenue) ; small : un geste confirmé (vote modifié, image partagée). */
export type CelebrationSize = 'big' | 'small';
/** Où jouer : l'app, ou au-dessus de la feuille ouverte (une Modal cache la racine). */
export type CelebrationHost = 'app' | 'sheet';

export const BIG_VARIANTS = ['gerbe', 'fusees', 'surlignage', 'boucles'] as const;
export const SMALL_VARIANTS = ['etincelles', 'traits'] as const;
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
  current: Celebration | null;
  last: Partial<Record<CelebrationSize, CelebrationVariant>>;
  celebrate: (size: CelebrationSize, host?: CelebrationHost, origin?: CelebrationPoint) => void;
  done: (id: number) => void;
}

// Jamais deux fois la même animation d'affilée.
function pick(size: CelebrationSize, last?: CelebrationVariant): CelebrationVariant {
  const pool: readonly CelebrationVariant[] = size === 'big' ? BIG_VARIANTS : SMALL_VARIANTS;
  const options = pool.filter((v) => v !== last);
  return options[Math.floor(Math.random() * options.length)];
}

export const useCelebrationStore = create<CelebrationState>((set, get) => ({
  current: null,
  last: {},
  celebrate: (size, host = 'app', origin) => {
    const variant = pick(size, get().last[size]);
    set({ current: { id: Date.now(), size, host, variant, origin }, last: { ...get().last, [size]: variant } });
  },
  done: (id) => {
    if (get().current?.id === id) {
      set({ current: null });
    }
  },
}));

export const celebrate = (size: CelebrationSize, host?: CelebrationHost, origin?: CelebrationPoint) =>
  useCelebrationStore.getState().celebrate(size, host, origin);

/** Point touché, dans la fenêtre (sur le web, pageX compte le défilement : clientX) ; au clavier, aucun. */
export function pointOf(e: GestureResponderEvent): CelebrationPoint | undefined {
  const n = e.nativeEvent as { pageX?: number; pageY?: number; clientX?: number; clientY?: number };
  const x = n.clientX ?? n.pageX ?? 0;
  const y = n.clientY ?? n.pageY ?? 0;
  return x === 0 && y === 0 ? undefined : { x, y };
}
