# À faire

- faire plusieurs celebrate big() d'affilé (avec un peu d'espacement) quand on termine tous les votes et afficher un message sur le classement et dans "partager" (J'ai voté à tout !) Afficher sur la page "Voter" "Vous avez remplis tous les votes, partagez votre classement !" et afficher le bouton "partager" sur la page vote.
- améliorer le logo de l'app pour utiliser les 4 couleurs de surligneurs
- Refaire les screenshots pour mobile avec les nouveaux design
- reinitialiser les votes -> faire un celebrate big().
- La salle derrière les scrutins : fluidité et rendu.
- son du scrutin un peu trop wtf
- ajoute plus de retour haptique/vibration quand on fait des actions (vote, changement de page navbar...) sans trop abuser

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

## Autres

- Relecture des mentions légales et de la page Méthode et corrections par un avocat.
- Site : refaire les captures d'écran de l'app (`public/images/explorer.webp`) après les changements de `feature/tuto-et-sons` (onglet Cahier, A voté !, en-tête des scrutins).
- Compléter `docs/feature-20261015-smaller-updates.md` avec les derniers tours (salle, fêtes, partage, fiche candidat, score, simulation) avant de commiter.
