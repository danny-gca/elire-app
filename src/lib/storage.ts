import Storage from 'expo-sqlite/kv-store';
import type { StateStorage } from 'zustand/middleware';

// Natif : clé-valeur SQLite locale (les votes ne quittent jamais l'appareil).
export const appStorage: StateStorage = {
  getItem: (name) => Storage.getItemSync(name),
  setItem: (name, value) => Storage.setItemSync(name, value),
  removeItem: (name) => {
    Storage.removeItemSync(name);
  },
};
