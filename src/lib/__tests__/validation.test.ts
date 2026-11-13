import { empreinte, noteHistorique, statutValidation } from '@/lib/validation';

const v = (over: object = {}) => ({ le: '2026-11-11', par: 'claude' as const, empreinte: empreinte({ a: 1, b: [2] }), ...over });

describe('empreinte', () => {
  it('ne dépend pas de l’ordre des clés et change avec le contenu', () => {
    expect(empreinte({ a: 1, b: [2] })).toBe(empreinte({ b: [2], a: 1 }));
    expect(empreinte({ a: 1, b: [2] })).not.toBe(empreinte({ a: 1, b: [3] }));
    expect(empreinte({ a: 1, b: undefined })).toBe(empreinte({ a: 1 }));
    expect(empreinte({ a: 'x' })).toMatch(/^[0-9a-f]{8}$/);
  });
});

describe('statutValidation', () => {
  const base = { empreinte: empreinte({ a: 1, b: [2] }), today: '2026-12-01', delaiJours: 30 };

  it('distingue jamais validé, modifié, périmé et validé', () => {
    expect(statutValidation({ ...base }).statut).toBe('jamais');
    expect(statutValidation({ ...base, validation: v({ empreinte: '00000000' }) }).statut).toBe('modifie');
    expect(statutValidation({ ...base, today: '2026-12-12', validation: v() })).toEqual({
      statut: 'perime',
      motif: 'validé le 2026-11-11, plus de 30 jours',
    });
    expect(statutValidation({ ...base, validation: v() })).toEqual({ statut: 'valide', motif: 'validé le 2026-11-11 par claude' });
  });

  it('périme sur un fait nouveau, jamais par le temps sans délai', () => {
    const validation = v();
    expect(
      statutValidation({ ...base, validation, faitNouveau: { date: '2026-11-20', motif: 'programme publié' } }),
    ).toEqual({ statut: 'perime', motif: 'programme publié le 2026-11-20' });
    expect(statutValidation({ ...base, validation, faitNouveau: { date: '2026-11-01', motif: 'programme publié' } }).statut).toBe('valide');
    expect(statutValidation({ ...base, today: '2030-01-01', delaiJours: null, validation }).statut).toBe('valide');
  });
});

describe('noteHistorique', () => {
  it('ajoute la note datée en tête sans perdre ni doubler les précédentes', () => {
    expect(noteHistorique('2026-12-01', 'confirmée : page 3', '2026-11-11 corrigée : vote')).toBe(
      '2026-12-01 confirmée : page 3 // 2026-11-11 corrigée : vote',
    );
    expect(noteHistorique('2026-12-01', 'confirmée : page 3', '2026-12-01 confirmée : page 3')).toBe('2026-12-01 confirmée : page 3');
    expect(noteHistorique('2026-12-01', undefined, 'ancienne')).toBe('ancienne');
    expect(noteHistorique('2026-12-01', undefined, undefined)).toBeUndefined();
  });
});
