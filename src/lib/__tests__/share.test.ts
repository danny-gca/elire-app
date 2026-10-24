import { scrutinsSentence, scrutinsSummary, shareSummary, shareText } from '@/lib/share';
import type { CandidateScore } from '@/lib/scoring';
import type { Loi } from '@/schemas/dataset';

const score = (ranked: boolean, reliability: CandidateScore['reliability']) => ({ ranked, reliability }) as CandidateScore;
const loi = (id: string, statut: Loi['statut']) => ({ id, statut }) as Loi;

describe('partage', () => {
  it('compte les classés et les scores fiables, sans nom', () => {
    expect(shareSummary([score(true, 'fiable'), score(true, 'moyen'), score(false, null)])).toEqual({ ranked: 2, fiables: 1, total: 3 });
  });

  it("n'écrit aucun nom de candidat dans le texte", () => {
    expect(shareText('complet', { answered: 48 }, 'https://exemple.fr')).toBe("48 questions répondues à l'aveugle : je me fais mon avis avec élire. https://exemple.fr");
    expect(shareText('discret', { answered: 48, complete: true }, 'https://exemple.fr')).toBe("J'ai voté à tout sur élire : 48 questions répondues à l'aveugle. https://exemple.fr");
    expect(shareText('themes', { answered: 48 }, 'https://exemple.fr')).toBe("Les thèmes où j'ai le plus approuvé sur élire. https://exemple.fr");
  });

  it('compare mes votes au sort réel des textes, sans abstention ni texte en cours', () => {
    const lois = [loi('a', 'adoptee'), loi('b', 'adoptee'), loi('c', 'rejetee'), loi('d', 'rejetee'), loi('e', 'en_cours'), loi('f', 'adoptee')];
    const summary = scrutinsSummary(lois, { a: 'pour', b: 'contre', c: 'contre', d: 'pour', e: 'pour', f: 'abstention' });
    expect(summary).toEqual({ total: 4, same: 2, adoptedAgainst: 1, rejectedFor: 1 });
    expect(scrutinsSentence(summary)).toBe('Avec mes votes, 2 textes sur 4 auraient eu le même sort au Parlement.');
    expect(scrutinsSentence({ ...summary, same: 1 })).toBe('Avec mes votes, 1 texte sur 4 aurait eu le même sort au Parlement.');
    expect(shareText('scrutins', { answered: 10, scrutins: summary }, 'https://exemple.fr')).toBe(
      'Avec mes votes, 2 textes sur 4 auraient eu le même sort au Parlement. Je me fais mon avis avec élire. https://exemple.fr'
    );
  });
});
