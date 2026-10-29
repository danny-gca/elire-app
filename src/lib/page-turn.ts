// Voter : la page qui se tourne et le retour d'un cran sur la question précédente.

/** Question à ramener d'un geste : la dernière votée, d'un seul cran, quand rien d'autre n'occupe l'écran. */
export function previousQuestion({
  lastId,
  shownId,
  revisiting,
  busy,
}: {
  lastId: string | null;
  /** Question affichée en ce moment. */
  shownId?: string;
  /** Une question est déjà ramenée (ou une page tourne) : pas de deuxième cran. */
  revisiting: boolean;
  /** Pause, fin, geste de vote, révélation ou tuto en cours. */
  busy: boolean;
}): string | null {
  if (!lastId || revisiting || busy || lastId === shownId) {
    return null;
  }
  return lastId;
}

/** Retour d'Android : un cran en arrière, puis repartir de la question ramenée ; ensuite plus rien jusqu'au vote suivant, l'app peut se fermer. */
export function hardwareBack({
  canBack,
  canForward,
  spent,
  moving,
}: {
  canBack: boolean;
  /** Une question ramenée est posée et peut repartir. */
  canForward: boolean;
  /** Le retour a déjà fait repartir une question ramenée depuis le dernier vote. */
  spent: boolean;
  /** Une page tourne ou un vote se pose : le retour attend, l'app ne se ferme pas sur une page à moitié tournée. */
  moving: boolean;
}): 'back' | 'forward' | 'wait' | null {
  if (moving) {
    return 'wait';
  }
  if (canForward) {
    return 'forward';
  }
  if (canBack && !spent) {
    return 'back';
  }
  return null;
}

/** Lâcher le doigt : la page se rabat au-delà d'un tiers de la largeur, ou sur un geste vif. */
export function pageTurnSettles(distance: number, width: number, velocity: number): boolean {
  'worklet';
  return distance > width / 3 || (distance > 0 && velocity > 800);
}
