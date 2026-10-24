import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_MARKER, Markers, type MarkerId } from '@/constants/theme';
import { effectiveVotes } from '@/lib/enjeux';
import { balancedOrder, interleaveLois, questionOrder } from '@/lib/shuffle';
import type { LoiVoteValue, VoteValue } from '@/lib/scoring';
import { appStorage } from '@/lib/storage';
import { enjeux, lois, propositions, soloPropositions } from '@/services/dataset';

export type { LoiVoteValue, VoteValue } from '@/lib/scoring';

// À monter quand la présentation change vraiment (pas à chaque version de l'app) : chacun la revoit une fois.
export const ONBOARDING_VERSION = 2;

interface PersistedState {
  /** Un vote par question : proposition seule ou enjeu (la note de chaque proposition s'en déduit, `usePropositionVotes`). */
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
  /** Votes effacés par le passage aux questions communes (v4) : un message l'explique dans Voter. */
  questionsChanged: boolean;
}

interface VotesState extends PersistedState {
  castVote: (propositionId: string, value: VoteValue) => void;
  castLoiVote: (loiId: string, value: LoiVoteValue) => void;
  resetVotes: () => void;
  completeOnboarding: () => void;
  setMarker: (marker: MarkerId) => void;
  dismissQuestionsChanged: () => void;
}

const enjeuIds = enjeux.map((e) => e.id);
const loiIds = lois.map((l) => l.id);
const knownVoteIds = new Set([...soloPropositions.map((p) => p.id), ...enjeuIds]);
const knownLoiIds = new Set(loiIds);
const isIntercalated = (id: string) => knownLoiIds.has(id) || enjeuIds.includes(id);

function freshOrder(): string[] {
  return questionOrder(soloPropositions, enjeuIds, loiIds);
}

// Garde l'ordre stocké et retire ce qui a disparu ; avec de nouvelles propositions, la partie pas encore votée
// est refaite par tours (sinon les nouveaux candidats arriveraient tous à la fin). Nouveaux enjeux et scrutins intercalés.
function reconcileOrder(stored: string[] | undefined, voted: ReadonlySet<string>): string[] {
  if (!stored) {
    return freshOrder();
  }
  let kept = stored.filter((id) => knownVoteIds.has(id) || knownLoiIds.has(id));
  if (soloPropositions.some((p) => !kept.includes(p.id))) {
    kept = [...kept.filter((id) => voted.has(id)), ...balancedOrder(soloPropositions.filter((p) => !voted.has(p.id)))];
  }
  const keptSet = new Set(kept);
  const withProps = [...kept, ...balancedOrder(soloPropositions.filter((p) => !keptSet.has(p.id)))];
  const firstOpen = withProps.findIndex((id) => !voted.has(id));
  const from = firstOpen === -1 ? withProps.length : firstOpen;
  const withEnjeux = interleaveLois(
    withProps,
    enjeuIds.filter((id) => !keptSet.has(id)),
    { from, existing: new Set(kept.filter(isIntercalated)) }
  );
  return interleaveLois(
    withEnjeux,
    loiIds.filter((id) => !keptSet.has(id)),
    { from, existing: new Set(withEnjeux.filter(isIntercalated)) }
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
      questionsChanged: false,

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
        set({ votes: {}, loiVotes: {}, marks: {}, order: freshOrder(), questionsChanged: false });
      },

      setMarker: (marker) => {
        set({ marker });
      },

      completeOnboarding: () => {
        set({ onboardingVersion: ONBOARDING_VERSION });
      },

      dismissQuestionsChanged: () => {
        set({ questionsChanged: false });
      },
    }),
    {
      name: 'elire-votes',
      // v2 : votes sur les scrutins (loiVotes), scrutins dans l'ordre de passage, surligneurs (marker, marks).
      // v3 : onboardingVersion remplace onboardingSeen.
      // v4 : questions communes (enjeux) ; votes effacés une fois, en phase de test (pas de conversion).
      version: 4,
      storage: createJSONStorage(() => appStorage),
      partialize: ({ votes, loiVotes, order, onboardingVersion, marker, marks, questionsChanged }): PersistedState => ({
        votes,
        loiVotes,
        order,
        onboardingVersion,
        marker,
        marks,
        questionsChanged,
      }),
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<PersistedState>;
        if (version >= 4) {
          return state as PersistedState;
        }
        const hadVotes = Object.keys(state.votes ?? {}).length + Object.keys(state.loiVotes ?? {}).length > 0;
        return { ...state, votes: {}, loiVotes: {}, marks: {}, order: undefined, questionsChanged: hadVotes } as unknown as PersistedState;
      },
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<PersistedState> & { onboardingSeen?: boolean };
        const votes = pick(stored.votes, knownVoteIds);
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
            Object.entries(pick(stored.marks, new Set([...knownVoteIds, ...knownLoiIds]))).filter(([, m]) => m in Markers)
          ),
          questionsChanged: stored.questionsChanged ?? false,
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

/** Note de chaque proposition, déduite des votes par question (enjeu inversé pour un « contre »). */
export function usePropositionVotes(): Record<string, VoteValue> {
  const votes = useVotesStore((s) => s.votes);
  return useMemo(() => effectiveVotes(votes, propositions), [votes]);
}

/** Surligneur d'un vote déjà posé (jaune pour les votes antérieurs au choix du surligneur). */
export function useMarkOf(id: string): MarkerId {
  return useVotesStore((s) => s.marks[id]) ?? DEFAULT_MARKER;
}
