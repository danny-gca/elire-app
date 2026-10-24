import { candidatureText, programmeText, TYPE_SOURCE_LABELS } from '@/lib/format';

describe('candidatureText', () => {
  it('dit le statut et la date', () => {
    expect(candidatureText({ statut: 'declaree', date: '2026-05-22', sourceUrl: 'https://a.fr' })).toBe('Candidature déclarée le 22 mai 2026');
    expect(candidatureText({ statut: 'pressentie', date: '2026-07-10', sourceUrl: 'https://a.fr' })).toContain('pas encore déclarée');
  });
});

describe('TYPE_SOURCE_LABELS', () => {
  it('nomme chaque type de source', () => {
    expect(TYPE_SOURCE_LABELS).toEqual({
      programme_2027: 'Programme 2027',
      programme_anterieur: 'Programme précédent',
      prise_de_position: 'Prise de position',
    });
  });
});

describe('programmeText', () => {
  it('dit le statut du programme 2027 et sa date', () => {
    expect(programmeText({ statut: 'complet', url: 'https://a.fr', date: '2026-09-12' })).toBe('Programme 2027 complet, publié le 12\u00a0sept.\u00a02026');
    expect(programmeText({ statut: 'partiel', url: 'https://a.fr', date: '2026-09-12' })).toBe('Programme 2027 partiel (premières mesures), publié le 12\u00a0sept.\u00a02026');
    expect(programmeText({ statut: 'partiel', url: 'https://a.fr' })).toBe('Programme 2027 partiel (premières mesures)');
    expect(programmeText({ statut: 'aucun' })).toBe('Pas de programme 2027 publié : mesures tirées d’un programme précédent ou de prises de position.');
  });
});
