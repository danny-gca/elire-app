import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { CandidateImages } from '@/constants/candidate-images';
import { Colors, Type } from '@/constants/theme';
import type { Candidat } from '@/schemas/dataset';

// Photo locale, sinon initiales : jamais de visage tiers en repli. `ring` : anneau à la couleur du parti.
export function CandidateAvatar({ candidat, size = 40, ring }: { candidat: Candidat; size?: number; ring?: string }) {
  const source = CandidateImages[candidat.id];
  const shape = { width: size, height: size, borderRadius: size / 2 };

  const face = source ? (
    <Image source={source} style={[shape, styles.photo]} contentFit="cover" accessibilityIgnoresInvertColors />
  ) : (
    <View style={[shape, styles.initials]}>
      <Text style={{ color: Colors.graphite, fontFamily: Type.labelStrong.fontFamily, fontSize: size * 0.36 }}>{candidat.avatar}</Text>
    </View>
  );
  if (!ring) {
    return face;
  }
  // Anneau de 2pt séparé du visage par 2pt de feuille.
  const outer = size + 8;
  return <View style={[styles.ring, { width: outer, height: outer, borderRadius: outer / 2, borderColor: ring }]}>{face}</View>;
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    backgroundColor: Colors.ruleSoft,
  },
  initials: {
    backgroundColor: Colors.ruleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
