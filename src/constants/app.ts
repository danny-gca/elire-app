import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { metadata } from '@/services/dataset';

// Dépôt public du projet : code, contributions, et repli de « Signaler une erreur » tant que le formulaire n'est pas branché.
export const REPO_URL = 'https://github.com/danny-gca/elire-app';

// Formulaire Google de signalement (Formulaires > Obtenir le lien prérempli) : l'adresse `.../viewform` et le numéro `entry.` de chaque champ.
// Vides : « Signaler une erreur » ouvre encore un ticket GitHub.
export const REPORT_FORM = {
  url: '',
  entries: { reference: '', titre: '', version: '', donnees: '', plateforme: '' },
};

/** Lien « Signaler une erreur », pré-rempli (référence, titre, version, date des données, plateforme), ou null sans destination. */
export function reportUrl(ref?: string, titre?: string): string | null {
  if (REPORT_FORM.url) {
    const { entries } = REPORT_FORM;
    const params = new URLSearchParams({ usp: 'pp_url' });
    const values: [string, string][] = [
      [entries.reference, ref ?? ''],
      [entries.titre, titre ?? ''],
      [entries.version, APP_VERSION],
      [entries.donnees, metadata.generatedAt.slice(0, 10)],
      [entries.plateforme, Platform.OS],
    ];
    values.filter(([entry, value]) => entry && value).forEach(([entry, value]) => params.append(`entry.${entry}`, value));
    return `${REPORT_FORM.url}?${params.toString()}`;
  }
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

// Site public : lien des images partagées.
export const SITE_URL = 'https://danny-gca.github.io/elire-website/';

// Version affichée (app.json, tenue à jour par release-please).
export const APP_VERSION = Constants.expoConfig?.version ?? '';
