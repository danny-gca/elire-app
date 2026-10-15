// Web : partage de fichier si le navigateur le permet (mobile surtout), sinon téléchargement de l'image.
export async function shareImage(dataUri: string, text: string): Promise<'shared' | 'unavailable' | 'downloaded'> {
  const blob = await (await fetch(dataUri)).blob();
  const file = new File([blob], 'elire-classement.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return 'shared';
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return 'shared';
      }
    }
  }
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(link.href);
  return 'downloaded';
}
