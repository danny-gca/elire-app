// Contrôle de tous les liens affichés dans l'application : data/ (JSON, CSV) et src/constants/.
// Usage : node .claude/skills/verifier-donnees/scripts/check-links.mjs [--fichier lois.json] [--tout]
import fs from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const onlyFile = args.includes('--fichier') ? args[args.indexOf('--fichier') + 1] : undefined;
const showAll = args.includes('--tout');
// Navigateur mobile : c'est ce que voit l'utilisateur, et ce que simule la vérification Google Play.
const UA = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36';
const CONCURRENCY = 12;

const isUrl = (s) => typeof s === 'string' && /^https?:\/\/\S+$/.test(s.trim());
const links = new Map(); // url -> [emplacements]
const add = (url, where) => {
  const u = url.trim();
  if (!links.has(u)) links.set(u, []);
  links.get(u).push(where);
};

// Parcourt un JSON en gardant un chemin lisible (id de l'élément quand il existe).
function walk(node, trail, file) {
  if (isUrl(node)) return add(node, `${file} > ${trail.join('.')}`);
  if (Array.isArray(node)) return node.forEach((v, i) => walk(v, [...trail, v?.id ?? i], file));
  if (node && typeof node === 'object') Object.entries(node).forEach(([k, v]) => walk(v, [...trail, k], file));
}

const dataDir = path.join(ROOT, 'data');
for (const f of fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'))) {
  if (!onlyFile || onlyFile === f) walk(JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8')), [], f);
}
const csvDir = path.join(dataDir, 'candidats');
for (const f of fs.readdirSync(csvDir).filter((f) => f.endsWith('.csv'))) {
  if (onlyFile && onlyFile !== f) continue;
  const rows = Papa.parse(fs.readFileSync(path.join(csvDir, f), 'utf8'), { header: true, skipEmptyLines: true }).data;
  for (const row of rows) {
    for (const [col, val] of Object.entries(row)) if (isUrl(val)) add(val, `candidats/${f} > ${row.id}.${col}`);
  }
}
const constDir = path.join(ROOT, 'src/constants');
for (const f of fs.readdirSync(constDir).filter((f) => f.endsWith('.ts'))) {
  if (onlyFile && onlyFile !== f) continue;
  const lines = fs.readFileSync(path.join(constDir, f), 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/['"`](https?:\/\/[^'"`\s]+)['"`]/g)) add(m[1], `src/constants/${f}:${i + 1}`);
  });
}

async function check(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'fr' }, redirect: 'follow', signal: AbortSignal.timeout(30000) });
    await res.body?.cancel();
    return { status: res.status, finalUrl: res.url };
  } catch (e) {
    return { status: 0, error: String(e.cause?.code ?? e.message ?? e) };
  }
}

// Anti-robot (202/401/403/406/429), serveur saturé (5xx) ou délai dépassé : la page existe peut-être, à ouvrir à la main.
const blocked = (s) => s === 0 || s >= 500 || [202, 401, 403, 406, 429].includes(s);
const level = (r) => {
  if (r.status >= 200 && r.status < 300 && r.status !== 202) return 'OK';
  if (r.status === 0 && /ENOTFOUND|EAI_AGAIN|ECONNREFUSED/.test(r.error)) return 'ERREUR';
  return blocked(r.status) ? 'A LIRE' : 'ERREUR';
};

const urls = [...links.keys()];
const results = new Map();
let next = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < urls.length) {
      const url = urls[next++];
      results.set(url, await check(url));
    }
  }),
);

const counts = { OK: 0, 'A LIRE': 0, ERREUR: 0 };
for (const lvl of ['ERREUR', 'A LIRE', ...(showAll ? ['OK'] : [])]) {
  for (const url of urls.filter((u) => level(results.get(u)) === lvl)) {
    const r = results.get(url);
    console.log(`${lvl.padEnd(7)} ${String(r.status || r.error).padEnd(6)} ${url}`);
    for (const where of links.get(url)) console.log(`        ↳ ${where}`);
  }
}
for (const url of urls) counts[level(results.get(url))]++;
console.log(`\n${urls.length} lien(s) unique(s) : ${counts.OK} OK, ${counts.ERREUR} erreur(s), ${counts['A LIRE']} à lire.`);
process.exitCode = counts.ERREUR ? 1 : 0;
