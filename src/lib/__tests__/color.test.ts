import { contrast, readableOn } from '../color';

describe('contraste', () => {
  it('donne 21:1 entre blanc et noir', () => {
    expect(contrast('#FFFFFF', '#000000')).toBeCloseTo(21, 0);
  });

  it('fonce une couleur pâle jusqu’au contraste AA, sans toucher une couleur déjà lisible', () => {
    expect(contrast(readableOn('#FFD412', '#F6F7F5'), '#F6F7F5')).toBeGreaterThanOrEqual(4.5);
    expect(readableOn('#002B7F', '#F6F7F5')).toBe('#002B7F');
  });
});
