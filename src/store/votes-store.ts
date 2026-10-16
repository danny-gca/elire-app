import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_MARKER, Markers, type MarkerId } from '@/constants/theme';
import { balancedOrder, interleaveLois } from '@/lib/shuffle';
import type { LoiVoteValue, VoteValue } from '@/lib/scoring';
import { appStorage } from '@/lib/storage';
import { lois, propositions } from '@/services/dataset';

export type { LoiVoteValue, VoteValue } from '@/lib/scoring';

// À monter quand la présentation change vraiment (pas à chaque version de l'app) : chacun la revoit une fois.
export const ONBOARDING_VERSION = 2;

interface PersistedState {
  votes: Record<string, VoteValue>;
  loiVotes: Record<string, LoiVoteValue>;
  /** Ordre de passage figé (propositions et scrutins), régénéré seulement au reset. */
  order: string[];
  /** Dernière version de la présentation vue (0 : jamais). */
  onboardingVersion: number;
  /** Surligneur actif, choisi dans l'onboarding. */
  marker: MarkerId;
  /** Surligneur avec lequel chaque vote a été posé : changer de surligneur ne recolore pas le passé. */
  marks: Record<string, MarkerId>;
}

interface VotesState extends PersistedState {
  castVote: (propositionId: string, value: VoteValue) => void;
  castLoiVote: (loiId: string, value: LoiVoteValue) => void;
  resetVotes: () => void;
  completeOnboarding: () => void;
  setMarker: (marker: MarkerId) => void;
}

const knownPropIds = new Set(propositions.map((p) => p.id));
const knownLoiIds = new Set(lois.map((l) => l.id));

function freshOrder(): string[] {
  return interleaveLois(balancedOrder(propositions), [...knownLoiIds]);
}

// Garde l'ordre stocké et retire ce qui a disparu ; avec de nouvelles propositions, la partie pas encore votée
// est refaite par tours (sinon les nouveaux candidats arriveraient tous à la fin). Nouveaux scrutins intercalés.
function reconcileOrder(stored: string[] | undefined, voted: ReadonlySet<string>): string[] {
  if (!stored) {
    return freshOrder();
  }
  let kept = stored.filter((id) => knownPropIds.has(id) || knownLoiIds.has(id));
  if (propositions.some((p) => !kept.includes(p.id))) {
    kept = [...kept.filter((id) => voted.has(id)), ...balancedOrder(propositions.filter((p) => !voted.has(p.id)))];
  }
  const keptSet = new Set(kept);
  const withProps = [...kept, ...balancedOrder(propositions.filter((p) => !keptSet.has(p.id)))];
  const firstOpen = withProps.findIndex((id) => !voted.has(id));
  return interleaveLois(
    withProps,
    [...knownLoiIds].filter((id) => !keptSet.has(id)),
    { from: firstOpen === -1 ? withProps.length : firstOpen, existing: new Set(kept.filter((id) => knownLoiIds.has(id))) }
  );
}

function pick<T>(record: Record<string, T> | undefined, known: ReadonlySet<string>): Record<string, T> {
  return Object.fromEntries(Object.entries(record ?? {}).filter(([id]) => known.has(id)));
}

export const useVotesStore = create<VotesState>()(
  persist(
    (set) => ({
      votes: {},
      loiVotes: {},
      order: freshOrder(),
      onboardingVersion: 0,
      marker: DEFAULT_MARKER,
      marks: {},

      castVote: (propositionId, value) => {
        set((state) => ({
          votes: { ...state.votes, [propositionId]: value },
          marks: { ...state.marks, [propositionId]: state.marker },
        }));
      },

      castLoiVote: (loiId, value) => {
        set((state) => ({
          loiVotes: { ...state.loiVotes, [loiId]: value },
          marks: { ...state.marks, [loiId]: state.marker },
        }));
      },

      resetVotes: () => {
        set({ votes: {}, loiVotes: {}, marks: {}, order: freshOrder() });
      },

      setMarker: (marker) => {
        set({ marker });
      },

      completeOnboarding: () => {
        set({ onboardingVersion: ONBOARDING_VERSION });
      },
    }),
    {
      name: 'elire-votes',
      // v2 : votes sur les scrutins (loiVotes), scrutins dans l'ordre de passage, surligneurs (marker, marks).
      // v3 : onboardingVersion remplace onboardingSeen.
      version: 3,
      storage: createJSONStorage(() => appStorage),
      partialize: ({ votes, loiVotes, order, onboardingVersion, marker, marks }): PersistedState => ({
        votes,
        loiVotes,
        order,
        onboardingVersion,
        marker,
        marks,
      }),
      migrate: (persisted) => persisted as PersistedState,
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<PersistedState> & { onboardingSeen?: boolean };
        const votes = pick(stored.votes, knownPropIds);
        const loiVotes = pick(stored.loiVotes, knownLoiIds);
        const voted = new Set([...Object.keys(votes), ...Object.keys(loiVotes)]);
        return {
          ...current,
          votes,
          loiVotes,
          order: reconcileOrder(stored.order, voted),
          // Avant la v3, « déjà vue » valait la version 1.
          onboardingVersion: stored.onboardingVersion ?? (stored.onboardingSeen ? 1 : 0),
          marker: stored.marker && stored.marker in Markers ? stored.marker : DEFAULT_MARKER,
          marks: Object.fromEntries(
            Object.entries(pick(stored.marks, new Set([...knownPropIds, ...knownLoiIds]))).filter(([, m]) => m in Markers)
          ),
        };
      },
    }
  )
);

/** Premier élément (proposition ou scrutin) non voté de l'ordre de passage, undefined quand tout est voté. */
export function selectNextId(state: Pick<PersistedState, 'votes' | 'loiVotes' | 'order'>) {
  return state.order.find((id) => state.votes[id] === undefined && state.loiVotes[id] === undefined);
}

export function isLoiId(id: string) {
  return knownLoiIds.has(id);
}

/** Surligneur d'un vote déjà posé (jaune pour les votes antérieurs au choix du surligneur). */
export function useMarkOf(id: string): MarkerId {
  return useVotesStore((s) => s.marks[id]) ?? DEFAULT_MARKER;
}
