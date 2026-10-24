// Propose des groupes de propositions proches ou opposées, par thème, pour rédiger data/enjeux.json à la main.
// Usage : node scripts/find-enjeux.ts [--seuil=0.25]  -> docs/enjeux-candidats.md (un tri à relire, jamais une décision)
import fs from 'node:fs';
import path from 'node:path';

import { cosine, normalize, opposedVerbs } from '../src/lib/similarity.ts';

interface Prop {
  id: string;
  ref: string;
  thematiqueId: string;
  titre: string;
  description: string;
  typeSource: string;
  enjeuId?: string;
}

const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const OUTPUT = path.join(ROOT_DIR, 'docs', 'enjeux-candidats.md');
const seuilArg = process.argv.find((a) => a.startsWith('--seuil='));
const SEUIL = seuilArg ? Number(seuilArg.split('=')[1]) : 0.25;

const dataset = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'src', 'data', 'dataset.json'), 'utf-8'));
const thematiques: { id: string; titre: string }[] = dataset.thematiques;
const props: Prop[] = dataset.propositions.filter((p: Prop) => !p.enjeuId);
const words = new Map(props.map((p) => [p.id, normalize(`${p.titre} ${p.description}`)]));

// Rareté de chaque racine : un mot présent partout ne rapproche rien.
const df = new Map<string, number>();
words.forEach((ws) => new Set(ws).forEach((w) => df.set(w, (df.get(w) ?? 0) + 1)));
const idf = new Map([...df].map(([w, n]) => [w, Math.log(props.length / n)]));

interface Pair {
  a: string;
  b: string;
  score: number;
  opposed: boolean;
}

const lines = [`# Enjeux candidats`, ``, `Généré par \`npm run find:enjeux\` (seuil ${SEUIL}). Groupes à relire : rien n'entre dans \`data/enjeux.json\` sans validation.`, ``];
let groups = 0;

for (const theme of thematiques) {
  const inTheme = props.filter((p) => p.thematiqueId === theme.id);
  const pairs: Pair[] = [];
  for (let i = 0; i < inTheme.length; i++) {
    for (let j = i + 1; j < inTheme.length; j++) {
      const a = words.get(inTheme[i].id)!;
      const b = words.get(inTheme[j].id)!;
      const score = cosine(a, b, idf);
      if (score >= SEUIL) {
        pairs.push({ a: inTheme[i].id, b: inTheme[j].id, score, opposed: opposedVerbs(a, b) });
      }
    }
  }
  // Composantes connexes des paires retenues.
  const parent = new Map(inTheme.map((p) => [p.id, p.id]));
  const find = (id: string): string => (parent.get(id) === id ? id : find(parent.get(id)!));
  pairs.forEach(({ a, b }) => parent.set(find(a), find(b)));
  const components = new Map<string, string[]>();
  pairs.flatMap(({ a, b }) => [a, b]).forEach((id) => {
    const root = find(id);
    components.set(root, [...new Set([...(components.get(root) ?? []), id])]);
  });
  if (components.size === 0) {
    continue;
  }
  lines.push(`## ${theme.titre}`, ``);
  for (const ids of components.values()) {
    groups++;
    const inner = pairs.filter((p) => ids.includes(p.a));
    const best = Math.max(...inner.map((p) => p.score));
    const opposed = inner.some((p) => p.opposed);
    lines.push(`### Groupe ${groups} : ${opposed ? 'opposés' : 'proches'} (score max ${best.toFixed(2)})`, ``);
    for (const id of ids) {
      const p = props.find((x) => x.id === id)!;
      lines.push(`- \`${p.id}\` (${p.typeSource}) : ${p.titre}`);
    }
    lines.push(``);
  }
}

fs.writeFileSync(OUTPUT, lines.join('\n'), 'utf-8');
console.log(`✅ ${groups} groupes -> ${path.relative(ROOT_DIR, OUTPUT)}`);
