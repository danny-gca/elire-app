// Statut de validation interne des données (jamais affiché dans l'app) : partagé par les scripts et les tests (aucun import d'alias).

export type Validateur = 'claude' | 'danny';
export type Genre = 'proposition' | 'loi' | 'enjeu' | 'candidat' | 'parti' | 'sujet';
export type StatutValidation = 'valide' | 'modifie' | 'perime' | 'jamais';

export interface Validation {
  le: string;
  par: Validateur;
  empreinte: string;
  note?: string;
}

/** Délai avant revalidation, en jours (null : jamais périmé par le temps). */
export const DELAIS = {
  proposition: 90, // seulement si la source n'est pas un programme 2027
  loiEnCours: 30,
  candidat: 30,
  parti: 365,
  sujet: 180,
} as const;

// Sérialisation aux clés triées : la même donnée donne toujours la même empreinte.
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined);
    return `{${entries
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([k, v]) => `${JSON.stringify(k)}:${stable(v)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

/** Empreinte courte (FNV-1a 32 bits) du contenu d'un élément, sans ses champs de validation. */
export function empreinte(contenu: unknown): string {
  let hash = 0x811c9dc5;
  for (const char of stable(contenu)) {
    hash ^= char.codePointAt(0)!;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

interface StatutInput {
  validation?: Validation;
  empreinte: string;
  /** AAAA-MM-JJ */
  today: string;
  delaiJours: number | null;
  /** Fait daté qui impose une relecture s'il est postérieur à la validation (ex. programme publié). */
  faitNouveau?: { date: string; motif: string };
}

export function statutValidation({ validation, empreinte: actuelle, today, delaiJours, faitNouveau }: StatutInput): {
  statut: StatutValidation;
  motif: string;
} {
  if (!validation) return { statut: 'jamais', motif: 'jamais validé' };
  if (validation.empreinte !== actuelle) return { statut: 'modifie', motif: `modifié depuis la validation du ${validation.le}` };
  if (faitNouveau && faitNouveau.date > validation.le) return { statut: 'perime', motif: `${faitNouveau.motif} le ${faitNouveau.date}` };
  const jours = (Date.parse(today) - Date.parse(validation.le)) / 86_400_000;
  if (delaiJours !== null && jours > delaiJours) return { statut: 'perime', motif: `validé le ${validation.le}, plus de ${delaiJours} jours` };
  return { statut: 'valide', motif: `validé le ${validation.le} par ${validation.par}` };
}

/** Historique des vérifications, la plus récente en tête : « AAAA-MM-JJ note // précédentes ». */
export function noteHistorique(le: string, note: string | undefined, ancienne: string | undefined): string | undefined {
  const nouvelle = note ? `${le} ${note}` : undefined;
  if (nouvelle && ancienne?.startsWith(nouvelle)) return ancienne;
  return [nouvelle, ancienne].filter(Boolean).join(' // ') || undefined;
}
