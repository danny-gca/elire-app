import { Fragment } from 'react';
import { Platform, StyleSheet, Text, type AccessibilityProps, type AccessibilityRole, type StyleProp, type TextStyle } from 'react-native';

import { Colors } from '@/constants/theme';
import { glossarySpans } from '@/lib/glossary';
import { glossaire, mots } from '@/services/dataset';

interface GlossaryTextProps {
  children: string;
  style?: StyleProp<TextStyle>;
  /** Toucher un mot souligné : ouvre sa définition. Sans rappel, rien n'est souligné. */
  onWord?: (mot: string) => void;
  numberOfLines?: number;
  selectable?: boolean;
  accessibilityRole?: AccessibilityRole;
  /** Gestes sans bouton visible, offerts au lecteur d'écran. */
  actions?: Pick<AccessibilityProps, 'accessibilityActions' | 'onAccessibilityAction'>;
  textRef?: React.Ref<Text>;
}

// Web : un bouton serait un bloc qui casse la ligne (« ( » seul en fin de ligne) ; un lien reste dans le texte.
const WORD_ROLE: AccessibilityRole = Platform.OS === 'web' ? 'link' : 'button';

// Les mots du glossaire soulignés au crayon (pointillé graphite) : l'app annote, le lecteur surligne.
export function GlossaryText({ children, style, onWord, numberOfLines, selectable, accessibilityRole, actions, textRef }: GlossaryTextProps) {
  const spans = onWord ? glossarySpans(children, mots, glossaire) : [];
  const tail = spans.length > 0 ? spans[spans.length - 1].end : 0;
  // Sur mobile, un Text selectable parent capture les gestes et bloque le onPress des Text enfants.
  const isSelectable = spans.length > 0 ? false : selectable;
  return (
    <Text ref={textRef} style={style} numberOfLines={numberOfLines} selectable={isSelectable} accessibilityRole={accessibilityRole} {...actions}>
      {spans.map((span, i) => (
        <Fragment key={span.start}>
          {children.slice(i === 0 ? 0 : spans[i - 1].end, span.start)}
          <Text
            style={styles.word}
            onPress={() => onWord?.(span.mot)}
            accessibilityRole={WORD_ROLE}
            accessibilityHint="Ouvre sa définition dans le Glossaire">
            {children.slice(span.start, span.end)}
          </Text>
        </Fragment>
      ))}
      {children.slice(tail)}
    </Text>
  );
}

const styles = StyleSheet.create({
  // Android ne dessine pas le pointillé : trait plein, même sens.
  word: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationColor: Colors.graphite,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as TextStyle) : null),
  },
});
