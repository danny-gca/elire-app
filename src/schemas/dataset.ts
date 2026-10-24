import { z } from 'zod';

// Schémas partagés : validés par scripts/build-data.ts, types consommés par l'app.

const id = z.string().regex(/^[a-z0-9-]+$/, 'id en kebab-case attendu');
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date AAAA-MM-JJ attendue');
const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'couleur #RRGGBB attendue');
const url = z.url({ protocol: /^https$/ });

// Nuance attribuée par le ministère de l'Intérieur à la dernière élection du parti : un classement officiel, pas le nôtre.
export const NuanceOfficielleSchema = z.object({
  code: z.string().min(1),
  libelle: z.string().min(1),
  election: z.string().min(1),
  sourceUrl: url,
});

export const PartiSchema = z.object({
  id,
  nom: z.string().min(1),
  /** Absent quand le parti n'en utilise aucun : on n'en invente pas. */
  sigle: z.string().min(1).optional(),
  couleur: hexColor,
  /** Absente quand le ministère n'a jamais classé le parti : on n'en invente pas. */
  nuanceOfficielle: NuanceOfficielleSchema.optional(),
  siteWeb: url,
});

export const ThematiqueSchema = z.object({
  id,
  titre: z.string().min(1),
  slug: id,
  icone: z.string().min(1),
  description: z.string().min(1),
});

// Critère d'entrée (CONTRIBUTING.md) : candidature déclarée ou désignée, avec une source datée.
export const CandidatureSchema = z.object({
  statut: z.enum(['declaree', 'designee', 'sous_condition', 'pressentie']),
  date: isoDate,
  sourceUrl: url,
});

// Programme 2027 publié : en entier, en partie (premières mesures, dépliant), ou pas encore ; date seulement si la source la donne.
export const ProgrammeSchema = z
  .object({
    statut: z.enum(['complet', 'partiel', 'aucun']),
    url: url.optional(),
    date: isoDate.optional(),
    // Prochaine publication annoncée (programme complet, livret...) : le build la rappelle une fois la date passée.
    annonce: z.object({ date: isoDate, sourceUrl: url }).optional(),
  })
  .refine((p) => p.statut === 'aucun' || p.url, 'url attendue sauf pour « aucun »');

export const CandidatSourceSchema = z.object({
  id,
  nom: z.string().min(1),
  partiId: id,
  avatar: z.string().min(1).max(3),
  photoUrl: url.optional(),
  biographie: z.string().min(1),
  candidature: CandidatureSchema,
  programme: ProgrammeSchema,
});

export const CandidatSchema = CandidatSourceSchema.extend({
  parti: z.string().min(1),
  couleurParti: hexColor,
  /** Sigle du parti s'il en a un ; sinon l'app écrit son nom. */
  sigleParti: z.string().min(1).optional(),
});

// Programme 2027, programme d'une élection passée, ou prise de position (interview, article, circulaire...).
export const TypeSourceSchema = z.enum(['programme_2027', 'programme_anterieur', 'prise_de_position']);

// Une ligne de data/candidats/<candidat-id>.csv
export const PropositionCsvSchema = z.object({
  id,
  thematique_id: id,
  titre: z.string().min(1),
  description: z.string().min(1),
  source_url: url,
  // Vide quand la source n'est pas datée.
  date_declaration: isoDate.or(z.literal('')),
  type_source: TypeSourceSchema,
  contexte: z.string().min(1),
});

const ref = z.string().regex(/^[PLE]-\d{2,3}$/, 'référence P-123 / L-12 / E-04 attendue');
export const SensSchema = z.enum(['pour', 'contre']);

export const PropositionSchema = z.object({
  id,
  ref,
  candidatId: id,
  thematiqueId: id,
  titre: z.string().min(1),
  description: z.string().min(1),
  sourceUrl: url,
  dateDeclaration: isoDate.optional(),
  typeSource: TypeSourceSchema,
  contexte: z.string().min(1),
  /** Question commune qui porte cette proposition (data/enjeux.json), posée par le build. */
  enjeuId: id.optional(),
  sens: SensSchema.optional(),
});

// Une entrée de data/enjeux.json : une question neutre, chaque candidat pour ou contre par une de ses propositions.
export const EnjeuSourceSchema = z.object({
  id,
  thematiqueId: id,
  question: z.string().min(1).max(130),
  enjeu: z.string().min(1).max(220),
  positions: z.array(z.object({ propositionId: id, sens: SensSchema })).min(2),
});

export const EnjeuSchema = EnjeuSourceSchema.extend({ ref });

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
  /** Posée en vote à l'aveugle : ni nom, ni parti, ni résultat ; « pour » = la position « pour » du scrutin. */
  question: z.string().min(1).max(130),
  /** Ce que fait le texte, sans nom ni résultat. */
  enjeu: z.string().min(1).max(220),
  resume: z.string().min(1),
  chambre: ChambreSchema,
  dateVote: isoDate,
  statut: StatutLoiSchema,
  sourceOfficielleUrl: url,
  votes: z.record(id, VoteCandidatLoiSchema),
});

export const LoiSchema = LoiSourceSchema.extend({ ref });

// Glossaire des sigles, affiché dans « En savoir plus ».
export const GlossaireEntrySchema = z.object({
  sigle: z.string().regex(/^\p{Lu}{2,}\p{N}*$/u, 'sigle en capitales attendu'),
  forme: z.string().min(1),
  definition: z.string().min(1).max(160).optional(),
});

export const DatasetSchema = z.object({
  metadata: z.object({
    generatedAt: z.string(),
    partisCount: z.number(),
    candidatsCount: z.number(),
    thematiquesCount: z.number(),
    propositionsCount: z.number(),
    loisCount: z.number(),
    enjeuxCount: z.number(),
  }),
  partis: z.array(PartiSchema),
  thematiques: z.array(ThematiqueSchema),
  candidats: z.array(CandidatSchema),
  propositions: z.array(PropositionSchema),
  lois: z.array(LoiSchema),
  enjeux: z.array(EnjeuSchema),
  glossaire: z.array(GlossaireEntrySchema),
});

export type Parti = z.infer<typeof PartiSchema>;
export type Thematique = z.infer<typeof ThematiqueSchema>;
export type Candidat = z.infer<typeof CandidatSchema>;
export type Candidature = z.infer<typeof CandidatureSchema>;
export type Programme = z.infer<typeof ProgrammeSchema>;
export type Proposition = z.infer<typeof PropositionSchema>;
export type TypeSource = z.infer<typeof TypeSourceSchema>;
export type Sens = z.infer<typeof SensSchema>;
export type EnjeuSource = z.infer<typeof EnjeuSourceSchema>;
export type Enjeu = z.infer<typeof EnjeuSchema>;
export type NatureLoi = z.infer<typeof NatureLoiSchema>;
export type Chambre = z.infer<typeof ChambreSchema>;
export type StatutLoi = z.infer<typeof StatutLoiSchema>;
export type PositionVote = z.infer<typeof PositionVoteSchema>;
export type TypeVote = z.infer<typeof TypeVoteSchema>;
export type VoteCandidatLoi = z.infer<typeof VoteCandidatLoiSchema>;
export type Loi = z.infer<typeof LoiSchema>;
export type GlossaireEntry = z.infer<typeof GlossaireEntrySchema>;
export type Dataset = z.infer<typeof DatasetSchema>;
