---
version: 1
slug: "src-app-tabs-index-tsx"
primary_target: "src/app/(tabs)/index.tsx"
related_targets: ["src/app/(tabs)/results.tsx","src/app/(tabs)/lois.tsx","src/app/(tabs)/explore.tsx","src/app/candidate/[id].tsx"]
---

## Scope

App élire complète (4 onglets, fiche candidat, onboarding). Mode : Operate. Plateformes : iOS, Android, Web. Thème clair unique.

## Audience et tâche

Citoyen qui se fait son avis seul, au calme : lire une proposition anonyme, la noter sur 4 niveaux (Impossible, Contre, Pour, Parfait) ou « Je ne sais pas » (non compté), voter de vrais scrutins (Contre, Abstention, Pour), puis confronter ses avis aux candidats et à leurs votes réels, avec la fiabilité de chaque score. À éviter : air de site gouv, gadget/gamifié, fade, ressemblance avec les applis à cartes à swiper (dégradé violet).

## Direction contract

THESIS: Le cahier annoté. Chaque proposition se lit comme un texte qu'on annote : l'avis s'écrit dans la marge et se voit au surligneur. Refuse la pile de cartes à swiper et la carte centrée à puce colorée du standard civique.

OWN-WORLD: Papier blanc froid #F6F7F5 (jamais crème), feuille #FFFFFF, encre #1C1E21, graphite #5B6168 pour la marge et le secondaire, filets #D5D9DD. Surligneur au choix du lecteur parmi quatre (jaune #EADB3F, rose #F2A7C3, vert #A8E0A1, bleu #A9D3F5), réservé à ses marques ; une marque garde sa couleur. La valeur du vote s'écrit en toutes lettres dans sa couleur d'échelle : terre cuite (négatif), graphite (neutre), vert correcteur #2F7D5B (positif). Rythme Seyès invisible : grille de 8 pt. Literata pour les titres, Atkinson Hyperlegible Next pour lire, Caveat pour l'écriture du lecteur (« Votre avis », « Dernier vote »), auto-hébergées ; deux tailles de lecture (17 et 13), hiérarchie par graisse, casse et filets.

STORY: L'utilisateur lit sans savoir qui parle, annote, et voit ses marques le suivre partout (Explorer, fiche candidat, récapitulatif). Le Classement montre chaque candidat sur un panneau identique et numéroté : égalité de traitement visible.

FIRST VIEWPORT: Voter. Grand titre « Voter », puis le prochain palier (« 4 votes avant votre Classement », ensuite « 7 votes avant le prochain bilan · 9 candidats classés sur 17 ») sur un filet de 2 px. « Dernier vote » en Caveat, puis la ligne du dernier vote surlignée dans sa couleur. Feuille blanche : marge de 48 px séparée par un filet graphite (numéro P-024, pictogramme, thème vertical), corps : titre 24 Literata, citation 17, « En savoir plus » fermé (glossaire puis contexte), aucune source. Sous la feuille : « Votre avis », 4 niveaux égaux, puis « Je ne sais pas » pleine largeur. Toutes les 10 questions, un bilan (fiabilité, 17 panneaux). Icônes d'onglets d'un seul jeu au trait.

FORM: Cahier Seyès / copie double, candidat 4 de la liste ordonnée ; raises : mots-repères collants (lexique), états qui restylent la ligne (tableau à palettes), mobilier identique par candidat + panneau électoral numéroté pour le Classement (catalogue + choix utilisateur), deux tailles de texte (indicateur), numéros stables P-xxx / L-xx (pochette), jaune réservé aux marques (signalétique). Seed key 287847d2.

Signature move: le trait de surligneur. Au vote, un trait tiré au hasard sur le bouton choisi (droit, diagonal ou ondulé, parfois hors du cadre), puis le titre est balayé de gauche à droite et la feuille remonte se ranger en « Dernier vote » (coupé si Réduire les animations) ; le trait garde sa couleur et réapparaît partout où la proposition est citée.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Décisions ouvertes

- Rendu natif à vérifier sur appareil : polices, Caveat, icônes d'onglets PNG, trait sur les lignes.
