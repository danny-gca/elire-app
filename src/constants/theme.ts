/**
 * Univers « cahier annoté » : papier blanc froid, encre, marge graphite,
 * surligneur jaune réservé aux marques de l'utilisateur. Thème clair uniquement.
 */
import { Platform, type TextStyle } from 'react-native';

export const Colors = {
  paper: '#F6F7F5',
  sheet: '#FFFFFF',
  ink: '#1C1E21',
  inkSoft: '#3A3F45',
  graphite: '#5B6168',
  rule: '#D5D9DD',
  ruleSoft: '#E8EBED',
  boardEdge: '#B9BFC5',
  pressed: '#EEF0F1',
  // Réservé aux marques de l'utilisateur (votes) : ne jamais l'utiliser ailleurs.
  mark: '#EADB3F',
  markSoft: 'rgba(234, 219, 63, 0.7)',
  positive: '#2F7D5B',
  positiveSoft: '#E4F0EA',
  negative: '#A4482A',
  negativeSoft: '#F5E7E1',
  negativePressed: '#EFD9CF',
  caution: '#8A6A1F',
  cautionSoft: '#F3EEDF',
  focus: '#1C1E21',
} as const;

// Échelle de vote : terre cuite (négatif), graphite (neutre), vert correcteur (positif).
export const VoteColors = {
  '-2': '#8E3A1F',
  '-1': '#9C5530',
  '0': '#5B6168',
  '1': '#3A7D60',
  '2': '#22654A',
} as const;

export interface ThemeAccent {
  accent: string;
  tint: string;
}

// Un accent par thématique, sans violet ni jaune.
export const ThematicColors: Record<string, ThemeAccent> = {
  environnement: { accent: '#3B7D4A', tint: '#E6F0E8' },
  agriculture: { accent: '#6B7722', tint: '#EEF0DE' },
  economie: { accent: '#8C6A1A', tint: '#F2EDDF' },
  travail: { accent: '#A0532C', tint: '#F4E8E1' },
  logement: { accent: '#77593A', tint: '#EFE9E2' },
  sante: { accent: '#A3455C', tint: '#F4E5E8' },
  societe: { accent: '#40707A', tint: '#E3EEEF' },
  education: { accent: '#1F7A70', tint: '#E0EFED' },
  numerique: { accent: '#2B6A8F', tint: '#E1ECF2' },
  international: { accent: '#3D5E88', tint: '#E3E9F1' },
  institutions: { accent: '#555E70', tint: '#E8EAEE' },
  securite: { accent: '#5C5047', tint: '#ECE9E6' },
};

export function themeAccent(thematiqueId: string | undefined): ThemeAccent {
  return (thematiqueId && ThematicColors[thematiqueId]) || { accent: Colors.graphite, tint: Colors.ruleSoft };
}

const family = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  default: undefined,
});

// Deux tailles de lecture (17 et 13) ; 34 et 24 seulement pour le titre d'écran et le titre de proposition.
export const Type = {
  screenTitle: { fontFamily: family, fontSize: 34, lineHeight: 40, fontWeight: '700', letterSpacing: -0.4 },
  display: { fontFamily: family, fontSize: 24, lineHeight: 32, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontFamily: family, fontSize: 17, lineHeight: 24, fontWeight: '400' },
  bodyStrong: { fontFamily: family, fontSize: 17, lineHeight: 24, fontWeight: '600' },
  label: { fontFamily: family, fontSize: 13, lineHeight: 18, fontWeight: '500' },
  labelStrong: { fontFamily: family, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  caps: { fontFamily: family, fontSize: 13, lineHeight: 18, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
} satisfies Record<string, TextStyle>;

export const Numeric: TextStyle = { fontVariant: ['tabular-nums'] };

// Grille de 8 pt (rythme Seyès).
export const Spacing = {
  half: 4,
  one: 8,
  two: 16,
  three: 24,
  four: 32,
  five: 40,
  six: 64,
} as const;

export const Radius = {
  small: 6,
  medium: 12,
  large: 14,
} as const;

export const MinTarget = Platform.select({ android: 48, default: 44 });
export const MarginWidth = 48;
export const BottomTabInset = Platform.select({ ios: 60, android: 80 }) ?? 60;
export const MaxContentWidth = 720;
