import { forwardRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { ReliabilityMark } from '@/components/reliability-mark';
import { SITE_URL } from '@/constants/app';
import { Colors, Markers, Numeric, Type, type MarkerId } from '@/constants/theme';
import { competitionRanks, type CandidateScore } from '@/lib/scoring';
import { shareSummary, type ShareMode } from '@/lib/share';

// 4:5, rendue en 320 de large pour tenir dans la feuille d'un téléphone, exportée en 1080 x 1350.
export const SHARE_CARD = { width: 320, height: 400, exportWidth: 1080, exportHeight: 1350 };
const MAX_ROWS = 8;
// Le « é » du logo n'occupe que le centre de son image (143 à 417 sur 512) : on aligne la lettre, pas l'image.
const LOGO = 36;
const LOGO_INSET = (143 / 512) * LOGO;

interface ShareCardProps {
  mode: ShareMode;
  scores: CandidateScore[];
  answered: number;
  marker: MarkerId;
}

// L'image partagée, capturée telle qu'affichée : le classement, ou en discret l'avancée seule, sans nom.
export const ShareCard = forwardRef<View, ShareCardProps>(function ShareCard({ mode, scores, answered, marker }, ref) {
  const ranked = scores.filter((s) => s.ranked);
  const ranks = competitionRanks(ranked);
  const summary = shareSummary(scores);
  const band = { backgroundColor: Markers[marker].soft };

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <View style={styles.rule} />
      <View style={styles.head}>
        <Text style={[Type.caps, styles.muted]}>Présidentielle 2027</Text>
        <Text style={[Type.display, styles.ink]}>{mode === 'complet' ? 'Mon classement' : 'Je me fais mon avis'}</Text>
      </View>

      {mode === 'complet' ? (
        <View style={styles.list}>
          {ranked.slice(0, MAX_ROWS).map((s, i) => (
            <View key={s.candidat.id} style={styles.row}>
              {/* Liseré aux couleurs du parti, comme le bandeau du panneau. */}
              <View style={[styles.party, { backgroundColor: s.candidat.couleurParti }]} />
              <Text style={[Type.labelStrong, Numeric, styles.muted, styles.rank]}>{ranks[i]}</Text>
              <Text style={[Type.labelStrong, styles.ink, styles.name]} numberOfLines={1}>
                {s.candidat.nom}
              </Text>
              {s.reliability && <ReliabilityMark level={s.reliability} label={false} />}
              <Text style={[Type.labelStrong, Numeric, styles.ink, styles.score]}>{s.score} %</Text>
            </View>
          ))}
          {ranked.length > MAX_ROWS && (
            <Text style={[Type.label, styles.muted, styles.more]}>et {ranked.length - MAX_ROWS} autres candidats classés</Text>
          )}
        </View>
      ) : (
        <View style={styles.discreet}>
          {/* Le nombre passé au surligneur : une bande basse, comme les marques de l'app. */}
          <View style={styles.bigWrap}>
            <View style={[styles.bigBand, band]} />
            <Text style={[styles.big, Numeric, styles.ink]}>{answered}</Text>
          </View>
          <Text style={[Type.bodyStrong, styles.ink]}>questions répondues à l’aveugle, sans savoir qui parle.</Text>
          <Text style={[Type.label, styles.soft]}>
            {summary.ranked} candidats classés sur {summary.total}, dont {summary.fiables} avec un score fiable.
          </Text>
        </View>
      )}

      <View style={styles.foot}>
        <Image source={require('@/assets/images/splash-icon.png')} style={styles.logo} />
        <View style={styles.footText}>
          <Text style={[Type.labelStrong, styles.ink]} numberOfLines={1}>
            {SITE_URL.replace(/^https:\/\//, '').replace(/\/$/, '')}
          </Text>
          <Text style={[Type.label, styles.muted]}>Sans compte, sans traceur, neutre.</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: SHARE_CARD.width,
    height: SHARE_CARD.height,
    backgroundColor: Colors.paper,
    paddingTop: 24,
    paddingBottom: 18,
    paddingRight: 20,
    paddingLeft: 40,
    overflow: 'hidden',
  },
  // Filet de marge du cahier, comme sur l'icône.
  rule: {
    position: 'absolute',
    left: 24,
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: Colors.graphite,
  },
  head: {
    gap: 2,
  },
  // 8 lignes + « et N autres » tiennent au-dessus du pied (place utile : 258pt).
  list: {
    flex: 1,
    marginTop: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 26,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.rule,
  },
  party: {
    width: 3,
    height: 16,
    borderRadius: 1.5,
  },
  rank: {
    width: 18,
  },
  name: {
    flex: 1,
  },
  score: {
    width: 40,
    textAlign: 'right',
  },
  more: {
    marginTop: 4,
  },
  discreet: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  bigWrap: {
    alignSelf: 'flex-start',
    // Approche du chiffre Literata : le trait s'aligne sur la marge du texte.
    marginLeft: -4,
  },
  bigBand: {
    position: 'absolute',
    left: -2,
    right: -6,
    top: '50%',
    bottom: '14%',
    borderRadius: 4,
    transform: [{ rotate: '-2deg' }],
  },
  big: {
    fontFamily: Type.screenTitle.fontFamily,
    fontSize: 96,
    lineHeight: 104,
  },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
  },
  logo: {
    width: LOGO,
    height: LOGO,
    marginLeft: -LOGO_INSET,
    marginRight: 2,
  },
  footText: {
    flex: 1,
  },
  ink: {
    color: Colors.ink,
  },
  soft: {
    color: Colors.inkSoft,
  },
  muted: {
    color: Colors.graphite,
  },
});
