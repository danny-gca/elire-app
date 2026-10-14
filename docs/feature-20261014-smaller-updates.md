# Spécifications : Améliorations UX et retours d'utilisation

Document de synthèse regroupant les changements à apporter, ordonnés par écran et composant d'impact.

---

## 1. Écran de Vote (`src/app/(tabs)/index.tsx`)

### 1.1 En-tête et identité de l'écran

- **Renommage de l'écran** : Remplacer l'intitulé "Voter" par "élire" dans le header et la navigation (`_layout.tsx`), ou intégrer le logo "é".
- **Sélecteur de surligneur dans l'en-tête** : Ajouter un sélecteur compact de couleur de surligneur (`MarkerPicker`) en haut à droite du titre, via la prop `accessory` de `ScreenHeader` (comme sur le website)

### 1.2 Cartes de vote (`PropositionSheet`, `LoiBallot`)

- **Allègement du contenu textuel** :
  - N'afficher que le premier paragraphe / titre de la mesure sur la carte principale.
  - Déplacer la citation textuelle complète dans le volet "En savoir plus" (`MoreInfo`).
  - Objectif : réduire la hauteur de la carte pour rendre les boutons de vote immédiatement visibles sans défilement.
- **Scrutins parlementaires immersifs** :
  - Différencier visuellement la carte d'un scrutin réel par rapport à une proposition de programme.
  - Mettre en place une carte spécifique ou un contour animé continu sobre pour signifier l'importance du vote parlementaire.

### 1.3 Comportement du compte à rebours de passage automatique

- **Annulation au geste de l'utilisateur** :
  - Sur l'écran de révélation d'un scrutin (après le vote, pendant l'affichage de l'hémicycle), annuler immédiatement le compte à rebours de 5 secondes si l'utilisateur touche l'écran ou fait défiler la page (`onScroll` ou geste tactile).

### 1.4 Bandeau "Dernier vote"

- **Apparition temporaire** : Remplacer l'affichage persistant actuel par une apparition temporaire minutée avec un indicateur linéaire de progression/disparition.
- **Format compact sur une seule ligne** : Regrouper sur une ligne unique :
  `[Dernier vote] [Titre tronqué] [+2 Parfait] [Icône gomme pour éditer]`

---

## 2. Écran Lois (`src/app/(tabs)/lois.tsx` & `src/components/loi-card.tsx`)

### 2.1 Lisibilité du vote utilisateur

- Remplacer le texte brut "Votre vote : pour" par un surlignage dynamique reprenant la couleur active du surligneur de l'utilisateur.

### 2.2 Navigation et consultation des scrutins

- **Affichage modale / sheet** : Remplacer l'accordéon actuel par l'ouverture d'une feuille dédiée (`Sheet`), à l'image des propositions.
- **Allègement de la liste** : Réduire les détails affichés dans chaque carte de la liste au profit de la feuille détaillée.
- **Harmonisation des libellés** : Améliorer l'affichage de "vote personnel a voté pour" jugée trop longue (et sur deux lignes) et discordante avec le reste de l'application.

### 2.3 Édition rapide du vote

- Ajouter une icône de gomme sur les scrutins déjà votés pour permettre la modification directe du vote depuis la liste ou la fiche. (réutiliser la même gomme que sur dernier vote)

---

## 3. Écran Explorer & Fiches Thématiques (`src/app/(tabs)/explore.tsx`, `src/app/theme/[id].tsx`)

### 3.1 Édition du vote existant

- Ajouter une icône de gomme (la même que les autres) / action directe sur les propositions déjà votées pour modifier son choix sans devoir repasser par le flux principal de vote.
- Intégrer la possibilité de modification directement dans la feuille de détail (`PropositionDetail`).

---

## 4. Fiche Candidat (`src/app/candidate/[id].tsx`)

### 4.1 Lisibilité des compteurs d'onglets (`SegmentedControl`)

- Dans le sélecteur d'onglets ("Programme 2027 5", "Votes au Parlement 8"), styliser les chiffres pour les rendre plus lisibles : pastille surlignée.

### 4.2 Consultation des scrutins du candidat

- Permettre d'ouvrir les détails d'un scrutin parlementaire dans une feuille modale dédiée (`Sheet`), comme c'est déjà le cas pour les propositions du programme.
- Alléger la carte de scrutin intégrée à la fiche candidat.

---

## 5. Composant de Feuille Modale (`src/components/ui/sheet.tsx`)

### 5.1 Fermeture par glissement vers le bas (Swipe-to-dismiss)

- Implémenter le geste de glissement vers le bas pour fermer la feuille sur Android et Web (actuellement natif sur iOS sous `presentationStyle="pageSheet"`).
- Harmoniser le comportement sur toutes les modales de l'app (détail de proposition, détail de scrutin, modification de vote).

---

## 6. Algorithme de Classement & Départage (`src/lib/scoring.ts`, `src/app/(tabs)/results.tsx`)

### 6.1 Analyse critique : Pourquoi le tri alphabétique est à proscrire

- **Alerte Neutralité** : Classer les candidats ex aequo par ordre alphabétique favorise systématiquement les candidats dont le nom commence par les premières lettres (ex. Arthaud, Attal) au détriment des derniers (ex. Roussel, Zemmour).
- Cela violerait directement le principe fondateur d'ÉLIRE : la neutralité républicaine absolue garantie dans `PRODUCT.md` et `README.md`.

### 6.2 Ordre de départage recommandé

1. **Score d'accord principal** (% décroissant).
2. **Niveau de fiabilité et volume de données** : en cas d'égalité de score, classer en avant le candidat ayant le plus d'avis enregistrés ou la meilleure fiabilité (`reliability` / `evidence`).
3. **Égalité totale stricte** : maintien d'un tirage aléatoire équitable fixé par session (`tieOrder`), sans privilège alphabétique.

### 6.3 Partage sur les réseaux sociaux (`src/app/(tabs)/results.tsx`)

- Permettre de partager une image propre du classement (carte récapitulative avec les panneaux ou scores).
- Pouvoir partager son classement réel en montrant tout ou, si on veut être plus discret, seulement le nombre de questions répondues avec une phrase du style "Je peux faire mon avis grâce à élire" + score de fiabilité par exemple.
- Intégrer un lien vers l'application citoyenne pour inciter au vote.

---

## 7. Données & Glossaire (`data/glossaire.json`)

### 7.1 Suppression du doublon

- Corriger le doublon identifié dans le glossaire : présence simultanée de `"BFM": "BFMTV"` et `"BFMTV": "BFMTV"`.
- Conserver une seule définition claire pour éviter l'affichage redondant "BFMTV : BFMTV".
- Vérifier et corriger d'autres elements du glossaire si nécessaire

---

## 8. Identité Visuelle & Logo (`assets/brand/mark.svg`)

### 8.1 Refonte du logo

- Remplacer le logo actuel par un « é » minuscule manuscrit (style plume, cahier d'écolier, cohérent avec l'univers papier/encre).
- renommer aussi sur le website le nom de l'app "élire" en minuscule et dans les readme et mentions légales.
