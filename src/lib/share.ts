import type { CandidateScore } from '@/lib/scoring';

export type ShareMode = 'complet' | 'discret';

/** Chiffres du mode discret : aucun nom, seulement l'avancée du lecteur. */
export function shareSummary(scores: readonly CandidateScore[]) {
  const ranked = scores.filter((s) => s.ranked);
  return {
    ranked: ranked.length,
    fiables: ranked.filter((s) => s.reliability === 'fiable').length,
    total: scores.length,
  };
}

/** Texte qui accompagne l'image : jamais de nom de candidat, même en mode complet. */
export function shareText(answered: number, url: string): string {
  return `${answered} questions répondues à l'aveugle : je me fais mon avis avec élire. ${url}`;
}
