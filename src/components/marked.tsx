import { Platform, Text, type StyleProp, type TextStyle } from 'react-native';

import { Colors } from '@/constants/theme';

interface MarkedProps {
  active: boolean;
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

// Web : trait bas façon surligneur (global.css, [data-marked]) ; natif : fond de ligne.
const markProps =
  Platform.OS === 'web' ? ({ dataSet: { marked: 'true' } } as object) : { style: { backgroundColor: Colors.markSoft } };

// Trait de surligneur ligne par ligne : réservé aux propositions votées.
export function Marked({ active, children, style, numberOfLines }: MarkedProps) {
  return (
    <Text style={style} numberOfLines={numberOfLines}>
      <Text {...(active ? markProps : {})}>{children}</Text>
    </Text>
  );
}
