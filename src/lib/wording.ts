// Tournures négatives des textes notés à l'aveugle : partagé par l'app et scripts/build-data.ts (aucun import d'alias).

// Assez de mots pour comprendre d'un coup d'œil ce qu'on vote, sans ouvrir les tiroirs : sens du changement et ce qu'il touche.
export const MIN_WORDS = { titre: 8, question: 8, scrutin: 10 } as const;

const NEGATIVE_LEAD = /^(?:faut-il\s+)?(?:ne\s+(?:pas|plus)\b|n['’]|non\b)/iu;
const REFUSAL = /(?<![\p{L}])(?:refus\p{L}*|rejet\p{L}*|rejett\p{L}*)/iu;

/** Raison pour laquelle un texte noté « Contre » donnerait une double négation, ou null ; `vote` : question de scrutin, où un refus compte aussi. */
export function negativeWording(text: string, vote = false): string | null {
  const trimmed = text.trim();
  if (NEGATIVE_LEAD.test(trimmed)) {
    return 'commence par une négation';
  }
  if (vote && REFUSAL.test(trimmed)) {
    return 'porte un refus ou un rejet';
  }
  return null;
}

/** Mots d'un texte, sans la ponctuation seule (« ? », « % ») : « l'âge » compte pour un. */
export function wordCount(text: string): number {
  return text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
}
