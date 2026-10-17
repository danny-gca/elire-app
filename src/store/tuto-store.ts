import { useIsFocused } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import type { View } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import TUTOS from '@/constants/tutos.json';
import { appStorage } from '@/lib/storage';
import type { Box } from '@/lib/stroke';

/** Une étape du tuto (src/constants/tutos.json) : un message, l'élément qu'il entoure, le moment où il apparaît. */
export interface TutoStep {
  id: string;
  /** Écran où l'étape apparaît (lisibilité du fichier). */
  ecran: string;
  /** Événement de l'app qui la déclenche (useTuto). */
  quand: string;
  /** Nom posé sur l'élément entouré (useTutoTarget). */
  cible: string;
  /** Deux étapes du même événement s'enchaînent dans cet ordre. */
  ordre: number;
  lignes: string[];
}

export const TUTO_STEPS: TutoStep[] = [...(TUTOS as TutoStep[])].sort((a, b) => a.ordre - b.ordre);
const stepsById = new Map(TUTO_STEPS.map((s) => [s.id, s]));
export const tutoStep = (id: string) => stepsById.get(id);

interface TutoState {
  /** Étapes déjà vues : elles ne reviennent pas (« Revoir les astuces » vide la liste). */
  seen: string[];
  /** Étapes en attente, la première est à l'écran ; non enregistrées. */
  queue: string[];
  enqueue: (quand: string) => void;
  /** « Compris » : l'étape est vue. */
  done: (id: string) => void;
  /** Élément introuvable à l'écran : l'étape reviendra au prochain déclenchement. */
  skip: (id: string) => void;
  reset: () => void;
}

export const useTutoStore = create<TutoState>()(
  persist(
    (set, get) => ({
      seen: [],
      queue: [],
      enqueue: (quand) => {
        const { seen, queue } = get();
        const ids = TUTO_STEPS.filter((s) => s.quand === quand && !seen.includes(s.id) && !queue.includes(s.id)).map((s) => s.id);
        if (ids.length > 0) {
          set({ queue: [...queue, ...ids] });
        }
      },
      done: (id) => set((s) => ({ seen: s.seen.includes(id) ? s.seen : [...s.seen, id], queue: s.queue.filter((q) => q !== id) })),
      skip: (id) => set((s) => ({ queue: s.queue.filter((q) => q !== id) })),
      reset: () => set({ seen: [], queue: [] }),
    }),
    {
      name: 'elire-tutos',
      version: 1,
      storage: createJSONStorage(() => appStorage),
      partialize: ({ seen }) => ({ seen }),
    }
  )
);

/** Un tuto à l'écran (ou sur le point d'y être) : l'app se met en pause, plus rien ne part seul. */
export const useTutoActive = () => useTutoStore((s) => s.queue.length > 0);

// Les éléments que le tuto peut entourer, par nom.
const targets = new Map<string, View>();

/** À poser sur l'élément à entourer : `<View {...useTutoTarget('a-vote')}>`, même s'il apparaît plus tard. */
export function useTutoTarget(cible: string) {
  const last = useRef<View | null>(null);
  const ref = useCallback(
    (view: View | null) => {
      if (view) {
        targets.set(cible, view);
      } else if (last.current && targets.get(cible) === last.current) {
        targets.delete(cible);
      }
      last.current = view;
    },
    [cible]
  );
  return { ref, collapsable: false };
}

/** Position de l'élément dans la fenêtre, ou null s'il n'est pas à l'écran. */
export function measureTarget(cible: string): Promise<Box | null> {
  const view = targets.get(cible);
  if (!view) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => view.measureInWindow((x, y, width, height) => resolve(width > 0 && height > 0 ? { x, y, width, height } : null)));
}

/** Déclenche les étapes de `quand` dès que `when` est vrai, sur l'écran affiché. */
export function useTuto(quand: string, when: boolean) {
  const focused = useIsFocused();
  const enqueue = useTutoStore((s) => s.enqueue);
  useEffect(() => {
    if (when && focused) {
      enqueue(quand);
    }
  }, [quand, when, focused, enqueue]);
}
