---
version: 1
slug: "src-app-tabs-index-tsx"
primary_target: "src/app/(tabs)/index.tsx"
related_targets: ["src/app/(tabs)/results.tsx","src/app/(tabs)/lois.tsx","src/app/(tabs)/explore.tsx","src/app/candidate/[id].tsx"]
---

## Scope

App ÉLIRE complète (4 onglets, fiche candidat, onboarding). Mode : Operate. Plateformes : iOS, Android, Web. Thème clair unique.

## Audience et tâche

Citoyen qui se fait son avis seul, au calme : lire une proposition anonyme, la noter sur 5 niveaux (Impossible, Contre, Neutre, Pour, Parfait), puis confronter ses notes aux candidats et à leurs votes réels. À éviter : air de site gouv, gadget/gamifié, fade, ressemblance avec les applis à cartes à swiper (dégradé violet).

## Direction contract

THESIS: Le cahier annoté. Chaque proposition se lit comme un texte qu'on annote : l'avis s'écrit dans la marge et se voit au surligneur. Refuse la pile de cartes à swiper et la carte centrée à puce colorée du standard civique.

OWN-WORLD: Papier blanc froid #F6F7F5 (jamais crème), feuille #FFFFFF, encre #1C1E21, graphite #5B6168 pour la marge et le secondaire, filets #D5D9DD. Jaune surligneur #EADB3F réservé aux marques de l'utilisateur (trait derrière une proposition votée), rien d'autre n'est jaune. La valeur du vote s'écrit en toutes lettres dans sa couleur d'échelle : terre cuite (négatif), graphite (neutre), vert correcteur #2F7D5B (positif). Rythme Seyès invisible : grille de 8 pt. Police système (SF / Roboto), deux tailles de texte par écran au plus, hiérarchie par graisse, casse et filets.

STORY: L'utilisateur lit sans savoir qui parle, annote, et voit ses marques le suivre partout (Explorer, fiche candidat, récapitulatif). Le Classement montre chaque candidat sur un panneau identique et numéroté : égalité de traitement visible.

FIRST VIEWPORT: Voter. Grand titre « Voter » à gauche, compteur « 23 sur 108 » à droite en chiffres tabulaires, filet de progression de 2 px. Dernière proposition votée sur une ligne, surlignée en jaune, valeur du vote en couleur d'échelle. Feuille blanche : marge de 64 px séparée par un filet graphite (numéro P-024, pictogramme, thème), corps : titre 24 pt semi-gras, description 17 pt, lien source. Sous la feuille : « Votre avis », 5 boutons égaux en ligne. Barre d'onglets native.

FORM: Cahier Seyès / copie double, candidat 4 de la liste ordonnée ; raises : mots-repères collants (lexique), états qui restylent la ligne (tableau à palettes), mobilier identique par candidat + panneau électoral numéroté pour le Classement (catalogue + choix utilisateur), deux tailles de texte (indicateur), numéros stables P-xxx / L-xx (pochette), jaune réservé aux marques (signalétique). Seed key 287847d2.

Signature move: le trait de surligneur. Voter pose un trait jaune derrière le titre de la proposition (animation de balayage gauche-droite, 220 ms, coupée si Réduire les animations), et ce trait réapparaît partout où la proposition est citée.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Décisions ouvertes

- Sources précises des 78 propositions (éditorial, hors design).
