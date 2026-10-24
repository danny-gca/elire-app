// Neutralité des questions : selon la façon de répondre (tout oui, tout non, au hasard...), qui sort dans le top 6 (docs/simulations).
// node scripts/simulate-neutralite.ts [lecteurs] [graine]
import fs from 'node:fs';
import path from 'node:path';

import { effectiveVotes } from '../src/lib/enjeux.ts';
import { computeScores, UNSURE, type LoiVoteValue, type VoteValue } from '../src/lib/scoring.ts';
import type { Candidat, Enjeu, Loi, Proposition } from '../src/schemas/dataset.ts';

const READERS = Number(process.argv[2] ?? 4000);
const SEED = Number(process.argv[3] ?? 2027);
const TOP = 6;

const root = path.resolve(import.meta.dirname, '..');
const dataset = JSON.parse(fs.readFileSync(path.join(root, 'src/data/dataset.json'), 'utf8')) as {
  candidats: Candidat[];
  propositions: Proposition[];
  lois: Loi[];
  enjeux: Enjeu[];
  metadata: { generatedAt: string };
};
const { candidats, propositions, lois, enjeux } = dataset;
// Ce qu'on vote dans Voter : une proposition seule ou un enjeu.
const questions = [...propositions.filter((p) => !p.enjeuId).map((p) => p.id), ...enjeux.map((e) => e.id)];

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

/** Une façon de répondre : `yes` est la part de réponses favorables, `unsure` celle de « Je ne sais pas ». */
type Profile = { yes: () => number; unsure: number; strength: readonly (1 | 2)[] };
const PROFILES: Record<string, Profile> = {
  'tout +2 et pour': { yes: () => 1, unsure: 0, strength: [2] },
  'plutôt oui (80 %)': { yes: () => 0.8, unsure: 0, strength: [1, 2] },
  'au hasard': { yes: () => 0.5, unsure: 0, strength: [1, 2] },
  'mélange (penchant tiré au hasard, 10 % Je ne sais pas)': { yes: () => 0.2 + random() * 0.6, unsure: 0.1, strength: [1, 2] },
  'plutôt non (80 %)': { yes: () => 0.2, unsure: 0, strength: [1, 2] },
  'tout -2 et contre': { yes: () => 0, unsure: 0, strength: [2] },
};
// Un lecteur réaliste (45 questions, 15 scrutins, comme simulate-scoring), sans scrutin (isole les questions), ou qui répond à tout.
const LENGTHS = {
  partiel: { questions: 45, lois: 15 },
  sansScrutins: { questions: 45, lois: 0 },
  complet: { questions: questions.length, lois: lois.length },
};

function reader(profile: Profile, length: { questions: number; lois: number }) {
  const yes = profile.yes();
  const answers: Record<string, VoteValue> = {};
  for (const id of shuffle(questions).slice(0, length.questions)) {
    answers[id] = random() < profile.unsure ? UNSURE : (((random() < yes ? 1 : -1) * pick(profile.strength)) as VoteValue);
  }
  const loiVotes: Record<string, LoiVoteValue> = {};
  for (const l of shuffle(lois).slice(0, length.lois)) {
    loiVotes[l.id] = random() < yes ? 'pour' : 'contre';
  }
  return { votes: effectiveVotes(answers, propositions), loiVotes };
}

const pct = (n: number, d: number) => Math.round((n / d) * 1000) / 10;
const seated = new Set(lois.flatMap((l) => Object.keys(l.votes)));

function run(profile: Profile, length: { questions: number; lois: number }) {
  const count = Object.fromEntries(candidats.map((c) => [c.id, { top: 0, first: 0, bottom: 0, ranked: 0 }]));
  for (let i = 0; i < READERS; i++) {
    const r = reader(profile, length);
    const tieOrder = new Map(shuffle(candidats).map((c, k) => [c.id, k]));
    const ranked = computeScores(candidats, propositions, r.votes, tieOrder, { lois, votes: r.loiVotes }).filter((s) => s.ranked);
    ranked.forEach((s, k) => {
      const c = count[s.candidat.id];
      c.ranked += 1;
      c.first += k === 0 ? 1 : 0;
      c.top += k < TOP ? 1 : 0;
      c.bottom += k >= ranked.length - TOP ? 1 : 0;
    });
  }
  const rows = candidats
    .map((c) => ({
      candidat: c.nom,
      aSiege: seated.has(c.id),
      propositions: propositions.filter((p) => p.candidatId === c.id).length,
      classe: pct(count[c.id].ranked, READERS),
      numero1: pct(count[c.id].first, READERS),
      top6: pct(count[c.id].top, READERS),
      bas6: pct(count[c.id].bottom, READERS),
    }))
    .sort((a, b) => b.top6 - a.top6);
  const tops = rows.map((r) => r.top6);
  return { ecartTop6: { min: Math.min(...tops), max: Math.max(...tops) }, candidats: rows };
}

const result = {
  date: new Date().toISOString().slice(0, 10),
  donnees: dataset.metadata.generatedAt.slice(0, 10),
  graine: SEED,
  lecteursParCas: READERS,
  attenduSiNeutre: { numero1: pct(1, candidats.length), top6: pct(TOP, candidats.length) },
  lecteur: LENGTHS,
  profils: Object.fromEntries(
    Object.entries(PROFILES).map(([name, profile]) => [
      name,
      Object.fromEntries(Object.entries(LENGTHS).map(([len, length]) => [len, run(profile, length)])),
    ])
  ),
};

const out = path.join(root, 'docs/simulations', `neutralite-${result.date}.json`);
fs.writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
for (const [name, byLength] of Object.entries(result.profils)) {
  for (const [len, r] of Object.entries(byLength)) {
    console.log(`\n## ${name} · ${len} · top 6 de ${r.ecartTop6.min} à ${r.ecartTop6.max} %`);
    for (const c of r.candidats) {
      console.log(`${c.candidat.padEnd(24)} top6 ${String(c.top6).padStart(5)}  n°1 ${String(c.numero1).padStart(5)}  bas6 ${String(c.bas6).padStart(5)}  classé ${String(c.classe).padStart(5)}  ${c.aSiege ? 'siégé' : ''} ${c.propositions}p`);
    }
  }
}
console.log(`\nÉcrit dans ${path.relative(root, out)}`);
