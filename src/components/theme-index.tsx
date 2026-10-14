import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Marked } from '@/components/marked';
import { ThemeMark } from '@/components/theme-mark';
import { Colors, Numeric, Spacing, Type } from '@/constants/theme';
import type { VoteValue } from '@/lib/scoring';
import { propositions, thematiques } from '@/services/dataset';
import { useVotesStore } from '@/store/votes-store';

const LEADER = ' .'.repeat(80);

// Sommaire du cahier : un thème par ligne, points de conduite, votes / total.
export function ThemeIndex({ votes }: { votes: Record<string, VoteValue> }) {
  const router = useRouter();
  const marker = useVotesStore((s) => s.marker);
  return (
    <View style={styles.root} accessibilityRole="list">
      {thematiques.map((t, i) => {
        const items = propositions.filter((p) => p.thematiqueId === t.id);
        const voted = items.filter((p) => votes[p.id] !== undefined).length;
        const done = voted === items.length;
        return (
          <Pressable
            key={t.id}
            onPress={() => router.push({ pathname: '/theme/[id]', params: { id: t.id } })}
            accessibilityRole="link"
            accessibilityLabel={`${t.titre}, ${voted} votées sur ${items.length}`}
            style={({ pressed }) => [styles.row, i > 0 && styles.separator, pressed && styles.pressed]}>
            <ThemeMark thematiqueId={t.id} size={32} />
            <View style={styles.body}>
              <View style={styles.line}>
                <Text style={[Type.bodyStrong, styles.ink]} numberOfLines={1}>
                  {t.titre}
                </Text>
                <View style={styles.leader} importantForAccessibility="no-hide-descendants">
                  <Text style={[Type.label, styles.leaderText]}>{LEADER}</Text>
                </View>
                <Marked active={done && voted > 0} marker={marker} style={[Type.labelStrong, Numeric, done ? styles.ink : styles.muted]}>
                  {voted}/{items.length}
                </Marked>
              </View>
              <Text style={[Type.label, styles.muted]} numberOfLines={1}>
                {t.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.graphite} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    paddingVertical: 12,
  },
  separator: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
  },
  pressed: {
    backgroundColor: Colors.pressed,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
  leader: {
    flex: 1,
    height: 18,
    overflow: 'hidden',
  },
  leaderText: {
    color: Colors.boardEdge,
  },
  ink: {
    color: Colors.ink,
    flexShrink: 1,
  },
  muted: {
    color: Colors.graphite,
  },
});
