import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Numeric, Radius, Spacing, Type } from '@/constants/theme';
import { VOTE_CHOICES } from '@/constants/votes';
import { MAX_PARLEMENT_SHARE, type ScoreDetail } from '@/lib/scoring';

// Une décimale au plus, virgule française.
const num = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');
// Vrai signe moins, comme sur les boutons de vote.
const signed = (n: number) => (n > 0 ? `+${num(n)}` : n < 0 ? `−${num(-n)}` : '0');
const LOI_LABELS: Record<-2 | 0 | 2, string> = { 2: 'Même position', 0: 'Abstention', [-2]: 'Position contraire' };

type LoiRow = ScoreDetail['parlement']['rows'][number];

// Le calcul posé comme à l'école : une carte par partie, une ligne par sorte de vote, un trait, le total.
export function ScoreCalcul({ detail }: { detail: ScoreDetail }) {
  const { programme, parlement, share, score } = detail;
  const progRatio = programme.max > 0 ? (programme.sum + programme.max) / (programme.max * 2) : 0;
  const loiRatio = parlement.max > 0 ? (parlement.sum + parlement.max) / (parlement.max * 2) : 0;
  const both = programme.max > 0 && parlement.max > 0;
  const exact = ((1 - share) * progRatio + share * loiRatio) * 100;
  const points = programme.max + parlement.max;
  const capped = share === MAX_PARLEMENT_SHARE && parlement.max > programme.max;
  // Le poids en fraction des points possibles, ou 50 % quand le Parlement est plafonné.
  const weight = (part: number) => (capped ? '50 %' : `${num(part)} ÷ ${num(points)}`);
  const personal = parlement.rows.filter((r) => r.weight === 1);
  const group = parlement.rows.filter((r) => r.weight < 1);
  const loiCount = parlement.rows.reduce((acc, r) => acc + r.count, 0);

  return (
    <View style={styles.root}>
      {programme.max > 0 && (
        <Part
          title="Son programme"
          result={progRatio}
          subtitle={programme.max === 2 ? 'Votre note sur 1 de ses propositions.' : `Vos notes sur ${programme.max / 2} de ses propositions.`}
          sum={programme.sum}
          max={programme.max}
          low="tout Impossible"
          high="tout Parfait">
          {programme.rows.map((r) => {
            const choice = VOTE_CHOICES.find((c) => c.value === r.value)!;
            return <Row key={r.value} count={r.count} label={choice.label} color={choice.color} points={choice.sign} value={signed(r.value * r.count)} />;
          })}
        </Part>
      )}

      {parlement.max > 0 && (
        <Part
          title="Ses votes au Parlement"
          result={loiRatio}
          subtitle={loiCount === 1 ? 'Votre vote sur 1 de ses scrutins, comparé au sien.' : `Vos votes sur ${loiCount} de ses scrutins, comparés aux siens.`}
          sum={parlement.sum}
          max={parlement.max}
          low="toujours contraire"
          high="toujours pareil">
          {personal.length > 0 && <LoiGroup icon="person" title="Votes personnels" note="comptent en entier" rows={personal} />}
          {group.length > 0 && <LoiGroup icon="people" title="Votes de son groupe" note="comptent moitié" rows={group} />}
        </Part>
      )}

      <View style={styles.card}>
        <Text style={[Type.bodyStrong, styles.ink]} accessibilityRole="header">
          Accord avec vos votes
        </Text>
        {both && (
          <>
            <Text style={[Type.label, styles.muted]}>
              {capped
                ? 'Le Parlement ne compte jamais plus de la moitié : 50 % chacun.'
                : `Chaque partie compte selon ses points possibles : ${num(programme.max)} pour le programme et ${num(parlement.max)} pour le Parlement, sur ${num(points)}.`}
            </Text>
            <View style={styles.sum}>
              <Row label="Programme" points={`${num(progRatio * 100)} % × ${weight(programme.max)}`} value={num((1 - share) * progRatio * 100)} />
              <Row label="Parlement" points={`${num(loiRatio * 100)} % × ${weight(parlement.max)}`} value={num(share * loiRatio * 100)} />
              <View style={styles.bar} />
            </View>
          </>
        )}
        <View style={styles.total} accessible accessibilityLabel={`Total : ${score} %`}>
          <Text style={[Type.label, styles.muted, styles.flex]}>
            {Math.round(exact * 10) / 10 !== score ? `${num(exact)}, arrondi à` : 'Total'}
          </Text>
          <Text style={[Type.screenTitle, Numeric, styles.ink]}>{score} %</Text>
        </View>
      </View>

      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={18} color={Colors.graphite} />
        <Text style={[Type.label, styles.muted, styles.flex]}>
          Ne comptent pas : « Je ne sais pas », vos abstentions, et les scrutins où il n’a pas voté.
        </Text>
      </View>
    </View>
  );
}

interface PartProps {
  title: string;
  /** Résultat de la partie, 0 à 1 : annoncé dans le titre. */
  result: number;
  subtitle: string;
  sum: number;
  max: number;
  low: string;
  high: string;
  children: React.ReactNode;
}

function Part({ title, result, subtitle, sum, max, low, high, children }: PartProps) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={[Type.bodyStrong, styles.ink, styles.flex]} accessibilityRole="header">
          {title}
        </Text>
        <Text style={[Type.bodyStrong, Numeric, styles.ink]}>{num(result * 100)} %</Text>
      </View>
      <Text style={[Type.label, styles.muted]}>{subtitle}</Text>
      <View style={styles.sum}>
        {children}
        <View style={styles.bar} />
        <Row label="Total" value={signed(sum)} strong />
      </View>
      {/* Sous un filet : la mise sur 100, l'étape que l'on vérifie à la main. */}
      <View style={styles.step}>
        <Text style={[Type.label, styles.soft]}>
          Le total va de {signed(-max)} ({low}) à {signed(max)} ({high}). On ajoute {num(max)} pour partir de 0, puis on divise par l’écart, {num(max * 2)}.
        </Text>
        <Text style={[Type.bodyStrong, Numeric, styles.ink]}>
          ({signed(sum)} + {num(max)}) ÷ {num(max * 2)} = {num(result * 100)} %
        </Text>
      </View>
    </View>
  );
}

function LoiGroup({ icon, title, note, rows }: { icon: 'person' | 'people'; title: string; note: string; rows: LoiRow[] }) {
  return (
    <View style={styles.group}>
      <View style={styles.groupHead}>
        <Ionicons name={icon} size={14} color={Colors.ink} />
        <Text style={[Type.labelStrong, styles.ink]}>{title}</Text>
        <Text style={[Type.label, styles.muted]}>· {note}</Text>
      </View>
      {rows.map((r) => (
        <Row key={r.points} count={r.count} label={LOI_LABELS[r.points]} points={signed(r.points * r.weight)} value={signed(r.points * r.weight * r.count)} />
      ))}
    </View>
  );
}

interface RowProps {
  count?: number;
  label: string;
  /** Couleur d'échelle : seulement pour vos notes. */
  color?: string;
  points?: string;
  value: string;
  strong?: boolean;
}

// Colonnes du cahier : combien, quoi, combien chacun, le résultat.
function Row({ count, label, color, points, value, strong }: RowProps) {
  const type = strong ? Type.bodyStrong : Type.body;
  return (
    <View style={styles.row} accessible accessibilityLabel={`${count ? `${count} fois ` : ''}${label}${points ? `, ${points}` : ''} : ${value}`}>
      {count !== undefined && <Text style={[Type.body, Numeric, styles.muted, styles.count]}>{count} ×</Text>}
      <Text style={[type, styles.flex, { color: color ?? Colors.ink }]}>{label}</Text>
      {points && <Text style={[Type.label, Numeric, styles.muted]}>{points}</Text>}
      <Text style={[type, Numeric, styles.ink, styles.value]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.two,
  },
  card: {
    gap: Spacing.one,
    padding: Spacing.two,
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.rule,
    backgroundColor: Colors.sheet,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  sum: {
    marginTop: Spacing.one,
    gap: Spacing.half,
  },
  group: {
    gap: Spacing.half,
  },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.half,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one,
  },
  count: {
    width: 32,
  },
  value: {
    minWidth: 48,
    textAlign: 'right',
  },
  // Le trait de l'addition, sous la dernière ligne.
  bar: {
    height: 1.5,
    marginVertical: Spacing.half,
    backgroundColor: Colors.ink,
  },
  step: {
    marginTop: Spacing.one,
    paddingTop: 12,
    gap: Spacing.half,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.rule,
  },
  total: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  note: {
    flexDirection: 'row',
    gap: Spacing.one,
    paddingHorizontal: Spacing.half,
  },
  flex: {
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
