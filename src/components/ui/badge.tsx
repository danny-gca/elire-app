import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Radius, Type } from '@/constants/theme';

export type BadgeTone = 'neutral' | 'positive' | 'negative' | 'caution';

const TONES: Record<BadgeTone, { fg: string; bg: string }> = {
  neutral: { fg: Colors.graphite, bg: Colors.ruleSoft },
  positive: { fg: Colors.positive, bg: Colors.positiveSoft },
  negative: { fg: Colors.negative, bg: Colors.negativeSoft },
  caution: { fg: Colors.caution, bg: Colors.cautionSoft },
};

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  /** Couleurs explicites (thématique) prioritaires sur le ton. */
  color?: { fg: string; bg: string };
  style?: StyleProp<ViewStyle>;
}

// Étiquette plate : texte court sur aplat, sans icône ni bordure.
export function Badge({ label, tone = 'neutral', color, style }: BadgeProps) {
  const c = color ?? TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, style]}>
      <Text style={[Type.labelStrong, { color: c.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.small,
  },
});
