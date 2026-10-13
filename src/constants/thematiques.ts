import type { Ionicons } from '@expo/vector-icons';

export const THEME_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  environnement: 'leaf-outline',
  economie: 'wallet-outline',
  securite: 'shield-outline',
  travail: 'briefcase-outline',
  education: 'school-outline',
  sante: 'medkit-outline',
  societe: 'people-outline',
  international: 'globe-outline',
  agriculture: 'nutrition-outline',
  institutions: 'business-outline',
  numerique: 'hardware-chip-outline',
  logement: 'home-outline',
};

export function themeIcon(thematiqueId: string | undefined): keyof typeof Ionicons.glyphMap {
  return (thematiqueId && THEME_ICONS[thematiqueId]) || 'document-text-outline';
}
