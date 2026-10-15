# Couleurs des partis : Classement et fiche candidat

Décisions du 2026-10-15 : affiche électorale, sigle en pastille, nuance officielle sur la fiche seule.

## Problème

Le Classement est une tôle grise de panneaux identiques : juste, mais froid et dur à parcourir (25 panneaux encre et graphite). La fiche candidat ne dit rien visuellement de l'appartenance du candidat.

## Direction : l'affiche électorale

Sur les vrais panneaux, chaque affiche porte ses couleurs ; ce qui est égal, c'est le panneau (même taille, même place, même numéro). On garde exactement cette règle.

- **Panneau du Classement** : un bandeau haut de 6pt à la couleur du parti, et un anneau de 2pt de la même couleur autour du portrait (ou des initiales). Sous le nom, le sigle en pastille (fond à la couleur du parti, texte blanc ou encre selon le contraste AA). Nom, score, « sur N votes » et jauge restent en encre : la couleur dit qui, jamais combien.
- **Fiche candidat** : le même bandeau en haut de l'écran (pleine largeur, sous la flèche retour), l'anneau autour du grand portrait, la pastille de sigle à côté du nom du parti. Ligne de nuance (voir plus bas).
- **Classement non classés** : même traitement ; « Pas encore évalué » garde ses couleurs.
- **Image de partage** : un liseré de 3pt à gauche de chaque ligne, à la couleur du parti (mode complet seulement ; le mode discret n'a aucun nom, donc aucune couleur).

## Ce qui ne change pas

- Les couleurs d'échelle (Impossible à Parfait, Contre / Pour) et les 4 surligneurs restent réservés aux votes du lecteur. Une couleur de parti n'est jamais posée sur un score, un vote, une marque ou un bouton.
- Pendant le vote à l'aveugle (Voter), aucune couleur ni sigle de parti : rien ne trahit l'auteur.
- Même taille, même place, même traitement pour les 25 candidats ; l'ordre reste celui des scores.

## Sigle

- `sigle` existant ; sans sigle (Projet France, Nous sommes la France), la pastille porte le nom court du parti, sans rien inventer.
- Pas de logo : marques protégées, rarement sous licence libre, qualité inégale.

## Nuance politique (fiche seule)

- Remplacer le champ libre `nuance` (aujourd'hui écrit par nous : « Droite identitaire », « Gauche populaire »...) par la **nuance attribuée par le ministère de l'Intérieur** aux dernières élections où le parti s'est présenté (grille des nuances des législatives 2024 ou des européennes 2024), avec sa source et l'élection d'origine : « Nuance du ministère de l'Intérieur (législatives 2024) : Divers centre ».
- Un parti jamais classé par le ministère : « Pas de nuance officielle », sans en inventer.
- Rien dans le Classement : un camp affiché à côté des scores orienterait la lecture des résultats.

## Contraste et accessibilité

- Chaque couleur de parti est vérifiée contre le blanc et l'encre ; la pastille choisit le texte qui passe AA. Les couleurs trop pâles (ex. #46B7FF, #00A2B0) prennent l'encre.
- La couleur n'est jamais seule porteuse d'information : le sigle et le nom sont toujours écrits.

## Règles à mettre à jour

- `CONTRIBUTING.md`, Neutralité : « Pas de couleur, d'ordre ou de mise en avant propre à un candidat ou un parti » devient « Chaque parti a sa couleur (celle de son logo), posée de la même façon pour tous et seulement sur son identité (bandeau, anneau, sigle) ; jamais sur un score ni pendant le vote à l'aveugle. »
- `DESIGN.md` : panneau électoral, fiche, règle des couleurs ; `PRODUCT.md` : palette.

## Ouvert

- Données : relever la nuance officielle de chaque parti (source : circulaire et résultats du ministère de l'Intérieur), à faire avec `collecter-donnees`.
- Couleurs proches entre partis (plusieurs rouges, plusieurs bleus) : on les garde telles quelles, le sigle les distingue.

## Livraison du 2026-10-15

- Après essai, le Classement ne garde que l'**anneau du portrait** à la couleur du parti (bandeau et sigle faisaient carnaval à 25) ; le nom du parti reste en graphite.
- Fiche : bandeau, anneau, nom du parti dans sa couleur (foncée jusqu'au contraste AA si besoin ; la pastille du sigle a été retirée, elle faisait doublon avec le nom), puis la nuance officielle avec son lien.
- Image de partage : liseré de 3px par ligne.
- `nuance` (champ libre) remplacé par `nuanceOfficielle` (`code`, `libelle`, `election`, `sourceUrl`) : 19 partis classés (européennes 2024, législatives 2024, ou grille des municipales 2026 pour Debout !), 6 sans nuance (Nouvelle Énergie, La France Humaine et Forte, Projet France, Nous sommes la France, Nous France, Résistons : sa nuance 2024 était celle de la liste Alliance rurale, pas la sienne).
- Les blocs (extrême gauche à extrême droite) de la circulaire de 2026 ne sont pas affichés : ils valent pour les municipales, et le classement de LFI y est contesté.
- Équinoxe : couleur corrigée en jaune (#FFD412, site du parti).
