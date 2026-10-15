// Simulation des méthodes de score : qui sort n°1, selon qu'un candidat a déjà siégé ou non (docs/simulations).
// node scripts/simulate-scoring.ts [lecteurs] [graine]
import fs from 'node:fs';
import path from 'node:path';

import {
  computeScores,
  GROUP_VOTE_WEIGHT,
  MIN_VOTES_PER_CANDIDAT,
  scoreCandidat,
  type LoiVoteValue,
  type VoteValue,
} from '../src/lib/scoring.ts';
import type { Candidat, Loi, Proposition } from '../src/schemas/dataset.ts';

const READERS = Number(process.argv[2] ?? 4000);
const SEED = Number(process.argv[3] ?? 2027);
// Un lecteur d'environ 60 votes : 45 propositions et 15 scrutins.
const PROPOSITIONS_PER_READER = 45;
const LOIS_PER_READER = 15;

const root = path.resolve(import.meta.dirname, '..');
const dataset = JSON.parse(fs.readFileSync(path.join(root, 'src/data/dataset.json'), 'utf8')) as {
  candidats: Candidat[];
  propositions: Proposition[];
  lois: Loi[];
  metadata: { generatedAt: string };
};
const { candidats, propositions, lois } = dataset;

// Générateur à graine : les mêmes chiffres à chaque exécution.
let state = SEED;
const random = () => {
  state = (state * 16807) % 2147483647;
  return (state - 1) / 2147483646;
};
const pick = <T>(items: readonly T[]) => items[Math.floor(random() * items.length)];
const shuffle = <T>(items: readonly T[]) => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

type Reader = { votes: Record<string, VoteValue>; loiVotes: Record<string, LoiVoteValue> };

/** Sans favori : tout au hasard. Avec un favori : d'accord avec son programme et ses votes, au hasard ailleurs. */
function reader(fan: string | null): Reader {
  const votes: Record<string, VoteValue> = {};
  for (const p of shuffle(propositions).slice(0, PROPOSITIONS_PER_READER)) {
    votes[p.id] = p.candidatId === fan ? pick<VoteValue>([2, 2, 1]) : pick<VoteValue>([-2, -1, 1, 2]);
  }
  const loiVotes: Record<string, LoiVoteValue> = {};
  for (const l of shuffle(lois).slice(0, LOIS_PER_READER)) {
    const position = fan ? l.votes[fan]?.position : undefined;
    loiVotes[l.id] = position && position !== 'abstention' ? position : pick<LoiVoteValue>(['pour', 'contre']);
  }
  return { votes, loiVotes };
}

// Les méthodes comparées. « retenue » est le code de l'app (src/lib/scoring.ts) ; les autres sont recalculées ici.
const ratio = (sum: number, max: number) => (sum + max) / (max * 2);
type Parts = { propSum: number; propMax: number; loiSum: number; loiMax: number; evidence: number; ranked: boolean };

function parts(c: Candidat, r: Reader): Parts {
  let propSum = 0;
  let propMax = 0;
  for (const p of propositions) {
    if (p.candidatId === c.id && r.votes[p.id] !== undefined) {
      propSum += r.votes[p.id];
      propMax += 2;
    }
  }
  let loiSum = 0;
  let loiMax = 0;
  for (const l of lois) {
    const position = l.votes[c.id];
    const user = r.loiVotes[l.id];
    if (!position || !user) {
      continue;
    }
    const w = position.typeVote === 'groupe_parti' ? GROUP_VOTE_WEIGHT : 1;
    loiSum += w * (position.position === 'abstention' ? 0 : position.position === user ? 2 : -2);
    loiMax += w * 2;
  }
  return { propSum, propMax, loiSum, loiMax, evidence: propMax / 2 + loiMax / 2, ranked: propMax / 2 >= MIN_VOTES_PER_CANDIDAT };
}

const METHODS = {
  'avant: au nombre, égalité par fiabilité': { score: (x: Parts) => ratio(x.propSum + x.loiSum, x.propMax + x.loiMax), tieByEvidence: true },
  'option 1: au nombre, égalité au hasard': { score: (x: Parts) => ratio(x.propSum + x.loiSum, x.propMax + x.loiMax), tieByEvidence: false },
  'option 2: moitié programme, moitié Parlement': {
    score: (x: Parts) => (x.loiMax > 0 ? (ratio(x.propSum, x.propMax) + ratio(x.loiSum, x.loiMax)) / 2 : ratio(x.propSum, x.propMax)),
    tieByEvidence: false,
  },
} as const;

function winner(r: Reader, method: keyof typeof METHODS | 'retenue'): string | undefined {
  if (method === 'retenue') {
    const tieOrder = new Map(shuffle(candidats).map((c, i) => [c.id, i]));
    return computeScores(candidats, propositions, r.votes, tieOrder, { lois, votes: r.loiVotes }).find((s) => s.ranked)?.candidat.id;
  }
  const m = METHODS[method];
  return candidats
    .map((c) => ({ c, x: parts(c, r), tie: random() }))
    .filter((e) => e.x.ranked)
    .map((e) => ({ ...e, score: Math.round(m.score(e.x) * 100) }))
    .sort((a, b) => b.score - a.score || (m.tieByEvidence ? b.x.evidence - a.x.evidence : 0) || a.tie - b.tie)[0]?.c.id;
}

const seated = new Set(lois.flatMap((l) => Object.keys(l.votes)));
const isSeated = (id: string) => seated.has(id);
const nSeated = candidats.filter((c) => isSeated(c.id)).length;
const nOthers = candidats.length - nSeated;
const methods = [...(Object.keys(METHODS) as (keyof typeof METHODS)[]), 'retenue'] as const;
const pct = (n: number, d: number) => Math.round((n / d) * 1000) / 10;

// Test 1 : un lecteur d'accord avec X. X sort-il n°1 aussi souvent, qu'il ait siégé ou non ?
const fan = Object.fromEntries(methods.map((m) => [m, { seated: [0, 0], others: [0, 0] }]));
const perCandidate = Math.max(1, Math.round(READERS / candidats.length));
for (const c of candidats) {
  for (let i = 0; i < perCandidate; i++) {
    const r = reader(c.id);
    for (const m of methods) {
      const bucket = fan[m][isSeated(c.id) ? 'seated' : 'others'];
      bucket[1] += 1;
      if (winner(r, m) === c.id) {
        bucket[0] += 1;
      }
    }
  }
}

// Test 2 : un lecteur au hasard. Chacun devrait sortir n°1 aussi souvent (1 sur 25).
const neutral = Object.fromEntries(methods.map((m) => [m, { seated: 0, others: 0 }]));
for (let i = 0; i < READERS; i++) {
  const r = reader(null);
  for (const m of methods) {
    const id = winner(r, m);
    if (id) {
      neutral[m][isSeated(id) ? 'seated' : 'others'] += 1;
    }
  }
}

const result = {
  date: new Date().toISOString().slice(0, 10),
  donnees: dataset.metadata.generatedAt.slice(0, 10),
  graine: SEED,
  lecteurs: READERS,
  lecteur: { propositions: PROPOSITIONS_PER_READER, scrutins: LOIS_PER_READER },
  candidats: { total: candidats.length, ontSiege: nSeated, nontJamaisSiege: nOthers },
  test1_lecteurAccordAvecX_XSortNumero1: Object.fromEntries(
    methods.map((m) => [m, { xASiege: pct(fan[m].seated[0], fan[m].seated[1]), xNaJamaisSiege: pct(fan[m].others[0], fan[m].others[1]) }])
  ),
  test2_lecteurAuHasard_partDeNumero1ParCandidat: Object.fromEntries(
    methods.map((m) => [m, { aSiege: pct(neutral[m].seated / nSeated, READERS), naJamaisSiege: pct(neutral[m].others / nOthers, READERS) }])
  ),
};

const out = path.join(root, 'docs/simulations', `score-${result.date}.json`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
console.log(`\nÉcrit dans ${path.relative(root, out)}`);
