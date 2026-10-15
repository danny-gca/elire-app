# Simulations du score

Pourquoi le score est calculé comme il l'est. Chaque fichier `score-AAAA-MM-JJ.json` est le résultat brut d'une simulation, reproductible :

```bash
npm run simulate:scoring   # 25 000 lecteurs, graine 2027
```

Le script est `scripts/simulate-scoring.ts`. La méthode « retenue » appelle le vrai code de l'app (`src/lib/scoring.ts`) ; les autres méthodes sont recalculées dans le script pour comparer.

## La question (2026-10-15)

Un candidat qui n'a jamais siégé (nouveau parti, jamais élu) n'a pas de votes au Parlement. Est-il désavantagé ?

Rappel du calcul : chaque vote rapporte de −2 à +2 ; le score ramène le total entre 0 et 100 % (`(points + maximum) / (2 × maximum)`). Sans scrutin, le score est celui du programme seul : pas de point en moins. Mais deux effets indirects existaient :

1. **Les égalités** : à score égal, le candidat avec le plus de votes passait devant. Un député a ses scrutins en plus de ses propositions : il gagnait presque toutes les égalités.
2. **Le poids du Parlement** : au nombre de votes, 4 propositions et 20 scrutins donnaient 83 % du score aux votes passés. Un sortant était jugé surtout sur ses actes, un nouveau venu sur ses promesses.

## Les lecteurs simulés

- Chacun note 45 propositions et répond à 15 scrutins, tirés au hasard (environ 60 votes).
- **Test 1, lecteur d'accord avec un candidat X** : il note les propositions de X à +2 ou +1, vote comme X sur ses scrutins, et au hasard ailleurs. On compte combien de fois X sort n°1.
- **Test 2, lecteur au hasard** : tout au hasard. Dans une méthode neutre, chaque candidat sortirait n°1 une fois sur 25 (4 %).

## Résultats (données du 2026-10-15, 25 candidats dont 13 ont siégé)

Test 1, X sort n°1 :

| Méthode | X a siégé | X n'a jamais siégé | Écart |
| --- | --- | --- | --- |
| Avant : au nombre, égalité par fiabilité | 44,4 % | 37,7 % | 6,7 |
| Option 1 : égalité au hasard | 42,7 % | 37,3 % | 5,4 |
| Option 2 : moitié programme, moitié Parlement | 40,8 % | 36,9 % | 3,9 |
| **Retenue : option 1 + Parlement plafonné à moitié** | **40,8 %** | **37,1 %** | **3,7** |

Test 2, part de n°1 par candidat : environ 1,5 à 1,8 % pour ceux qui ont siégé, 6,4 à 6,8 % pour les autres, quelle que soit la méthode. Avec peu de votes, un score monte facilement très haut par hasard (2 notes « Parfait » font 100 %), alors que les scores des sortants, appuyés sur plus de votes, restent près de 50 %. Ce biais-là avantage les nouveaux venus ; la jauge « fragile » le signale au lecteur.

Une première simulation à 4 000 lecteurs donnait un écart nul pour la méthode retenue : c'était du bruit. À 25 000 lecteurs, sur deux graines (2027 et 1789), l'écart retenu est de 3 à 4 points. Les chiffres ci-dessus incluent les votes de Delphine Batho et d'Olivier Becht, ajoutés le même jour (13 candidats ont siégé au lieu de 11).

## Décision

- **Option 1** : à score égal, l'ordre est tiré au hasard, sans regarder le nombre de votes.
- **Option 2 plafonnée** (`MAX_PARLEMENT_SHARE = 0.5`) : programme et Parlement pèsent au nombre de leurs votes, mais le Parlement jamais plus de la moitié. Avec 1 scrutin pour 4 propositions, il pèse 1/5 ; avec 20 scrutins, la moitié, au lieu de 83 %. Le programme reste la base commune à tous les candidats.

Ensemble, elles réduisent l'écart de près de moitié (de 6,7 à 3,7 points). L'écart restant vient du test lui-même : le lecteur simulé est d'accord avec tous les votes réels de X, ce qui est un vrai accord, pas un bonus de méthode.

Option écartée : afficher « programme seul » sur les candidats qui n'ont jamais siégé, qui reviendrait à les marquer.
