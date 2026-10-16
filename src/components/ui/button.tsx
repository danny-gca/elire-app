import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, type GestureResponderEvent, type StyleProp, type ViewStyle } from 'react-native';
import type { DerivedValue, SharedValue } from 'react-native-reanimated';

import { CountdownFill } from '@/components/countdown-fill';
import { Colors, MinTarget, Radius, Spacing, Type } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'quiet' | 'danger';

interface ButtonProps {
  label: string;
  onPress: (e: GestureResponderEvent) => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  /** Temps restant avant que l'action parte seule (de 1 à 0), montré par un fond qui se retire. */
  countdown?: SharedValue<number> | DerivedValue<number>;
}

const VARIANTS: Record<Variant, { bg: string; pressedBg: string; fg: string; border: string; countdown: string }> = {
  primary: { bg: Colors.ink, pressedBg: Colors.inkSoft, fg: Colors.sheet, border: Colors.ink, countdown: Colors.graphite },
  secondary: { bg: Colors.sheet, pressedBg: Colors.pressed, fg: Colors.ink, border: Colors.rule, countdown: Colors.ruleSoft },
  quiet: { bg: 'transparent', pressedBg: Colors.pressed, fg: Colors.ink, border: 'transparent', countdown: Colors.ruleSoft },
  danger: { bg: Colors.negativeSoft, pressedBg: Colors.negativePressed, fg: Colors.negative, border: Colors.negative, countdown: Colors.negativePressed },
};

export function Button({ label, onPress, variant = 'secondary', icon, disabled, accessibilityHint, style, countdown }: ButtonProps) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.base,
        countdown && styles.clip,
        { backgroundColor: pressed ? v.pressedBg : v.bg, borderColor: v.border, opacity: disabled ? 0.45 : 1 },
        style,
      ]}>
      {countdown && <CountdownFill remaining={countdown} color={v.countdown} />}
      {icon && <Ionicons name={icon} size={18} color={v.fg} />}
      <Text style={[Type.bodyStrong, { color: v.fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MinTarget,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.medium,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  clip: {
    overflow: 'hidden',
  },
});
