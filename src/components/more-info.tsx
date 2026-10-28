import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

import { GlossaryText } from '@/components/glossary-text';
import { TabMark } from '@/components/tab-mark';
import { Colors, MinTarget, Spacing, Type } from '@/constants/theme';
import { acronymsIn, wordsIn } from '@/lib/glossary';
import { formatDate, NATURE_EXPLAINED, NATURE_LABELS } from '@/lib/format';
import type { Lien, NatureLoi } from '@/schemas/dataset';
import { getRepere, glossaire, mots } from '@/services/dataset';
import { useVotesStore } from '@/store/votes-store';

const bySigle = new Map(glossaire.map((g) => [g.sigle, g]));
const byMot = new Map(mots.map((m) => [m.mot, m]));

export type InfoTab = 'clair' | 'mesure' | 'mots' | 'liens';

const MESURE_LABELS = { proposition: 'La mesure', scrutin: 'Le vote', question: 'La question' } as const;
const MEDIA_LABELS: Record<Lien['media'], string> = { article: 'article', video: 'vidéo', audio: 'son' };

interface MoreInfoProps {
  /** Proposition, scrutin ou question commune : son repère, et la graine des couleurs. */
  itemId: string;
  kind: keyof typeof MESURE_LABELS;
  /** Contexte de la proposition, ou enjeu du scrutin ou de la question. */
  text: string;
  /** Type de source (« Programme 2027 »...) : il ne trahit pas l'auteur. */
  source?: string;
  nature?: NatureLoi;
  /** Textes de la feuille (titre, citation) : leurs sigles et leurs mots vont dans « Les mots ». */
  terms: string[];
  /** Onglet ouvert, piloté par la feuille (un mot touché ouvre « Les mots »). */
  tab: InfoTab | null;
  onTab: (tab: InfoTab | null) => void;
  /** Le contenu vient de s'afficher : l'écran peut défiler jusqu'aux onglets. */
  onOpen?: (target: View | null) => void;
}

// Les onglets du bas de la feuille : une fiche ouverte à la fois, rien sur l'auteur ni le résultat.
export function MoreInfo({ itemId, kind, text, source, nature, terms, tab, onTab, onOpen }: MoreInfoProps) {
  const reader = useVotesStore((s) => s.marker);
  const rootRef = useRef<View>(null);
  const reducedMotion = useReducedMotion();
  const repere = getRepere(itemId);
  // Pendant le vote : seulement les liens qui ne trahissent ni l'auteur ni le résultat.
  const liens = repere?.liens.filter((l) => l.aveugle !== false) ?? [];
  const explained = nature ? NATURE_EXPLAINED[nature] : undefined;
  const texts = [...terms, text, explained, repere?.titre, repere?.aujourdhui, repere?.enDebat];
  const sigles = acronymsIn(...texts).flatMap((s) => bySigle.get(s) ?? []);
  const words = wordsIn(texts, mots).flatMap((m) => byMot.get(m) ?? []);

  const tabs: { id: InfoTab; label: string }[] = [
    ...(repere ? [{ id: 'clair' as const, label: 'En clair' }] : []),
    { id: 'mesure', label: MESURE_LABELS[kind] },
    ...(sigles.length + words.length > 0 ? [{ id: 'mots' as const, label: 'Les mots' }] : []),
    ...(liens.length > 0 ? [{ id: 'liens' as const, label: 'Liens' }] : []),
  ];
  const onWord = () => onTab('mots');
  const open = tabs.some((t) => t.id === tab) ? tab : null;

  const subtitle =
    open === 'clair' ? repere?.titre : open === 'mesure' ? (nature ? NATURE_LABELS[nature] : source) : undefined;

  return (
    <View ref={rootRef} style={styles.root} accessibilityLabel="En savoir plus">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {tabs.map((t) => {
          const expanded = open === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => onTab(expanded ? null : t.id)}
              accessibilityRole="button"
              accessibilityLabel={t.label}
              accessibilityState={{ expanded }}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
              {/* Comme la barre du bas : seul l'onglet ouvert est surligné, du feutre du lecteur. */}
              <View>
                {expanded && <TabMark marker={reader} />}
                <Text style={[Type.labelStrong, expanded ? styles.ink : styles.muted]}>{t.label}</Text>
              </View>
              <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={expanded ? Colors.ink : Colors.graphite} />
            </Pressable>
          );
        })}
      </ScrollView>

      {open && (
        <Animated.View key={open} entering={reducedMotion ? undefined : FadeIn.duration(180)} style={styles.body} onLayout={() => onOpen?.(rootRef.current)}>
          {subtitle && (
            <Text style={[Type.labelStrong, styles.muted]} accessibilityRole="header">
              {subtitle}
            </Text>
          )}

          {open === 'clair' && repere && (
            <>
              <View style={styles.block}>
                <Text style={[Type.labelStrong, styles.ink]}>Aujourd’hui</Text>
                <GlossaryText style={[Type.body, styles.soft]} onWord={onWord} selectable>
                  {repere.aujourdhui}
                </GlossaryText>
              </View>
              <View style={styles.block}>
                <Text style={[Type.labelStrong, styles.ink]}>En débat</Text>
                <GlossaryText style={[Type.body, styles.soft]} onWord={onWord} selectable>
                  {repere.enDebat}
                </GlossaryText>
              </View>
              <Text style={[Type.label, styles.muted]}>À jour au {formatDate(repere.aJour)}</Text>
            </>
          )}

          {open === 'mesure' && (
            <>
              {explained && (
                <GlossaryText style={[Type.bodyStrong, styles.ink]} onWord={onWord} selectable>
                  {explained}
                </GlossaryText>
              )}
              <GlossaryText style={[Type.body, styles.soft]} onWord={onWord} selectable>
                {text}
              </GlossaryText>
            </>
          )}

          {open === 'mots' && (
            <>
              {words.map((m) => (
                <Text key={m.mot} style={[Type.body, styles.soft]} selectable>
                  <Text style={[Type.bodyStrong, styles.ink]}>{m.mot.charAt(0).toUpperCase() + m.mot.slice(1)}</Text>
                  {' '}: {m.definition}
                </Text>
              ))}
              {sigles.map((g) => (
                <Text key={g.sigle} style={[Type.body, styles.soft]} selectable>
                  <Text style={[Type.bodyStrong, styles.ink]}>{g.sigle}</Text>
                  {' '}: {g.forme}
                  {g.definition ? `. ${g.definition}` : '.'}
                </Text>
              ))}
            </>
          )}

          {open === 'liens' &&
            liens.map((l) => (
              <Pressable
                key={l.url}
                onPress={() => Linking.openURL(l.url)}
                accessibilityRole="link"
                accessibilityHint="Ouvre le navigateur"
                style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
                <View style={styles.flex}>
                  <Text style={[Type.bodyStrong, styles.ink]}>{l.titre}</Text>
                  <Text style={[Type.label, styles.muted]}>
                    {l.editeur} · {MEDIA_LABELS[l.media]}
                    {l.duree ? ` · ${l.duree} min` : ''}
                  </Text>
                </View>
                <Ionicons name="open-outline" size={16} color={Colors.graphite} />
              </Pressable>
            ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
    paddingHorizontal: Spacing.two,
  },
  tabs: {
    gap: 12,
  },
  tab: {
    minHeight: MinTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  pressed: {
    backgroundColor: Colors.pressed,
  },
  body: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  block: {
    gap: Spacing.half,
  },
  link: {
    minHeight: MinTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  flex: {
    flex: 1,
  },
  ink: {
    color: Colors.ink,
  },
  soft: {
    color: Colors.inkSoft,
  },
  muted: {
    color: Colors.graphite,
  },
});
