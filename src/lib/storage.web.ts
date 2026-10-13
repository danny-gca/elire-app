import type { StateStorage } from 'zustand/middleware';

// Web : localStorage (kv-store web est en alpha et exige COOP/COEP + wasm).
function local(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export const appStorage: StateStorage = {
  getItem: (name) => local()?.getItem(name) ?? null,
  setItem: (name, value) => local()?.setItem(name, value),
  removeItem: (name) => local()?.removeItem(name),
};
