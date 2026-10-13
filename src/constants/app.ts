// Dépôt public du projet : sert aux liens « Signaler une erreur » (tickets GitHub pré-remplis).
export const REPO_URL = 'https://github.com/danny-gca/elire-app';

/** Lien vers un ticket « Erreur dans les données » pré-rempli, ou null sans dépôt configuré. */
export function reportIssueUrl(ref?: string, titre?: string): string | null {
  if (!REPO_URL) {
    return null;
  }
  const params = new URLSearchParams({
    template: 'erreur-donnees.yml',
    title: ref ? `Erreur ${ref}${titre ? ` : ${titre}` : ''}` : 'Erreur dans les données',
    reference: ref ?? '',
  });
  return `${REPO_URL}/issues/new?${params.toString()}`;
}
