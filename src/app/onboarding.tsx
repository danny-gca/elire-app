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

import { Marked } from "@/components/marked";
import { MarkerPicker } from "@/components/marker-picker";
import { Button } from "@/components/ui/button";
import {
  Colors,
  MaxContentWidth,
  MinTarget,
  Spacing,
  Type,
} from "@/constants/theme";
import { useVotesStore } from "@/store/votes-store";

const STORY_MS = 8000;

interface Story {
  title: string;
  /** Mot surligné (démonstration du geste) ou souligné dans le titre. */
  key?: { word: string; style: "mark" | "underline" };
  body: string;
  /** Dernière étape : choix du surligneur. */
  picker?: boolean;
}

const STORIES: Story[] = [
  {
    title: "ÉLIRE",
    body: "Présidentielle 2027. Un cahier pour se faire son avis sur les propositions des candidats, seul et au calme. Environ 20 secondes par question : un premier classement en 3 à 5 minutes, et vous arrêtez quand vous voulez.",
  },
  {
    title: "Neutralité : vous jugez la mesure, pas la personne.",
    key: { word: "la mesure", style: "mark" },
    body: "Les propositions arrivent sans nom ni parti, dans un ordre mélangé. Vous les notez d’Impossible à Parfait, ou « Je ne sais pas », et vos notes se marquent au surligneur.",
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
  {
    title: "Votre surligneur : vos avis, votre couleur.",
    key: { word: "votre couleur", style: "mark" },
    body: "Choisissez la couleur de vos marques. Vous pourrez en changer dans Classement ; ce que vous avez déjà surligné garde sa couleur.",
    picker: true,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useVotesStore((s) => s.completeOnboarding);
  const reducedMotion = useReducedMotion();
  const [screenReader, setScreenReader] = useState(false);
  const [index, setIndex] = useState(0);
  const progress = useSharedValue(0);
  const autoplay = !reducedMotion && !screenReader;
  const last = index === STORIES.length - 1;

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReader);
  }, []);

  const finish = () => {
    completeOnboarding();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const go = (delta: number) =>
    setIndex((i) => Math.max(0, Math.min(STORIES.length - 1, i + delta)));

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
          </Animated.View>
        </View>

        <View style={styles.bottom}>
          {story.picker && (
            <View style={styles.picker}>
              <MarkerPicker />
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
            <Button label="Suivant" onPress={() => go(1)} style={styles.cta} />
          )}
        </View>
      </View>
    </SafeAreaView>
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
    height: 2,
    backgroundColor: Colors.rule,
    overflow: "hidden",
  },
  barFill: {
    height: 2,
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
