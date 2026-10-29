import { DEFAULT_MARKER } from '@/constants/theme';
import { questionOrder } from '@/lib/shuffle';
import { enjeux, lois, propositions, soloPropositions } from '@/services/dataset';
import { selectNextId, useVotesStore } from '@/store/votes-store';

// Stockage en mémoire à la place de SQLite (natif) ou de localStorage (web).
jest.mock('@/lib/storage', () => {
  const memory = new Map<string, string>();
  return {
    appStorage: {
      getItem: (name: string) => memory.get(name) ?? null,
      setItem: (name: string, value: string) => void memory.set(name, value),
      removeItem: (name: string) => void memory.delete(name),
    },
  };
});

const { appStorage } = jest.requireMock('@/lib/storage');
const linkedIds = propositions.filter((p) => p.enjeuId).map((p) => p.id);

async function reload(state: object, version: number) {
  appStorage.setItem('elire-votes', JSON.stringify({ state, version }));
  await useVotesStore.persist.rehydrate();
  return useVotesStore.getState();
}

describe('fin des votes', () => {
  it('sans question commune : finie quand chaque proposition et chaque scrutin a sa réponse', () => {
    const order = questionOrder(soloPropositions, [], lois.map((l) => l.id));
    const votes = Object.fromEntries(soloPropositions.map((p) => [p.id, 1 as const]));
    const loiVotes = Object.fromEntries(lois.map((l) => [l.id, 'pour' as const]));
    expect(selectNextId({ order, votes: {}, loiVotes: {} })).toBe(order[0]);
    expect(lois.map((l) => l.id)).toContain(selectNextId({ order, votes, loiVotes: {} }));
    expect(selectNextId({ order, votes, loiVotes })).toBeUndefined();
  });

  it('avec les questions communes : voter chaque question suffit, sans les propositions qu\'elle porte', () => {
    useVotesStore.getState().resetVotes();
    const { order } = useVotesStore.getState();
    const votes = Object.fromEntries([...soloPropositions.map((p) => p.id), ...enjeux.map((e) => e.id)].map((id) => [id, 2 as const]));
    const loiVotes = Object.fromEntries(lois.map((l) => [l.id, 'contre' as const]));
    expect(selectNextId({ order, votes, loiVotes })).toBeUndefined();
  });
});

describe("ordre de passage", () => {
  it('ne contient jamais seule une proposition portée par une question commune', () => {
    for (let run = 0; run < 20; run++) {
      useVotesStore.getState().resetVotes();
      const { order } = useVotesStore.getState();
      expect(order.filter((id) => linkedIds.includes(id))).toEqual([]);
      expect(order.length).toBe(new Set(order).size);
      expect(new Set(order)).toEqual(new Set([...soloPropositions.map((p) => p.id), ...enjeux.map((e) => e.id), ...lois.map((l) => l.id)]));
    }
  });

  it('retire une proposition liée d\'un ordre stocké', async () => {
    const order = questionOrder(soloPropositions, enjeux.map((e) => e.id), lois.map((l) => l.id));
    const state = await reload({ votes: {}, loiVotes: {}, order: [linkedIds[0], ...order], onboardingVersion: 2, marker: 'jaune', marks: {} }, 4);
    expect(state.order).not.toContain(linkedIds[0]);
    expect(state.order).toEqual(order);
  });
});

describe('migration du store', () => {
  it('v3 avec des votes : tout repart de zéro, et Voter l\'explique', async () => {
    const state = await reload({ votes: { [soloPropositions[0].id]: 1 }, loiVotes: { [lois[0].id]: 'pour' }, order: [], onboardingVersion: 2, marker: 'rose', marks: {} }, 3);
    expect(state.votes).toEqual({});
    expect(state.loiVotes).toEqual({});
    expect(state.questionsChanged).toBe(true);
    expect(state.marker).toBe('rose');
  });

  it('v3 sans vote : rien à expliquer', async () => {
    const state = await reload({ votes: {}, loiVotes: {}, onboardingVersion: 2, marker: 'jaune', marks: {} }, 3);
    expect(state.questionsChanged).toBe(false);
  });

  it('v4 : perd les votes d\'ids disparus et un surligneur inconnu', async () => {
    const kept = soloPropositions[0].id;
    const state = await reload(
      { votes: { [kept]: -1, 'prop-disparue': 2, [linkedIds[0]]: 1 }, loiVotes: { 'loi-disparue': 'pour' }, onboardingVersion: 2, marker: 'violet', marks: { [kept]: 'violet' } },
      4
    );
    expect(state.votes).toEqual({ [kept]: -1 });
    expect(state.loiVotes).toEqual({});
    expect(state.marker).toBe(DEFAULT_MARKER);
    expect(state.marks).toEqual({});
  });

  it('avant la v3 : « déjà vue » vaut la présentation 1', async () => {
    const state = await reload({ votes: {}, loiVotes: {}, onboardingSeen: true }, 4);
    expect(state.onboardingVersion).toBe(1);
  });
});
