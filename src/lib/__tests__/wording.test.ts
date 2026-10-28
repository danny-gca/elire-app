import { negativeWording } from '../wording';

describe('negativeWording', () => {
  it('signale un texte qui commence par une négation', () => {
    expect(negativeWording('Ne pas taxer les voitures électriques')).not.toBeNull();
    expect(negativeWording('Faut-il ne plus imposer de règles ?')).not.toBeNull();
  });

  it('signale une question de scrutin qui porte un refus', () => {
    expect(negativeWording("Faut-il que la France refuse, en l'état, l'accord ?", true)).not.toBeNull();
    expect(negativeWording('Rejet de la ratification', true)).not.toBeNull();
  });

  it('laisse un refus hors question de scrutin', () => {
    expect(negativeWording('Garantir la liberté de refuser un vaccin')).toBeNull();
  });

  it('laisse les négations au milieu du texte et les verbes affirmatifs', () => {
    expect(negativeWording('Régulariser tous les sans-papiers')).toBeNull();
    expect(negativeWording('Construire de nouveaux réacteurs nucléaires')).toBeNull();
    expect(negativeWording('Nommer un ministre')).toBeNull();
  });
});
