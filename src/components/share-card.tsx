import { Ionicons } from '@expo/vector-icons';
import { forwardRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { AllVotedNote } from '@/components/all-voted-note';
import { ReliabilityMark } from '@/components/reliability-mark';
import { themeIcon } from '@/constants/thematiques';
import { Colors, Markers, Numeric, themeAccent, Type, VoteColors, type MarkerId } from '@/constants/theme';
import { denseRanks, type CandidateScore } from '@/lib/scoring';
import { scrutinsTail, shareSummary, type ScrutinsSummary, type ShareMode } from '@/lib/share';
import { signedAverage, type ThemeAverage } from '@/lib/themes';

// 4:5, rendue en 320 de large pour tenir dans la feuille d'un téléphone, exportée en 1080 x 1350.
export const SHARE_CARD = { width: 320, height: 400, exportWidth: 1080, exportHeight: 1350 };
const MAX_ROWS = 8;
// Le logo n'occupe que le centre de son image (61 à 430 sur 512) : on aligne le dessin, pas l'image.
const LOGO = 36;
const LOGO_INSET = (61 / 512) * LOGO;
// Demi-largeur de la barre d'un thème : une moyenne de ±2 la remplit d'un côté.
const BAR_HALF = 30;

const TITLES: Record<ShareMode, string> = {
  complet: 'Mon classement',
  discret: 'Je me fais mon avis',
  themes: 'Ce qui me parle le plus',
  scrutins: 'Si j’avais siégé',
};

interface ShareCardProps {
  mode: ShareMode;
  scores: CandidateScore[];
  answered: number;
  marker: MarkerId;
  complete?: boolean;
  themes: ThemeAverage[];
  scrutins: ScrutinsSummary;
}

// L'image partagée, capturée telle qu'affichée : le classement, ou sans aucun nom l'avancée, les thèmes ou les scrutins.
export const ShareCard = forwardRef<View, ShareCardProps>(function ShareCard({ mode, scores, answered, marker, complete = false, themes, scrutins }, ref) {
  const ranked = scores.filter((s) => s.ranked);
  const ranks = denseRanks(ranked);
  const summary = shareSummary(scores);
  const band = { backgroundColor: Markers[marker].soft };
  // La note « J'ai voté à tout ! » prend la place d'une ligne : la carte garde sa hauteur. Les 12 thèmes n'en laissent pas la place.
  const note = complete && (mode === 'complet' || mode === 'discret');
  const rows = note ? MAX_ROWS - 1 : MAX_ROWS;

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <View style={styles.rule} />
      <View style={styles.head}>
        <Text style={[Type.caps, styles.muted]}>Présidentielle 2027</Text>
        <Text style={[Type.display, styles.ink]}>{TITLES[mode]}</Text>
        {note && <AllVotedNote marker={marker} />}
      </View>

      {mode === 'themes' ? (
        <ThemesBody themes={themes} />
      ) : mode === 'scrutins' ? (
        <ScrutinsBody scrutins={scrutins} band={band} />
      ) : mode === 'complet' ? (
        <View style={styles.list}>
          {ranked.slice(0, rows).map((s, i) => (
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
          {ranked.length > rows && (
            <Text style={[Type.label, styles.muted, styles.more]}>et {ranked.length - rows} autres candidats classés</Text>
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
            élire
          </Text>
          <Text style={[Type.label, styles.muted]}>Sans compte, sans traceur, neutre.</Text>
        </View>
      </View>
    </View>
  );
});

// Les 12 thèmes, du plus approuvé au moins approuvé ; une barre centrée sur 0, aux couleurs d'échelle des votes du lecteur.
function ThemesBody({ themes }: { themes: ThemeAverage[] }) {
  if (themes.every((t) => t.average === null)) {
    return <Empty text="Notez une proposition pour remplir cette image." />;
  }
  return (
    <View style={styles.list}>
      {themes.map(({ thematique, average }) => (
        <View key={thematique.id} style={styles.themeRow}>
          <Ionicons name={themeIcon(thematique.id)} size={14} color={themeAccent(thematique.id).accent} />
          <Text style={[Type.label, average === null ? styles.muted : styles.ink, styles.name]} numberOfLines={1}>
            {thematique.titre}
          </Text>
          {average === null ? (
            <Text style={[Type.label, styles.muted]}>pas encore noté</Text>
          ) : (
            <>
              <View style={styles.bar}>
                <View style={styles.axis} />
                <View
                  style={[
                    styles.fill,
                    average >= 0 ? { left: BAR_HALF } : { right: BAR_HALF },
                    { width: (Math.abs(average) / 2) * BAR_HALF, backgroundColor: VoteColors[average >= 0 ? '1' : '-1'] },
                  ]}
                />
              </View>
              <Text style={[Type.labelStrong, Numeric, styles.ink, styles.average]}>{signedAverage(average)}</Text>
            </>
          )}
        </View>
      ))}
    </View>
  );
}

// Mes votes Pour ou Contre comparés au sort réel des textes, en grand chiffre comme le mode discret.
function ScrutinsBody({ scrutins, band }: { scrutins: ScrutinsSummary; band: { backgroundColor: string } }) {
  if (scrutins.total === 0) {
    return <Empty text="Votez Pour ou Contre sur un scrutin pour remplir cette image." />;
  }
  const { same, adoptedAgainst, rejectedFor } = scrutins;
  const detail = [
    adoptedAgainst > 0 && `${adoptedAgainst} ${adoptedAgainst > 1 ? 'textes adoptés' : 'texte adopté'} que j’aurais rejeté${adoptedAgainst > 1 ? 's' : ''}`,
    rejectedFor > 0 && `${rejectedFor} ${rejectedFor > 1 ? 'textes rejetés' : 'texte rejeté'} que j’aurais adopté${rejectedFor > 1 ? 's' : ''}`,
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <View style={styles.discreet}>
      <View style={styles.bigWrap}>
        <View style={[styles.bigBand, band]} />
        <Text style={[styles.big, Numeric, styles.ink]}>{same}</Text>
      </View>
      <Text style={[Type.bodyStrong, styles.ink]}>{scrutinsTail(scrutins)}, avec mes votes.</Text>
      {detail !== '' && <Text style={[Type.label, styles.soft]}>{detail}.</Text>}
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <View style={styles.discreet}>
      <Text style={[Type.bodyStrong, styles.muted]}>{text}</Text>
    </View>
  );
}

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
  // 12 thèmes de 20 tiennent dans la place utile (244pt).
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.rule,
  },
  bar: {
    width: BAR_HALF * 2,
    height: 8,
  },
  axis: {
    position: 'absolute',
    left: BAR_HALF,
    top: -2,
    bottom: -2,
    width: 1,
    backgroundColor: Colors.graphite,
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 2,
  },
  average: {
    width: 30,
    textAlign: 'right',
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
