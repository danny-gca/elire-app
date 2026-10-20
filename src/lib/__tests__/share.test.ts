import { shareSummary, shareText } from '@/lib/share';
import type { CandidateScore } from '@/lib/scoring';

const score = (ranked: boolean, reliability: CandidateScore['reliability']) => ({ ranked, reliability }) as CandidateScore;

describe('partage', () => {
  it('compte les classés et les scores fiables, sans nom', () => {
    expect(shareSummary([score(true, 'fiable'), score(true, 'moyen'), score(false, null)])).toEqual({ ranked: 2, fiables: 1, total: 3 });
  });

  it("n'écrit aucun nom de candidat dans le texte", () => {
    expect(shareText(48, 'https://exemple.fr')).toBe("48 questions répondues à l'aveugle : je me fais mon avis avec élire. https://exemple.fr");
    expect(shareText(48, 'https://exemple.fr', true)).toBe("J'ai voté à tout sur élire : 48 questions répondues à l'aveugle. https://exemple.fr");
  });
});
