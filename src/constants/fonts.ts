// Polices de la charte, sous licence SIL OFL 1.1 (licences dans assets/fonts/) : chargées au démarrage par _layout.
export const FONT_FILES = {
  'Literata-SemiBold': require('@/assets/fonts/Literata-SemiBold.ttf'),
  'Literata-Bold': require('@/assets/fonts/Literata-Bold.ttf'),
  'AtkinsonHyperlegibleNext-Regular': require('@/assets/fonts/AtkinsonHyperlegibleNext-Regular.ttf'),
  'AtkinsonHyperlegibleNext-Medium': require('@/assets/fonts/AtkinsonHyperlegibleNext-Medium.ttf'),
  'AtkinsonHyperlegibleNext-SemiBold': require('@/assets/fonts/AtkinsonHyperlegibleNext-SemiBold.ttf'),
  'AtkinsonHyperlegibleNext-Bold': require('@/assets/fonts/AtkinsonHyperlegibleNext-Bold.ttf'),
  'Caveat-Bold': require('@/assets/fonts/Caveat-Bold.ttf'),
};

export type FontName = keyof typeof FONT_FILES;
