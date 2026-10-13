// Compile data/ vers src/data/dataset.json. Échoue (exit 1) sur toute donnée invalide.
// Usage : node scripts/build-data.ts [--strict]  (--strict : les avertissements deviennent bloquants)
import fs from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';
import { z } from 'zod';

import {
  CandidatSourceSchema,
  LoiSourceSchema,
  PartiSchema,
  PropositionCsvSchema,
  ThematiqueSchema,
  type Candidat,
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
      errors.push(`${label} [${issue.path.join('.')}] ${issue.message}`);
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

function checkPreciseUrl(value: string, where: string) {
  if (new URL(value).pathname.replace(/\/$/, '') === '') {
    warnings.push(`${where} : source = page d'accueil (${value}), document précis attendu`);
  }
}

interface Refs {
  propositions: Record<string, number>;
  lois: Record<string, number>;
}

function loadRefs(): Refs {
  return fs.existsSync(REFS_FILE)
    ? JSON.parse(fs.readFileSync(REFS_FILE, 'utf-8'))
    : { propositions: {}, lois: {} };
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

// Numéro de loi stable, attribué dans l'ordre d'arrivée.
function loiNumber(refs: Refs, id: string): number {
  if (refs.lois[id] === undefined) {
    refs.lois[id] = Math.max(0, ...Object.values(refs.lois)) + 1;
  }
  return refs.lois[id];
}

// Date conservée si le contenu n'a pas changé, pour que `npm run check` puisse comparer avec git.
function previousGeneratedAt(content: object): string | undefined {
  if (!fs.existsSync(OUTPUT_FILE)) {
    return undefined;
  }
  const { metadata, ...previous } = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
  const { partis, thematiques, candidats, propositions, lois } = previous;
  const same = JSON.stringify({ partis, thematiques, candidats, propositions, lois }) === JSON.stringify(content);
  return same ? metadata?.generatedAt : undefined;
}

function main() {
  const partis = parseArray(PartiSchema, readJson('partis.json'), 'partis.json');
  const thematiques = parseArray(ThematiqueSchema, readJson('thematiques.json'), 'thematiques.json');
  const rawCandidats = parseArray(CandidatSourceSchema, readJson('candidats.json'), 'candidats.json');
  const sourceLois = parseArray(LoiSourceSchema, readJson('lois.json'), 'lois.json');
  const refs = loadRefs();

  checkUniqueIds(partis, 'partis.json');
  checkUniqueIds(thematiques, 'thematiques.json');
  checkUniqueIds(rawCandidats, 'candidats.json');
  checkUniqueIds(sourceLois, 'lois.json');

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
    return { ...c, parti: parti ? parti.nom : 'Indépendant', couleurParti: parti ? parti.couleur : '#6B7280' };
  });

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
        contexte: row.contexte,
      });
    }
  }
  checkUniqueIds(propositions, 'propositions');

  const lois: Loi[] = [...sourceLois]
    .sort((a, b) => a.dateVote.localeCompare(b.dateVote) || a.id.localeCompare(b.id))
    .map((loi) => ({ ...loi, ref: `L-${String(loiNumber(refs, loi.id)).padStart(2, '0')}` }))
    .sort((a, b) => b.dateVote.localeCompare(a.dateVote));

  for (const loi of lois) {
    if (!thematiqueIds.has(loi.thematiqueId)) {
      errors.push(`lois.json ${loi.id} : thématique inconnue "${loi.thematiqueId}"`);
    }
    checkText(`${loi.titre} ${loi.resume}`, `lois.json ${loi.id}`);
    for (const [candidatId, vote] of Object.entries(loi.votes)) {
      if (!candidatIds.has(candidatId)) {
        errors.push(`lois.json ${loi.id} : candidat inconnu "${candidatId}"`);
      }
      checkText(vote.explication, `lois.json ${loi.id} / ${candidatId}`);
    }
  }

  warnings.forEach((w) => console.warn(`⚠️  ${w}`));
  if (warnings.length > 0) {
    console.warn(`⚠️  ${warnings.length} avertissement(s)${STRICT ? ' (bloquants en --strict)' : ''}`);
  }
  if (errors.length > 0 || (STRICT && warnings.length > 0)) {
    errors.forEach((e) => console.error(`❌ ${e}`));
    console.error(`❌ ${errors.length} erreur(s)${STRICT ? `, ${warnings.length} avertissement(s)` : ''}, dataset non généré.`);
    process.exit(1);
  }

  const content = { partis, thematiques, candidats, propositions, lois };
  const dataset = {
    metadata: {
      generatedAt: previousGeneratedAt(content) ?? new Date().toISOString(),
      partisCount: partis.length,
      candidatsCount: candidats.length,
      thematiquesCount: thematiques.length,
      propositionsCount: propositions.length,
      loisCount: lois.length,
    },
    partis,
    thematiques,
    candidats,
    propositions,
    lois,
  };

  fs.writeFileSync(REFS_FILE, JSON.stringify(refs, null, 2) + '\n', 'utf-8');
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dataset, null, 2) + '\n', 'utf-8');

  console.log(
    `✅ ${partis.length} partis, ${candidats.length} candidats, ${thematiques.length} thématiques, ` +
      `${propositions.length} propositions, ${lois.length} lois -> ${path.relative(ROOT_DIR, OUTPUT_FILE)}`
  );
}

main();
