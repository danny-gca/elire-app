// Recalcule les votes de data/lois.json depuis la page officielle de chaque scrutin de l'Assemblée (date, résultat, décompte des groupes, votes nominatifs).
// Usage : node .claude/skills/verifier-donnees/scripts/check-votes.mjs [--loi <id>]
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const onlyLoi = args.includes('--loi') ? args[args.indexOf('--loi') + 1] : undefined;
const UA = 'ElireApp/1.0 (verification des sources; https://github.com/danny-gca/elire-app)';
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const POSITIONS = { Pour: 'pour', Contre: 'contre', Abstention: 'abstention', 'Non votant': 'non_votant' };

const groupKey = (s) => norm(s.replace(/\s*\(membre de l.intergroupe NUPES\)/, ''));
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, "'").replace(/\s+/g, ' ').toLowerCase().trim();
const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, c) => String.fromCodePoint(Number(c)))
    .replace(/&#x([0-9a-f]+);/gi, (_, c) => String.fromCodePoint(parseInt(c, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
const toText = (html) =>
  decode(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, '\n'))
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

// « Votes des groupes » jusqu'au pied de page « LCP » : nom du groupe, puis ses lignes « Pour : n »… (aucune ligne : aucun vote).
function groupCounts(lines) {
  const groups = new Map();
  const start = lines.indexOf('Votes des groupes');
  if (start < 0) return groups;
  let current;
  for (let i = start + 1; i < lines.length && lines[i] !== 'LCP'; i += 1) {
    const m = /^(Pour|Contre|Abstention|Non votant) : (\d+)$/.exec(lines[i]);
    if (m) {
      current[POSITIONS[m[1]]] = Number(m[2]);
    } else {
      current = { pour: 0, contre: 0, abstention: 0, non_votant: 0, nom: lines[i] };
      groups.set(groupKey(lines[i]), current);
    }
  }
  return groups;
}

// Position du député : le dernier intitulé « Pour / Contre / Abstention / Non votant » avant son nom.
function personalVote(html, nom) {
  const esc = nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Député : lien vers sa fiche ; sénateur (Congrès) : nom seul.
  const re = new RegExp(`title="Accéder à la fiche de (?:M\\.|Mme) ${esc}\\s*"|<span class="_small">(?:M\\.|Mme) ${esc}\\s*</span>`, 'i');
  const m = re.exec(decode(html));
  if (!m) return undefined;
  const before = decode(html).slice(0, m.index);
  const heads = [...before.matchAll(/<span class="h6[^"]*">(Pour|Contre|Abstention|Non votant)<\/span>/g)];
  return heads.length ? POSITIONS[heads.at(-1)[1]] : '?';
}

// Motion de censure : seuls les « pour » sont décomptés, un groupe sans vote est contre.
function majority(c, censure) {
  if (c.pour + c.contre + c.abstention === 0) return censure ? 'contre' : 'aucun vote';
  const ranked = ['pour', 'contre', 'abstention'].sort((a, b) => c[b] - c[a]);
  return c[ranked[0]] === c[ranked[1]] ? 'égalité' : ranked[0];
}

const lois = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/lois.json'), 'utf8'));
const candidats = new Map(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/candidats.json'), 'utf8')).map((c) => [c.id, c.nom]));
const report = (level, loi, msg) => console.log(`${level.padEnd(7)} ${loi.padEnd(44)} ${msg}`);
let errors = 0;
let todo = 0;

for (const loi of lois) {
  if (onlyLoi && loi.id !== onlyLoi) continue;
  if (loi.chambre !== 'assemblee_nationale') {
    report('A LIRE', loi.id, `${loi.chambre} : à vérifier à la main`);
    todo += 1;
    continue;
  }
  const res = await fetch(loi.sourceOfficielleUrl, { headers: { 'User-Agent': UA } });
  if (!res.ok) {
    report('A LIRE', loi.id, `scrutin non lu (${res.status})`);
    todo += 1;
    continue;
  }
  const html = await res.text();
  const lines = toText(html);
  const problems = [];
  const [y, mo, d] = loi.dateVote.split('-').map(Number);
  const dateText = norm(`${d === 1 ? '1er' : d} ${MOIS[mo - 1]} ${y}`);
  const congres = /\/c\d+$/.test(loi.sourceOfficielleUrl);
  if (!congres && !lines.some((l) => norm(l).includes(dateText))) problems.push(`date ${loi.dateVote} absente de la page (${lines.find((l) => /séance du /i.test(l)) ?? '?'})`);
  // Motion de rejet, amendement de suppression, censure d'une réforme : « pour » sur la page = « contre » la question.
  const inverse = /motion de rejet|amendements? de suppression|motion de censure/i.test(
    [loi.nature === 'motion_censure' ? '' : loi.titre, loi.nature === 'motion_censure' ? '' : loi.resume, ...Object.values(loi.votes).map((v) => v.explication)].join(' '),
  );
  const flip = (p) => (inverse ? { pour: 'contre', contre: 'pour' }[p] ?? p : p);
  const adopted = lines.some((l) => /a adopté/.test(l) && !/n'a pas adopté/.test(l));
  const rejected = lines.some((l) => /n'a pas adopté/.test(l));
  const pageStatut = rejected ? 'rejetee' : adopted ? 'adoptee' : '?';
  const expected = inverse ? { adoptee: 'rejetee', rejetee: 'adoptee' }[pageStatut] : pageStatut;
  if (loi.statut !== 'en_cours' && loi.statut !== expected) problems.push(`statut ${loi.statut}, page : ${pageStatut}${inverse ? ' (scrutin inversé)' : ''}`);
  const synth = (label) => Number(lines[lines.indexOf(label) + 1]);
  const voix = /(\d+) voix contre (\d+)/.exec(loi.resume ?? '');
  const pair = [synth("Pour l'adoption :"), synth('Contre :')].sort().join();
  if (voix && [Number(voix[1]), Number(voix[2])].sort().join() !== pair) {
    problems.push(`résumé « ${voix[0]} » ≠ page ${synth("Pour l'adoption :")} pour, ${synth('Contre :')} contre`);
  }
  const groups = groupCounts(lines);
  for (const [cid, v] of Object.entries(loi.votes)) {
    const nom = candidats.get(cid) ?? cid;
    const own = personalVote(html, nom);
    if (v.sourceUrl !== loi.sourceOfficielleUrl) {
      report('A LIRE', loi.id, `${cid} : vote sourcé sur un autre scrutin (${v.sourceUrl})`);
      todo += 1;
      continue;
    }
    if (v.typeVote === 'individuel') {
      if (own === undefined) problems.push(`${cid} : individuel, absent des votes nominatifs`);
      else if (flip(own) !== v.position) problems.push(`${cid} : individuel ${v.position}, page ${own}`);
      continue;
    }
    if (own !== undefined) problems.push(`${cid} : a voté lui-même (${own}), noté en groupe`);
    const g = groups.get(groupKey(v.groupeNom ?? ''));
    if (!g) {
      problems.push(`${cid} : groupe « ${v.groupeNom} » introuvable (${[...groups.values()].map((x) => x.nom).join(' / ')})`);
      continue;
    }
    const censure = loi.nature === 'motion_censure' || /motion de censure/i.test(v.explication);
    const maj = flip(majority(g, censure));
    const counts = `${g.pour} pour, ${g.contre} contre, ${g.abstention} abstention`;
    if (maj !== v.position) problems.push(`${cid} : ${v.position}, majorité du groupe ${maj} (${counts})`);
    const said = (label) => new RegExp(`(\\d+) ${label}`).exec(v.explication)?.[1];
    const wrong = ['pour', 'contre', 'abstention'].filter((k) => said(k) !== undefined && Number(said(k)) !== g[k]);
    if (wrong.length) problems.push(`${cid} : explication « ${v.explication} » ≠ ${counts}`);
  }
  if (problems.length) {
    errors += problems.length;
    for (const p of problems) report('ERREUR', loi.id, p);
  } else {
    report('OK', loi.id, `${Object.keys(loi.votes).length} vote(s)${inverse ? ', scrutin inversé' : ''}`);
  }
}
console.log(`${errors} erreur(s), ${todo} à lire.`);
