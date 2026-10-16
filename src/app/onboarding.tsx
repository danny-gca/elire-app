import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
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
import { SafeAreaView } from "react-native-safe-area-context";

import { CandidateAvatar } from "@/components/candidate-avatar";
import { EditVoteSheet } from "@/components/edit-vote-sheet";
import { EraserIcon } from "@/components/eraser-icon";
import { Marked } from "@/components/marked";
import { MarkerPicker } from "@/components/marker-picker";
import { PropositionRow } from "@/components/proposition-row";
import { SweepText } from "@/components/sweep-text";
import { Button } from "@/components/ui/button";
import { ResetButton } from "@/components/ui/reset-button";
import { VoteScale } from "@/components/vote-scale";
import { VoteTag } from "@/components/vote-tag";
import { PositionMark, YourVoteMark } from "@/components/your-vote-mark";
import {
  Colors,
  Markers,
  MaxContentWidth,
  MinTarget,
  Radius,
  Spacing,
  Type,
  type MarkerId,
} from "@/constants/theme";
import type { VoteValue } from "@/lib/scoring";
import type { Proposition } from "@/schemas/dataset";
import { celebrate } from "@/store/celebration-store";
import { useVotesStore } from "@/store/votes-store";

// Le temps de lire une page avant la suivante, montré par le trait du haut.
const STORY_MS = 15000;

type Demo =
  | "picker"
  | "vote"
  | "eraser"
  | "source"
  | "groupe"
  | "reset"
  | "start";

interface Story {
  /** Début du titre, en encre. */
  lead: string;
  /** Fin du titre, balayée par le surligneur à l'arrivée de la page. */
  mark?: string;
  body: string;
  demo?: Demo;
}

// Les démonstrations à essayer vont en bas, hors des zones de toucher de la page.
const INTERACTIVE: Demo[] = ["picker", "vote", "eraser", "source", "reset"];

const STORIES: Story[] = [
  {
    lead: "élire",
    body: "Présidentielle 2027. Un cahier pour se faire son avis sur les propositions des candidats, seul et au calme. Environ 20 secondes par question : un premier classement en 3 à 5 minutes, et vous arrêtez quand vous voulez.",
  },
  {
    lead: "Votre surligneur :",
    mark: "vos avis, votre couleur.",
    body: "Choisissez la couleur de vos marques, elle sert dès la page suivante. Vous pourrez en changer en haut de Voter ; ce que vous avez déjà surligné garde sa couleur.",
    demo: "picker",
  },
  {
    lead: "Neutralité :",
    mark: "vous jugez la mesure, pas la personne.",
    body: "Les propositions arrivent sans nom ni parti, dans un ordre mélangé. Notez-les d’Impossible à Parfait, ou « Je ne sais pas » : essayez ci-dessous.",
    demo: "vote",
  },
  {
    lead: "Changer d’avis :",
    mark: "la gomme.",
    body: "Juste après un vote, « A voté ! » reste 10 secondes en haut de Voter : touchez-le pour corriger. Plus tard, ouvrez une proposition ou un scrutin déjà voté dans Explorer, Lois ou la fiche d’un candidat, puis touchez la gomme. Essayez ci-dessous.",
    demo: "eraser",
  },
  {
    lead: "Transparence :",
    mark: "chaque fait a sa source.",
    body: "Dans Explorer, chaque proposition montre son auteur, sa date et sa source ; chaque scrutin renvoie au site officiel du Parlement. Touchez l’exemple (fictif).",
    demo: "source",
  },
  {
    lead: "Responsabilité :",
    mark: "une promesse n’est pas un vote.",
    body: "Le programme 2027 et les votes réels au Parlement sont séparés. Quand un candidat n’a pas voté lui-même, c’est écrit : vote de son groupe.",
    demo: "groupe",
  },
  {
    lead: "Confidentialité :",
    mark: "vos avis restent chez vous.",
    body: "Aucun compte, aucune statistique envoyée. Vos votes restent sur cet appareil, et vous pouvez les effacer à tout moment, avec le bouton en bas du Classement. Essayez-le ci-dessous : cet exemple ne touche pas à vos votes.",
    demo: "reset",
  },
  {
    lead: "élire",
    body: "",
    demo: "start",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useVotesStore((s) => s.completeOnboarding);
  const marker = useVotesStore((s) => s.marker);
  const reducedMotion = useReducedMotion();
  const [screenReader, setScreenReader] = useState(false);
  const [index, setIndex] = useState(0);
  // Un essai (surligneur, boutons, exemple) : la page ne part plus seule.
  const [held, setHeld] = useState(false);
  // Aucun surligneur choisi au départ : « votre couleur » se surligne au premier choix.
  const [picked, setPicked] = useState<MarkerId | null>(null);
  // Un seul vote fictif suit toute la présentation : posé en Neutralité, corrigé à la gomme, retrouvé ensuite ; chaque toucher compte.
  const [example, setExample] = useState<ExampleState>({ count: 0 });
  const voteExample = (vote: VoteValue) =>
    setExample((e) => ({ vote, count: e.count + 1 }));
  const progress = useSharedValue(0);
  const autoplay = !reducedMotion && !screenReader && !held;
  const last = index === STORIES.length - 1;

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReader);
  }, []);

  const finish = () => {
    completeOnboarding();
    celebrate("big");
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const goTo = (next: number) => {
    setHeld(false);
    setIndex(Math.max(0, Math.min(STORIES.length - 1, next)));
  };

  useEffect(() => {
    progress.value = 0;
    if (!autoplay || last) {
      progress.value = 1;
      return;
    }
    progress.value = withTiming(1, {
      duration: STORY_MS,
      easing: Easing.linear,
    });
    const timer = setTimeout(() => goTo(index + 1), STORY_MS);
    return () => clearTimeout(timer);
  }, [index, autoplay, last, progress]);

  const story = STORIES[index];
  // Avant le choix, la page du surligneur ne surligne rien ; ensuite, chaque titre porte la couleur choisie.
  const sweep = story.demo === "picker" ? picked : marker;
  const interactive = story.demo && INTERACTIVE.includes(story.demo);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.rule} />
      <View style={styles.column}>
        {/* Les traits du haut : où on en est, et un toucher pour revenir à une page. */}
        <View style={styles.bars} accessibilityRole="tablist">
          {STORIES.map((s, i) => (
            <Pressable
              key={`${i}-${s.lead}`}
              onPress={() => goTo(i)}
              accessibilityRole="tab"
              accessibilityLabel={`Page ${i + 1} sur ${STORIES.length}`}
              accessibilityState={{ selected: i === index }}
              style={styles.barTarget}
            >
              <Bar
                state={i < index ? "done" : i === index ? "current" : "todo"}
                progress={progress}
              />
            </Pressable>
          ))}
        </View>

        <View style={styles.stage}>
          {/* Comme une story : à gauche la page d'avant, à droite la suivante. */}
          <Pressable
            style={styles.zoneLeft}
            onPress={() => goTo(index - 1)}
            accessibilityRole="button"
            accessibilityLabel="Page précédente"
          />
          <Pressable
            style={styles.zoneRight}
            onPress={() => (last ? undefined : goTo(index + 1))}
            accessibilityRole="button"
            accessibilityLabel="Page suivante"
          />
          {story.demo === "start" ? (
            <Animated.View
              key={index}
              entering={FadeIn.duration(260)}
              style={styles.start}
            >
              <Image
                source={require("@/assets/images/splash-icon.png")}
                style={styles.startLogo}
                accessibilityIgnoresInvertColors
              />
              <Text
                style={[Type.display, styles.ink]}
                accessibilityRole="header"
              >
                élire
              </Text>
              <Button
                label="Commencer à voter"
                variant="primary"
                onPress={finish}
                style={styles.cta}
              />
            </Animated.View>
          ) : (
            <Animated.View
              key={index}
              entering={FadeIn.duration(260)}
              style={styles.content}
              pointerEvents="none"
            >
              {index === 0 && (
                <Image
                  source={require("@/assets/images/splash-icon.png")}
                  style={styles.logo}
                  accessibilityIgnoresInvertColors
                />
              )}
              <View
                accessible
                accessibilityRole="header"
                accessibilityLabel={[story.lead, story.mark]
                  .filter(Boolean)
                  .join(" ")}
              >
                <Text style={[Type.screenTitle, styles.ink]}>{story.lead}</Text>
                {story.mark && (
                  <SweepText
                    key={sweep ?? "none"}
                    marker={sweep ?? undefined}
                    header={false}
                    style={[Type.screenTitle, styles.ink]}
                  >
                    {story.mark}
                  </SweepText>
                )}
              </View>
              <Text style={[Type.body, styles.soft]}>{story.body}</Text>
              {story.demo === "groupe" && <GroupeDemo vote={example.vote} />}
            </Animated.View>
          )}
        </View>

        <View style={styles.bottom}>
          {interactive && (
            <View
              onTouchStart={() => setHeld(true)}
              {...({ onPointerDown: () => setHeld(true) } as object)}
            >
              {story.demo === "picker" && (
                <MarkerPicker selected={picked} onSelect={setPicked} />
              )}
              {story.demo === "vote" && (
                <VoteDemo vote={example.vote} onVote={voteExample} />
              )}
              {story.demo === "eraser" && (
                <EraserDemo vote={example.vote} onVote={voteExample} />
              )}
              {story.demo === "source" && <SourceDemo vote={example.vote} />}
              {story.demo === "reset" && (
                <ResetDemo
                  count={example.count}
                  onErase={() => setExample({ count: 0 })}
                />
              )}
            </View>
          )}
          <Text
            style={[Type.label, styles.muted]}
            accessibilityLiveRegion="polite"
          >
            {index + 1} / {STORIES.length}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

interface ExampleState {
  vote?: VoteValue;
  /** Touchers de vote dans la présentation : ce que l'exemple de Confidentialité efface. */
  count: number;
}

const EXAMPLE: Proposition = {
  id: "exemple",
  ref: "P-000",
  candidatId: "exemple",
  thematiqueId: "education",
  titre: "Ouvrir les bibliothèques publiques le dimanche",
  description:
    "« Les bibliothèques ouvriront le dimanche et plus tard le soir, pour que chacun puisse y lire, y travailler ou y réviser quand il est libre. »",
  sourceUrl: "https://exemple.fr/programme.pdf",
  dateDeclaration: "2026-03-03",
  contexte: "Exemple fictif.",
};

// La proposition fictive et les vrais boutons de Voter : le choix prend le trait du surligneur choisi juste avant.
function VoteDemo({
  vote,
  onVote,
}: {
  vote?: VoteValue;
  onVote: (vote: VoteValue) => void;
}) {
  const marker = useVotesStore((s) => s.marker);
  return (
    <View style={styles.voteDemo}>
      <Marked
        active={vote !== undefined}
        marker={marker}
        style={[Type.bodyStrong, styles.ink]}
      >
        {EXAMPLE.titre}
      </Marked>
      <VoteScale
        value={vote}
        onVote={onVote}
        stroke={
          vote !== undefined
            ? { value: vote, color: Markers[marker].soft }
            : undefined
        }
      />
    </View>
  );
}

// La ligne « A voté ! » telle qu'elle apparaît dans Voter ; la toucher ouvre la vraie feuille de modification, sur le vote fictif.
function EraserDemo({
  vote,
  onVote,
}: {
  vote?: VoteValue;
  onVote: (vote: VoteValue) => void;
}) {
  const marker = useVotesStore((s) => s.marker);
  const [editing, setEditing] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => setEditing(true)}
        accessibilityRole="button"
        accessibilityLabel={`A voté : ${EXAMPLE.titre}`}
        accessibilityHint="Ouvre la modification du vote, sur l’exemple"
        style={({ pressed }) => [
          styles.demo,
          pressed && { backgroundColor: Colors.pressed },
        ]}
      >
        <Text style={[Type.note, styles.ink]}>A voté !</Text>
        <View style={styles.flex}>
          <Marked
            active={vote !== undefined}
            marker={marker}
            style={[Type.label, styles.ink]}
            numberOfLines={1}
          >
            {EXAMPLE.titre}
          </Marked>
        </View>
        {vote !== undefined ? (
          <VoteTag value={vote} />
        ) : (
          <Text style={[Type.label, styles.muted]}>Pas encore voté</Text>
        )}
        <EraserIcon size={20} color={Colors.ink} />
      </Pressable>
      <EditVoteSheet
        id={null}
        visible={editing}
        onClose={() => setEditing(false)}
        example={{
          titre: EXAMPLE.titre,
          description: EXAMPLE.description,
          value: vote,
          onVote,
        }}
      />
    </>
  );
}

// Une ligne d'Explorer (fictive) : auteur et votre note visibles, la source au toucher.
function SourceDemo({ vote }: { vote?: VoteValue }) {
  const marker = useVotesStore((s) => s.marker);
  const [open, setOpen] = useState(false);
  const [tried, setTried] = useState(false);
  return (
    <View style={styles.card}>
      <PropositionRow
        proposition={EXAMPLE}
        vote={vote}
        author="Candidat fictif"
        marker={marker}
        onPress={() => setOpen(!open)}
        actionHint="Montre la date et la source de l’exemple"
      />
      {open && (
        <Animated.View entering={FadeIn.duration(180)} style={styles.cardBody}>
          <Text style={[Type.label, styles.muted]}>
            Déclaré le 3 mars 2026 · Programme 2027, page 12
          </Text>
          <Button
            label="Ouvrir la source · exemple.fr"
            icon="open-outline"
            onPress={() => setTried(true)}
          />
          {tried && (
            <Animated.Text
              entering={FadeIn.duration(180)}
              style={[Type.label, styles.soft]}
            >
              Ouvre la page de la source dans votre navigateur.
            </Animated.Text>
          )}
        </Animated.View>
      )}
    </View>
  );
}

// Votre vote face à deux candidats fictifs, comme sur la fiche d'un scrutin : photo, nom, puis le type de vote.
const GROUPE_ROWS = [
  {
    id: "exemple-a",
    avatar: "A",
    nom: "Candidat A",
    icon: "person",
    type: "Vote personnel",
    position: "Pour",
  },
  {
    id: "exemple-b",
    avatar: "B",
    nom: "Candidat B",
    icon: "people",
    type: "Vote de son groupe",
    position: "Contre",
  },
] as const;

function GroupeDemo({ vote }: { vote?: VoteValue }) {
  const marker = useVotesStore((s) => s.marker);
  return (
    <View
      style={[styles.card, styles.compact]}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      <View style={styles.groupeRow}>
        <Text style={[Type.bodyStrong, styles.ink, styles.flex]}>Vous</Text>
        {vote !== undefined ? (
          <YourVoteMark id="exemple" vote={vote} marker={marker} />
        ) : (
          <Text style={[Type.label, styles.muted]}>Pas encore voté</Text>
        )}
      </View>
      {GROUPE_ROWS.map((r) => (
        <View key={r.id} style={[styles.groupeRow, styles.separator]}>
          <CandidateAvatar candidat={r} size={32} />
          <View style={styles.flex}>
            <Text style={[Type.bodyStrong, styles.ink]}>{r.nom}</Text>
            <View style={styles.type}>
              <Ionicons name={r.icon} size={12} color={Colors.graphite} />
              <Text style={[Type.label, styles.muted]}>{r.type}</Text>
            </View>
          </View>
          <PositionMark label={r.position} />
        </View>
      ))}
    </View>
  );
}

// Le vrai bouton du Classement, branché sur les votes de la présentation : il n'efface jamais vos vrais votes.
function ResetDemo({ count, onErase }: { count: number; onErase: () => void }) {
  const [shown, setShown] = useState<number | null>(null);
  const value = shown ?? count;

  const erase = () => {
    celebrate("small");
    // Le compteur descend vite jusqu'à zéro : on voit les votes partir.
    for (let n = count - 1; n >= 0; n--) {
      setTimeout(() => setShown(n), (count - n) * 45);
    }
    setTimeout(
      () => {
        onErase();
        setShown(null);
      },
      (count + 1) * 45,
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Text style={[Type.bodyStrong, styles.ink]}>
          {value > 0
            ? `Exemple : ${value} vote${value > 1 ? "s" : ""}`
            : "Exemple : aucun vote"}
        </Text>
        <ResetButton count={value} onConfirm={erase} />
      </View>
    </View>
  );
}

function Bar({
  state,
  progress,
}: {
  state: "done" | "current" | "todo";
  progress: { value: number };
}) {
  const fill = useAnimatedStyle(() => ({
    width: `${(state === "done" ? 1 : state === "current" ? progress.value : 0) * 100}%`,
  }));
  return (
    <View style={styles.bar}>
      <Animated.View style={[styles.barFill, fill]} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  rule: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 40,
    width: 1,
    backgroundColor: Colors.graphite,
    opacity: 0.5,
  },
  column: {
    flex: 1,
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    paddingLeft: 56,
    paddingRight: Spacing.two,
  },
  bars: {
    flexDirection: "row",
    gap: 4,
  },
  // Trait de 4 pt dans une cible de 44 pt de haut.
  barTarget: {
    flex: 1,
    minHeight: MinTarget,
    justifyContent: "center",
  },
  bar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.rule,
    overflow: "hidden",
  },
  barFill: {
    height: 4,
    backgroundColor: Colors.ink,
  },
  stage: {
    flex: 1,
    justifyContent: "center",
  },
  zoneLeft: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: -56,
    width: "33%",
  },
  zoneRight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: "67%",
  },
  content: {
    gap: Spacing.three,
  },
  voteDemo: {
    gap: Spacing.two,
  },
  demo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    minHeight: MinTarget,
    paddingHorizontal: Spacing.one,
    borderRadius: Radius.medium,
    backgroundColor: Colors.sheet,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
  },
  flex: {
    flex: 1,
  },
  card: {
    borderRadius: Radius.large,
    backgroundColor: Colors.sheet,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
    overflow: "hidden",
  },
  cardBody: {
    gap: Spacing.one,
    padding: Spacing.two,
  },
  compact: {
    paddingHorizontal: 12,
  },
  groupeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    minHeight: 44,
    paddingVertical: 6,
  },
  type: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  start: {
    alignItems: "center",
    gap: Spacing.three,
  },
  startLogo: {
    width: 128,
    height: 128,
  },
  separator: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
  },
  logo: {
    width: 96,
    height: 96,
    marginLeft: -12,
  },
  bottom: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  cta: {
    alignSelf: "stretch",
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
