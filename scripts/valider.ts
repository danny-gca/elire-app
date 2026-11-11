// Valide des éléments de data/ : écrit date, validateur et empreinte du contenu actuel.
// Usage : npm run valider -- <id | genre:id>... [--candidat <id>] [--modifies] --par claude|danny [--note "..."]
import { ecrireValidations, elements, today, type Element } from './validation-data.ts';

const args = process.argv.slice(2);
const opt = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const par = opt('--par');
const note = opt('--note');
const candidat = opt('--candidat');
const valued = new Set(['--par', '--note', '--candidat']);
const refs = args.filter((a, i) => !a.startsWith('--') && !valued.has(args[i - 1]));

if (par !== 'claude' && par !== 'danny') {
  console.error('--par claude|danny attendu');
  process.exit(1);
}

const all = elements(today());
const cibles = new Map<string, Element>();
const key = (e: Element) => `${e.genre}:${e.id}`;
let erreurs = 0;

for (const ref of refs) {
  const [genre, id] = ref.includes(':') ? ref.split(':') : [undefined, ref];
  const found = all.filter((e) => e.id === id && (!genre || e.genre === genre));
  if (found.length !== 1) {
    console.error(found.length === 0 ? `inconnu : ${ref}` : `ambigu : ${ref} (${found.map(key).join(', ')})`);
    erreurs += 1;
    continue;
  }
  cibles.set(key(found[0]), found[0]);
}
if (candidat) {
  for (const e of all.filter((x) => x.candidatId === candidat)) cibles.set(key(e), e);
}
if (args.includes('--modifies')) {
  for (const e of all.filter((x) => x.statut === 'modifie')) cibles.set(key(e), e);
}
if (erreurs > 0 || cibles.size === 0) {
  console.error(cibles.size === 0 ? 'aucun élément à valider' : 'rien écrit');
  process.exit(1);
}

ecrireValidations([...cibles.values()], par, today(), note);
console.log(`✅ ${cibles.size} élément(s) validé(s) par ${par} : ${[...cibles.keys()].join(', ')}`);
