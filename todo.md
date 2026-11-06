# Todolist

## Calendrier

Les dates annoncées sont aussi dans `data/candidats.json` (`programme.annonce`) : le build les rappelle une fois passées.

- 2026-11-01 : revue mensuelle des 25 candidats (programmes publiés, liens morts avec `check-links.mjs`), puis le 1er de chaque mois.
- Antoine Mikolajczak : programme synthétique « L'essentiel » paru en novembre 2026 (52 p., 3 chapitres), lu le 2026-11-06 ; statut `partiel`. Remplacer ses 3 prises de position (prop-am-9 à 11) et ses 4 mesures de 2024 par des mesures de ce document.
- Jean-Luc Mélenchon : 5e édition de L'Avenir en commun en librairie le 2026-11-06 (1 069 mesures, 238 nouvelles), sans PDF en ligne ([annonce](https://lafranceinsoumise.fr/2026/11/02/avenir-en-commun-nouvelle-france/)). Relire ses propositions dès qu'une version en ligne existe.
- Nathalie Arthaud : dépliant de campagne du 2026-11-03 ([page](https://www.lutte-ouvriere.org/portail/documents/depliant-campagne-209499.html)), PDF non téléchargeable par robot : à lire à la main.
- 2026-11-09 : partie 11 du livre-programme d'Olivier Becht, repasser en `complet`.
- 2026-12-13 : vote des adhérents écologistes (10 au 13 décembre) sur la candidature de Marine Tondelier ou le soutien à un autre candidat ([Public Sénat](https://www.publicsenat.fr/actualites/politique/presidentielle-2027-personne-ne-gagnera-seul-assure-marine-tondelier)).
- Fin 2026 : déclaration formelle annoncée par Xavier Bertrand (« à la fin de l'année ») ; décision de Jean Lassalle annoncée « à l'automne ».
- 2027-02-07 au plus tard : décret de convocation, puis ouverture des parrainages ; clôture le 2027-03-12 à 18 h ([Toute l'Europe](https://www.touteleurope.eu/vie-politique-des-etats-membres/presidentielle-2027-calendrier-dates-inscription-candidats-vote/)).
- Avant le premier tour : arrêt de la Cour de cassation sur le pourvoi de Marine Le Pen (éligible depuis l'arrêt d'appel du 2026-07-07).
- 2027-03-16 (au plus tard le 26) : liste officielle du Conseil constitutionnel. Passer chaque candidat retenu en statut officiel, retirer les autres. Premier tour le 2027-04-18, second le 2027-05-02.
- Les autres : dès la publication de leur programme 2027, mettre à jour de la même façon (propositions ajoutées ou remplacées, sources revérifiées, `contexte` daté).

## Neutralité

Détail : `docs/simulations/README.md`, section « Neutralité des questions ».

- Équilibrer les scrutins : 35 des 47 textes ont été adoptés (8 rejetés, 4 en cours), donc votés « pour » par la majorité. Ajouter des textes de l'opposition rejetés par la majorité.
- Ajouter des « contre » dans d'autres questions communes : seuls Selma Labib et Bruno Retailleau en ont.
- Compléter à 8 propositions David Lisnard, Édouard Philippe et Fabien Roussel (7 chacun). Passer à 10 par candidat seulement quand la plupart auront un programme 2027.

## Données à valider

- Les 16 questions communes (`data/enjeux.json`), surtout : budget-defense (db-3, et sl-3 en contre), temps-de-travail (br-3 en contre), peines-planchers (br-1).
- Types de source discutables : jlm et nda en programme 2027 ; br-7, br-8 et np-6 en programme 2027 ; ez-2 en programme précédent ; fa-1, fa-2 et ga-\* en prise de position.
- prop-ez-8 : citation lue sur une page en image (couche texte du PDF illisible).
- prop-na-3 : page imprimée 11 ou 12 ?
- prop-fro-4 : la citation est une phrase du journaliste de Terre-net, pas une parole du candidat. Chercher la source du candidat.
- prop-nda-3 : préciser « faute de vaccin Covid » dans le titre ? Seule sa proposition de loi n° 26 de 2022 le dit, pas la page du programme.
- Thème de l'immigration à harmoniser : prop-ep-8 et prop-sl-4 en société, prop-nda-1 en sécurité.
- Questions proches et contexte maigre signalés par le build : arbitrages dans `docs/feature-20261106-doublons-contexte.md`.

## Choix à trancher

- Étiquette de Natacha Polony et Olivier Becht, avec une règle commune à tous : leur mouvement de campagne (que Wikipédia présente comme un slogan) ou leur étiquette d'origine ?

## Portraits

- Portraits libres manquants (l'app affiche les initiales en attendant) : Antoine Mikolajczak, Mira Markovic (nom d'usage « Douchka Markovic »), Selma Labib. Rien de libre sur Commons, Wikidata ni Flickr (recherche du 2026-10-15).
- Écrire à chaque équipe de campagne (contact sur son site) pour un portrait sous CC BY 4.0, idéalement déposé sur Wikimedia Commons, puis l'ajouter dans `assets/images/candidates/` et `src/constants/credits.ts`. Message type :
  > Bonjour, je développe élire, une application gratuite et neutre de comparaison des candidats à la présidentielle 2027. Chaque candidat y figure avec un portrait sous licence libre, crédité. Pourriez-vous nous fournir un portrait de [Prénom Nom] sous licence CC BY 4.0, avec le nom du photographe à créditer (le plus simple : le publier sur Wikimedia Commons) ? Sans photo libre, la candidate apparaît avec ses initiales, comme tout candidat dans ce cas. Merci.

## Aspects légaux

- Relecture des mentions légales et de la page Méthode et corrections par un avocat
