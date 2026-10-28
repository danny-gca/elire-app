// Tournures négatives des textes notés à l'aveugle : partagé par l'app et scripts/build-data.ts (aucun import d'alias).

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
