import * as Sharing from 'expo-sharing';

// Natif : l'image capturée (fichier temporaire) passe par la feuille de partage du système.
export async function shareImage(uri: string, text: string): Promise<'shared' | 'unavailable' | 'downloaded'> {
  if (!(await Sharing.isAvailableAsync())) {
    return 'unavailable';
  }
  await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: text });
  return 'shared';
}
