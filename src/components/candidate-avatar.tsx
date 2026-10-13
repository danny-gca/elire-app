import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { CandidateImages } from '@/constants/candidate-images';
import { Colors } from '@/constants/theme';
import type { Candidat } from '@/schemas/dataset';

// Photo locale, sinon initiales : jamais de visage tiers en repli.
export function CandidateAvatar({ candidat, size = 40 }: { candidat: Candidat; size?: number }) {
  const source = CandidateImages[candidat.id];
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (source) {
    return <Image source={source} style={[shape, styles.photo]} contentFit="cover" accessibilityIgnoresInvertColors />;
  }
  return (
    <View style={[shape, styles.initials]}>
      <Text style={{ color: Colors.graphite, fontWeight: '600', fontSize: size * 0.36 }}>{candidat.avatar}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: {
    backgroundColor: Colors.ruleSoft,
  },
  initials: {
    backgroundColor: Colors.ruleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
