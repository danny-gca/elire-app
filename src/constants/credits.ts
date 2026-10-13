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
  { candidatId: 'helene-thouy', auteur: 'Jonathan Lecarderonnel', licence: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Helene_Thouy_(cropped_2).jpg' },
  { candidatId: 'jean-lassalle', auteur: 'Antoine Lamielle', licence: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Jean_Lassalle.jpg' },
];
