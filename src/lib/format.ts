import type { Candidature, Chambre, NatureLoi, PositionVote, StatutLoi, TypeVote } from '@/schemas/dataset';

const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) {
    return isoDate;
  }
  return `${day}\u00a0${MOIS[month - 1]}\u00a0${year}`;
}

/** Statut de candidature et sa date, pour le lien vers la source (fiche candidat). */
export function candidatureText({ statut, date }: Candidature): string {
  const jour = formatDate(date);
  switch (statut) {
    case 'designee':
      return `Candidature désignée par son parti le ${jour}`;
    case 'sous_condition':
      return `Candidature annoncée sous condition le ${jour}`;
    case 'pressentie':
      return `Candidature pressentie, pas encore déclarée (source du ${jour})`;
    default:
      return `Candidature déclarée le ${jour}`;
  }
}

export const CHAMBRE_LABELS: Record<Chambre, string> = {
  assemblee_nationale: 'Assemblée nationale',
  senat: 'Sénat',
  parlement_europeen: 'Parlement européen',
};

export const NATURE_LABELS: Record<NatureLoi, string> = {
  projet_loi: 'Projet de loi',
  proposition_loi: 'Proposition de loi',
  motion_censure: 'Motion de censure',
  declaration_gouvernement: 'Déclaration du gouvernement',
  resolution: 'Résolution',
  texte_europeen: 'Texte européen',
};

export const STATUT_LABELS: Record<StatutLoi, string> = {
  adoptee: 'Adoptée',
  rejetee: 'Rejetée',
  en_cours: 'En cours',
};

export const POSITION_LABELS: Record<PositionVote, string> = {
  pour: 'Pour',
  contre: 'Contre',
  abstention: 'Abstention',
};

export const TYPE_VOTE_LABELS: Record<TypeVote, string> = {
  individuel: 'Vote personnel',
  groupe_parti: 'Position du groupe',
};

export function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count > 1 ? pluralForm : singular}`;
}

/** Comparaison insensible à la casse et aux accents. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}
