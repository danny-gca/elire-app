import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { balancedOrder } from '@/lib/shuffle';
import type { VoteValue } from '@/lib/scoring';
import { appStorage } from '@/lib/storage';
import { propositions } from '@/services/dataset';

export type { VoteValue } from '@/lib/scoring';

interface PersistedState {
  votes: Record<string, VoteValue>;
  /** Ordre de passage figé, régénéré seulement au reset. */
  order: string[];
  onboardingSeen: boolean;
}

interface VotesState extends PersistedState {
  castVote: (propositionId: string, value: VoteValue) => void;
  resetVotes: () => void;
  completeOnboarding: () => void;
}

const knownIds = new Set(propositions.map((p) => p.id));

// Garde l'ordre stocké, retire les propositions supprimées, ajoute les nouvelles à la fin.
function reconcileOrder(stored: string[] | undefined): string[] {
  const kept = (stored ?? []).filter((id) => knownIds.has(id));
  const keptSet = new Set(kept);
  const added = balancedOrder(propositions.filter((p) => !keptSet.has(p.id)));
  return [...kept, ...added];
}

export const useVotesStore = create<VotesState>()(
  persist(
    (set) => ({
      votes: {},
      order: reconcileOrder(undefined),
      onboardingSeen: false,

      castVote: (propositionId, value) => {
        set((state) => ({ votes: { ...state.votes, [propositionId]: value } }));
      },

      resetVotes: () => {
        set({ votes: {}, order: balancedOrder(propositions) });
      },

      completeOnboarding: () => {
        set({ onboardingSeen: true });
      },
    }),
    {
      name: 'elire-votes',
      version: 1,
      storage: createJSONStorage(() => appStorage),
      partialize: ({ votes, order, onboardingSeen }): PersistedState => ({ votes, order, onboardingSeen }),
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<PersistedState>;
        const votes = Object.fromEntries(
          Object.entries(stored.votes ?? {}).filter(([id]) => knownIds.has(id))
        ) as Record<string, VoteValue>;
        return {
          ...current,
          votes,
          order: reconcileOrder(stored.order),
          onboardingSeen: stored.onboardingSeen ?? false,
        };
      },
    }
  )
);

/** Première proposition non votée de l'ordre de passage, undefined quand tout est voté. */
export function selectNextPropositionId(state: Pick<PersistedState, 'votes' | 'order'>) {
  return state.order.find((id) => state.votes[id] === undefined);
}
