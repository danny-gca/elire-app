import { candidatureText } from '@/lib/format';

describe('candidatureText', () => {
  it('dit le statut et la date', () => {
    expect(candidatureText({ statut: 'declaree', date: '2026-05-22', sourceUrl: 'https://a.fr' })).toBe('Candidature déclarée le 22 mai 2026');
    expect(candidatureText({ statut: 'pressentie', date: '2026-07-10', sourceUrl: 'https://a.fr' })).toContain('pas encore déclarée');
  });
});
