import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { AllVotedNote } from '@/components/all-voted-note';
import { SHARE_CARD, ShareCard } from '@/components/share-card';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Sheet } from '@/components/ui/sheet';
import { SITE_URL } from '@/constants/app';
import { Colors, Radius, Spacing, Type } from '@/constants/theme';
import type { CandidateScore } from '@/lib/scoring';
import { shareText, type ShareMode } from '@/lib/share';
import { shareImage } from '@/lib/share-image';
import { buzz } from '@/lib/sound';
import { celebrate, pointOf, type CelebrationPoint } from '@/store/celebration-store';
import { useVotesStore } from '@/store/votes-store';

const STATUS = {
  shared: '',
  downloaded: 'Image enregistrée : vous pouvez la publier où vous voulez.',
  unavailable: 'Le partage n’est pas disponible sur cet appareil.',
  error: 'L’image n’a pas pu être créée. Réessayez.',
} as const;

// Partager une image de son classement, en entier ou en discret (sans aucun nom). Rien ne part sans ce bouton.
export function ShareSheet({
  visible,
  onClose,
  scores,
  answered,
  complete = false,
}: {
  visible: boolean;
  onClose: () => void;
  scores: CandidateScore[];
  answered: number;
  /** Toutes les questions répondues : « J'ai voté à tout ! » sur la feuille, l'image et le texte. */
  complete?: boolean;
}) {
  const marker = useVotesStore((s) => s.marker);
  const [mode, setMode] = useState<ShareMode>('complet');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<keyof typeof STATUS>('shared');
  const card = useRef<View>(null);

  const share = async (point?: CelebrationPoint) => {
    setBusy(true);
    setStatus('shared');
    try {
      const uri = await captureRef(card, { format: 'png', width: SHARE_CARD.exportWidth, height: SHARE_CARD.exportHeight, result: 'tmpfile' });
      const result = await shareImage(uri, shareText(answered, SITE_URL, complete));
      setStatus(result);
      if (result === 'shared' || result === 'downloaded') {
        celebrate('small', 'sheet', point);
        buzz('success');
      }
    } catch {
      setStatus('error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet visible={visible} title="Partager" onClose={onClose}>
      {complete && <AllVotedNote marker={marker} />}
      <SegmentedControl<ShareMode>
        accessibilityLabel="Ce que montre l'image"
        value={mode}
        onChange={setMode}
        segments={[
          { value: 'complet', label: 'Mon classement' },
          { value: 'discret', label: 'Discret, sans nom' },
        ]}
      />
      <Text style={[Type.label, styles.muted]}>
        {mode === 'complet'
          ? `Vos ${complete ? 7 : 8} premiers candidats et leurs scores.`
          : 'Seulement votre nombre de questions et la fiabilité de vos scores : aucun candidat n’apparaît.'}
      </Text>
      {/* L'image posée sur la table : un objet, pas un écran de plus. */}
      <View style={styles.table}>
        <View style={styles.preview} accessible accessibilityLabel="Aperçu de l'image partagée">
          <ShareCard ref={card} mode={mode} scores={scores} answered={answered} marker={marker} complete={complete} />
        </View>
      </View>
      <Button label={busy ? 'Préparation…' : 'Partager l’image'} variant="primary" onPress={(e) => share(pointOf(e))} disabled={busy} />
      {STATUS[status] !== '' && (
        <Text style={[Type.label, styles.muted]} accessibilityLiveRegion="polite">
          {STATUS[status]}
        </Text>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  table: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radius.large,
    backgroundColor: Colors.ruleSoft,
  },
  preview: {
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
    overflow: 'hidden',
    boxShadow: '0 6px 18px rgba(28, 30, 33, 0.12)',
  },
  muted: {
    color: Colors.graphite,
  },
});
