import { hardwareBack, pageTurnSettles, previousQuestion } from '@/lib/page-turn';

describe('page tournée', () => {
  const base = { lastId: 'p-1', shownId: 'p-2', revisiting: false, busy: false };

  it('ramène la dernière question votée', () => {
    expect(previousQuestion(base)).toBe('p-1');
  });

  it("refuse sans vote, d'un deuxième cran, ou quand l'écran est occupé", () => {
    expect(previousQuestion({ ...base, lastId: null })).toBeNull();
    expect(previousQuestion({ ...base, revisiting: true })).toBeNull();
    expect(previousQuestion({ ...base, busy: true })).toBeNull();
  });

  it('refuse la question déjà affichée', () => {
    expect(previousQuestion({ ...base, shownId: 'p-1' })).toBeNull();
  });

  it('retour Android : un cran, puis repartir, puis plus rien avant le vote suivant', () => {
    const idle = { canBack: false, canForward: false, spent: false, moving: false };
    expect(hardwareBack({ ...idle, canBack: true })).toBe('back');
    expect(hardwareBack({ ...idle, canForward: true })).toBe('forward');
    expect(hardwareBack({ ...idle, canBack: true, spent: true })).toBeNull();
    expect(hardwareBack(idle)).toBeNull();
  });

  it("retour Android pendant qu'une page tourne : il attend, sans fermer l'app", () => {
    const idle = { canBack: false, canForward: false, spent: false, moving: true };
    expect(hardwareBack(idle)).toBe('wait');
    expect(hardwareBack({ ...idle, canBack: true, spent: true })).toBe('wait');
  });

  it("se rabat au-delà d'un tiers ou sur un geste vif dans le bon sens", () => {
    expect(pageTurnSettles(130, 360, 0)).toBe(true);
    expect(pageTurnSettles(100, 360, 0)).toBe(false);
    expect(pageTurnSettles(40, 360, 1200)).toBe(true);
    expect(pageTurnSettles(-40, 360, 1200)).toBe(false);
  });
});
