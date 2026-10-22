# Todolist

## Dev à faire

- amélioration du bouton partage :
- ajouter un partage par nb de point par theme
- Modifier le partage pour slider entre les différent type de partage, avec des points afficher en bas de l'écran

- Réfléchir a mettre en place un json/typage plus complet par programme et par candidat pour les rapprocher, si un candidat veut la même chose qu'un autre on pourrait donner des points a plusieurs candidats d'un coup et pas remettre la même question plusieurs fois pour éviter les doublons
- noter dans les infos candidats si on a le programme complet ou pas
- si on a le programme complet, essayer de le remplir au maximum d'info du programme, ça nous permettra de plus facilement voir si on peut mettre le programme en face d'un autre
- et si on met les programmes en face des autres on peut aussi calculer les propositions qui sont a l'inverse d'un programme a l'autre (par exemple un candidat dit "monter plus de reacteur nucléaire" et un autre dit "supprimer des reacteurs nucléaires", on pourrait proposer une seule question qui retire des points à l'un et ajoute des points a l'autre avec le détail sur la proposition de chaque candidat). est-ce possible tu penses ? mathématiquement parlant et si on classe bien les datas correctement ? pour créer les propositions "qui vont en face" un script pourrait faire l'affaire ? comment choisir proprement ? je sais qu'il y a des solutions comme obsidian/gortex qui met relie des mots ensemble par exemple, est-ce que ça pourrait etre une solution ou pas du tout et il y a autre chose ? ou bien seulement en json et en script on pourrait faire un truc ?
- mon but premier c'est éviter les questions en double, j'en ai vu beaucoup trop similaire, et je sais meme pas si c'est vraiment dans leurs programme. donc il faudrait peut etre meme différencier les questions de "programme" et les "avoeux inattendu à la télé, réseaux sociaux, journaux etc.." qui n'est pas dis de la meme façon dans le programme quoi. mieux catégoriser les propositions en fait.

## Infos candidats

- Portraits libres manquants (l'app affiche les initiales en attendant) : Antoine Mikolajczak, Mira Markovic (nom d'usage « Douchka Markovic »), Selma Labib. Rien de libre sur Commons, Wikidata ni Flickr (recherche du 2026-10-15). Écrire à chaque équipe de campagne (contact sur son site) pour un portrait sous CC BY 4.0, idéalement déposé sur Wikimedia Commons, puis l'ajouter dans `assets/images/candidates/` et `src/constants/credits.ts`. Message type :
  > Bonjour, je développe élire, une application gratuite et neutre de comparaison des candidats à la présidentielle 2027. Chaque candidat y figure avec un portrait sous licence libre, crédité. Pourriez-vous nous fournir un portrait de [Prénom Nom] sous licence CC BY 4.0, avec le nom du photographe à créditer (le plus simple : le publier sur Wikimedia Commons) ? Sans photo libre, la candidate apparaît avec ses initiales, comme tout candidat dans ce cas. Merci.
- Compléter les candidats à moins de 8 propositions : Mikolajczak (5), Lisnard, Philippe et Roussel (7).
- Mettre à jour chaque candidat de la même façon à chaque nouveau programme ou nouvelle édition : propositions ajoutées ou remplacées, sources revérifiées, `contexte` daté.
  - 2026-11-01 : revue mensuelle des 25 candidats (programmes publiés depuis, liens morts), puis le 1er de chaque mois.
  - 2026-11-02 : programme 2027 annoncé d'Antoine Mikolajczak.
  - 2026-11-06 et 07 : nouvelle édition annoncée du programme de Jean-Luc Mélenchon.
  - Les autres : dès la publication de leur programme 2027.
- À valider à la main : prop-ez-8 (citation lue sur une page en image, couche texte du PDF illisible) ; page de prop-na-3 (p. 11 ou p. 12 imprimée ?).
- Titres plus larges que leur citation, à valider contre la source : prop-dl-5, prop-fr-6 ; « soignants exclus » de prop-nda-3 à préciser.
- Harmoniser le thème de l'immigration (prop-ep-8 et prop-sl-4 en société, prop-nda-1 en sécurité).
- Scrutin du Congrès sur l'IVG (2024-03-04) : l'URL `assemblee-nationale.fr/dyn/16/scrutins/congres-ivg` de toutes les entrées répond 404. Trouver la page officielle du scrutin du Congrès ; les votes de Batho et Becht pointent pour l'instant vers l'open data de l'Assemblée.
- Étiquette de deux candidats à trancher, avec une règle commune à tous : Natacha Polony et Olivier Becht ont un mouvement de campagne que Wikipédia présente comme un slogan. Garder le mouvement de campagne ou l'étiquette d'origine ?
- Graphie du parti de Delphine Batho : celle de Wikipédia (gardée) ou celle du parti, qui met une majuscule à « Écologie ».

## Aspect légales

- Relecture des mentions légales et de la page Méthode et corrections par un avocat.
