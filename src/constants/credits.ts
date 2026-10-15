// Crédits des portraits (Wikimedia Commons, sauf mention), vérifiés le 2026-10-13 sur les fichiers téléchargés.
export interface PhotoCredit {
  candidatId: string;
  auteur: string;
  licence: string;
  /** Page source de la photo. */
  url?: string;
}

export const PHOTO_CREDITS: PhotoCredit[] = [
  { candidatId: 'raphael-glucksmann', auteur: 'European Union 2024 - Source : EP', licence: 'European Parliament', url: 'https://commons.wikimedia.org/wiki/File:1720448398743_20240708_GLUCKSMANN_Raphael_FR_006.jpg' },
  { candidatId: 'edouard-philippe', auteur: 'Wasasaq8', licence: 'CC0', url: 'https://commons.wikimedia.org/wiki/File:Edouard_Philippe_3x4_crop.jpg' },
  { candidatId: 'gabriel-attal', auteur: 'Ismail Aissoub', licence: 'CC BY 4.0', url: 'https://commons.wikimedia.org/wiki/File:Gabriel_Attal_2025_(close_crop).jpg' },
  { candidatId: 'jean-luc-melenchon', auteur: 'jlm2017.fr', licence: 'CC BY 4.0', url: 'https://commons.wikimedia.org/wiki/File:Jean_Luc_M%C3%A9lenchon_en_mai_2026-_55261894422_(cropped).jpg' },
  { candidatId: 'marine-le-pen', auteur: 'Vox España', licence: 'CC0', url: 'https://commons.wikimedia.org/wiki/File:Marine_Le_Pen_2025_(cropped).jpg' },
  { candidatId: 'marine-tondelier', auteur: 'Greenbox', licence: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:20210819_tondelier.m-cr3.jpg' },
  { candidatId: 'bruno-retailleau', auteur: 'Anthonymontardyfr', licence: 'CC BY 4.0', url: 'https://commons.wikimedia.org/wiki/File:Bruno_Retailleau_-_Ministre_de_l%27Int%C3%A9rieur_fran%C3%A7ais_(cropped).jpg' },
  { candidatId: 'francois-ruffin', auteur: 'Thinkerview', licence: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Fran%C3%A7ois_Ruffin_(cropped).jpg' },
  { candidatId: 'fabien-roussel', auteur: 'Zouhair NAKARA', licence: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Roussel_Fabien_1.jpg' },
  { candidatId: 'eric-zemmour', auteur: 'Anh De France', licence: 'CC0', url: 'https://commons.wikimedia.org/wiki/File:Portrait_d%27%C3%89ric_Zemmour,_avril_2022.jpg' },
  { candidatId: 'nathalie-arthaud', auteur: 'Kokluts', licence: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Nathalie_Arthaud_(LO)_19-05-2024.jpg' },
  { candidatId: 'francois-asselineau', auteur: 'Union Populaire Républicaine', licence: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Fran%C3%A7ois_ASSELINEAU.jpg' },
  { candidatId: 'nicolas-dupont-aignan', auteur: 'Debout la France', licence: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Nicolas_Dupont-Aignan,_homme_politique_fran%C3%A7ais.jpg' },
  { candidatId: 'david-lisnard', auteur: 'Frantogian', licence: 'CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:David_Lisnard_-_2013.jpg' },
  { candidatId: 'jean-lassalle', auteur: 'Antoine Lamielle', licence: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Jean_Lassalle.jpg' },
  { candidatId: 'anasse-kazib', auteur: 'PabloMorao27', licence: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Anasse_Kazib,_d%C3%A9cembre_2021.jpg' },
  { candidatId: 'florian-philippot', auteur: 'Films et documetnaires', licence: 'CC BY 4.0', url: 'https://commons.wikimedia.org/wiki/File:Florian_Philippot.jpg' },
  { candidatId: 'karim-bouamrane', auteur: 'Oumma', licence: 'CC BY 4.0', url: 'https://commons.wikimedia.org/wiki/File:Karim_Bouamrane_en_2026.jpg' },
  { candidatId: 'delphine-batho', auteur: 'Greenbox', licence: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:20210820_batho_d_6593.jpg' },
  { candidatId: 'olivier-becht', auteur: 'Ricardo Stuckert / Palácio do Planalto', licence: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Olivier_Becht_2023_(cropped).jpg' },
  { candidatId: 'natacha-polony', auteur: 'Georges Biard', licence: 'CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Natacha_Polony_Cannes_2015.jpg' },
  { candidatId: 'xavier-bertrand', auteur: 'Claudio Centonze / European Union, 2025 / EC - Audiovisual Service', licence: 'CC BY 4.0', url: 'https://commons.wikimedia.org/wiki/File:Xavier_Bertrand_(2025)_(cropped).jpg' },
];

export interface FontCredit {
  nom: string;
  role: string;
  auteur: string;
  url: string;
}

// Polices auto-hébergées (assets/fonts/), SIL Open Font License 1.1 ; auteurs repris de leur fichier OFL.
export const FONT_CREDITS: FontCredit[] = [
  { nom: 'Literata', role: 'Titres', auteur: 'The Literata Project Authors', url: 'https://github.com/googlefonts/literata' },
  { nom: 'Atkinson Hyperlegible Next', role: 'Texte', auteur: 'The Atkinson Hyperlegible Next Project Authors', url: 'https://github.com/googlefonts/atkinson-hyperlegible-next' },
  { nom: 'Caveat', role: 'Annotations et logo', auteur: 'The Caveat Project Authors', url: 'https://github.com/googlefonts/caveat' },
];

// Icônes d'onglets Explorer et Classement reprises d'Ionicons (MIT, licence dans assets/icons/tabs/).
export const ICON_CREDIT = { nom: 'Ionicons', role: 'Icônes', auteur: 'Ionic', licence: 'MIT', url: 'https://ionic.io/ionicons' };
