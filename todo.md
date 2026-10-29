# Todolist

## Calendrier

Les dates annoncées sont aussi dans `data/candidats.json` (`programme.annonce`) : le build les rappelle une fois passées.

- 2026-11-01 : revue mensuelle des 25 candidats (programmes publiés, liens morts avec `check-links.mjs`), puis le 1er de chaque mois.
- 2026-11-02 : programme 2027 d'Antoine Mikolajczak. Remplacer ou confirmer ses 3 prises de position (prop-am-9 à 11), passer le statut en `complet`.
- 2026-11-06 : nouvelle édition du programme de Jean-Luc Mélenchon (présentée les 6 et 7 novembre).
- 2026-11-09 : dernière partie du livre-programme d'Olivier Becht, repasser en `complet`.
- Les autres : dès la publication de leur programme 2027, mettre à jour de la même façon (propositions ajoutées ou remplacées, sources revérifiées, `contexte` daté).

## Neutralité

Détail : `docs/simulations/README.md`, section « Neutralité des questions ».

- Équilibrer les scrutins : 36 des 42 textes ont été adoptés, donc votés « pour » par la majorité. Ajouter des textes de l'opposition rejetés par la majorité.
- Ajouter des « contre » dans d'autres questions communes : seuls Selma Labib et Bruno Retailleau en ont.
- Compléter à 8 propositions David Lisnard, Édouard Philippe et Fabien Roussel (7 chacun). Passer à 10 par candidat seulement quand la plupart auront un programme 2027.

## Données à valider

- Les 17 questions communes (`data/enjeux.json`), surtout : prix-minimum-agricole (jl-1), budget-defense (db-3, et sl-3 en contre), temps-de-travail (br-3 en contre), peines-planchers (br-1).
- Types de source discutables : jlm et nda en programme 2027 ; br-7, br-8 et np-6 en programme 2027 ; ez-2 en programme précédent ; fa-1, fa-2 et ga-\* en prise de position.
- prop-ez-8 : citation lue sur une page en image (couche texte du PDF illisible).
- prop-na-3 : page imprimée 11 ou 12 ?
- Thème de l'immigration à harmoniser : prop-ep-8 et prop-sl-4 en société, prop-nda-1 en sécurité.
- Sources plus récentes à étudier : page « projet » de Natacha Polony (natachapolony2027.fr/projet, douze chantiers), brochure de Nathalie Arthaud du 2026-08-25.

## Choix à trancher

- Étiquette de Natacha Polony et Olivier Becht, avec une règle commune à tous : leur mouvement de campagne (que Wikipédia présente comme un slogan) ou leur étiquette d'origine ?
- Graphie du parti de Delphine Batho : celle de Wikipédia (« Génération écologie », gardée) ou celle du parti (« Génération Écologie »).

## Portraits

- Portraits libres manquants (l'app affiche les initiales en attendant) : Antoine Mikolajczak, Mira Markovic (nom d'usage « Douchka Markovic »), Selma Labib. Rien de libre sur Commons, Wikidata ni Flickr (recherche du 2026-10-15).
- Écrire à chaque équipe de campagne (contact sur son site) pour un portrait sous CC BY 4.0, idéalement déposé sur Wikimedia Commons, puis l'ajouter dans `assets/images/candidates/` et `src/constants/credits.ts`. Message type :
  > Bonjour, je développe élire, une application gratuite et neutre de comparaison des candidats à la présidentielle 2027. Chaque candidat y figure avec un portrait sous licence libre, crédité. Pourriez-vous nous fournir un portrait de [Prénom Nom] sous licence CC BY 4.0, avec le nom du photographe à créditer (le plus simple : le publier sur Wikimedia Commons) ? Sans photo libre, la candidate apparaît avec ses initiales, comme tout candidat dans ce cas. Merci.

## Aspects légaux

- Relecture des mentions légales et de la page Méthode et corrections par un avocat
