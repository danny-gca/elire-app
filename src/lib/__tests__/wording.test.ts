import { MIN_WORDS, negativeWording, wordCount } from '../wording';

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

describe('wordCount', () => {
  it('compte les mots sans la ponctuation seule', () => {
    expect(wordCount("Faut-il rendre l'instruction obligatoire dès 3 ans ?")).toBe(7);
    expect(wordCount('Rembourser à 100 % tous les soins')).toBe(6);
  });

  it("signale une question trop courte pour se lire d'un coup d'œil", () => {
    expect(wordCount("Reculer l'âge de départ à la retraite")).toBeLessThan(MIN_WORDS.question);
    expect(wordCount("Relever l'âge légal de départ à la retraite, pour partir plus tard qu'aujourd'hui")).toBeGreaterThanOrEqual(MIN_WORDS.question);
  });
});
