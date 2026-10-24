import type { LoiVoteValue, CandidateScore } from '@/lib/scoring';
import type { Loi } from '@/schemas/dataset';

export type ShareMode = 'complet' | 'discret' | 'themes' | 'scrutins';

/** Chiffres du mode discret : aucun nom, seulement l'avancée du lecteur. */
export function shareSummary(scores: readonly CandidateScore[]) {
  const ranked = scores.filter((s) => s.ranked);
  return {
    ranked: ranked.length,
    fiables: ranked.filter((s) => s.reliability === 'fiable').length,
    total: scores.length,
  };
}

export interface ScrutinsSummary {
  /** Textes adoptés ou rejetés où le lecteur a voté Pour ou Contre. */
  total: number;
  /** Même sort qu'au Parlement : Pour un texte adopté, Contre un texte rejeté. */
  same: number;
  adoptedAgainst: number;
  rejectedFor: number;
}

/** Les votes du lecteur comparés au sort réel des textes ; abstentions et textes en cours exclus. */
export function scrutinsSummary(lois: readonly Loi[], loiVotes: Record<string, LoiVoteValue>): ScrutinsSummary {
  const summary = { total: 0, same: 0, adoptedAgainst: 0, rejectedFor: 0 };
  for (const l of lois) {
    const v = loiVotes[l.id];
    if (v === undefined || v === 'abstention' || l.statut === 'en_cours') {
      continue;
    }
    summary.total++;
    if ((l.statut === 'adoptee') === (v === 'pour')) {
      summary.same++;
    } else if (l.statut === 'adoptee') {
      summary.adoptedAgainst++;
    } else {
      summary.rejectedFor++;
    }
  }
  return summary;
}

/** Ce qui suit le chiffre : « textes sur 20 auraient eu le même sort au Parlement » (0 et 1 au singulier). */
export function scrutinsTail({ same, total }: ScrutinsSummary): string {
  return `${same > 1 ? 'textes' : 'texte'} sur ${total} ${same > 1 ? 'auraient' : 'aurait'} eu le même sort au Parlement`;
}

export function scrutinsSentence(summary: ScrutinsSummary): string {
  return `Avec mes votes, ${summary.same} ${scrutinsTail(summary)}.`;
}

/** Texte qui accompagne l'image : jamais de nom de candidat, même en mode complet. */
export function shareText(
  mode: ShareMode,
  { answered, complete = false, scrutins }: { answered: number; complete?: boolean; scrutins?: ScrutinsSummary },
  url: string
): string {
  if (mode === 'themes') {
    return `Les thèmes où j'ai le plus approuvé sur élire. ${url}`;
  }
  if (mode === 'scrutins' && scrutins) {
    return `${scrutinsSentence(scrutins)} Je me fais mon avis avec élire. ${url}`;
  }
  if (complete) {
    return `J'ai voté à tout sur élire : ${answered} questions répondues à l'aveugle. ${url}`;
  }
  return `${answered} questions répondues à l'aveugle : je me fais mon avis avec élire. ${url}`;
}

/** L'annotation des lecteurs qui ont répondu à tout : Classement, Partager et image. */
export const ALL_VOTED_TEXT = 'J’ai voté à tout !';
