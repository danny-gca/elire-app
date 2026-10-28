// Contrôle mécanique des sources : URL joignable, citation présente dans la source, cohérence des scrutins.
// Usage : node .claude/skills/verifier-donnees/scripts/check-sources.mjs [--candidat <id>] [--lois] [--limit N]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Papa from 'papaparse';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const onlyCandidat = opt('--candidat');
const withLois = args.includes('--lois');
const limit = Number(opt('--limit') ?? Infinity);
const UA = 'ElireApp/1.0 (verification des sources; https://github.com/danny-gca/elire-app)';
const cache = new Map();

const norm = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’‘`´]/g, "'")
    .replace(/[«»“”"]/g, '')
    .replace(/[  \s]+/g, ' ')
    // Tirets et césures de PDF (« ré- duction ») : retirés des deux côtés, la comparaison reste juste.
    .replace(/[-‐‑–—]\s?/g, '')
    // Espace laissé par une balise avant la ponctuation (« ordre , notamment »).
    .replace(/ ([,.;:!?)])/g, '$1')
    .replace(/\( /g, '(')
    .toLowerCase()
    .trim();

const ENTITIES = { nbsp: ' ', amp: '&', apos: "'", quot: '"', lt: '<', gt: '>', rsquo: "'", lsquo: "'", laquo: '«', raquo: '»', hellip: '…', ndash: '–', mdash: '—', oelig: 'œ', OElig: 'Œ', euro: '€' };
const ACCENTS = { acute: '́', grave: '̀', circ: '̂', uml: '̈', cedil: '̧', tilde: '̃' };

// &eacute; &Agrave; &ccedil; : lettre et accent ; les autres par la table, les numériques par leur code.
function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (_, name) => {
    if (name[0] === '#') {
      const code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : ' ';
    }
    if (ENTITIES[name]) return ENTITIES[name];
    const accent = /^([a-z])(acute|grave|circ|uml|cedil|tilde)$/i.exec(name);
    return accent ? (accent[1] + ACCENTS[accent[2]]).normalize('NFC') : ' ';
  });
}

// Texte hors du HTML visible : description de la page, et description d'une vidéo YouTube (JSON).
function metaText(html) {
  const parts = [...html.matchAll(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']*)["']/gi)].map((m) => m[1]);
  for (const m of html.matchAll(/"shortDescription":"((?:[^"\\]|\\.)*)"/g)) {
    try {
      parts.push(JSON.parse(`"${m[1]}"`));
    } catch {
      // Description illisible : ignorée.
    }
  }
  return parts.join(' ');
}

function htmlToText(html) {
  const visible = html.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ');
  return decodeEntities(`${visible} ${metaText(html)}`);
}

async function fetchText(url) {
  if (cache.has(url)) return cache.get(url);
  let result;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(30000) });
    const type = res.headers.get('content-type') ?? '';
    const buf = Buffer.from(await res.arrayBuffer());
    let text = '';
    if (type.includes('pdf') || url.toLowerCase().endsWith('.pdf')) {
      const tmp = path.join(os.tmpdir(), `elire-${Date.now()}.pdf`);
      fs.writeFileSync(tmp, buf);
      try {
        text = execFileSync('pdftotext', ['-q', tmp, '-'], { maxBuffer: 64 * 1024 * 1024 }).toString();
      } catch {
        text = '';
      }
      fs.rmSync(tmp, { force: true });
    } else {
      text = htmlToText(buf.toString('utf8'));
    }
    result = { status: res.status, finalUrl: res.url, text: norm(text) };
  } catch (e) {
    result = { status: 0, error: String(e.message ?? e), text: '' };
  }
  cache.set(url, result);
  return result;
}

// Extrait les citations « … » et les découpe aux coupures [...] pour chercher chaque morceau.
function quoteParts(description) {
  const quotes = [...description.matchAll(/«\s*([^»]+?)\s*»/g)].map((m) => m[1]);
  return quotes.flatMap((q) => q.split(/\[\s*(?:\.\.\.|…)\s*\]|…/)).map(norm).filter((p) => p.length >= 15);
}

const findings = [];
const report = (level, ref, msg) => findings.push({ level, ref, msg });
// Anti-robot (202/403/429), serveur saturé (5xx) ou délai dépassé : la page existe peut-être, à ouvrir à la main.
const blocked = (s) => s === 0 || s >= 500 || [202, 401, 403, 429].includes(s);
const unreachable = (ref, label, url, src) =>
  report(blocked(src.status) ? 'A LIRE' : 'ERREUR', ref, `${label} ${blocked(src.status) ? 'non lu (anti-robot, serveur ou délai)' : 'introuvable'} (${src.status || src.error}) : ${url}`);

const dir = path.join(ROOT, 'data/candidats');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.csv') && (!onlyCandidat || f === `${onlyCandidat}.csv`));
let count = 0;
for (const f of files) {
  const rows = Papa.parse(fs.readFileSync(path.join(dir, f), 'utf8'), { header: true, skipEmptyLines: true }).data;
  for (const p of rows) {
    if (count++ >= limit) break;
    const src = await fetchText(p.source_url);
    if (src.status !== 200) {
      unreachable(p.id, 'source', p.source_url, src);
      continue;
    }
    if (new URL(p.source_url).pathname.replace(/\/$/, '') === '') {
      report('ERREUR', p.id, `source = page d'accueil : ${p.source_url}`);
    }
    const parts = quoteParts(p.description);
    if (parts.length === 0) {
      report('ERREUR', p.id, 'description sans citation « … »');
      continue;
    }
    if (!src.text) {
      report('A LIRE', p.id, `texte de la source illisible (PDF scanné, JS, accès bloqué) : ${p.source_url}`);
      continue;
    }
    const missing = parts.filter((part) => !src.text.includes(part));
    if (missing.length) {
      report('A LIRE', p.id, `${missing.length}/${parts.length} extrait(s) introuvable(s) mot pour mot, ex. « ${missing[0].slice(0, 80)} »`);
    }
  }
}

if (withLois) {
  const lois = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/lois.json'), 'utf8'));
  const num = (u) => u?.match(/scrutins\/0*(\d+)/)?.[1];
  for (const loi of lois) {
    const src = await fetchText(loi.sourceOfficielleUrl);
    if (src.status !== 200) unreachable(loi.id, 'scrutin', loi.sourceOfficielleUrl, src);
    for (const [cid, v] of Object.entries(loi.votes)) {
      if (num(v.sourceUrl) && num(loi.sourceOfficielleUrl) && num(v.sourceUrl) !== num(loi.sourceOfficielleUrl)) {
        report('ERREUR', `${loi.id}/${cid}`, `scrutin ${num(v.sourceUrl)} au lieu de ${num(loi.sourceOfficielleUrl)}`);
      }
      if (v.typeVote === 'groupe_parti' && !v.groupe) report('ERREUR', `${loi.id}/${cid}`, 'vote de groupe sans sigle de groupe');
    }
  }
}

for (const level of ['ERREUR', 'A LIRE']) {
  for (const f of findings.filter((x) => x.level === level)) console.log(`${level.padEnd(7)} ${f.ref.padEnd(28)} ${f.msg}`);
}
console.log(`\n${count > limit ? limit : count} proposition(s) contrôlée(s)${withLois ? ', lois incluses' : ''} : ${findings.filter((x) => x.level === 'ERREUR').length} erreur(s), ${findings.filter((x) => x.level === 'A LIRE').length} à lire.`);
process.exitCode = findings.some((x) => x.level === 'ERREUR') ? 1 : 0;
