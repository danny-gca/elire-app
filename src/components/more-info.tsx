import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { GlossaryText } from "@/components/glossary-text";
import {
  Colors,
  Markers,
  MinTarget,
  Spacing,
  Type,
  type MarkerId,
} from "@/constants/theme";
import {
  formatDate,
  NATURE_EXPLAINED,
  NATURE_LABELS,
  TYPE_SOURCE_LABELS,
} from "@/lib/format";
import { acronymsIn, wordsIn } from "@/lib/glossary";
import type { Lien, NatureLoi } from "@/schemas/dataset";
import {
  getRepere,
  glossaire,
  mots,
  propositions,
} from "@/services/dataset";
import { useVotesStore } from "@/store/votes-store";

const bySigle = new Map(glossaire.map((g) => [g.sigle, g]));
const byMot = new Map(mots.map((m) => [m.mot, m]));
const siteOf = (url: string) => url.match(/^https?:\/\/(?:www\.)?([^/]+)/)?.[1] ?? url;

export type InfoTab = "clair" | "mesure" | "mots" | "liens";

const MEDIA_LABELS: Record<Lien["media"], string> = {
  article: "article",
  video: "vidéo",
  audio: "son",
};
const DRAWER_MS = 220;

interface MoreInfoProps {
  /** Proposition, scrutin ou question commune : son repère, et la graine des couleurs. */
  itemId: string;
  /** Contexte de la proposition, ou enjeu du scrutin ou de la question. */
  text: string;
  /** Type de source (« Programme 2027 »...) : il ne trahit pas l'auteur. */
  source?: string;
  nature?: NatureLoi;
  /** Textes de la feuille (titre, citation) : leurs sigles et leurs mots vont dans le glossaire. */
  terms: string[];
  /** Tiroir ouvert, piloté par la feuille (un mot touché ouvre le glossaire). */
  tab: InfoTab | null;
  onTab: (tab: InfoTab | null) => void;
  /** Le contenu vient de s'afficher : l'écran peut défiler jusqu'au tiroir ouvert. */
  onOpen?: (target: View | null) => void;
}

// Les tiroirs du bas de la feuille, un par ligne : un seul ouvert à la fois, rien sur l'auteur ni le résultat.
export function MoreInfo({
  itemId,
  text,
  source,
  nature,
  terms,
  tab,
  onTab,
  onOpen,
}: MoreInfoProps) {
  const reader = useVotesStore((s) => s.marker);
  const openRef = useRef<View>(null);
  const reducedMotion = useReducedMotion();
  const repere = getRepere(itemId);
  // Pendant le vote : seulement les liens qui ne trahissent ni l'auteur ni le résultat.
  const liens = repere?.liens.filter((l) => l.aveugle !== false) ?? [];
  const explained = nature ? NATURE_EXPLAINED[nature] : undefined;
  // Question commune : ce que propose chaque candidat, sans son nom ; sa source peut le trahir, la précision compte plus.
  const proposals = propositions.filter((p) => p.enjeuId === itemId);
  const links = [
    ...proposals.map((p) => ({
      titre: p.titre,
      url: p.sourceUrl,
      meta: `${siteOf(p.sourceUrl)} · ${TYPE_SOURCE_LABELS[p.typeSource].toLowerCase()}`,
    })),
    ...liens.map((l) => ({
      titre: l.titre,
      url: l.url,
      meta: `${l.editeur} · ${MEDIA_LABELS[l.media]}${l.duree ? ` · ${l.duree} min` : ""}`,
    })),
  ];
  const texts = [
    ...terms,
    text,
    explained,
    ...proposals.flatMap((p) => [p.titre, p.contexte]),
    repere?.titre,
    repere?.aujourdhui,
    repere?.enDebat,
  ];
  const sigles = acronymsIn(...texts).flatMap((s) => bySigle.get(s) ?? []);
  const words = wordsIn(texts, mots).flatMap((m) => byMot.get(m) ?? []);

  const origin = nature ? NATURE_LABELS[nature] : source;
  const tabs: { id: InfoTab; label: string }[] = [
    ...(repere ? [{ id: "clair" as const, label: "Contexte" }] : []),
    { id: "mesure", label: "Précisions" },
    ...(sigles.length + words.length > 0
      ? [{ id: "mots" as const, label: "Glossaire" }]
      : []),
    ...(links.length > 0
      ? [{ id: "liens" as const, label: "Liens et sources" }]
      : []),
  ];
  const onWord = () => onTab("mots");
  const open = tabs.some((t) => t.id === tab) ? tab : null;

  return (
    <View style={styles.root} accessibilityLabel="En savoir plus">
      {tabs.map((t, i) => {
        const expanded = open === t.id;
        return (
          <View
            key={t.id}
            ref={expanded ? openRef : undefined}
            style={i > 0 && styles.divider}
          >
            <DrawerRow
              label={t.label}
              expanded={expanded}
              marker={reader}
              onPress={() => onTab(expanded ? null : t.id)}
            />
            {expanded && (
              <Animated.View
                entering={reducedMotion ? undefined : FadeIn.duration(180)}
                style={styles.body}
                onLayout={() => onOpen?.(openRef.current)}
              >
                {t.id === "clair" && repere && (
                  <>
                    <View style={styles.block}>
                      <Text style={[Type.labelStrong, styles.ink]}>
                        Aujourd’hui
                      </Text>
                      <GlossaryText
                        style={[Type.body, styles.soft]}
                        onWord={onWord}
                        selectable
                      >
                        {repere.aujourdhui}
                      </GlossaryText>
                    </View>
                    <View style={styles.block}>
                      <Text style={[Type.labelStrong, styles.ink]}>
                        En débat
                      </Text>
                      <GlossaryText
                        style={[Type.body, styles.soft]}
                        onWord={onWord}
                        selectable
                      >
                        {repere.enDebat}
                      </GlossaryText>
                    </View>
                    <Text style={[Type.label, styles.muted]}>
                      À jour au {formatDate(repere.aJour)}
                    </Text>
                  </>
                )}

                {t.id === "mesure" && (
                  <>
                    {origin && (
                      <Text style={[Type.labelStrong, styles.muted]}>
                        {origin}
                      </Text>
                    )}
                    {explained && (
                      <GlossaryText
                        style={[Type.bodyStrong, styles.ink]}
                        onWord={onWord}
                        selectable
                      >
                        {explained}
                      </GlossaryText>
                    )}
                    <GlossaryText
                      style={[Type.body, styles.soft]}
                      onWord={onWord}
                      selectable
                    >
                      {text}
                    </GlossaryText>
                    {proposals.length > 0 && (
                      <Text style={[Type.labelStrong, styles.ink]}>
                        Ce que proposent les candidats
                      </Text>
                    )}
                    {proposals.map((p) => (
                      <View key={p.id} style={styles.block}>
                        {p.sens === "contre" && (
                          <Text style={[Type.labelStrong, styles.muted]}>
                            Contre la mesure
                          </Text>
                        )}
                        <GlossaryText
                          style={[Type.bodyStrong, styles.ink]}
                          onWord={onWord}
                          selectable
                        >
                          {p.titre}
                        </GlossaryText>
                        <GlossaryText
                          style={[Type.body, styles.soft]}
                          onWord={onWord}
                          selectable
                        >
                          {p.contexte}
                        </GlossaryText>
                      </View>
                    ))}
                  </>
                )}

                {t.id === "mots" && (
                  <>
                    {words.map((m) => (
                      <Text
                        key={m.mot}
                        style={[Type.body, styles.soft]}
                        selectable
                      >
                        <Text style={[Type.bodyStrong, styles.ink]}>
                          {m.mot.charAt(0).toUpperCase() + m.mot.slice(1)}
                        </Text>
                        {" "}: {m.definition}
                      </Text>
                    ))}
                    {sigles.map((g) => (
                      <Text
                        key={g.sigle}
                        style={[Type.body, styles.soft]}
                        selectable
                      >
                        <Text style={[Type.bodyStrong, styles.ink]}>
                          {g.sigle}
                        </Text>
                        {" "}: {g.forme}
                        {g.definition ? `. ${g.definition}` : "."}
                      </Text>
                    ))}
                  </>
                )}

                {t.id === "liens" &&
                  links.map((l) => (
                    <Pressable
                      key={l.url}
                      onPress={() => Linking.openURL(l.url)}
                      accessibilityRole="link"
                      accessibilityHint="Ouvre le navigateur"
                      style={({ pressed }) => [
                        styles.link,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.flex}>
                        <Text style={[Type.bodyStrong, styles.ink]}>
                          {l.titre}
                        </Text>
                        <Text style={[Type.label, styles.muted]}>
                          {l.meta}
                        </Text>
                      </View>
                      <Ionicons
                        name="open-outline"
                        size={16}
                        color={Colors.graphite}
                      />
                    </Pressable>
                  ))}
              </Animated.View>
            )}
          </View>
        );
      })}
    </View>
  );
}

// Le tiroir ouvert est surligné du feutre du lecteur sur toute la ligne : le trait se pose de gauche à droite, la flèche pivote.
function DrawerRow({
  label,
  expanded,
  marker,
  onPress,
}: {
  label: string;
  expanded: boolean;
  marker: MarkerId;
  onPress: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(expanded ? 1 : 0);
  useEffect(() => {
    progress.value = reducedMotion
      ? Number(expanded)
      : withTiming(Number(expanded), {
          duration: DRAWER_MS,
          easing: Easing.out(Easing.cubic),
        });
  }, [expanded, reducedMotion, progress]);
  const markStyle = useAnimatedStyle(() => ({
    opacity: progress.value > 0 ? 1 : 0,
    transform: [{ scaleX: progress.value }],
  }));
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ expanded }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Animated.View
        style={[
          styles.mark,
          { backgroundColor: Markers[marker].soft },
          markStyle,
        ]}
      />
      <Text style={[Type.labelStrong, expanded ? styles.ink : styles.muted]}>
        {label}
      </Text>
      <Animated.View style={[styles.chevron, chevronStyle]}>
        <Ionicons
          name="chevron-down"
          size={16}
          color={expanded ? Colors.ink : Colors.graphite}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.ruleSoft,
  },
  row: {
    minHeight: MinTarget + Spacing.one,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  // Trait de feutre légèrement de biais, comme les onglets de la barre du bas.
  mark: {
    position: "absolute",
    top: Spacing.one,
    bottom: Spacing.one,
    left: Spacing.one,
    right: Spacing.one,
    borderRadius: 3,
    transformOrigin: "left center",
    transform: [{ rotate: "-0.6deg" }],
  },
  chevron: {
    marginLeft: "auto",
  },
  pressed: {
    backgroundColor: Colors.pressed,
  },
  body: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.three,
  },
  block: {
    gap: Spacing.half,
  },
  link: {
    minHeight: MinTarget,
    flexDirection: "row",
    alignItems: "center",
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
