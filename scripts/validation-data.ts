// Lecture et écriture des champs de validation dans data/ (colonnes valide_* des CSV, champ `validation` des JSON).
import fs from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';

import { DELAIS, empreinte, noteHistorique, statutValidation, type Genre, type StatutValidation, type Validateur, type Validation } from '../src/lib/validation.ts';

const DATA_DIR = path.resolve(import.meta.dirname, '..', 'data');
const CSV_DIR = path.join(DATA_DIR, 'candidats');
export const CSV_VALIDATION = ['valide_le', 'valide_par', 'valide_empreinte', 'valide_note'] as const;
const JSON_FILES: Record<Exclude<Genre, 'proposition'>, string> = {
  loi: 'lois.json',
  enjeu: 'enjeux.json',
  candidat: 'candidats.json',
  parti: 'partis.json',
  sujet: 'sujets.json',
};

type Item = Record<string, unknown> & { id: string; validation?: Validation };

export interface Element {
  genre: Genre;
  id: string;
  /** Candidat de la proposition, ou le candidat lui-même. */
  candidatId?: string;
  empreinte: string;
  validation?: Validation;
  statut: StatutValidation;
  motif: string;
}

const readJson = (file: string): Item[] => JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));

function contenu(item: Item): Record<string, unknown> {
  const { validation: _validation, ...rest } = item;
  return rest;
}

function csvRows(file: string): Record<string, string>[] {
  return Papa.parse<Record<string, string>>(fs.readFileSync(path.join(CSV_DIR, file), 'utf-8'), {
    header: true,
    skipEmptyLines: true,
    transform: (value) => value.trim(),
  }).data;
}

function csvContenu(row: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(row).filter(([k]) => !(CSV_VALIDATION as readonly string[]).includes(k)));
}

function csvValidation(row: Record<string, string>): Validation | undefined {
  if (!row.valide_le) return undefined;
  return { le: row.valide_le, par: row.valide_par as Validateur, empreinte: row.valide_empreinte, note: row.valide_note || undefined };
}

/** Tous les éléments de data/ avec leur statut de validation au jour `today`. */
export function elements(today: string): Element[] {
  const candidats = readJson('candidats.json');
  const programmeDate = new Map(candidats.map((c) => [c.id, (c.programme as { date?: string } | undefined)?.date]));
  const out: Element[] = [];

  for (const file of fs.readdirSync(CSV_DIR).filter((f) => f.endsWith('.csv')).sort()) {
    const candidatId = file.replace(/\.csv$/, '');
    for (const row of csvRows(file)) {
      const emp = empreinte(csvContenu(row));
      const validation = csvValidation(row);
      const date = programmeDate.get(candidatId);
      const s = statutValidation({
        validation,
        empreinte: emp,
        today,
        delaiJours: row.type_source === 'programme_2027' ? null : DELAIS.proposition,
        faitNouveau: date ? { date, motif: 'programme publié' } : undefined,
      });
      out.push({ genre: 'proposition', id: row.id, candidatId, empreinte: emp, validation, ...s });
    }
  }

  for (const [genre, file] of Object.entries(JSON_FILES) as [Exclude<Genre, 'proposition'>, string][]) {
    for (const item of readJson(file)) {
      const emp = empreinte(contenu(item));
      const delaiJours =
        genre === 'loi' ? (item.statut === 'en_cours' ? DELAIS.loiEnCours : null) : genre === 'enjeu' ? null : DELAIS[genre];
      const s = statutValidation({ validation: item.validation, empreinte: emp, today, delaiJours });
      out.push({ genre, id: item.id, candidatId: genre === 'candidat' ? item.id : undefined, empreinte: emp, validation: item.validation, ...s });
    }
  }
  return out;
}

// enjeux.json garde son format : une position par ligne.
function formatEnjeux(items: Item[]): string {
  const d = (v: unknown) => JSON.stringify(v);
  const blocks = items.map((e) => {
    const lines = Object.entries(e)
      .filter(([k]) => k !== 'positions' && k !== 'validation')
      .map(([k, v]) => `    ${d(k)}: ${d(v)},`);
    const positions = (e.positions as { propositionId: string; sens: string }[])
      .map((p) => `      { "propositionId": ${d(p.propositionId)}, "sens": ${d(p.sens)} }`)
      .join(',\n');
    const validation = e.validation ? `,\n    "validation": ${d(e.validation)}` : '';
    return `  {\n${lines.join('\n')}\n    "positions": [\n${positions}\n    ]${validation}\n  }`;
  });
  return `[\n${blocks.join(',\n')}\n]\n`;
}

/** Ajoute les colonnes valide_* à un CSV qui ne les a pas encore (une fois). */
function ensureCsvColumns(file: string): void {
  const p = path.join(CSV_DIR, file);
  const lines = fs.readFileSync(p, 'utf-8').split('\n');
  if (lines[0].includes('valide_le')) return;
  const out = lines.map((line, i) => (line.trim() === '' ? line : i === 0 ? `${line},${CSV_VALIDATION.join(',')}` : `${line},,,,`));
  fs.writeFileSync(p, out.join('\n'));
}

/** Écrit la validation des éléments donnés (empreinte du contenu actuel, note ajoutée à l'historique), sans toucher aux autres lignes. */
export function ecrireValidations(cibles: Element[], par: Validateur, le: string, note?: string): void {
  const v = (e: Element): Validation => {
    const n = noteHistorique(le, note, e.validation?.note);
    return { le, par, empreinte: e.empreinte, ...(n ? { note: n } : {}) };
  };

  const parCsv = new Map<string, Map<string, Validation>>();
  for (const e of cibles.filter((c) => c.genre === 'proposition')) {
    const file = `${e.candidatId}.csv`;
    if (!parCsv.has(file)) parCsv.set(file, new Map());
    parCsv.get(file)!.set(e.id, v(e));
  }
  for (const [file, ids] of parCsv) {
    ensureCsvColumns(file);
    const p = path.join(CSV_DIR, file);
    const lines = fs.readFileSync(p, 'utf-8').split('\n');
    const header = Papa.parse<string[]>(lines[0]).data[0];
    const out = lines.map((line, i) => {
      if (i === 0 || line.trim() === '') return line;
      const fields = Papa.parse<string[]>(line).data[0];
      const val = ids.get(fields[0]);
      if (!val) return line;
      const row = Object.fromEntries(header.map((h, j) => [h, fields[j] ?? '']));
      Object.assign(row, { valide_le: val.le, valide_par: val.par, valide_empreinte: val.empreinte, valide_note: val.note ?? '' });
      return Papa.unparse([header.map((h) => row[h])], { newline: '' });
    });
    fs.writeFileSync(p, out.join('\n'));
  }

  for (const [genre, file] of Object.entries(JSON_FILES) as [Exclude<Genre, 'proposition'>, string][]) {
    const ids = new Map(cibles.filter((c) => c.genre === genre).map((c) => [c.id, v(c)]));
    if (ids.size === 0) continue;
    const items = readJson(file);
    for (const item of items) {
      const val = ids.get(item.id);
      if (val) item.validation = val;
    }
    fs.writeFileSync(path.join(DATA_DIR, file), genre === 'enjeu' ? formatEnjeux(items) : `${JSON.stringify(items, null, 2)}\n`);
  }
}

export const today = () => new Date().toISOString().slice(0, 10);
