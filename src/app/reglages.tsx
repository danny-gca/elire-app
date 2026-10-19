import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { DataFooter } from '@/components/data-footer';
import { MarkerPicker } from '@/components/marker-picker';
import { Screen } from '@/components/screen';
import { ScreenHeader } from '@/components/screen-header';
import { Button } from '@/components/ui/button';
import { ResetButton } from '@/components/ui/reset-button';
import { Colors, MinTarget, Spacing, Type } from '@/constants/theme';
import { opinionCount } from '@/lib/progress';
import { useCelebrationStore } from '@/store/celebration-store';
import { useSettingsStore } from '@/store/settings-store';
import { useTutoStore } from '@/store/tuto-store';
import { useVotesStore } from '@/store/votes-store';

// Les réglages du cahier, ouverts depuis l'en-tête du Cahier.
export default function ReglagesScreen() {
  const router = useRouter();
  const votes = useVotesStore((s) => s.votes);
  const loiVotes = useVotesStore((s) => s.loiVotes);
  const resetVotes = useVotesStore((s) => s.resetVotes);
  const resetTutos = useTutoStore((s) => s.reset);
  const [tutosReset, setTutosReset] = useState(false);
  const sons = useSettingsStore((s) => s.sons);
  const setSons = useSettingsStore((s) => s.setSons);

  return (
    <Screen>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.navigate('/cahier'))}
        accessibilityRole="button"
        accessibilityLabel="Retour"
        hitSlop={8}
        style={styles.back}>
        <Ionicons name="chevron-back" size={26} color={Colors.ink} />
      </Pressable>
      <ScreenHeader title="Réglages" note="Tout reste sur votre appareil." />

      <View style={styles.setting}>
        <Text style={[Type.bodyStrong, styles.ink]} accessibilityRole="header">
          Votre surligneur
        </Text>
        <Text style={[Type.label, styles.muted]}>Vos anciennes notes gardent leur couleur.</Text>
        <MarkerPicker />
      </View>
      <View style={[styles.setting, styles.switchRow]}>
        <View style={styles.grow}>
          <Text style={[Type.bodyStrong, styles.ink]}>Sons et vibrations</Text>
          <Text style={[Type.label, styles.muted]}>Discrets, et coupés par le mode silencieux.</Text>
        </View>
        <Switch
          value={sons}
          onValueChange={setSons}
          accessibilityLabel="Sons et vibrations"
          trackColor={{ false: Colors.rule, true: Colors.ink }}
          thumbColor={Colors.sheet}
          ios_backgroundColor={Colors.rule}
          // Web : react-native-web prend sa propre couleur de pastille une fois activé.
          {...({ activeThumbColor: Colors.sheet } as object)}
        />
      </View>
      <View style={styles.setting}>
        <Text style={[Type.bodyStrong, styles.ink]} accessibilityRole="header">
          Vos votes
        </Text>
        {/* Tout recommencer : efface les votes sans toucher aux astuces déjà vues. */}
        <ResetButton
          count={opinionCount(votes, loiVotes)}
          onConfirm={() => {
            resetVotes();
            useCelebrationStore.getState().celebrate('small');
          }}
        />
      </View>
      <View style={styles.setting}>
        <Text style={[Type.bodyStrong, styles.ink]} accessibilityRole="header">
          Astuces
        </Text>
        <Text style={[Type.label, styles.muted]} accessibilityLiveRegion="polite">
          {tutosReset ? 'Elles reviendront au fil de l’app, là où elles servent.' : 'Les explications des premières fois, une par une.'}
        </Text>
        <Button
          label="Revoir les astuces"
          icon="bulb-outline"
          disabled={tutosReset}
          onPress={() => {
            resetTutos();
            setTutosReset(true);
          }}
        />
      </View>

      <DataFooter />
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    width: MinTarget,
    height: MinTarget,
    marginLeft: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setting: {
    gap: Spacing.one,
    marginBottom: Spacing.four,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  grow: {
    flex: 1,
    gap: Spacing.half,
  },
  ink: {
    color: Colors.ink,
  },
  muted: {
    color: Colors.graphite,
  },
});
