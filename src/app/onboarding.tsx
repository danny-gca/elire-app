import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { CandidateAvatar } from "@/components/candidate-avatar";
import { EditChip } from "@/components/edit-chip";
import { EditVoteSheet } from "@/components/edit-vote-sheet";
import { Marked } from "@/components/marked";
import { MarkerPicker } from "@/components/marker-picker";
import { PropositionRow } from "@/components/proposition-row";
import { SweepText } from "@/components/sweep-text";
import { Button } from "@/components/ui/button";
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
import { buzz, playSound } from "@/lib/sound";
import type { Proposition } from "@/schemas/dataset";
import { celebrate } from "@/store/celebration-store";
import { useVotesStore } from "@/store/votes-store";

// Le temps de lire une page avant la suivante, montré par le trait du haut.
const STORY_MS = 15000;
// Après un essai réussi (couleur, vote), le temps de voir son geste avant la page suivante.
const TRY_NEXT_MS = 1200;
// Après « Ouvrir la source », le temps de lire le message.
const SOURCE_NEXT_MS = 1800;
// Après la fermeture de la feuille de la gomme (qui se ferme seule après le vote).
const SHEET_NEXT_MS = 600;

type Demo = "picker" | "vote" | "eraser" | "source" | "groupe" | "start";

interface Story {
  /** Début du titre, en encre. */
  lead: string;
  /** Fin du titre, balayée par le surligneur à l'arrivée de la page. */
  mark?: string;
  body: string;
  demo?: Demo;
}

// Les démonstrations à essayer vont en bas, hors des zones de toucher de la page.
const INTERACTIVE: Demo[] = ["picker", "vote", "eraser", "source"];

const STORIES: Story[] = [
  {
    lead: "élire",
    body: "Présidentielle 2027. Un cahier pour se faire son avis sur les propositions des candidats, seul et au calme. Environ 20 secondes par question : un premier classement en 3 à 5 minutes, et vous arrêtez quand vous voulez.",
  },
  {
    lead: "Votre surligneur :",
    mark: "vos avis, votre couleur.",
    body: "Choisissez la couleur de vos avis. Vous pourrez la changer plus tard : ce que vous avez déjà surligné garde sa couleur.",
    demo: "picker",
  },
  {
    lead: "Neutralité :",
    mark: "vous jugez la mesure, pas la personne.",
    body: "Les propositions arrivent sans nom ni parti, dans un ordre mélangé. Notez-les ! Essayez ci-dessous.",
    demo: "vote",
  },
  {
    lead: "Changer d’avis :",
    mark: "la gomme.",
    body: "Juste après un vote, touchez « A voté ! » pour le corriger. Vous pourrez aussi modifier vos votes après coup, si vous n’avez pas eu le temps de le faire. Essayez ci-dessous.",
    demo: "eraser",
  },
  {
    lead: "Transparence :",
    mark: "chaque fait a sa source.",
    body: "Chaque proposition montre son auteur, sa date et sa source, et chaque scrutin renvoie à sa source. Essayez l’exemple ci-dessous.",
    demo: "source",
  },
  {
    lead: "Responsabilité :",
    mark: "une promesse n’est pas un vote.",
    body: "Ce qu’un candidat promet et ce qu’il a vraiment voté sont montrés séparément. S’il n’était pas élu au moment d’un vote, on montre comment ont voté les élus de son parti : on appelle ça son « groupe ».",
    demo: "groupe",
  },
  {
    lead: "Confidentialité :",
    mark: "vos avis restent chez vous.",
    body: "Aucun compte, aucune statistique envoyée. Vos votes restent sur cet appareil, et vous pouvez les effacer à tout moment.",
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
  // Un seul vote fictif suit toute la présentation : posé en Neutralité, corrigé à la gomme, retrouvé ensuite.
  const [example, setExample] = useState<ExampleState>({});
  const voteExample = (vote: VoteValue) => {
    playSound("trait");
    setExample({ vote });
  };
  const progress = useSharedValue(0);
  const autoplay = !reducedMotion && !screenReader && !held;
  const last = index === STORIES.length - 1;

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReader);
  }, []);

  const finish = () => {
    completeOnboarding();
    celebrate("big");
    buzz("success");
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  // Essai terminé : la page tourne seule après ce délai (`at` relance le délai à chaque nouveau geste).
  const [soon, setSoon] = useState<{ ms: number; at: number } | null>(null);
  const nextSoon = (ms: number) => {
    if (!screenReader) {
      setSoon({ ms, at: Date.now() });
    }
  };

  const goTo = (next: number) => {
    setHeld(false);
    setSoon(null);
    setIndex(Math.max(0, Math.min(STORIES.length - 1, next)));
  };

  // Glisser comme une story : vers la gauche la suivante, vers la droite la précédente.
  const [swipedAt, setSwipedAt] = useState(0);
  const tap = (next: number) => {
    // Un glissement finit par un relâché : ce n'est pas un toucher sur la zone.
    if (Date.now() - swipedAt > 400) {
      goTo(next);
    }
  };
  const onSwipe = useCallback(
    (e?: { translationX: number; velocityX: number }) => {
      setSwipedAt(Date.now());
      if (!e) {
        return;
      }
      if ((e.translationX < -48 || e.velocityX < -500) && !last) {
        goTo(index + 1);
      } else if (e.translationX > 48 || e.velocityX > 500) {
        goTo(index - 1);
      }
    },
    [index, last],
  );
  const swipe = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .activeOffsetX([-24, 24])
        .failOffsetY([-20, 20])
        .onStart(() => onSwipe())
        .onEnd((e) => onSwipe(e)),
    [onSwipe],
  );

  // Après un essai, le trait du haut se remplit vite : on voit que la page va tourner.
  useEffect(() => {
    progress.value = 0;
    if (last || (!soon && !autoplay)) {
      progress.value = 1;
      return;
    }
    const ms = soon?.ms ?? STORY_MS;
    progress.value = withTiming(1, {
      duration: ms,
      easing: Easing.linear,
    });
    const timer = setTimeout(() => goTo(index + 1), ms);
    return () => clearTimeout(timer);
  }, [index, autoplay, last, progress, soon]);

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

        <GestureHandlerRootView style={styles.stage}>
          <GestureDetector gesture={swipe}>
            <View style={styles.stage}>
              {/* Comme une story : à gauche la page d'avant, à droite la suivante. */}
              <Pressable
                style={styles.zoneLeft}
                onPress={() => tap(index - 1)}
                accessibilityRole="button"
                accessibilityLabel="Page précédente"
              />
              <Pressable
                style={styles.zoneRight}
                onPress={() => (last ? undefined : tap(index + 1))}
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
                    <Text style={[Type.screenTitle, styles.ink]}>
                      {story.lead}
                    </Text>
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
                  {story.demo === "groupe" && (
                    <GroupeDemo vote={example.vote} />
                  )}
                </Animated.View>
              )}
            </View>
          </GestureDetector>
        </GestureHandlerRootView>

        <View style={styles.bottom}>
          {interactive && (
            <View
              onTouchStart={() => setHeld(true)}
              {...({ onPointerDown: () => setHeld(true) } as object)}
            >
              {story.demo === "picker" && (
                <MarkerPicker
                  selected={picked}
                  onSelect={(m) => {
                    setPicked(m);
                    nextSoon(TRY_NEXT_MS);
                  }}
                />
              )}
              {story.demo === "vote" && (
                <VoteDemo
                  vote={example.vote}
                  onVote={(v) => {
                    voteExample(v);
                    nextSoon(TRY_NEXT_MS);
                  }}
                />
              )}
              {story.demo === "eraser" && (
                <EraserDemo
                  vote={example.vote}
                  onVote={voteExample}
                  onDone={() => nextSoon(SHEET_NEXT_MS)}
                />
              )}
              {story.demo === "source" && (
                <SourceDemo
                  vote={example.vote}
                  onDone={() => nextSoon(SOURCE_NEXT_MS)}
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
  typeSource: "programme_2027",
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
  onDone,
}: {
  vote?: VoteValue;
  onVote: (vote: VoteValue) => void;
  /** La feuille se ferme après un vote corrigé. */
  onDone: () => void;
}) {
  const marker = useVotesStore((s) => s.marker);
  const [editing, setEditing] = useState(false);
  const [changed, setChanged] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => setEditing(true)}
        accessibilityRole="button"
        accessibilityLabel={`A voté : ${EXAMPLE.titre}`}
        accessibilityHint="Ouvre la modification du vote, sur l’exemple"
        style={({ pressed }) => [
          styles.demo,
          vote !== undefined && { backgroundColor: Markers[marker].solid },
          pressed && { backgroundColor: Colors.pressed },
        ]}
      >
        <Text style={[Type.note, styles.ink, styles.noShrink]} numberOfLines={1}>
          A voté !
        </Text>
        <Text style={[Type.label, styles.ink, styles.flex]} numberOfLines={1}>
          {EXAMPLE.titre}
        </Text>
        <EditChip>
          {vote !== undefined ? (
            <VoteTag value={vote} />
          ) : (
            <Text style={[Type.label, styles.muted]}>Pas encore voté</Text>
          )}
        </EditChip>
      </Pressable>
      <EditVoteSheet
        id={null}
        visible={editing}
        onClose={() => {
          setEditing(false);
          if (changed) {
            onDone();
          }
        }}
        example={{
          titre: EXAMPLE.titre,
          description: EXAMPLE.description,
          value: vote,
          onVote: (v) => {
            setChanged(true);
            onVote(v);
          },
        }}
      />
    </>
  );
}

// Une ligne d'Explorer (fictive) : auteur et votre note visibles, la source au toucher.
function SourceDemo({ vote, onDone }: { vote?: VoteValue; onDone: () => void }) {
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
            onPress={() => {
              setTried(true);
              onDone();
            }}
          />
          {tried && (
            <Animated.Text
              entering={FadeIn.duration(180)}
              style={[Type.label, styles.soft]}
            >
              La page s’ouvrira dans votre navigateur.
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
  noShrink: {
    flexShrink: 0,
  },
});
