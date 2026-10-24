# Enjeux communs, type de source et programme complet

Demandes du 2026-10-24. Branche à créer depuis `feat/updates` (gros lot, données et code).

Légende : **[Danny]** = demandé tel quel, **[Proposition]** = ma proposition, pas encore validée, **[À trancher]** = Danny décide avant la suite, **[Décidé]** = validé ensemble, **[Fait]** = dans le code.

## 0. Pourquoi

**[Danny]** Trop de questions se ressemblent dans Voter, et certaines ne viennent peut-être pas d'un programme. But premier : plus de doublons.

Ce qu'on trouve aujourd'hui dans les 194 propositions (relevé du 2026-10-24, titres seuls) :

| Sujet | Propositions proches | Opposées |
| --- | --- | --- |
| Nouveaux réacteurs nucléaires | am-1, ep-2, ez-7, fro-2 | |
| Éolien | am-1, ep-2 (développer) | fp-4, mlp-7 (démanteler) |
| Référendum d'initiative citoyenne | fa-3, fp-2, mlp-5, nda-2, ob-3 | |
| Quitter l'OTAN | fa-2, fro-7, jl-8, jlm-6 | |
| Hausse du budget de la défense | db-3, ez-8, kb-2, rg-1 | sl-3 (le réaffecter) |
| Impôt sur la fortune | fr-5, mt-7, nda-6, rg-2 | |
| Âge de la retraite | ep-1, xb-3 (reculer) | jlm-3 (60 ans) |
| Régulariser les sans-papiers | ak-4, na-6, sl-4 | ep-8 (diviser l'immigration) |
| Prix minimums agricoles | fr-4, fro-4, jl-1, jlm-4, rg-7 | |
| Pas de normes au-delà de l'Europe | dl-8, ga-6, kb-7, xb-7 | |
| Chefs d'établissement qui recrutent | dl-3, ep-3, ob-6 | |
| Peines planchers | br-1, ep-7, mlp-1 | |
| Logement social | fro-5, jlm-5 | ez-5 (supprimer le quota SRU) |

Ordre de grandeur : 194 questions de propositions pourraient tomber vers 140 à 150. Relevé à refaire par le script (lot 3).

## 1. Lots

| Lot | Sujet | État |
| --- | --- | --- |
| 1 | Type de source sur chaque proposition | [Décidé] |
| 2 | Statut du programme de chaque candidat | [Décidé] |
| 3 | Script de détection des doublons et opposés | [Décidé] |
| 4 | Données : `data/enjeux.json` et règles de rédaction | [Décidé] |
| 5 | Score : un enjeu compte comme un scrutin | [Décidé] |
| 6 | Voter : carte enjeu aux 4 surligneurs, détail après le vote, astuce | [Décidé] |
| 7 | Explorer, fiche, récapitulatif : les noms | [Décidé] |
| 8 | Réinitialisation des votes (store v4) | [Décidé] |
| 9 | Documentation | à faire |

Les lots 1 et 2 sont indépendants et peuvent partir avant le reste.

---

## 2. Lot 1 : type de source

**[Décidé]** Étiquette visible, même poids dans le score. Affichée dans « En savoir plus » pendant le vote à l'aveugle.

**[Proposition]**

- Nouvelle colonne CSV `type_source`, obligatoire :
  - `programme_2027` : programme ou site de campagne 2027 ;
  - `programme_anterieur` : programme d'une élection passée (2022, 2024) ;
  - `prise_de_position` : interview, discours, article, réseau social, communiqué, et aussi un acte de ministre (circulaire), pour ne pas trahir l'auteur.
- Libellés : « Programme 2027 », « Programme précédent », « Prise de position ».
- Affichée aussi dans Explorer, la fiche et le détail d'une proposition.
- Le build bloque si la colonne manque ou est inconnue.
- Remplissage des 194 lignes : une passe du skill `verifier-donnees`, qui confirme au passage qu'une mesure dite « de programme » y figure bien.

## 3. Lot 2 : statut du programme

**[Danny]** Noter si on a le programme complet ou pas.

**[Proposition]** Dans `data/candidats.json` :

```json
"programme": { "statut": "complet", "titre": "Programme 2027", "url": "https://...", "date": "2026-09-12" }
```

- `complet` : document de programme 2027 publié en entier par le candidat.
- `partiel` : premières mesures, dépliant, site en cours.
- `aucun` : pas de programme 2027, mesures tirées d'un programme antérieur ou de prises de position (`url` et `date` absents).
- Affiché sur la fiche candidat (une ligne sous la biographie) et en colonne du tableau du README.

**[Décidé]** Même nombre de questions pour tous : un programme complet ne donne pas plus de questions.

**[Décidé]** Avec un programme complet, on choisit les 8 **mesures phares** du candidat ; on ne les lie à un enjeu que si ça tombe juste. Le programme complet sert à vérifier et à mieux rédiger, pas à multiplier.

## 4. Lot 3 : script de détection

**[Danny]** Un script pour trouver les propositions qui vont ensemble ou en face. Obsidian, Gortex ?

**[Décidé]** Script et relecture. Obsidian relie des notes à la main et Gortex analyse du code : aucun ne comprend le sens d'une phrase. Les embeddings trouvent les sujets proches mais confondent « construire » et « fermer » des réacteurs : relecture obligatoire quand même, pour une dépendance lourde.

**[Proposition]** `scripts/find-enjeux.mjs`, sans dépendance :

1. Par thème (12 thèmes, 9 à 22 propositions chacun), sur titre et citation.
2. Normalise : minuscules, sans accents, sans mots vides, racine courte (« réacteurs » et « réacteur »).
3. Similarité de mots entre chaque paire (cosinus TF-IDF), au-dessus d'un seuil réglable.
4. Signale les verbes opposés dans une paire proche : créer / supprimer, construire / fermer, augmenter / baisser, développer / arrêter, rester / quitter, autoriser / interdire, rétablir / abolir.
5. Écrit un rapport `docs/enjeux-candidats.md` : groupes proposés, score, « proches » ou « opposés ».
6. Ignore les propositions déjà liées à un enjeu.

Ensuite, le skill `collecter-donnees` (nouvelle section « Enjeux ») trie le rapport et propose les enjeux ; **Danny valide** chaque enjeu avant qu'il entre dans `data/enjeux.json`. À relancer à chaque ajout de propositions.

## 5. Lot 4 : données

**[Décidé]** Une question neutre, liée à chaque candidat qui a pris position, pour ou contre, comme un scrutin.

**[Proposition]** Les CSV ne changent pas : chaque proposition reste la position sourcée d'un candidat. Nouveau fichier `data/enjeux.json` :

```json
{
  "id": "nouveaux-reacteurs",
  "thematiqueId": "environnement",
  "question": "Construire de nouveaux réacteurs nucléaires",
  "enjeu": "Ce que tranche la question, sans nom ni chiffre propre à un candidat.",
  "positions": [
    { "propositionId": "prop-fro-2", "sens": "pour" },
    { "propositionId": "prop-ez-7", "sens": "pour" }
  ]
}
```

Règles (dans `CONTRIBUTING.md`, vérifiées par le build) :

- **Pour ou contre seulement** **[Décidé]** : pas de « modéré ». Les écarts (14 ou 20 réacteurs) se lisent dans le détail de chaque position.
- **Contre** seulement si la proposition dit explicitement l'inverse (supprimer, quitter, démanteler). Ne rien dire n'est jamais une position : on ne déduit rien d'un silence.
- **Une proposition dans un enjeu au plus**, jamais deux : sinon une même citation compterait deux fois pour son auteur.
- **Au moins 2 positions**, de 2 candidats différents ; une proposition seule reste une question seule, comme aujourd'hui.
- **Une idée par proposition** : une proposition double (am-1 « nucléaire et éolien », mlp-5 « RIC et proportionnelle ») est d'abord réécrite sur une idée (règle 7 de `CONTRIBUTING.md`), sinon elle reste seule.
- **Question** : mêmes règles que `question` d'un scrutin (130 caractères, anonyme, sans sigle hors glossaire).
- **Sens de la question** : formulée comme le changement que propose le plus de candidats ; à égalité, le changement par rapport à la situation actuelle. **[Proposition]**, pour ne pas choisir le sens selon un camp.
- **Numéro stable** : `E-12`, géré par le build dans `refs.json`, repris par « Signaler une erreur ».
- Build : enjeu inconnu, proposition introuvable ou déjà liée, moins de 2 candidats, glossaire : bloquant.

## 6. Lot 5 : score

**[Danny]** Une seule question qui donne des points à l'un et en retire à l'autre. Mathématiquement possible ?

**Oui, c'est le calcul des scrutins.** Ma note `v` (-2..+2) sur l'enjeu donne `v` au candidat « pour » et `-v` au candidat « contre ». Exemple : « Parfait » (+2) sur « Développer l'éolien » donne +2 à qui le propose, -2 à qui veut démanteler.

- Une question seule d'aujourd'hui est un enjeu à une seule position « pour » : un seul calcul pour tout (`src/lib/scoring.ts`, testé).
- Chaque position compte pour 1 élément de fiabilité, comme aujourd'hui : chaque candidat garde ses 8 positions, donc la même chance d'être fiable.
- « Je ne sais pas » sur un enjeu : rien pour personne.
- Classé à partir de 2 positions votées, sans changement.
- `npm run simulate:scoring` à étendre : vérifier qu'un candidat présent dans beaucoup d'enjeux n'est pas avantagé ou desservi (docs/simulations).

## 7. Lot 6 : Voter

**[Danny]** Un affichage différent du scrutin : une carte dessinée au surligneur, qui montre que le vote est « multi-candidat ». Une nouvelle astuce pour l'expliquer.

**[Décidé]**

- **Cadre aux 4 surligneurs**, tracé à la main à l'arrivée (comme la fête « cadre » : quatre côtés de quatre couleurs qui dépassent aux coins). Toujours 4 traits : le dessin ne dit pas combien de candidats sont concernés avant le vote.
- Exception à la règle du surligneur, à écrire dans `DESIGN.md` comme le logo et le tuto : un dessin fixe, pas une marque.
- **Après le vote, anonyme** : « 3 pensent comme vous, 2 à l'inverse », puis chaque position sans nom (« Une mesure : « Construire 20 réacteurs (EPR) » »), son type de source et « comme vous » ou « à l'inverse ».
- **Les noms en fin de série** (récapitulatif), dans Explorer et sur la fiche, jamais juste après le vote.
- **Astuce** `premier-enjeu` dans `src/constants/tutos.json` (`ecran: voter`, `quand: enjeu`), sur le cadre : « Cette question réunit plusieurs candidats : votre note compte pour chacun, dans un sens ou dans l'autre. »

**[Proposition]**

- Même échelle que les propositions (Impossible à Parfait, « Je ne sais pas ») : on juge une idée, pas un texte voté.
- Fond papier comme une proposition (le gris froid reste aux scrutins).
- Ordre de passage (`src/lib/shuffle.ts`) : un enjeu compte dans le tour de chacun de ses candidats ; jamais deux enjeux de suite ; si possible, deux questions qui se suivent ne partagent aucun candidat.
- Progression et bilans (`src/lib/progress.ts`) : comptent des questions, plus des propositions ; `allVoted()` inclut les enjeux.
- « Réduire les animations » : cadre posé d'un coup.

## 8. Lot 7 : Explorer, fiche, récapitulatif

**[Proposition]**

- Explorer : un enjeu s'affiche comme une carte de groupe, avec la question, puis chaque candidat, sa position (pour, contre) et sa mesure.
- Fiche candidat : la proposition porte « Question partagée avec 3 candidats », qui ouvre l'enjeu.
- Récapitulatif de fin de Voter : l'enjeu avec les noms, mon vote modifiable à la gomme.
- Lois : pas de changement.

## 9. Lot 8 : votes existants

**[Décidé]** On réinitialise tous les votes une fois (store `version: 4`) : 3 testeurs seulement, phase de test. Message au lancement : « Les questions ont changé : vos votes repartent de zéro. »

Ce choix vaut pour cette version seulement : après la sortie publique, une migration propre convertira les votes.

## 10. Lot 9 : documentation

- `CONTRIBUTING.md` : colonne `type_source`, `programme` des candidats, règles des enjeux.
- `DESIGN.md` : carte enjeu et exception au surligneur.
- `PRODUCT.md` et `README.md` : questions communes, type de source, statut du programme.
- Skills `collecter-donnees` et `verifier-donnees` : enjeux et type de source.

## Ce qui reste au builder

- Seuil de similarité du script, à régler sur le relevé du § 0.
- Animation exacte du cadre, à partir de la fête « cadre » (`celebration.tsx`).
- Mise en page du détail après le vote.

## À vérifier à la main

- Un enjeu « pour / contre » : « Parfait » monte l'un et descend l'autre dans le Classement.
- Aucun nom ni indice d'auteur sur la carte enjeu ni juste après le vote.
- Chaque candidat a toujours 8 positions au plus, et le même nombre que les autres.
