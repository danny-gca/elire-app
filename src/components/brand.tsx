import { Image, StyleSheet, Text, View } from 'react-native';

import { Colors, Type } from '@/constants/theme';

// Le logo (la France d'un trait, le « é » au centre) n'occupe que le centre de son image (x 61-430, y 65-424 sur 512) : on le recadre pour l'aligner.
const BOX = { x: 61, y: 65, w: 369, h: 359, size: 512 };

// Logo et nom : la France au feutre et son « é », puis « élire ».
export function Brand({ height = 28 }: { height?: number }) {
  const scale = height / BOX.h;
  const full = BOX.size * scale;
  return (
    <View style={styles.row} accessible accessibilityRole="header" accessibilityLabel="élire">
      <View style={{ width: BOX.w * scale, height, overflow: 'hidden' }}>
        <Image
          source={require('@/assets/images/splash-icon.png')}
          style={{ width: full, height: full, marginLeft: -BOX.x * scale, marginTop: -BOX.y * scale }}
        />
      </View>
      <Text style={[Type.bodyStrong, styles.name]}>élire</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    color: Colors.ink,
  },
});
