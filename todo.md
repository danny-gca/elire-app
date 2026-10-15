# À faire

## Ce soir : publier sur Google Play

EAS construit l'app et peut l'envoyer au store, mais la Play Console doit d'abord connaître l'app. Ordre :

1. **Créer l'app dans la Play Console** (play.google.com/console) : « Créer une application », nom « élire », langue français, type Application, gratuite, accepter les déclarations.
2. **Refaire un build de production** (les nouvelles briques natives : SVG, gestes, capture d'image, partage ; nom et icône « élire ») : `npx eas-cli build -p android --profile production`. Le profil `production` produit un `.aab`, seul format accepté par le Play Store (un `.apk` est refusé).
3. **Premier envoi**, au choix :
   - **À la main** (le plus simple pour la première fois) : sur expo.dev, ouvrir le build et « Download » le `.aab`. Dans la Play Console : Tester > Tests internes > Créer une version > glisser le `.aab` > Enregistrer > Examiner la version > Déployer. Ajouter son adresse dans l'onglet Testeurs.
   - **Par EAS** : créer une clé de compte de service Google (Google Cloud > IAM > Comptes de service > Clés > JSON), inviter l'adresse du compte de service dans Play Console > Utilisateurs et autorisations (droits sur les versions), déposer la clé sur expo.dev > Credentials > Android > fr.elire.app > Service credentials, puis `npx eas-cli submit -p android`. La version part en test interne.
4. **Finir les tâches du tableau de bord** de la Play Console (l'app reste en brouillon tant qu'elles ne sont pas faites) :
   - règles de confidentialité : <https://danny-gca.github.io/elire-website/mentions-legales/> ;
   - accès à l'app : tout est accessible sans compte ;
   - annonces : non ;
   - classification du contenu : questionnaire ;
   - public cible : adultes (18+) ;
   - sécurité des données : aucune donnée collectée ni partagée (tout reste sur l'appareil) ;
   - fiche du Play Store : description courte et longue, icône 512 × 512, image de présentation 1024 × 500, au moins 2 captures d'écran de téléphone.
5. **Compte développeur personnel récent** : Google demande un test fermé avec au moins 12 testeurs pendant 14 jours avant d'ouvrir la production. Vérifier dans la Play Console si cela s'applique au compte.
6. **Ensuite, automatiser** : ajouter un job `submit` après `build_android` dans `.eas/workflows/create-production-builds.yml` (il construit sans envoyer pour l'instant), et la piste dans `eas.json` (`submit.production.android.track`).

Doc : <https://docs.expo.dev/submit/android/>

## À vérifier sur un téléphone Android (après le build)

- Fermer une feuille en la glissant vers le bas.
- Partage natif de l'image du classement.
- Nouvelle icône, écran de lancement, nom « élire ».
- La salle derrière les scrutins : fluidité et rendu.
- Les fêtes : point de départ dans une feuille (décalage possible de la hauteur de la barre d'état), fête de bienvenue en fin d'onboarding.

## Données

- Photo d'Antoine Mikolajczak : demander au parti Équinoxe un portrait libre de droits (CC BY ou CC0), puis l'ajouter dans `assets/images/candidates/` et `src/constants/credits.ts`. En attendant, l'app affiche ses initiales.
- Photos de Mira Markovic (Parti animaliste, nom d'usage « Douchka Markovic ») et de Selma Labib (NPA-Révolutionnaires) : rien de libre sur Commons, Wikidata ni Flickr (recherche du 2026-10-15). Écrire aux partis (formulaire du Parti animaliste, contact@npa-revolutionnaires.org) pour un portrait sous CC BY 4.0, idéalement déposé par eux sur Wikimedia Commons. Message type :
  > Bonjour, je développe élire, une application gratuite et neutre de comparaison des candidats à la présidentielle 2027. Chaque candidat y figure avec un portrait sous licence libre, crédité. Pourriez-vous nous fournir un portrait de [Prénom Nom] sous licence CC BY 4.0, avec le nom du photographe à créditer (le plus simple : le publier sur Wikimedia Commons) ? Sans photo libre, la candidate apparaît avec ses initiales, comme tout candidat dans ce cas. Merci.
- Revérifier les sources LFI après la nouvelle édition de L'Avenir en commun (6-7 nov. 2026), et celles du RN dès la publication de son programme 2027.
- Scrutin du Congrès sur l'IVG (2024-03-04) : l'URL `assemblee-nationale.fr/dyn/16/scrutins/congres-ivg` de toutes les entrées répond 404. Trouver la page officielle du scrutin du Congrès ; les votes de Batho et Becht pointent pour l'instant vers l'open data de l'Assemblée.
- Parti de deux candidats à trancher : Wikipédia présente Natacha Polony « sans étiquette » (« Nous sommes la France » y est un slogan) et Olivier Becht Renaissance / Agir (« Projet France » y est un slogan). Garder le mouvement de campagne ou l'étiquette ?
- Graphie : « Génération écologie » (Wikipédia, gardé) ou « Génération Écologie » (le parti).

Fait le 2026-10-15 : citation de prop-ez-6 en français (extrait BFMTV de « Face à BFM ») ; 66 votes de Batho et Becht ajoutés (Bertrand et Philippot ne siégeaient pas aux dates des scrutins) ; noms, sigles et couleurs des nouveaux partis vérifiés (pas de sigle inventé pour Projet France ni Nous sommes la France).

## Autres

- Relecture des mentions légales et de la page Méthode et corrections par un avocat.
- Compléter `docs/feature-20261015-smaller-updates.md` avec les derniers tours (salle, fêtes, partage, fiche candidat, score, simulation) avant de commiter.
- Idée : une petite fête quand un thème est entièrement voté dans Explore.
