import { Platform, Text, type StyleProp, type TextStyle } from 'react-native';

import { DEFAULT_MARKER, Markers, type MarkerId } from '@/constants/theme';

interface MarkedProps {
  active: boolean;
  children: React.ReactNode;
  /** Surligneur avec lequel la marque a été posée. */
  marker?: MarkerId;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

// Variante d'ondulation stable pour un même texte (3 tuiles dans global.css).
function waveOf(children: React.ReactNode): number {
  const text = typeof children === 'string' ? children : String(children ?? '');
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 3;
}

// Web : trait bas ondulé par portions (global.css, [data-marked]) ; natif : fond de ligne.
function markProps(marker: MarkerId, wave: number) {
  return Platform.OS === 'web' ? ({ dataSet: { marked: marker, wave } } as object) : { style: { backgroundColor: Markers[marker].soft } };
}

// Trait de surligneur ligne par ligne : réservé aux éléments votés.
export function Marked({ active, children, marker = DEFAULT_MARKER, style, numberOfLines }: MarkedProps) {
  return (
    <Text style={style} numberOfLines={numberOfLines}>
      <Text {...(active ? markProps(marker, waveOf(children)) : {})}>{children}</Text>
    </Text>
  );
}
