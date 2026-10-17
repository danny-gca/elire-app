import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { CandidateAvatar } from "@/components/candidate-avatar";
import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import { APP_VERSION, REPO_URL, SITE_URL } from "@/constants/app";
import {
  FONT_CREDITS,
  ICON_CREDIT,
  PHOTO_CREDITS,
  SOUND_CREDIT,
} from "@/constants/credits";
import { EDITEUR } from "@/constants/legal";
import {
  Colors,
  MinTarget,
  Numeric,
  Radius,
  Spacing,
  Type,
} from "@/constants/theme";
import { getCandidat } from "@/services/dataset";

const host = (url: string) => url.replace(/^https:\/\//, "").replace(/\/$/, "");

// Qui a fait l'app, et où la retrouver.
const APP_LINKS = [
  { titre: "Site web", detail: host(SITE_URL), url: SITE_URL },
  {
    titre: "Code source et données",
    detail: `${host(REPO_URL)} · MIT, CC BY-SA 4.0`,
    url: REPO_URL,
  },
];

export default function CreditsScreen() {
  const router = useRouter();

  return (
    <Screen>
      <Pressable
        onPress={() =>
          router.canGoBack() ? router.back() : router.navigate("/")
        }
        accessibilityRole="button"
        accessibilityLabel="Retour"
        hitSlop={8}
        style={styles.back}
      >
        <Ionicons name="chevron-back" size={26} color={Colors.ink} />
      </Pressable>
      <ScreenHeader
        title="Crédits"
        note="Qui a fait élire, et ce qu'elle réutilise selon leur licence : portraits de Wikimedia Commons, polices et icônes libres. Les sons sont faits maison, par un script ouvert."
      />
      <View style={styles.list}>
        <View
          style={styles.row}
          accessible
          accessibilityLabel={`élire ${APP_VERSION}, conçue et développée par ${EDITEUR.nom}, à titre personnel`}
        >
          <View style={styles.text}>
            <Text style={[Type.bodyStrong, styles.ink]}>
              Développée par {EDITEUR.nom}
            </Text>
            <Text style={[Type.label, styles.muted]}>
              Sans lien avec un parti, ni un candidat
            </Text>
            {APP_VERSION !== "" && (
              <Text style={[Type.label, Numeric, styles.muted]}>
                Version {APP_VERSION}
              </Text>
            )}
          </View>
        </View>
        {APP_LINKS.map((link) => (
          <Pressable
            key={link.url}
            onPress={() => Linking.openURL(link.url)}
            accessibilityRole="link"
            accessibilityLabel={`${link.titre}, ${link.detail}`}
            style={({ pressed }) => [
              styles.row,
              styles.separator,
              pressed && { backgroundColor: Colors.pressed },
            ]}
          >
            <View style={styles.text}>
              <Text style={[Type.bodyStrong, styles.ink]}>{link.titre}</Text>
              <Text style={[Type.label, styles.muted]}>{link.detail}</Text>
            </View>
            <Ionicons name="open-outline" size={16} color={Colors.graphite} />
          </Pressable>
        ))}
      </View>
      <Text
        style={[Type.bodyStrong, styles.ink, styles.heading]}
        accessibilityRole="header"
      >
        Portraits
      </Text>
      <View style={styles.list}>
        {PHOTO_CREDITS.map((credit, i) => {
          const candidat = getCandidat(credit.candidatId);
          if (!candidat) {
            return null;
          }
          return (
            <Pressable
              key={credit.candidatId}
              disabled={!credit.url}
              onPress={() => credit.url && Linking.openURL(credit.url)}
              accessibilityRole={credit.url ? "link" : "text"}
              accessibilityLabel={`${candidat.nom}, photo de ${credit.auteur}, licence ${credit.licence}`}
              style={({ pressed }) => [
                styles.row,
                i > 0 && styles.separator,
                pressed && { backgroundColor: Colors.pressed },
              ]}
            >
              <CandidateAvatar candidat={candidat} size={40} />
              <View style={styles.text}>
                <Text style={[Type.bodyStrong, styles.ink]}>
                  {candidat.nom}
                </Text>
                <Text style={[Type.label, styles.muted]}>
                  {credit.auteur} · {credit.licence}
                </Text>
              </View>
              {credit.url && (
                <Ionicons
                  name="open-outline"
                  size={16}
                  color={Colors.graphite}
                />
              )}
            </Pressable>
          );
        })}
      </View>
      <Text
        style={[Type.bodyStrong, styles.ink, styles.heading]}
        accessibilityRole="header"
      >
        Polices, icônes et sons
      </Text>
      <View style={styles.list}>
        {FONT_CREDITS.map((font, i) => (
          <Pressable
            key={font.nom}
            onPress={() => Linking.openURL(font.url)}
            accessibilityRole="link"
            accessibilityLabel={`${font.nom}, ${font.role}, ${font.auteur}, licence SIL OFL 1.1`}
            style={({ pressed }) => [
              styles.row,
              i > 0 && styles.separator,
              pressed && { backgroundColor: Colors.pressed },
            ]}
          >
            <View style={styles.text}>
              <Text style={[Type.bodyStrong, styles.ink]}>
                {font.nom} · {font.role}
              </Text>
              <Text style={[Type.label, styles.muted]}>
                {font.auteur} · SIL OFL 1.1
              </Text>
            </View>
            <Ionicons name="open-outline" size={16} color={Colors.graphite} />
          </Pressable>
        ))}
        <Pressable
          onPress={() => Linking.openURL(ICON_CREDIT.url)}
          accessibilityRole="link"
          accessibilityLabel={`${ICON_CREDIT.nom}, ${ICON_CREDIT.role}, ${ICON_CREDIT.auteur}, licence ${ICON_CREDIT.licence}`}
          style={({ pressed }) => [
            styles.row,
            styles.separator,
            pressed && { backgroundColor: Colors.pressed },
          ]}
        >
          <View style={styles.text}>
            <Text style={[Type.bodyStrong, styles.ink]}>
              {ICON_CREDIT.nom} · {ICON_CREDIT.role}
            </Text>
            <Text style={[Type.label, styles.muted]}>
              {ICON_CREDIT.auteur} · {ICON_CREDIT.licence}
            </Text>
          </View>
          <Ionicons name="open-outline" size={16} color={Colors.graphite} />
        </Pressable>
        <Pressable
          onPress={() => Linking.openURL(SOUND_CREDIT.url)}
          accessibilityRole="link"
          accessibilityLabel={`${SOUND_CREDIT.nom}, ${SOUND_CREDIT.role}, ${SOUND_CREDIT.auteur}, licence ${SOUND_CREDIT.licence}`}
          style={({ pressed }) => [
            styles.row,
            styles.separator,
            pressed && { backgroundColor: Colors.pressed },
          ]}
        >
          <View style={styles.text}>
            <Text style={[Type.bodyStrong, styles.ink]}>
              {SOUND_CREDIT.nom} · {SOUND_CREDIT.role}
            </Text>
            <Text style={[Type.label, styles.muted]}>
              {SOUND_CREDIT.auteur} · {SOUND_CREDIT.licence}
            </Text>
          </View>
          <Ionicons name="open-outline" size={16} color={Colors.graphite} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    width: MinTarget,
    height: MinTarget,
    marginLeft: -10,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    borderRadius: Radius.large,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
    backgroundColor: Colors.sheet,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 64,
    paddingHorizontal: Spacing.two,
    paddingVertical: 12,
  },
  separator: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
  },
  text: {
    flex: 1,
  },
  heading: {
    marginTop: Spacing.three,
    marginBottom: Spacing.one,
  },
  ink: {
    color: Colors.ink,
  },
  muted: {
    color: Colors.graphite,
  },
});
