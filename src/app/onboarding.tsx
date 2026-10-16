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
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { EraserIcon } from "@/components/eraser-icon";
import { Marked } from "@/components/marked";
import { MarkerPicker } from "@/components/marker-picker";
import { Button } from "@/components/ui/button";
import { VoteScale } from "@/components/vote-scale";
import {
  Colors,
  Markers,
  MaxContentWidth,
  MinTarget,
  Radius,
  Spacing,
  Type,
} from "@/constants/theme";
import type { VoteValue } from "@/lib/scoring";
import { celebrate } from "@/store/celebration-store";
import { useVotesStore } from "@/store/votes-store";

// Le temps de lire une page avant la suivante (le bouton Suivant montre ce qui reste).
const STORY_MS = 12000;

interface Story {
  title: string;
  /** Mot surligné (démonstration du geste) ou souligné dans le titre. */
  key?: { word: string; style: "mark" | "underline" };
  body: string;
  /** Choix du surligneur, avant la démonstration du vote. */
  picker?: boolean;
  /** Boutons de vote à essayer. */
  vote?: boolean;
  /** Montre la ligne « A voté ! » et sa gomme. */
  eraser?: boolean;
}

const STORIES: Story[] = [
  {
    title: "élire",
    body: "Présidentielle 2027. Un cahier pour se faire son avis sur les propositions des candidats, seul et au calme. Environ 20 secondes par question : un premier classement en 3 à 5 minutes, et vous arrêtez quand vous voulez.",
  },
  {
    title: "Votre surligneur : vos avis, votre couleur.",
    key: { word: "votre couleur", style: "mark" },
    body: "Choisissez la couleur de vos marques, elle sert dès la page suivante. Vous pourrez en changer en haut de Voter ; ce que vous avez déjà surligné garde sa couleur.",
    picker: true,
  },
  {
    title: "Neutralité : vous jugez la mesure, pas la personne.",
    key: { word: "la mesure", style: "mark" },
    body: "Les propositions arrivent sans nom ni parti, dans un ordre mélangé. Notez-les d’Impossible à Parfait, ou « Je ne sais pas » : essayez ci-dessous, votre surligneur marque le choix.",
    vote: true,
  },
  {
    title: "Changer d’avis : la gomme.",
    key: { word: "la gomme", style: "underline" },
    body: "Juste après un vote, « A voté ! » reste 10 secondes en haut de Voter : touchez-le pour corriger. Plus tard, ouvrez une proposition ou un scrutin déjà voté dans Explorer, Lois ou la fiche d’un candidat, puis touchez la gomme.",
    eraser: true,
  },
  {
    title: "Transparence : chaque fait a sa source.",
    key: { word: "sa source", style: "underline" },
    body: "Chaque proposition renvoie à son origine, chaque scrutin au site officiel du Parlement. Une erreur ? Un lien permet de la signaler.",
  },
  {
    title: "Responsabilité : une promesse n’est pas un vote.",
    key: { word: "un vote", style: "underline" },
    body: "Le programme 2027 et les votes réels au Parlement sont séparés. Quand un candidat n’a pas voté lui-même, c’est écrit : position de son groupe.",
  },
  {
    title: "Confidentialité : vos avis restent chez vous.",
    key: { word: "chez vous", style: "underline" },
    body: "Aucun compte, aucune statistique envoyée. Vos votes sont enregistrés sur cet appareil seulement, et vous pouvez les effacer à tout moment.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useVotesStore((s) => s.completeOnboarding);
  const reducedMotion = useReducedMotion();
  const [screenReader, setScreenReader] = useState(false);
  const [index, setIndex] = useState(0);
  // Un essai (surligneur, boutons) : la page ne part plus seule.
  const [held, setHeld] = useState(false);
  const progress = useSharedValue(0);
  const remaining = useDerivedValue(() => 1 - progress.value);
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

  const go = (delta: number) => {
    setHeld(false);
    setIndex((i) => Math.max(0, Math.min(STORIES.length - 1, i + delta)));
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
    const timer = setTimeout(() => go(1), STORY_MS);
    return () => clearTimeout(timer);
  }, [index, autoplay, last, progress]);

  const story = STORIES[index];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.rule} />
      <View style={styles.column}>
        <View style={styles.top}>
          <View
            style={styles.bars}
            importantForAccessibility="no-hide-descendants"
          >
            {STORIES.map((s, i) => (
              <Bar
                key={s.title}
                state={i < index ? "done" : i === index ? "current" : "todo"}
                progress={progress}
              />
            ))}
          </View>
          {!last && (
            <Pressable
              onPress={finish}
              accessibilityRole="button"
              style={styles.skip}
              hitSlop={8}
            >
              <Text style={[Type.labelStrong, styles.ink]}>Passer</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.stage}>
          <Pressable
            style={styles.zoneLeft}
            onPress={() => go(-1)}
            accessibilityRole="button"
            accessibilityLabel="Précédent"
          />
          <Pressable
            style={styles.zoneRight}
            onPress={() => (last ? undefined : go(1))}
            accessibilityRole="button"
            accessibilityLabel="Suivant"
          />
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
            <Text
              style={[Type.screenTitle, styles.ink]}
              accessibilityRole="header"
            >
              <KeyedTitle story={story} />
            </Text>
            <Text style={[Type.body, styles.soft]}>{story.body}</Text>
            {story.eraser && <EraserDemo />}
          </Animated.View>
        </View>

        <View style={styles.bottom}>
          {(story.picker || story.vote) && (
            <View
              style={styles.picker}
              onTouchStart={() => setHeld(true)}
              {...({ onPointerDown: () => setHeld(true) } as object)}
            >
              {story.picker ? <MarkerPicker /> : <VoteDemo />}
            </View>
          )}
          <Text
            style={[Type.label, styles.muted]}
            accessibilityLiveRegion="polite"
          >
            {index + 1} / {STORIES.length}
          </Text>
          {last ? (
            <Button
              label="Commencer à voter"
              variant="primary"
              onPress={finish}
              style={styles.cta}
            />
          ) : (
            <Button
              label="Suivant"
              onPress={() => go(1)}
              style={styles.cta}
              countdown={autoplay ? remaining : undefined}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// Les vrais boutons de Voter : le choix prend le trait du surligneur choisi juste avant.
function VoteDemo() {
  const marker = useVotesStore((s) => s.marker);
  const [value, setValue] = useState<VoteValue>();
  return (
    <VoteScale
      value={value}
      onVote={setValue}
      stroke={value !== undefined ? { value, color: Markers[marker].soft } : undefined}
    />
  );
}

// La ligne « A voté ! » telle qu'elle apparaît dans Voter, gomme comprise.
function EraserDemo() {
  const marker = useVotesStore((s) => s.marker);
  return (
    <View style={styles.demo} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <Text style={[Type.note, styles.ink]}>A voté !</Text>
      <View style={styles.demoTitle}>
        <Marked active marker={marker} style={[Type.label, styles.ink]}>
          La mesure que vous venez de noter
        </Marked>
      </View>
      <EraserIcon size={20} color={Colors.ink} />
    </View>
  );
}

function KeyedTitle({ story }: { story: Story }) {
  const marker = useVotesStore((s) => s.marker);
  if (!story.key) {
    return story.title;
  }
  const [before, after] = story.title.split(story.key.word);
  return (
    <>
      {before}
      {story.key.style === "mark" ? (
        <Marked active marker={marker}>{story.key.word}</Marked>
      ) : (
        <Text
          style={{
            textDecorationLine: "underline",
            textDecorationColor: Colors.graphite,
          }}
        >
          {story.key.word}
        </Text>
      )}
      {after}
    </>
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
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    minHeight: MinTarget,
  },
  bars: {
    flex: 1,
    flexDirection: "row",
    gap: 4,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.rule,
    overflow: "hidden",
  },
  barFill: {
    height: 4,
    backgroundColor: Colors.ink,
  },
  skip: {
    minHeight: MinTarget,
    minWidth: MinTarget,
    paddingHorizontal: Spacing.one,
    alignItems: "center",
    justifyContent: "center",
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
  demoTitle: {
    flex: 1,
  },
  logo: {
    width: 96,
    height: 96,
    marginLeft: -12,
  },
  bottom: {
    gap: Spacing.one,
    paddingBottom: Spacing.two,
  },
  picker: {
    marginBottom: Spacing.two,
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
