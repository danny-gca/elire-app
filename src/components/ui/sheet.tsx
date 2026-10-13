import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, MaxContentWidth, MinTarget, Radius, Spacing, Type } from '@/constants/theme';

interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

// Feuille modale : pageSheet natif sur iOS, panneau du bas ailleurs.
export function Sheet({ visible, title, onClose, children }: SheetProps) {
  const insets = useSafeAreaInsets();
  const ios = Platform.OS === 'ios';

  const header = (
    <View style={styles.header}>
      <Text style={[Type.bodyStrong, styles.title]} accessibilityRole="header" numberOfLines={1}>
        {title}
      </Text>
      <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Fermer" style={styles.close} hitSlop={8}>
        <Text style={[Type.bodyStrong, { color: Colors.ink }]}>Fermer</Text>
      </Pressable>
    </View>
  );

  const content = (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.three }]}>
      {children}
    </ScrollView>
  );

  if (ios) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        <View style={styles.iosRoot}>
          {header}
          {content}
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fermer" />
        <View style={[styles.panel, { maxHeight: '88%' }]}>
          {header}
          {content}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  iosRoot: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 30, 33, 0.32)',
  },
  panel: {
    width: '100%',
    maxWidth: MaxContentWidth,
    backgroundColor: Colors.paper,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingLeft: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.rule,
  },
  title: {
    flex: 1,
    color: Colors.ink,
  },
  close: {
    minHeight: MinTarget,
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  content: {
    padding: Spacing.two,
    gap: Spacing.two,
  },
});
