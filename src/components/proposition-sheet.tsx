import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { SweepText } from '@/components/sweep-text';
import { ThemeMark } from '@/components/theme-mark';
import { Colors, MarginWidth, Numeric, Radius, Spacing, Type, type MarkerId } from '@/constants/theme';
import type { Proposition, Thematique } from '@/schemas/dataset';

interface PropositionSheetProps {
  /** Une proposition (titre, citation), ou un scrutin présenté de la même façon (question seule). */
  proposition: Pick<Proposition, 'ref' | 'thematiqueId' | 'titre'> & { description?: string };
  kind?: 'Proposition' | 'Scrutin';
  /** Pendant le geste du vote : le surligneur balaie le titre. */
  sweep?: MarkerId;
  thematique?: Thematique;
  children?: React.ReactNode;
}

const VERTICAL_LABEL_LENGTH = 220;
const VERTICAL_TOP = Spacing.three + 18 + Spacing.one + 32 + Spacing.two;
// Largeur moyenne d'une capitale à 13 pt espacée : sert à réserver la hauteur du thème vertical.
const CAPS_CHAR_WIDTH = 9;
const WIDE = 600;

// La feuille du cahier : marge graphite (numéro, thème) et corps de la proposition.
export function PropositionSheet({ proposition, kind = 'Proposition', sweep, thematique, children }: PropositionSheetProps) {
  // Grand écran : thème à l'horizontale sous la description, la feuille suit son contenu.
  const vertical = useWindowDimensions().width < WIDE;
  return (
    <View style={[styles.sheet, vertical && thematique && { minHeight: VERTICAL_TOP + thematique.titre.length * CAPS_CHAR_WIDTH + Spacing.three }]}>
      <View style={styles.margin} accessible accessibilityLabel={`${kind} ${proposition.ref}, thème ${thematique?.titre ?? ''}`}>
        <Text style={[Type.label, Numeric, styles.ref]}>{proposition.ref}</Text>
        <ThemeMark thematiqueId={proposition.thematiqueId} />
        {vertical && thematique && (
          <View style={styles.verticalBox} pointerEvents="none">
            <Text style={[Type.caps, styles.verticalText]} numberOfLines={1}>
              {thematique.titre}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <SweepText marker={sweep} style={[Type.display, styles.title]}>
          {proposition.titre}
        </SweepText>
        {proposition.description ? <Text style={[Type.body, styles.description]}>{proposition.description}</Text> : null}
        {!vertical && thematique && <Text style={[Type.caps, styles.ref]}>{thematique.titre}</Text>}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flexDirection: 'row',
    backgroundColor: Colors.sheet,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
    overflow: 'hidden',
  },
  margin: {
    width: MarginWidth,
    borderRightWidth: 1,
    borderRightColor: Colors.graphite,
    alignItems: 'center',
    paddingTop: Spacing.three,
    gap: Spacing.one,
    paddingHorizontal: 2,
  },
  ref: {
    color: Colors.graphite,
  },
  verticalBox: {
    position: 'absolute',
    top: VERTICAL_TOP + VERTICAL_LABEL_LENGTH / 2 - 9,
    left: MarginWidth / 2 - VERTICAL_LABEL_LENGTH / 2,
    width: VERTICAL_LABEL_LENGTH,
    height: 18,
    transform: [{ rotate: '-90deg' }],
  },
  verticalText: {
    color: Colors.graphite,
    textAlign: 'right',
  },
  body: {
    flex: 1,
    padding: Spacing.three,
    paddingLeft: Spacing.two,
    gap: Spacing.two,
  },
  title: {
    color: Colors.ink,
  },
  description: {
    color: Colors.inkSoft,
  },
});
