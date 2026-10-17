import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { appStorage } from '@/lib/storage';

interface SettingsState {
  /** Sons et vibrations de l'app (coupés aussi par le mode silencieux sur iOS). */
  sons: boolean;
  setSons: (sons: boolean) => void;
}

// Réglages du lecteur, hors votes : ils restent quand on efface ses votes.
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      sons: true,
      setSons: (sons) => set({ sons }),
    }),
    {
      name: 'elire-reglages',
      version: 1,
      storage: createJSONStorage(() => appStorage),
      partialize: ({ sons }) => ({ sons }),
    }
  )
);
