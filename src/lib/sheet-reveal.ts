// Feuille qui défile : jusqu'où descendre pour montrer un élément qui vient de s'ouvrir.

/** Juste assez pour voir le bas de l'élément, sans dépasser son haut ; `null` s'il est déjà visible. */
export function revealOffset({
  top,
  height,
  offset,
  seen,
  airBelow,
  airAbove,
}: {
  top: number;
  height: number;
  offset: number;
  seen: number;
  airBelow: number;
  airAbove: number;
}): number | null {
  const bottom = top + height + airBelow;
  if (bottom <= offset + seen) {
    return null;
  }
  return Math.max(0, Math.min(bottom - seen, top - airAbove));
}
