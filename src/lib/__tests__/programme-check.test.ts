import { programmeReminders } from '@/lib/programme-check';

const candidat = (id: string, annonce?: string) => ({
  id,
  programme: { statut: 'partiel', ...(annonce ? { annonce: { date: annonce, sourceUrl: 'https://exemple.fr/annonce' } } : {}) },
});

describe('programmeReminders', () => {
  it('rappelle un programme annoncé pour aujourd’hui ou avant', () => {
    expect(programmeReminders([candidat('a', '2026-11-02'), candidat('b', '2026-11-01')], '2026-11-02')).toEqual([
      'candidats.json a : programme annoncé pour le 2026-11-02, le relire et mettre à jour programme (puis retirer annonce)',
      'candidats.json b : programme annoncé pour le 2026-11-01, le relire et mettre à jour programme (puis retirer annonce)',
    ]);
  });

  it('ne dit rien avant la date ni sans annonce', () => {
    expect(programmeReminders([candidat('a', '2026-11-03'), candidat('b')], '2026-11-02')).toEqual([]);
  });
});
