import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Colors, Radius, Spacing, Type } from '@/constants/theme';
import { useVotesStore } from '@/store/votes-store';

// Mis de côté, branché nulle part : à afficher dans Voter seulement si une migration efface des votes existants.
export function QuestionsChangedNote() {
  const questionsChanged = useVotesStore((s) => s.questionsChanged);
  const dismissQuestionsChanged = useVotesStore((s) => s.dismissQuestionsChanged);
  if (!questionsChanged) {
    return null;
  }
  return (
    <View style={styles.notice} accessibilityLiveRegion="polite">
      <Text style={[Type.body, styles.ink]}>Les questions ont changé : vos votes repartent de zéro.</Text>
      <Button label="Compris" onPress={dismissQuestionsChanged} />
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    gap: Spacing.two,
    marginBottom: Spacing.two,
    padding: Spacing.two,
    backgroundColor: Colors.sheet,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
  },
  ink: {
    color: Colors.ink,
  },
});
