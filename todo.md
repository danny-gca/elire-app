# Todolist

## Calendrier

Les dates annoncées sont aussi dans `data/candidats.json` (`programme.annonce`) : le build les rappelle une fois passées.

- Le 1er de chaque mois (prochaine : 2026-12-01) : revue des 25 candidats (programmes publiés, liens morts avec `check-links.mjs`, votes avec `check-votes.mjs`).
- 2026-11-14 : meeting de lancement de Mira Markovic (pas encore de programme) : relire ses propositions.
- 2026-11-17 : réforme des retraites annoncée par Marine Le Pen : relire prop-mlp-9.
- 2026-11-18 : contre-budget 2027 annoncé par le parti d'Antoine Mikolajczak ([page](https://parti-equinoxe.fr/programme-2027/)).
- 2026-11-21 : meeting d'Éric Zemmour : relire ses propositions.
- Sans date : 2e volet du livret de Raphaël Glucksmann ; programme de l'UPR « en cours d'élaboration » (François Asselineau, 3 mesures sourcées en 2026, le reste en 2022) ; passation de la présidence du groupe RN de Marine Le Pen à Sébastien Chenu (biographie à mettre à jour).
- 2026-12-13 : vote des adhérents écologistes (10 au 13 décembre) sur la candidature de Marine Tondelier ou le soutien à un autre candidat ([Public Sénat](https://www.publicsenat.fr/actualites/politique/presidentielle-2027-personne-ne-gagnera-seul-assure-marine-tondelier)).
- Fin 2026 : déclaration formelle annoncée par Xavier Bertrand (« à la fin de l'année ») ; décision de Jean Lassalle annoncée « à l'automne ».
- 2027-02-07 au plus tard : décret de convocation, puis ouverture des parrainages ; clôture le 2027-03-12 à 18 h ([Toute l'Europe](https://www.touteleurope.eu/vie-politique-des-etats-membres/presidentielle-2027-calendrier-dates-inscription-candidats-vote/)).
- Avant le premier tour : arrêt de la Cour de cassation sur le pourvoi de Marine Le Pen (éligible depuis l'arrêt d'appel du 2026-07-07).
- 2027-05-05 : relire les 74 sujets (`data/sujets.json`), 180 jours après leur écriture ; le build le rappelle.
- 2027-03-16 (au plus tard le 26) : liste officielle du Conseil constitutionnel. Passer chaque candidat retenu en statut officiel, retirer les autres. Premier tour le 2027-04-18, second le 2027-05-02.
- Les autres : dès la publication de leur programme 2027, mettre à jour de la même façon (propositions ajoutées ou remplacées, sources revérifiées, `contexte` daté).

## Neutralité

Détail : `docs/simulations/README.md`, section « Neutralité des questions ».

- Équilibrer les scrutins : 35 des 47 textes ont été adoptés (8 rejetés, 4 en cours), donc votés « pour » par la majorité. Ajouter des textes de l'opposition rejetés par la majorité.
- Ajouter des « contre » dans d'autres questions communes : seules budget-defense et temps-de-travail en ont.
- Passer à 10 propositions par candidat seulement quand la plupart auront un programme 2027.

## Choix à trancher

- Votes de groupe à l'Assemblée quand le parti n'est qu'une partie du groupe : Glucksmann (Place publique / Socialistes, 37 votes), Batho (Génération écologie / Écologistes, 17), Becht (Projet France / Ensemble pour la République, 13), Roussel (PCF / Gauche démocrate et républicaine, 29). Garder le groupe, recalculer sur les seuls élus du parti ou retirer ?
- Attal ga-1 (uniforme) et ga-6 (normes agricoles) : sources de 2024, seules positions d'Attal dans 2 questions communes ; son programme 2026 n'en parle pas.
- Question commune possible « sécurité sociale climatique » : Batho et Ruffin (prop-fr-7) ; demanderait de remplacer prop-db-1.
- regulariser-sans-papiers : prop-ak-4 et prop-sl-4 mêlent encore régularisation et liberté de circulation (prop-na-6 corrigée).
- Questions de scrutins à deux idées, à réduire à une : loi-immigration-2023, loi-valletoux-acces-soins-2023, loi-anti-squat-kasbarian-2023, climat-resilience-2021, securite-globale-2020, principes-republique-2021, ordonnances-travail-2017, loi-asile-immigration-2018.
- Statuts de scrutins : holding-audiovisuel-public-2025 en `en_cours` (navette toujours ouverte) ? ratification-ceta-an-2019 : dire dans le résumé que le Sénat a retiré le CETA du texte ?
- Candidatures : Marine Tondelier `investie` -> `annoncee` (le vote du 2025-12-08 la désignait pour la primaire) ; Antoine Mikolajczak (investi en avril 2026, jour exact à trouver) ; Nathalie Arthaud (source qui atteste l'investiture par le congrès, sinon `annoncee`) ; programme d'Arthaud : dépliant du 2026-11-03 au lieu de la brochure de juin.
- Programmes : Marine Le Pen (url = article Europe 1, pas un document du RN) ; Florian Philippot `complet` alors que le document s'intitule « Grandes orientations ».
- Partis : `projet-france` est le projet d'Olivier Becht, pas un parti ; sigles absents des sites (FHuF, EQX, DEBOUT, NE, NF, RES) à sourcer ou retirer ; `reconquete` s'écrit « Reconquête! » sur son site ; `resistons` sans candidat ; site de `debout` (francoisruffin.fr est le site du député) ; `nuanceOfficielle.sourceUrl` vers les jeux de données data.gouv.fr (archives du ministère en 403) ; nuance LDIV de `france-libre` (européennes 2024).
- Étiquette de Natacha Polony et Olivier Becht, avec une règle commune à tous : leur mouvement de campagne (que Wikipédia présente comme un slogan) ou leur étiquette d'origine ?

## Données à valider

- Types de source discutables : br-7, br-8 et np-6 en programme 2027.
- prop-nda-3 : préciser « faute de vaccin Covid » dans le titre ? Seule sa proposition de loi n° 26 de 2022 le dit, pas la page du programme.
- Thème de l'immigration à harmoniser : prop-ep-8 et prop-sl-4 en société, prop-nda-1 en sécurité.
- Sujets sensibles à relire (immigration, priorité nationale, laïcité, IVG et PMA, justice des mineurs, défense, Ukraine) et chiffres de projets de budget à confirmer : section 5 de `docs/feature-20261106-doublons-contexte.md`.
- Les 74 sujets (`data/sujets.json`) n'ont pas été relus depuis leur écriture du 2026-11-06.

## Portraits

- Portraits libres manquants (l'app affiche les initiales en attendant) : Antoine Mikolajczak, Mira Markovic (nom d'usage « Douchka Markovic »), Selma Labib. Rien de libre sur Commons, Wikidata ni Flickr (recherche du 2026-10-15).
- Écrire à chaque équipe de campagne (contact sur son site) pour un portrait sous CC BY 4.0, idéalement déposé sur Wikimedia Commons, puis l'ajouter dans `assets/images/candidates/` et `src/constants/credits.ts`. Message type :
  > Bonjour, je développe élire, une application gratuite et neutre de comparaison des candidats à la présidentielle 2027. Chaque candidat y figure avec un portrait sous licence libre, crédité. Pourriez-vous nous fournir un portrait de [Prénom Nom] sous licence CC BY 4.0, avec le nom du photographe à créditer (le plus simple : le publier sur Wikimedia Commons) ? Sans photo libre, la candidate apparaît avec ses initiales, comme tout candidat dans ce cas. Merci.

## Aspects légaux

- Relecture des mentions légales et de la page Méthode et corrections par un avocat
