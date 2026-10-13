import { z } from 'zod';

// Schémas partagés : validés par scripts/build-data.ts, types consommés par l'app.

const id = z.string().regex(/^[a-z0-9-]+$/, 'id en kebab-case attendu');
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date AAAA-MM-JJ attendue');
const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'couleur #RRGGBB attendue');
const url = z.url({ protocol: /^https$/ });

export const PartiSchema = z.object({
  id,
  nom: z.string().min(1),
  sigle: z.string().min(1),
  couleur: hexColor,
  nuance: z.string().min(1),
  siteWeb: url,
});

export const ThematiqueSchema = z.object({
  id,
  titre: z.string().min(1),
  slug: id,
  icone: z.string().min(1),
  description: z.string().min(1),
});

export const CandidatSourceSchema = z.object({
  id,
  nom: z.string().min(1),
  partiId: id,
  avatar: z.string().min(1).max(3),
  photoUrl: url.optional(),
  biographie: z.string().min(1),
});

export const CandidatSchema = CandidatSourceSchema.extend({
  parti: z.string().min(1),
  couleurParti: hexColor,
});

// Une ligne de data/candidats/<candidat-id>.csv
export const PropositionCsvSchema = z.object({
  id,
  thematique_id: id,
  titre: z.string().min(1),
  description: z.string().min(1),
  source_url: url,
  // Vide quand la source n'est pas datée.
  date_declaration: isoDate.or(z.literal('')),
  contexte: z.string().min(1),
});

const ref = z.string().regex(/^[PL]-\d{2,3}$/, 'référence P-123 / L-12 attendue');

export const PropositionSchema = z.object({
  id,
  ref,
  candidatId: id,
  thematiqueId: id,
  titre: z.string().min(1),
  description: z.string().min(1),
  sourceUrl: url,
  dateDeclaration: isoDate.optional(),
  contexte: z.string().min(1),
});

export const NatureLoiSchema = z.enum([
  'projet_loi',
  'proposition_loi',
  'motion_censure',
  'declaration_gouvernement',
  'resolution',
  'texte_europeen',
]);
export const ChambreSchema = z.enum(['assemblee_nationale', 'senat', 'parlement_europeen']);
export const StatutLoiSchema = z.enum(['adoptee', 'rejetee', 'en_cours']);
export const PositionVoteSchema = z.enum(['pour', 'contre', 'abstention']);
export const TypeVoteSchema = z.enum(['individuel', 'groupe_parti']);

export const VoteCandidatLoiSchema = z.object({
  position: PositionVoteSchema,
  typeVote: TypeVoteSchema,
  /** Sigle du groupe parlementaire (votes de groupe), ex. LFI-NFP. */
  groupe: z.string().min(1).optional(),
  groupeNom: z.string().min(1).optional(),
  explication: z.string().optional(),
  sourceUrl: url,
});

// Une entrée de data/lois.json
export const LoiSourceSchema = z.object({
  id,
  thematiqueId: id,
  nature: NatureLoiSchema,
  titre: z.string().min(1),
  resume: z.string().min(1),
  chambre: ChambreSchema,
  dateVote: isoDate,
  statut: StatutLoiSchema,
  sourceOfficielleUrl: url,
  votes: z.record(id, VoteCandidatLoiSchema),
});

export const LoiSchema = LoiSourceSchema.extend({ ref });

export const DatasetSchema = z.object({
  metadata: z.object({
    generatedAt: z.string(),
    partisCount: z.number(),
    candidatsCount: z.number(),
    thematiquesCount: z.number(),
    propositionsCount: z.number(),
    loisCount: z.number(),
  }),
  partis: z.array(PartiSchema),
  thematiques: z.array(ThematiqueSchema),
  candidats: z.array(CandidatSchema),
  propositions: z.array(PropositionSchema),
  lois: z.array(LoiSchema),
});

export type Parti = z.infer<typeof PartiSchema>;
export type Thematique = z.infer<typeof ThematiqueSchema>;
export type Candidat = z.infer<typeof CandidatSchema>;
export type Proposition = z.infer<typeof PropositionSchema>;
export type NatureLoi = z.infer<typeof NatureLoiSchema>;
export type Chambre = z.infer<typeof ChambreSchema>;
export type StatutLoi = z.infer<typeof StatutLoiSchema>;
export type PositionVote = z.infer<typeof PositionVoteSchema>;
export type TypeVote = z.infer<typeof TypeVoteSchema>;
export type VoteCandidatLoi = z.infer<typeof VoteCandidatLoiSchema>;
export type Loi = z.infer<typeof LoiSchema>;
export type Dataset = z.infer<typeof DatasetSchema>;
