import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Colors, MinTarget, Radius, Spacing, Type } from '@/constants/theme';

interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

export function SearchField({ value, onChangeText, placeholder }: SearchFieldProps) {
  return (
    <View style={styles.field}>
      <Ionicons name="search" size={18} color={Colors.graphite} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.graphite}
        accessibilityLabel={placeholder}
        returnKeyType="search"
        autoCorrect={false}
        style={[Type.body, styles.input]}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Effacer la recherche">
          <Ionicons name="close-circle" size={18} color={Colors.graphite} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: MinTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: 12,
    backgroundColor: Colors.ruleSoft,
    borderRadius: Radius.medium,
  },
  input: {
    flex: 1,
    color: Colors.ink,
    paddingVertical: 10,
    outlineStyle: 'none',
  } as object,
});
