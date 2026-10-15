import { Image, StyleSheet, Text, View } from 'react-native';

import { Colors, Type } from '@/constants/theme';

// Le « é » n'occupe que le centre de son image (x 143-417, y 81-400 sur 512) : on le recadre pour l'aligner.
const BOX = { x: 143, y: 81, w: 274, h: 319, size: 512 };

// Logo et nom : le « é » au surligneur, puis « élire ».
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
