// Compile data/ vers src/data/dataset.json. Échoue (exit 1) sur toute donnée invalide.
// Usage : node scripts/build-data.ts [--strict]  (--strict : les avertissements deviennent bloquants)
import fs from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';
import { z } from 'zod';

import { checkEnjeux } from '../src/lib/enjeux-check.ts';
import { programmeReminders } from '../src/lib/programme-check.ts';
import { acronymsIn, unexplainedInTitle, wordsIn } from '../src/lib/glossary.ts';
import { negativeWording } from '../src/lib/wording.ts';
import {
  CandidatSourceSchema,
  EnjeuSourceSchema,
  GlossaireEntrySchema,
  LoiSourceSchema,
  MotSchema,
  PartiSchema,
  PropositionCsvSchema,
  RepereSchema,
  ThematiqueSchema,
  type Candidat,
  type Enjeu,
  type Loi,
  type Proposition,
} from '../src/schemas/dataset.ts';

const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const CSV_DIR = path.join(DATA_DIR, 'candidats');
const OUTPUT_FILE = path.join(ROOT_DIR, 'src', 'data', 'dataset.json');
const REFS_FILE = path.join(DATA_DIR, 'refs.json');
const STRICT = process.argv.includes('--strict');

// Élision sans apostrophe : "l énergie", "d achat", "qu il"
const MISSING_APOSTROPHE = /(?<![\p{L}'’·])(?:[ldnsjmtc]|qu) (?=[aeiouyhàâäéèêëîïôöùûüœ])/iu;

const errors: string[] = [];
const warnings: string[] = [];

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
}

function parseArray<T extends z.ZodType>(schema: T, data: unknown, label: string): z.infer<T>[] {
  const result = z.array(schema).safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      // L'id de l'élément plutôt que son rang seul : « enjeux.json eoliennes [3.positions] ».
      const index = issue.path[0];
      const item = Array.isArray(data) && typeof index === 'number' ? (data[index] as { id?: unknown } | undefined)?.id : undefined;
      errors.push(`${label}${typeof item === 'string' ? ` ${item}` : ''} [${issue.path.join('.')}] ${issue.message}`);
    }
    return [];
  }
  return result.data;
}

function checkUniqueIds(items: { id: string }[], label: string) {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) {
      errors.push(`${label} : id en double "${item.id}"`);
    }
    seen.add(item.id);
  }
}

function checkText(text: string | undefined, where: string) {
  if (text && MISSING_APOSTROPHE.test(text)) {
    errors.push(`${where} : apostrophe manquante ("${text.match(MISSING_APOSTROPHE)?.[0]}...")`);
  }
}

// Vote à l'aveugle : aucun nom de candidat ni de parti (sigles et noms comparés à la casse près).
function anonymityTerms(candidats: { nom: string }[], partis: { nom: string; sigle?: string }[]): RegExp[] {
  const terms = new Set<string>();
  for (const c of candidats) {
    terms.add(c.nom);
    terms.add(c.nom.split(' ').slice(1).join(' '));
  }
  for (const p of partis) {
    terms.add(p.nom);
    if (p.sigle) {
      terms.add(p.sigle);
    }
  }
  return [...terms]
    .filter((t) => t.length > 1)
    .map((t) => new RegExp(`(?<![\\p{L}])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}])`, 'u'));
}

function checkAnonymous(text: string, terms: RegExp[], where: string) {
  const hit = terms.find((t) => t.test(text));
  if (hit) {
    errors.push(`${where} : nom de candidat ou de parti visible en vote à l'aveugle ("${text.match(hit)?.[0]}")`);
  }
}

// Noté « Contre », un texte négatif donne une double négation (CONTRIBUTING, règle 12).
function checkWording(text: string, where: string, vote = false) {
  const reason = negativeWording(text, vote);
  if (reason) {
    warnings.push(`${where} : tournure négative (${reason}), à reformuler : « ${text} »`);
  }
}

// Lecture à l'aveugle : chaque sigle est au glossaire, et un titre ne garde que les sigles du quotidien ou développés.
function checkAcronyms(title: string, texts: string[], glossary: Set<string>, used: Set<string>, where: string) {
  for (const sigle of acronymsIn(title, ...texts)) {
    used.add(sigle);
    if (!glossary.has(sigle)) {
      errors.push(`${where} : sigle "${sigle}" absent de glossaire.json`);
    }
  }
  const unexplained = unexplainedInTitle(title);
  if (unexplained.length > 0) {
    errors.push(`${where} : sigle à écrire en clair dans le titre ou la question (${unexplained.join(', ')})`);
  }
}

function checkPreciseUrl(value: string, where: string) {
  if (new URL(value).pathname.replace(/\/$/, '') === '') {
    warnings.push(`${where} : source = page d'accueil (${value}), document précis attendu`);
  }
}

interface Refs {
  propositions: Record<string, number>;
  lois: Record<string, number>;
  enjeux: Record<string, number>;
}

function loadRefs(): Refs {
  const refs = fs.existsSync(REFS_FILE) ? JSON.parse(fs.readFileSync(REFS_FILE, 'utf-8')) : {};
  return { propositions: {}, lois: {}, enjeux: {}, ...refs };
}

function hash(text: string): number {
  let h = 2166136261;
  for (const char of text) {
    h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  }
  return h >>> 0;
}

// Numéro de proposition stable et non séquentiel (100-999) : ne trahit pas l'auteur en vote à l'aveugle.
function propositionNumber(refs: Refs, id: string): number {
  if (refs.propositions[id] === undefined) {
    const used = new Set(Object.values(refs.propositions));
    let n = (hash(id) % 900) + 100;
    while (used.has(n)) {
      n = n === 999 ? 100 : n + 1;
    }
    refs.propositions[id] = n;
  }
  return refs.propositions[id];
}

// Numéro de loi ou d'enjeu stable, attribué dans l'ordre d'arrivée.
function sequentialNumber(numbers: Record<string, number>, id: string): number {
  if (numbers[id] === undefined) {
    numbers[id] = Math.max(0, ...Object.values(numbers)) + 1;
  }
  return numbers[id];
}

// Date conservée si le contenu n'a pas changé, pour que `npm run check` puisse comparer avec git.
function previousGeneratedAt(content: object): string | undefined {
  if (!fs.existsSync(OUTPUT_FILE)) {
    return undefined;
  }
  const { metadata, ...previous } = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
  const { partis, thematiques, candidats, propositions, lois, enjeux, glossaire, mots, reperes } = previous;
  const same = JSON.stringify({ partis, thematiques, candidats, propositions, lois, enjeux, glossaire, mots, reperes }) === JSON.stringify(content);
  return same ? metadata?.generatedAt : undefined;
}

function main() {
  const partis = parseArray(PartiSchema, readJson('partis.json'), 'partis.json');
  const thematiques = parseArray(ThematiqueSchema, readJson('thematiques.json'), 'thematiques.json');
  const rawCandidats = parseArray(CandidatSourceSchema, readJson('candidats.json'), 'candidats.json');
  const sourceLois = parseArray(LoiSourceSchema, readJson('lois.json'), 'lois.json');
  const sourceEnjeux = parseArray(EnjeuSourceSchema, readJson('enjeux.json'), 'enjeux.json');
  const glossaire = parseArray(GlossaireEntrySchema, readJson('glossaire.json'), 'glossaire.json');
  const glossarySigles = new Set(glossaire.map((g) => g.sigle));
  const mots = parseArray(MotSchema, readJson('mots.json'), 'mots.json');
  const reperes = parseArray(RepereSchema, readJson('reperes.json'), 'reperes.json');
  const usedSigles = new Set<string>();
  const refs = loadRefs();

  checkUniqueIds(partis, 'partis.json');
  checkUniqueIds(thematiques, 'thematiques.json');
  checkUniqueIds(rawCandidats, 'candidats.json');
  checkUniqueIds(sourceLois, 'lois.json');
  checkUniqueIds(sourceEnjeux, 'enjeux.json');
  checkUniqueIds(reperes, 'reperes.json');

  const partisById = new Map(partis.map((p) => [p.id, p]));
  const thematiqueIds = new Set(thematiques.map((t) => t.id));
  const candidatIds = new Set(rawCandidats.map((c) => c.id));

  thematiques.forEach((t) => checkText(t.titre + ' ' + t.description, `thematiques.json ${t.id}`));

  const candidats: Candidat[] = rawCandidats.map((c) => {
    const parti = partisById.get(c.partiId);
    if (!parti) {
      errors.push(`candidats.json ${c.id} : parti inconnu "${c.partiId}"`);
    }
    checkText(c.biographie, `candidats.json ${c.id}`);
    return { ...c, parti: parti ? parti.nom : 'Indépendant', couleurParti: parti ? parti.couleur : '#6B7280', sigleParti: parti?.sigle };
  });

  const anonymity = anonymityTerms(rawCandidats, partis);
  const propositions: Proposition[] = [];
  const csvFiles = fs.readdirSync(CSV_DIR).filter((f) => f.endsWith('.csv'));

  for (const file of csvFiles) {
    const candidatId = path.basename(file, '.csv');
    if (!candidatIds.has(candidatId)) {
      errors.push(`${file} : aucun candidat "${candidatId}" dans candidats.json`);
    }

    const csv = Papa.parse<Record<string, string>>(fs.readFileSync(path.join(CSV_DIR, file), 'utf-8'), {
      header: true,
      skipEmptyLines: true,
      transform: (value) => value.trim(),
    });
    for (const parseError of csv.errors) {
      errors.push(`${file} ligne ${(parseError.row ?? 0) + 2} : ${parseError.message}`);
    }

    const rows = parseArray(PropositionCsvSchema, csv.data, file);
    for (const row of rows) {
      const where = `${file} ${row.id}`;
      if (!thematiqueIds.has(row.thematique_id)) {
        errors.push(`${where} : thématique inconnue "${row.thematique_id}"`);
      }
      checkText(`${row.titre} ${row.description} ${row.contexte}`, where);
      checkAnonymous(`${row.titre} ${row.description} ${row.contexte}`, anonymity, where);
      checkAcronyms(row.titre, [row.description, row.contexte], glossarySigles, usedSigles, where);
      checkWording(row.titre, where);
      checkPreciseUrl(row.source_url, where);
      propositions.push({
        id: row.id,
        ref: `P-${propositionNumber(refs, row.id)}`,
        candidatId,
        thematiqueId: row.thematique_id,
        titre: row.titre,
        description: row.description,
        sourceUrl: row.source_url,
        dateDeclaration: row.date_declaration || undefined,
        typeSource: row.type_source,
        contexte: row.contexte,
      });
    }
  }
  checkUniqueIds(propositions, 'propositions');

  const lois: Loi[] = [...sourceLois]
    .sort((a, b) => a.dateVote.localeCompare(b.dateVote) || a.id.localeCompare(b.id))
    .map((loi) => ({ ...loi, ref: `L-${String(sequentialNumber(refs.lois, loi.id)).padStart(2, '0')}` }))
    .sort((a, b) => b.dateVote.localeCompare(a.dateVote));

  for (const loi of lois) {
    if (!thematiqueIds.has(loi.thematiqueId)) {
      errors.push(`lois.json ${loi.id} : thématique inconnue "${loi.thematiqueId}"`);
    }
    checkText(`${loi.titre} ${loi.question} ${loi.enjeu} ${loi.resume}`, `lois.json ${loi.id}`);
    checkAnonymous(`${loi.question} ${loi.enjeu}`, anonymity, `lois.json ${loi.id}`);
    checkAcronyms(loi.question, [loi.enjeu], glossarySigles, usedSigles, `lois.json ${loi.id}`);
    checkWording(loi.question, `lois.json ${loi.id}`, true);
    for (const [candidatId, vote] of Object.entries(loi.votes)) {
      if (!candidatIds.has(candidatId)) {
        errors.push(`lois.json ${loi.id} : candidat inconnu "${candidatId}"`);
      }
      checkText(vote.explication, `lois.json ${loi.id} / ${candidatId}`);
    }
  }

  errors.push(...checkEnjeux(sourceEnjeux, propositions, thematiqueIds));
  const enjeux: Enjeu[] = sourceEnjeux.map((e) => ({ ...e, ref: `E-${String(sequentialNumber(refs.enjeux, e.id)).padStart(2, '0')}` }));
  const linked = new Map(enjeux.flatMap((e) => e.positions.map((p) => [p.propositionId, { enjeuId: e.id, sens: p.sens }] as const)));
  for (const p of propositions) {
    Object.assign(p, linked.get(p.id));
  }
  for (const e of enjeux) {
    const where = `enjeux.json ${e.id}`;
    checkText(`${e.question} ${e.enjeu}`, where);
    checkAnonymous(`${e.question} ${e.enjeu}`, anonymity, where);
    checkAcronyms(e.question, [e.enjeu], glossarySigles, usedSigles, where);
    checkWording(e.question, where);
  }

  // Repères : un sujet par entrée, chaque élément dans un repère au plus, lu à l'aveugle comme le reste.
  const known = { propositions: new Set(propositions.map((p) => p.id)), lois: new Set(lois.map((l) => l.id)), enjeux: new Set(enjeux.map((e) => e.id)) };
  const placed = new Map<string, string>();
  for (const r of reperes) {
    const where = `reperes.json ${r.id}`;
    if (!thematiqueIds.has(r.thematiqueId)) {
      errors.push(`${where} : thématique inconnue "${r.thematiqueId}"`);
    }
    for (const kind of ['propositions', 'lois', 'enjeux'] as const) {
      for (const itemId of r[kind]) {
        if (!known[kind].has(itemId)) {
          errors.push(`${where} : ${kind} inconnu "${itemId}"`);
        }
        if (placed.has(itemId)) {
          errors.push(`${where} : "${itemId}" est déjà dans le repère ${placed.get(itemId)}`);
        }
        placed.set(itemId, r.id);
      }
    }
    if (r.propositions.length + r.lois.length + r.enjeux.length === 0) {
      warnings.push(`${where} : repère rattaché à aucun élément`);
    }
    const texts = [r.titre, r.aujourdhui, r.enDebat, ...r.liens.map((l) => l.titre)];
    checkText(texts.join(' '), where);
    checkAnonymous(texts.join(' '), anonymity, where);
    checkAcronyms(r.titre, [r.aujourdhui, r.enDebat], glossarySigles, usedSigles, where);
    r.liens.forEach((l) => checkPreciseUrl(l.url, `${where} ${l.titre}`));
  }

  // Mots : définis une fois, employés quelque part dans les textes lus à l'aveugle.
  const blindTexts = [
    ...propositions.flatMap((p) => [p.titre, p.description, p.contexte]),
    ...lois.flatMap((l) => [l.question, l.enjeu]),
    ...enjeux.flatMap((e) => [e.question, e.enjeu]),
    ...reperes.flatMap((r) => [r.titre, r.aujourdhui, r.enDebat]),
  ];
  const usedWords = new Set(wordsIn(blindTexts, mots));
  const seenWords = new Set<string>();
  for (const m of mots) {
    const where = `mots.json ${m.mot}`;
    checkText(m.definition, where);
    for (const form of [m.mot, ...(m.variantes ?? [])].map((f) => f.toLowerCase())) {
      if (seenWords.has(form)) {
        errors.push(`${where} : forme en double "${form}"`);
      }
      seenWords.add(form);
    }
    if (!usedWords.has(m.mot)) {
      warnings.push(`${where} : mot employé nulle part`);
    }
  }

  glossaire.forEach((g) => {
    checkText(`${g.forme} ${g.definition ?? ''}`, `glossaire.json ${g.sigle}`);
    // « BFMTV : BFMTV » n'explique rien.
    if (g.forme.replace(/[^\p{L}\p{N}]/gu, '').toUpperCase() === g.sigle) {
      errors.push(`glossaire.json ${g.sigle} : la forme répète le sigle`);
    }
    if (!usedSigles.has(g.sigle)) {
      warnings.push(`glossaire.json ${g.sigle} : sigle employé nulle part`);
    }
  });
  warnings.push(...programmeReminders(rawCandidats, new Date().toISOString().slice(0, 10)));

  warnings.forEach((w) => console.warn(`⚠️  ${w}`));
  if (warnings.length > 0) {
    console.warn(`⚠️  ${warnings.length} avertissement(s)${STRICT ? ' (bloquants en --strict)' : ''}`);
  }
  if (errors.length > 0 || (STRICT && warnings.length > 0)) {
    errors.forEach((e) => console.error(`❌ ${e}`));
    console.error(`❌ ${errors.length} erreur(s)${STRICT ? `, ${warnings.length} avertissement(s)` : ''}, dataset non généré.`);
    process.exit(1);
  }

  const content = { partis, thematiques, candidats, propositions, lois, enjeux, glossaire, mots, reperes };
  const dataset = {
    metadata: {
      generatedAt: previousGeneratedAt(content) ?? new Date().toISOString(),
      partisCount: partis.length,
      candidatsCount: candidats.length,
      thematiquesCount: thematiques.length,
      propositionsCount: propositions.length,
      loisCount: lois.length,
      enjeuxCount: enjeux.length,
    },
    partis,
    thematiques,
    candidats,
    propositions,
    lois,
    enjeux,
    glossaire,
    mots,
    reperes,
  };

  fs.writeFileSync(REFS_FILE, JSON.stringify(refs, null, 2) + '\n', 'utf-8');
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dataset, null, 2) + '\n', 'utf-8');

  console.log(
    `✅ ${partis.length} partis, ${candidats.length} candidats, ${thematiques.length} thématiques, ` +
      `${propositions.length} propositions, ${lois.length} lois, ${enjeux.length} enjeux, ${glossaire.length} sigles, ${mots.length} mots, ${reperes.length} repères -> ${path.relative(ROOT_DIR, OUTPUT_FILE)}`
  );
}

main();
