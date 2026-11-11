// Liste ce qui reste à vérifier (jamais validé, modifié, périmé) dans docs/a-verifier.md.
// Usage : npm run a-verifier [-- --genre <genre>] [--candidat <id>]
import fs from 'node:fs';
import path from 'node:path';

import { elements, today } from './validation-data.ts';

const args = process.argv.slice(2);
const opt = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const genre = opt('--genre');
const candidat = opt('--candidat');
const day = today();

const all = elements(day).filter((e) => (!genre || e.genre === genre) && (!candidat || e.candidatId === candidat));
const todo = all.filter((e) => e.statut !== 'valide');
const count = (s: string) => all.filter((e) => e.statut === s).length;
const resume = `${count('valide')} validés, ${count('modifie')} modifiés, ${count('perime')} périmés, ${count('jamais')} jamais validés`;

const groups = new Map<string, typeof todo>();
for (const e of todo) {
  const g = e.genre === 'proposition' ? `proposition · ${e.candidatId}` : e.genre;
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g)!.push(e);
}
const lines = [
  '# À vérifier',
  '',
  `Généré par \`npm run a-verifier\` le ${day} : ${resume}. Après vérification : \`npm run valider -- <id> --par claude|danny --note "..."\`.`,
  '',
];
for (const [g, items] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
  lines.push(`## ${g}`, '', ...items.map((e) => `- \`${e.genre}:${e.id}\` : ${e.motif}`), '');
}
if (todo.length === 0) lines.push('Rien à vérifier.', '');

fs.writeFileSync(path.resolve(import.meta.dirname, '..', 'docs', 'a-verifier.md'), lines.join('\n'));
console.log(`🔎 ${resume} -> docs/a-verifier.md`);
