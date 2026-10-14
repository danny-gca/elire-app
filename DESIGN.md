---
name: ÉLIRE
description: Comparateur citoyen local-first pour la présidentielle 2027, sous la forme d'un cahier annoté.
colors:
  paper: "#F6F7F5"
  sheet: "#FFFFFF"
  ink: "#1C1E21"
  ink-soft: "#3A3F45"
  graphite: "#5B6168"
  rule: "#D5D9DD"
  rule-soft: "#E8EBED"
  board-edge: "#B9BFC5"
  pressed: "#EEF0F1"
  mark: "#EADB3F"
  marker-rose: "#F2A7C3"
  marker-vert: "#A8E0A1"
  marker-bleu: "#A9D3F5"
  negative: "#A4482A"
  negative-soft: "#F5E7E1"
  negative-pressed: "#EFD9CF"
  vote-impossible: "#8E3A1F"
  vote-contre: "#9C5530"
  vote-neutre: "#5B6168"
  vote-pour: "#3A7D60"
  vote-parfait: "#22654A"
  theme-environnement: "#3B7D4A"
  theme-environnement-tint: "#E6F0E8"
  theme-agriculture: "#6B7722"
  theme-agriculture-tint: "#EEF0DE"
  theme-economie: "#8C6A1A"
  theme-economie-tint: "#F2EDDF"
  theme-travail: "#A0532C"
  theme-travail-tint: "#F4E8E1"
  theme-logement: "#77593A"
  theme-logement-tint: "#EFE9E2"
  theme-sante: "#A3455C"
  theme-sante-tint: "#F4E5E8"
  theme-societe: "#40707A"
  theme-societe-tint: "#E3EEEF"
  theme-education: "#1F7A70"
  theme-education-tint: "#E0EFED"
  theme-numerique: "#2B6A8F"
  theme-numerique-tint: "#E1ECF2"
  theme-international: "#3D5E88"
  theme-international-tint: "#E3E9F1"
  theme-institutions: "#555E70"
  theme-institutions-tint: "#E8EAEE"
  theme-securite: "#5C5047"
  theme-securite-tint: "#ECE9E6"
typography:
  display:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: "40px"
    letterSpacing: "-0.3px"
  headline:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "32px"
    letterSpacing: "-0.2px"
  title:
    fontFamily: "Atkinson Hyperlegible Next, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: "24px"
  body:
    fontFamily: "Atkinson Hyperlegible Next, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "24px"
  label:
    fontFamily: "Atkinson Hyperlegible Next, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: "18px"
  label-strong:
    fontFamily: "Atkinson Hyperlegible Next, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: "18px"
  caps:
    fontFamily: "Atkinson Hyperlegible Next, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: "18px"
    letterSpacing: "0.4px"
  note:
    fontFamily: "Caveat, cursive"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: "26px"
rounded:
  bar: "1px"
  panel: "2px"
  stroke: "3px"
  sm: "6px"
  tile: "8px"
  md: "12px"
  lg: "14px"
spacing:
  half: "4px"
  one: "8px"
  two: "16px"
  three: "24px"
  four: "32px"
  margin: "48px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sheet}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-primary-pressed:
    backgroundColor: "{colors.ink-soft}"
  button-secondary:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-secondary-pressed:
    backgroundColor: "{colors.pressed}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-danger:
    backgroundColor: "{colors.negative-soft}"
    textColor: "{colors.negative}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-danger-pressed:
    backgroundColor: "{colors.negative-pressed}"
  badge:
    backgroundColor: "{colors.rule-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.label-strong}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  search-field:
    backgroundColor: "{colors.rule-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "44px"
  segmented-track:
    backgroundColor: "{colors.rule-soft}"
    textColor: "{colors.graphite}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "3px"
    height: "44px"
  segmented-selected:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.label-strong}"
    rounded: "9px"
  vote-option:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 0"
    height: "60px"
  vote-unsure:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.label-strong}"
    rounded: "{rounded.md}"
    height: "44px"
  loi-vote-option:
    backgroundColor: "{colors.sheet}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "0 4px"
    height: "60px"
  more-info-toggle:
    textColor: "{colors.ink}"
    typography: "{typography.label-strong}"
    height: "44px"
  more-info-glossary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "12px"
  milestone-track:
    backgroundColor: "{colors.rule}"
    height: "2px"
  milestone-track-fill:
    backgroundColor: "{colors.ink}"
    height: "2px"
  pause-card:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.lg}"
    padding: "24px"
  pause-panel:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.panel}"
    width: "16px"
    height: "22px"
  hemicycle-seat:
    backgroundColor: "{colors.sheet}"
    rounded: "10px"
    size: "20px"
  hemicycle-seat-abstention:
    backgroundColor: "{colors.rule-soft}"
    rounded: "10px"
    size: "20px"
  marker-option:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "56px"
  marker-option-selected:
    typography: "{typography.title}"
  marker-stroke:
    rounded: "{rounded.stroke}"
    width: "40px"
    height: "14px"
  proposition-sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.lg}"
    padding: "24px 24px 24px 16px"
  sheet-margin:
    textColor: "{colors.graphite}"
    typography: "{typography.label}"
    width: "48px"
  list-card:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.lg}"
    padding: "16px"
  candidate-panel:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.label-strong}"
    rounded: "{rounded.panel}"
    padding: "32px 8px 16px"
    height: "196px"
  reliability-bar:
    backgroundColor: "{colors.rule}"
    rounded: "{rounded.bar}"
    width: "4px"
  reliability-bar-on:
    backgroundColor: "{colors.ink}"
  rank-number:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sheet}"
    typography: "{typography.label-strong}"
    size: "28px"
  classement-board:
    backgroundColor: "{colors.rule}"
    rounded: "{rounded.sm}"
    padding: "8px"
  tab-bar-web:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.graphite}"
    typography: "{typography.label}"
    height: "56px"
  tab-bar-web-active:
    textColor: "{colors.ink}"
    typography: "{typography.label-strong}"
  credits-row:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "12px 16px"
    height: "64px"
---

# Design System: ÉLIRE

## Overview

**Creative North Star: "Le cahier annoté"**

Chaque proposition se lit comme un texte qu'on annote. Le papier est blanc froid, l'encre presque noire, le secondaire au graphite, les séparations au filet fin. L'avis de l'utilisateur est la seule chose qui se voit en couleur vive : un trait de surligneur (jaune par défaut, ou rose, vert, bleu) derrière ce qu'il a noté, et la valeur de sa note écrite en toutes lettres dans sa couleur d'échelle. Tout le reste reste en encre neutre, parce que l'application ne doit pas prendre parti.

La densité est celle d'un cahier de cours : une colonne de lecture (720px max), un rythme invisible de 8pt, deux tailles de lecture, une hiérarchie portée par la graisse, la casse et les filets plutôt que par la couleur. Les surfaces sont plates ; la profondeur vient du contraste papier / feuille et des filets hairline. Le Classement change de matière : une tôle grise de panneaux électoraux identiques et numérotés, pour rendre l'égalité de traitement visible.

Rejets confirmés : l'air de site gouvernemental, l'appli gadget ou gamifiée, la pile de cartes à swiper et le dégradé violet des applis à cartes à swiper, la carte centrée à puce colorée du standard civique. Thème clair uniquement, par décision produit.

**Key Characteristics:**

- Papier blanc froid, jamais crème ; encre, graphite, filets.
- Surligneur du lecteur (jaune, rose, vert ou bleu, à son choix) réservé à ses marques.
- Valeur de vote écrite en toutes lettres, avec son signe, dans sa couleur d'échelle.
- Numéros stables (P-531, L-28) en chiffres tabulaires partout.
- Literata pour les titres, Atkinson Hyperlegible Next pour lire, Caveat pour l'écriture du lecteur ; deux tailles de lecture (17 et 13).
- Classement en panneaux électoraux identiques sur une tôle grise.

## Colors

Une palette d'encre sur papier froid, sans couleur institutionnelle ni partisane, où l'unique couleur vive appartient au lecteur.

### Primary

- **Encre de cahier** (ink): texte principal, bouton primaire, carré de rang du Classement, indicateur d'onglet actif, anneau de focus web (2px, décalé de 2px). C'est la couleur d'action : il n'y a pas d'accent de marque.

### Secondary

- **Surligneurs** (mark, marker-rose, marker-vert, marker-bleu): le trait derrière ce que l'utilisateur a voté, et rien d'autre. Il choisit le sien à la fin de l'onboarding (jaune par défaut) et peut en changer dans Classement ; chaque marque garde la couleur du surligneur avec lequel elle a été posée (`marks` dans le store). Les couleurs ne signifient rien et ne rappellent aucun parti. En natif le trait s'applique en fond de ligne à 70% d'opacité ; sur le web en bande basse sur chaque ligne (de 38% à 94% de la hauteur, 85% d'opacité), coupée proprement aux retours à la ligne, droite sur une portion puis légèrement ondulée (tuiles SVG de 240px, 3 variantes stables par texte, `data-wave`). Tokens : `Markers` dans `theme.ts`, variables `--marker` dans `global.css`. La sélection de texte web reste jaune à 55%.

### Tertiary

- **Échelle de vote** (vote-impossible, vote-contre, vote-neutre, vote-pour, vote-parfait): terre cuite pour le négatif, graphite pour le neutre, vert correcteur pour le positif. Ces couleurs servent uniquement aux valeurs de vote de l'utilisateur : signe dans la rangée de vote, bordure 2px du niveau choisi, étiquette « Pour +1 » sur les listes.
- **Accents thématiques** (theme-\*): douze accents sourds et leur teinte, un par thématique, sans violet ni jaune. Ils apparaissent seulement en pictogramme Ionicons outline sur sa teinte (tuile de 32pt, icône à 56%) sur les lignes du sommaire d'Explorer et les en-têtes de section.
- **Terre d'alerte** (negative, negative-soft, negative-pressed): uniquement le bouton de confirmation destructive (« Confirmer : effacer N votes »), negative-pressed pour son appui.

### Neutral

- **Papier froid** (paper): fond d'écran et fond des feuilles modales.
- **Feuille** (sheet): cartes, feuille de proposition, panneaux, barres d'onglets.
- **Encre douce** (ink-soft): descriptions et résumés en corps de texte.
- **Graphite** (graphite): marge de la feuille, lignes meta, notes sous le titre, icônes et libellés d'onglets inactifs, soulignement des liens.
- **Filet** (rule): bordures hairline des cartes, séparateurs, piste de progression, tôle du Classement, traits vides de la jauge de fiabilité.
- **Filet léger** (rule-soft): fond des champs, du contrôle segmenté, des badges et des avatars sans photo.
- **Bord de tôle** (board-edge): épaisseur basse de 5px de la tôle du Classement et pointillés de la tôle vide.
- **Appui** (pressed): état pressé des lignes, boutons secondaires et onglets.

### Mentions légales, Méthode et corrections

Écrans de texte secondaires (`legal-page.tsx`), ouverts depuis le pied de données : chevron retour, titre d'écran, une ligne de note, puis des sections à intertitre 17 semi-gras et paragraphes en corps 17/24, largeur 640 max. Le texte vient de `src/constants/legal.ts`, copié sur le site. Méthode et corrections finit par un lien souligné vers le ticket « Droit de réponse ».

### Named Rules

**The Reader's Highlighter Rule.** Le surligneur ne marque que ce que l'utilisateur a noté, dans la couleur qu'il a choisie. Le wordmark, les états, les issues parlementaires, les illustrations : jamais surlignés. Une marque posée ne change jamais de couleur.

**The Scale Is Yours Rule.** Les couleurs d'échelle n'expriment que les votes de l'utilisateur. Les issues parlementaires (Adoptée / Rejetée) et les positions des candidats (Pour / Contre / Abstention) s'écrivent en encre neutre sur filet léger.

**The Cold Paper Rule.** Le fond reste blanc froid (paper) et les cartes blanches (sheet). Pas de crème, pas de violet, pas de dégradé décoratif ; le seul `linear-gradient` du système est la technique du trait de surligneur web.

## Typography

**Display Font:** Literata (SemiBold 600, Bold 700), serif de lecture à empattements doux
**Body Font:** Atkinson Hyperlegible Next (Regular, Medium, SemiBold ; Bold est chargée mais aucun style `Type` ne l'utilise), lettres très distinctes, zéro marqué d'un point
**Annotation Font:** Caveat Bold, écriture manuscrite réservée au lecteur

**Character:** le cahier annoté : un titre imprimé (Literata), un texte qu'on lit sans effort (Atkinson), et la main du lecteur (Caveat) sur ses seules annotations. Les trois sont sous SIL OFL 1.1, sans nom réservé, auto-hébergées (`assets/fonts/`, licences à côté) : aucune requête tierce. Fichiers statiques, un par graisse (le SDK 57 ne lit pas les polices variables) ; `Type` donne une famille par graisse et aucun `fontWeight`. Sur le web, une police de secours (Georgia, pile système, cursive) le temps du chargement.

### Hierarchy

- **Display** (Literata 700, 34px, 40px): titre d'écran seulement (Voter, Classement, Lois, Explorer).
- **Headline** (Literata 600, 24px, 32px): titre de la proposition ou question du scrutin sur la feuille Voter.
- **Title** (600, 17px, 24px): titres de cartes et de lignes, libellés de boutons, intertitres de section, score d'un panneau.
- **Body** (400, 17px, 24px): descriptions, résumés, champ de recherche.
- **Label** (500 / 600, 13px, 18px): lignes meta, notes, compteurs, libellés d'onglets et de l'échelle.
- **Caps** (600, 13px, 0.4px, majuscules): libellé vertical de thématique dans la marge de la feuille, et en-têtes de section de la liste Lois. Rien d'autre.
- **Annotation** (Caveat 700, 22px, 26px): « Votre avis », « Votre vote », « Dernier vote ». Jamais sous 20, jamais plus de trois mots, jamais pour une donnée.

### Named Rules

**The Two Sizes Rule.** On lit en 17 et en 13. Le 34 est réservé au titre d'écran et le 24 au titre de la proposition.

**The Written Value Rule.** Une note s'écrit en toutes lettres avec son signe : Impossible −2, Contre −1, Pour +1, Parfait +2, avec le vrai signe moins (U+2212) ; « Je ne sais pas » s'écrit sans signe, en graphite. Chiffres, numéros et compteurs en chiffres tabulaires.

## Layout

Une colonne centrée de 720px max avec 16px de marge latérale, sur fond papier. Le rythme suit une grille de 8pt (4, 8, 16, 24, 32) ; les intertitres de section prennent 24px au-dessus. Les cibles tactiles font 44pt au minimum (48 sur Android) ; les boutons de l'échelle de vote 60pt de haut.

L'en-tête d'écran aligne le grand titre à gauche et un accessoire à droite (sur Voter, le compteur « 23 sur 108 » en chiffres tabulaires), suivi d'une piste de progression de 2px (filet, remplissage encre).

Seule la feuille de proposition de Voter porte une marge : une colonne de 48px séparée du corps par un filet graphite de 1px, avec le numéro (P-024), le pictogramme de thématique et le libellé vertical de la thématique. Toutes les autres cartes (Lois, Explorer, récapitulatif, fiche candidat) n'ont pas de colonne de marge : le numéro, le statut et la thématique tiennent sur une ligne meta graphite sous le titre, séparés par « · ».

Les listes de propositions sont des groupes de lignes blanches à filets hairline, arrondis à 14px en haut et en bas du groupe. Le Classement range ses panneaux en 3 colonnes sous 560px de largeur utile, 4 au-delà, avec 8px d'écart.

Navigation : onglets natifs en iOS et Android ; sur le web, une barre du bas sous 900px et une barre du haut à partir de 900px.

### Named Rules

**The Margin Belongs to the Sheet Rule.** La marge large n'existe que sur la feuille Voter (48px). Ailleurs, la référence passe dans la ligne meta graphite sous le titre.

## Elevation & Depth

Le cahier est plat. La profondeur se lit dans le contraste papier / feuille, les bordures hairline au filet et l'état pressé. Deux exceptions mesurées : le segment sélectionné du contrôle segmenté porte une ombre de contact très légère, et la tôle du Classement a une épaisseur basse de 5px au bord de tôle. Les feuilles modales posent un voile d'encre à 32% (`rgba(28, 30, 33, 0.32)`) hors iOS, où la feuille native pageSheet s'en charge.

### Shadow Vocabulary

- **Contact de segment** (`0 1px 3px rgba(0, 0, 0, 0.08)`, elevation 1 sur Android): uniquement le segment sélectionné.

### Named Rules

**The Flat Notebook Rule.** Les cartes, feuilles et panneaux n'ont pas d'ombre. On sépare au filet, pas à l'ombre.

## Shapes

Des coins doux et retenus : 14px pour les feuilles et cartes, 12px pour les boutons, champs, contrôles et niveaux de vote, 6px pour les badges et la tôle, 8px pour la tuile de pictogramme. Les panneaux électoraux sont presque carrés (2px) avec un carré de rang de 28px sans arrondi collé dans l'angle haut gauche, comme une affiche numérotée. Les avatars sont des disques. Les bordures sont hairline au filet ; seuls le filet de marge (1px graphite), la bordure du niveau de vote choisi (2px, couleur d'échelle) et l'indicateur d'onglet (2px encre) sont plus épais.

## Components

### Buttons

Sobres et nets, comme un bouton de formulaire bien fait.

- **Shape:** coins doux (12px), hauteur minimale 44pt, 16px de marge interne, icône Ionicons de 18px facultative avec 8px d'écart.
- **Primary:** encre pleine, texte blanc, pour l'action unique d'un état (« Continuer à voter »).
- **Secondary (défaut):** feuille blanche, bordure 1px filet, texte encre.
- **Quiet:** sans fond ni bordure, texte encre.
- **Danger:** fond terre pâle, bordure et texte terre ; n'apparaît qu'au second appui de « Réinitialiser mes votes », sans modale, retombe après 4s.
- **Pressed / Disabled:** fond qui passe à l'appui (encre douce pour le primaire, appui pour les autres) ; désactivé à 45% d'opacité. Focus web : anneau encre 2px décalé de 2px.

### Chips

- **Badge:** étiquette plate, texte 13 semi-gras sur aplat, sans icône ni bordure (2px 8px, 6px). Les positions de candidat s'écrivent en encre sur filet léger.
- **Sommaire d'Explorer:** une ligne par thème sur le papier, filets hairline : pictogramme 32pt, titre 17 semi-gras, points de conduite gris filet, compteur « votées/total » tabulaire (surligné quand le thème est entièrement voté), description 13 graphite sur une ligne. Pas de puces horizontales.

### Cards / Containers

- **Corner Style:** 14px.
- **Background:** feuille blanche sur papier.
- **Shadow Strategy:** aucune (voir Elevation & Depth).
- **Border:** hairline au filet.
- **Internal Padding:** 16px ; la feuille de proposition prend 24px (16px côté marge).
- **Carte de loi:** titre en 17 semi-gras, ligne meta « L-28 · Adoptée · Thématique » en graphite avec le statut en encre semi-gras, seconde ligne nature · chambre · date, résumé sur deux lignes, bascule « Positions » sur fond papier qui déroule les positions des candidats.

### Inputs / Fields

- **Style:** fond filet léger, sans bordure, 12px, hauteur 44pt, loupe graphite 18px, texte encre en 17.
- **Focus:** pas d'anneau propre au champ ; curseur encre.
- **Contrôle segmenté:** piste filet léger à 3px de marge, segment choisi sur feuille blanche avec l'ombre de contact, libellé 13 encre semi-gras ; les autres en graphite. Compteurs en chiffres tabulaires.

### Navigation

- **Icônes:** un seul jeu au trait dans le style Ionicons outline (grille 512, trait 32, bouts et angles arrondis, coins de 16, aucun aplat) : Voter, un surligneur à pointe biseautée qui signe une vague (le geste de l'app ; l'urne ressemblait au podium de Classement) ; Classement, le podium d'Ionicons ; Lois, une balance ; Explorer, la bibliothèque d'Ionicons. Sources SVG dans `assets/icons/tabs/`, PNG 1x à 3x générés par `scripts/build-tab-icons.mjs` pour les onglets natifs, SVG sur le web ; toujours teintés (encre actif, graphite inactif).
- **Natif:** onglets système sur feuille blanche avec les icônes du jeu commun (image modèle teintée), teinte encre, icônes et libellés inactifs graphite, indicateur Android au filet léger.
- **Web:** barre blanche de 56pt séparée par un filet hairline, en bas sous 900px (icône 22px au-dessus du libellé), en haut à partir de 900px (icône 18px à côté du libellé). L'onglet actif passe en encre semi-gras avec un trait de 2px (au-dessus en bas d'écran, en dessous en haut d'écran). Sur grand écran, le wordmark « ÉLIRE » est du texte seul en 17 semi-gras encre, sans jaune.

### Feuille de proposition (signature)

La page du cahier : marge de 48px (numéro en 13 graphite tabulaire, pictogramme de thématique, libellé vertical en capitales graphite), filet graphite de 1px, puis le corps (titre en 24 semi-gras, citation en 17 encre douce, « En savoir plus » sous un filet). « En savoir plus » (13 semi-gras encre souligné graphite, chevron graphite de 16px, sous un filet hairline, 44pt de haut) est fermé par défaut et déplie sur place, en fondu de 180ms, le glossaire puis le contexte en 17 encre douce. Le glossaire ne reprend que les sigles présents sur la feuille : bloc papier à coins de 12 et 12px de marge, intitulé « Glossaire » en 13 semi-gras graphite, une entrée par sigle en 13 encre douce avec le sigle en semi-gras encre. Sans sigle, seul le contexte s'affiche. Aucun lien vers la source dans Voter : elle trahirait l'auteur. Sous la feuille, la rangée de vote.

### Palier et bilan

Sous le titre d'écran de Voter, le prochain palier, jamais le total, en 13 graphite avec le chiffre en encre, sur un filet de 2px qui se remplit d'encre : « **4** votes avant votre Classement », puis, Classement ouvert, « **7** votes avant le prochain bilan · 9 candidats classés sur 17 » (le filet repart à zéro après chaque bilan). Avant le premier vote, une phrase en 13 encre douce donne la durée (environ 20 secondes par question, Classement en 3 à 5 minutes) et rappelle qu'on peut s'arrêter.

À chaque dizaine d'avis (« Je ne sais pas » ne compte pas), la feuille laisse place au bilan, feuille blanche à filet : 24px de marge, coins de 14, apparition en fondu de 220ms. Dans l'ordre : le titre 24 Literata (« Votre Classement est ouvert, mais encore fragile. », puis « 20 votes : votre Classement s'affine. », ou « N votes : les N candidats sont classés. ») ; la moyenne de propositions notées par candidat en 17 encre douce, le chiffre en semi-gras encre (« il en faut 2 pour le classer, et 5 éléments pour un score fiable ») ; une rangée de petits panneaux anonymes, un par candidat (sur deux lignes à 25) (16 × 22, coins de 2, cerclés de graphite 1px, 4px d'écart), remplis d'encre par le bas selon la fiabilité (un tiers fragile, deux tiers assez sûr, plein fiable ; un tiers en filet pour une seule note ; vide sans note), triés du plus au moins rempli ; la légende « 10 candidats classés sur 25 · 5 scores fiables » en 13 graphite tabulaire ; la promesse en 17 (« Dix questions de plus, environ 3 minutes, et votre score devient plus fiable. ») ; « 10 questions de plus » en primaire, « Voir le Classement » en secondaire ; la phrase de pause en 13 graphite.

### Rangée de vote (signature)

Quatre niveaux égaux en ligne, 4px d'écart, 60pt de haut, feuille blanche à bordure filet : le signe en 17 semi-gras dans sa couleur d'échelle, le libellé en 13 encre dessous (12 sous 380pt de large pour que « Impossible » tienne). Le niveau choisi prend une bordure de 2px dans sa couleur d'échelle. Dessous, à 8px, pleine largeur et 44pt de haut, « Je ne sais pas » en 13 semi-gras encre, sans signe ; choisi, il prend une bordure encre de 2px. Ce n'est pas un niveau : il ne compte pas, n'est pas surligné et le titre n'est pas balayé.

### Feuille de scrutin

La même feuille que la proposition : marge avec le numéro (L-12) et la thématique, la `question` en titre 24, une ligne meta graphite « Scrutin réel · chambre · année », puis « En savoir plus » (glossaire et `enjeu`). Le titre officiel et le résultat n'apparaissent qu'après le vote. Sous la feuille, « Votre vote » et le nombre de candidats qui ont voté ce texte.

### Rangée de scrutin

Trois choix égaux (Contre, Abstention, Pour), 8px d'écart, 60pt de haut, feuille blanche à bordure filet, coins de 12, libellé en 17 semi-gras dans sa couleur d'échelle (terre cuite, graphite, vert correcteur). Après le vote, le choix garde sa bordure de 2px et les deux autres passent à 45%.

### Hémicycle (signature)

Le seul moment animé du vote sur un scrutin. Un arc de 264px de large (rayon 112) avec des points de 20px, un par candidat qui a voté le texte, sans nom, rangés comme vous, abstention, puis à l'inverse : plein au surligneur du lecteur avec contour encre de 1.5px (comme vous), feuille blanche à contour encre de 1.5px (à l'inverse), filet léger à contour graphite de 1px (abstention). Les points partent de la place du lecteur, « Vous · » suivi de son vote en couleur d'échelle, au centre de la base (filet hairline), arrivent en 420ms (ease-out exponentiel, 45ms d'écart, échelle de 0.6 à 1), puis le surligneur les remplit en 180ms. Une légende textuelle en 13 encre (pastilles de 12px) donne les comptes, la forme suffit sans la couleur. Si le lecteur s'abstient, la légende dit seulement « Abstention : ce texte ne change aucun score. » L'écran défile jusqu'à l'hémicycle, puis le titre officiel et le résultat (adopté ou rejeté) ; la suite part seule au bout de 5 s, comme après une proposition, avec un filet encre de 2px qui se remplit sous « Question suivante » (bouton primaire, pour aller plus vite). Avec un lecteur d'écran (natif), rien ne part seul. Animations coupées par « Réduire les animations ».

### Trait de surligneur (signature)

Le titre d'une proposition ou d'un scrutin voté porte le trait de son surligneur partout où il est cité (dernier vote sur Voter, Explorer, récapitulatif, fiche candidat, Lois).

Le geste du vote, en environ 1 s : (1) un trait de surligneur traverse le bouton choisi, toujours de gauche à droite, avec une forme tirée à chaque vote : droit, diagonal, ondulé ou diagonal ondulé, hauteur et épaisseur variables, et une fois sur quatre il dépasse du bouton (220ms, `ButtonStroke`, tracé SVG `react-native-svg` dessiné par `strokeDashoffset`, sous le texte ; formes dans `src/lib/stroke.ts`, testées) ; (2) le trait balaie le titre de la feuille ligne après ligne (260ms, `SweepText`, CSS `[data-sweep]` sur le web) ; (3) la feuille remonte de 56px en s'effaçant (320ms) vers « Dernier vote », dont le trait balaie le titre (220ms) ; (4) la feuille suivante arrive en fondu (220ms). Le vote est enregistré dès le clic, les boutons sont bloqués pendant la séquence, le lecteur d'écran annonce « Vote enregistré : … ». Sur un scrutin, l'hémicycle s'intercale entre (2) et (3). Avec « Réduire les animations », pas de séquence : état final direct.

### Sélecteur de surligneur

Quatre options (Jaune, Rose, Vert, Bleu) en grille 2 × 2 avec 8px d'écart, feuille blanche à bordure filet, coins de 12, 56pt de haut (60 sur Android), 16px de marge interne : un trait de 40 × 14px aux coins de 3, posé de biais (−6°) dans la teinte native du surligneur (70%), puis le nom en 17. L'option choisie prend une bordure encre de 2px et son nom en semi-gras. Il apparaît à la fin de l'onboarding et sous « Votre surligneur » dans Classement.

### Panneau électoral (signature)

Le même mobilier pour chaque candidat, seul le score change : panneau blanc presque carré, carré de rang encre de 28px dans l'angle (filet léger avec « – » hors classement), avatar de 56px, nom en 13 semi-gras, parti en graphite, score en 17 semi-gras tabulaire en bas, base « ex æquo, sur N votes » en graphite ; sans score, « Pas encore évalué » en 13 graphite. Les panneaux sont posés sur une tôle au filet (8px de marge, 6px, épaisseur basse 5px).

**Jauge de fiabilité :** sous la base du score, trois traits de 4px (6, 9 et 12px de haut, 2px d'écart, coins de 1), vides au filet et remplis d'encre selon le niveau (fragile 1, assez sûr 2, fiable 3), puis le niveau en 13 graphite à 6px. Lisible sans la couleur, la même sur chaque panneau ; absente tant que le candidat n'est pas classé. Sur la fiche, la même jauge suivie de son détail (« sur 5 propositions et 1 scrutin : assez de votes pour comparer »).

**Candidature sur la fiche :** sous la biographie, un lien souligné en 13 semi-gras vers la source de la candidature, avec son statut et sa date (« Candidature déclarée le 22 mai 2026 », « désignée par son parti », « annoncée sous condition », « pressentie, pas encore déclarée »).

### Crédits

Écran secondaire, ouvert depuis le pied de données, avec un chevron retour de 26px encre. Deux groupes de lignes blanches à filets hairline, coins de 14 : les portraits (avatar de 40px, nom en 17 semi-gras, auteur · licence en 13 graphite), puis, sous l'intertitre « Polices et icônes », Literata, Atkinson Hyperlegible Next et Caveat (nom · rôle, auteur · SIL OFL 1.1) et Ionicons (MIT). Lignes de 64pt minimum, icône de lien externe graphite de 16px à droite quand une source existe.

### Named Rules

**The Identical Furniture Rule.** Tous les candidats ont le même panneau, la même taille et la même place. Deux scores égaux partagent le même rang (« ex æquo ») et leur ordre est tiré au hasard à chaque lancement.

## Do's and Don'ts

### Do

- **Do** réserver le surligneur aux propositions et scrutins que l'utilisateur a votés, dans la couleur de chaque marque, sur toutes les surfaces qui les citent.
- **Do** écrire chaque note en toutes lettres avec son signe (Impossible −2 à Parfait +2), dans sa couleur d'échelle.
- **Do** écrire les positions des candidats et les issues parlementaires en encre neutre, sur filet léger pour les badges.
- **Do** mettre le numéro stable (P-xxx, L-xx), le statut et la thématique dans une ligne meta graphite sous le titre des cartes de liste.
- **Do** garder la lecture en 17 et 13, et réserver 34 au titre d'écran et 24 au titre de la proposition.
- **Do** séparer au filet hairline et garder les cartes sans ombre.
- **Do** donner 44pt minimum à chaque cible (48 sur Android).

### Don't

- **Don't** utiliser une couleur de surligneur ailleurs que sur une marque de l'utilisateur, wordmark compris ; ne jamais recolorer une marque déjà posée.
- **Don't** colorer un résultat parlementaire ou une position de candidat avec l'échelle de vote ou en vert / rouge.
- **Don't** ajouter une colonne de marge aux cartes de liste : la marge de 48px appartient à la feuille Voter.
- **Don't** différencier les panneaux du Classement (taille, couleur, mise en avant du premier).
- **Don't** utiliser de crème, de violet ou de dégradé décoratif.
- **Don't** poser de capitales en surtitre au-dessus d'un titre ; les capitales servent au libellé vertical de marge et aux en-têtes de section de Lois.
- **Don't** évoquer un site gouvernemental, une appli gamifiée ou des cartes à swiper.
