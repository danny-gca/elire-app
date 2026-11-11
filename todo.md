# Todolist

## Calendrier

Les dates annoncées sont aussi dans `data/candidats.json` (`programme.annonce`) : le build les rappelle une fois passées.

- Le 1er de chaque mois (prochaine : 2026-12-01) : revue des 27 candidats : `npm run a-verifier` (candidats périmés après 30 jours), programmes publiés, liens morts avec `check-links.mjs`, votes avec `check-votes.mjs`.
- 2026-11-14 : meeting de lancement de Mira Markovic (pas encore de programme) : relire ses propositions.
- 2026-11-17 : réforme des retraites annoncée par Marine Le Pen : relire prop-mlp-9.
- 2026-11-18 : contre-budget 2027 annoncé par le parti d'Antoine Mikolajczak ([page](https://parti-equinoxe.fr/programme-2027/)).
- 2026-11-21 : meeting d'Éric Zemmour : relire ses propositions.
- Sans date : 2e volet du livret de Raphaël Glucksmann ; programme de l'UPR « en cours d'élaboration » (François Asselineau, 3 mesures sourcées en 2026, le reste en 2022) ; passation de la présidence du groupe RN de Marine Le Pen à Sébastien Chenu, « pour la fin de la session parlementaire » selon LCP (biographie à mettre à jour).
- 2026-12-13 : vote des adhérents écologistes (10 au 13 décembre) sur la candidature de Marine Tondelier ou le soutien à un autre candidat ([Public Sénat](https://www.publicsenat.fr/actualites/politique/presidentielle-2027-personne-ne-gagnera-seul-assure-marine-tondelier)).
- Fin 2026 : déclaration formelle annoncée par Xavier Bertrand (« à la fin de l'année ») ; décision de Jean Lassalle annoncée « à l'automne ».
- 2027-02-07 au plus tard : décret de convocation, puis ouverture des parrainages ; clôture le 2027-03-12 à 18 h ([Toute l'Europe](https://www.touteleurope.eu/vie-politique-des-etats-membres/presidentielle-2027-calendrier-dates-inscription-candidats-vote/)).
- Avant le premier tour : arrêt de la Cour de cassation sur le pourvoi de Marine Le Pen (éligible depuis l'arrêt d'appel du 2026-07-07).
- 2027-05-10 : relire les 74 sujets (`data/sujets.json`), 180 jours après leur relecture du 2026-11-11 ; le build le rappelle.
- 2027-03-16 (au plus tard le 26) : liste officielle du Conseil constitutionnel. Passer chaque candidat retenu en statut officiel, retirer les autres. Premier tour le 2027-04-18, second le 2027-05-02.
- Les autres : dès la publication de leur programme 2027, mettre à jour de la même façon (propositions ajoutées ou remplacées, sources revérifiées, `contexte` daté).

## Portraits

- Portraits libres manquants (l'app affiche les initiales en attendant) : Antoine Mikolajczak, Mira Markovic (nom d'usage « Douchka Markovic »), Selma Labib, Sylvain Durif. Recherche du 2026-11-11 sur Commons et Wikidata : rien pour Mikolajczak et Markovic ; pour Labib, une bannière de 395 × 141 px d'auteur inconnu prise sur le site du parti (licence non prouvée) ; pour Durif, une capture YouTube de 2013 sous CC BY mais visée par une demande de suppression où il la dit diffamatoire, et deux photos à la flûte à la licence douteuse.
- Écrire à chaque équipe pour un portrait sous CC BY 4.0, idéalement déposé sur Wikimedia Commons, puis l'ajouter dans `assets/images/candidates/` et `src/constants/credits.ts`. Contacts : Équinoxe contact@parti-equinoxe.fr (photos du site créditées « Photographe : Jody Priour ») ; Parti animaliste contact@parti-animaliste.fr ; NPA-Révolutionnaires, formulaire npa-revolutionnaires.org/contact ; Sylvain Durif, formulaire durif2027.com/contact. Message type :
  > Bonjour, je développe élire, une application gratuite et neutre de comparaison des candidats à la présidentielle 2027. Chaque candidat y figure avec un portrait sous licence libre, crédité. Pourriez-vous nous fournir un portrait de [Prénom Nom] sous licence CC BY 4.0, avec le nom du photographe à créditer (le plus simple : le publier sur Wikimedia Commons) ? Sans photo libre, la candidate apparaît avec ses initiales, comme tout candidat dans ce cas. Merci.

## Aspects légaux

- Relecture des mentions légales et de la page Méthode et corrections par un avocat
