import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, MinTarget, Radius, Spacing, Type } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'quiet' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

const VARIANTS: Record<Variant, { bg: string; pressedBg: string; fg: string; border: string }> = {
  primary: { bg: Colors.ink, pressedBg: Colors.inkSoft, fg: Colors.sheet, border: Colors.ink },
  secondary: { bg: Colors.sheet, pressedBg: Colors.pressed, fg: Colors.ink, border: Colors.rule },
  quiet: { bg: 'transparent', pressedBg: Colors.pressed, fg: Colors.ink, border: 'transparent' },
  danger: { bg: Colors.negativeSoft, pressedBg: Colors.negativePressed, fg: Colors.negative, border: Colors.negative },
};

export function Button({ label, onPress, variant = 'secondary', icon, disabled, accessibilityHint, style }: ButtonProps) {
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
        { backgroundColor: pressed ? v.pressedBg : v.bg, borderColor: v.border, opacity: disabled ? 0.45 : 1 },
        style,
      ]}>
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
});
