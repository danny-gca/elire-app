import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Colors, Markers, Type, type MarkerId } from "@/constants/theme";
import { ALL_VOTED_TEXT } from "@/lib/share";

// « J'ai voté à tout ! » écrit à la main sur un trait de surligneur, comme une annotation dans la marge du cahier.
export function AllVotedNote({
  marker,
  style,
}: {
  marker: MarkerId;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[styles.root, style]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={ALL_VOTED_TEXT}
    >
      <View style={[styles.band, { backgroundColor: Markers[marker].soft }]} />
      <Text style={[Type.note, styles.ink]} numberOfLines={1}>
        {ALL_VOTED_TEXT}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    transform: [{ rotate: "-2deg" }],
  },
  // Bande basse : le feutre passe sous la moitié inférieure des lettres.
  band: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 2,
    height: "55%",
    borderRadius: 4,
  },
  ink: {
    color: Colors.ink,
  },
});
