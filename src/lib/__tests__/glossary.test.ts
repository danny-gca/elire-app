import { acronymsIn, glossarySpans, unexplainedInTitle, wordSpans, wordsIn } from '../glossary';

describe('acronymsIn', () => {
  it('trouve les sigles une fois, dans l\'ordre, avec chiffres et accents', () => {
    expect(acronymsIn('Le CETA et la PAC', 'encore le CETA, 6 EPR2 et l\'ÉTAT')).toEqual(['CETA', 'PAC', 'EPR2', 'ÉTAT']);
  });

  it('ignore les mots en minuscules et les capitales isolées', () => {
    expect(acronymsIn("Sortir de l'Otan à 64 ans, A69")).toEqual([]);
  });
});

describe('unexplainedInTitle', () => {
  it('admet les sigles du quotidien et ceux entre parenthèses', () => {
    expect(unexplainedInTitle('Baisser la TVA et sortir de l\'Alliance atlantique (OTAN)')).toEqual([]);
  });

  it('signale un sigle laissé seul', () => {
    expect(unexplainedInTitle("Sortir de l'OTAN")).toEqual(['OTAN']);
  });
});

const WORDS = [
  { mot: 'surtransposition', variantes: ['surtranspositions'] },
  { mot: 'transposition' },
  { mot: 'clause miroir', variantes: ['clauses miroirs'] },
  { mot: 'clause' },
  { mot: 'Mercosur' },
  { mot: 'libre-échange' },
];

describe('wordsIn', () => {
  it('trouve les formes fléchies, sans casse, dans l\'ordre du texte', () => {
    expect(wordsIn(['Les surtranspositions et des clauses miroirs'], WORDS)).toEqual(['surtransposition', 'clause miroir']);
  });

  it('prend le mot entier : « surtransposition » ne contient pas « transposition »', () => {
    expect(wordsIn(['une surtransposition'], WORDS)).toEqual(['surtransposition']);
  });

  it('trouve un mot en début de phrase, entre parenthèses ou avec un trait d\'union', () => {
    expect(wordsIn(["Mercosur : l'Amérique du Sud (MERCOSUR) et le libre-échange"], WORDS)).toEqual(['Mercosur', 'libre-échange']);
  });

  it('ne prend pas « échange » seul dans « libre-échange »', () => {
    expect(wordsIn(['le libre-échange'], [{ mot: 'échange' }])).toEqual([]);
  });
});

describe('wordSpans', () => {
  it('garde la première occurrence de chaque mot, positions comprises', () => {
    expect(wordSpans('la clause miroir, une clause', WORDS)).toEqual([
      { start: 3, end: 16, mot: 'clause miroir' },
      { start: 22, end: 28, mot: 'clause' },
    ]);
  });
});

describe('glossarySpans', () => {
  it('repère à la fois les mots de vocabulaire et les sigles du glossaire', () => {
    const text = "Faut-il que la France bloque l'accord de libre-échange avec l'Amérique du Sud (Mercosur), tel qu'il a été négocié ?";
    expect(glossarySpans(text, WORDS, [{ sigle: 'CETA' }])).toEqual([
      { start: 41, end: 54, mot: 'libre-échange' },
      { start: 79, end: 87, mot: 'Mercosur' },
    ]);
  });

  it('repère aussi les sigles connus', () => {
    const text = 'Sortir de l’OTAN et réformer la TVA';
    expect(glossarySpans(text, WORDS, [{ sigle: 'OTAN' }, { sigle: 'TVA' }])).toEqual([
      { start: 12, end: 16, mot: 'OTAN' },
      { start: 32, end: 35, mot: 'TVA' },
    ]);
  });
});
