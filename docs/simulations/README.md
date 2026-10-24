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

## Résultats (données du 2026-10-15 : 25 candidats dont 13 ont siégé, 194 propositions)

Test 1, X sort n°1 :

| Méthode                                              | X a siégé  | X n'a jamais siégé | Écart   |
| ---------------------------------------------------- | ---------- | ------------------ | ------- |
| Avant : au nombre, égalité par fiabilité             | 44,0 %     | 38,1 %             | 5,9     |
| Option 1 : égalité au hasard                         | 42,3 %     | 37,9 %             | 4,4     |
| Option 2 : moitié programme, moitié Parlement        | 40,4 %     | 37,3 %             | 3,1     |
| **Retenue : option 1 + Parlement plafonné à moitié** | **40,4 %** | **37,5 %**         | **2,9** |

Test 2, part de n°1 par candidat : environ 1,5 à 1,8 % pour ceux qui ont siégé, 6,4 à 6,8 % pour les autres, quelle que soit la méthode. Avec peu de votes, un score monte facilement très haut par hasard (2 notes « Parfait » font 100 %), alors que les scores des sortants, appuyés sur plus de votes, restent près de 50 %. Ce biais-là avantage les nouveaux venus ; la jauge « fragile » le signale au lecteur.

Une première simulation à 4 000 lecteurs donnait un écart nul pour la méthode retenue : c'était du bruit. À 25 000 lecteurs, sur deux graines (2027 et 1789), l'écart retenu est de 3 à 4 points. Les chiffres ci-dessus incluent les votes de Delphine Batho et d'Olivier Becht et les 50 propositions ajoutées le même jour (13 candidats ont siégé au lieu de 11, 194 propositions au lieu de 144).

## Décision

- **Option 1** : à score égal, l'ordre est tiré au hasard, sans regarder le nombre de votes.
- **Option 2 plafonnée** (`MAX_PARLEMENT_SHARE = 0.5`) : programme et Parlement pèsent au nombre de leurs votes, mais le Parlement jamais plus de la moitié. Avec 1 scrutin pour 4 propositions, il pèse 1/5 ; avec 20 scrutins, la moitié, au lieu de 83 %. Le programme reste la base commune à tous les candidats.

Ensemble, elles réduisent l'écart de près de moitié (de 5,9 à 2,9 points). L'écart restant vient du test lui-même : le lecteur simulé est d'accord avec tous les votes réels de X, ce qui est un vrai accord, pas un bonus de méthode.

Option écartée : afficher « programme seul » sur les candidats qui n'ont jamais siégé, qui reviendrait à les marquer.

## Questions communes (2026-10-24)

Depuis les enjeux (`data/enjeux.json`), un lecteur ne vote plus proposition par proposition mais question par question : une proposition seule, ou un enjeu dont la note va à chaque candidat « pour » et, inversée, à chaque candidat « contre » (`effectiveVotes`, `src/lib/enjeux.ts`). La simulation suit ce modèle : 45 questions tirées parmi 166 (149 propositions seules et 17 enjeux), puis 15 scrutins ; un lecteur d'accord avec X note les questions de X dans le sens de sa position. Résultat : `score-2026-10-24.json`.

La question : un candidat présent dans beaucoup d'enjeux est-il avantagé ou desservi ? Test 3, méthode retenue, 25 000 lecteurs, graine 2027 :

| Enjeux du candidat | Candidats | Lecteur d'accord avec X : X sort n°1 | Lecteur au hasard : part de n°1 par candidat |
| ------------------ | --------- | ------------------------------------ | -------------------------------------------- |
| Aucun              | 3         | 38,8 %                               | 4,2 %                                        |
| Un ou deux         | 17        | 43,9 %                               | 3,7 %                                        |
| Trois ou plus      | 5         | 42,1 %                               | 5,0 %                                        |

Lecture : pas d'effet régulier avec le nombre d'enjeux (un ou deux font mieux que trois ou plus). Le groupe « aucun » est trop petit et mélangé pour conclure : Antoine Mikolajczak n'a que 5 propositions (moins de chances d'être noté), Raphaël Glucksmann a siégé (son score s'appuie aussi sur ses votes), Mira Markovic non. Tests 1 et 2 inchangés dans leurs conclusions (écart siégé / jamais siégé de 2,5 points pour la méthode retenue).

À refaire quand les enjeux seront validés et quand chaque candidat aura 8 propositions.

## Neutralité des questions (2026-10-24)

La question : est-ce que l'app est neutre, ou est-ce que la façon de répondre pousse vers certains candidats ? Script `scripts/simulate-neutralite.ts` (`npm run simulate:neutralite`), résultat `neutralite-2026-10-24.json`, méthode retenue, 25 000 lecteurs par cas.

Six façons de répondre : tout à +2 et « pour », plutôt oui (80 %), au hasard, mélange (chaque lecteur tire son penchant entre 20 et 80 %, 10 % de « Je ne sais pas »), plutôt non (80 %), tout à -2 et « contre ». Trois longueurs : réaliste (45 questions, 15 scrutins), questions seules (45, aucun scrutin), tout répondu (166 questions, 42 scrutins). Si l'app est neutre, chaque candidat est dans le top 6 une fois sur 4 (24 %), et aussi souvent dans le top 6 que dans les 6 derniers.

**Questions seules (le programme)** : neutres. Au hasard ou en mélange, tous les candidats sont entre 21 et 25 % du top 6, autant en haut qu'en bas. Même en disant oui ou non à tout, presque rien ne bouge : chaque candidat a autant de propositions, toutes écrites dans le même sens. Deux exceptions :

- Selma Labib et Bruno Retailleau sont les seuls « contre » d'une question commune (budget de la défense, temps de travail). Un lecteur qui dit non à tout les met n°1 dans 23 % des cas (4 % attendus), un lecteur qui dit oui à tout les fait descendre (16 % du top 6).
- Antoine Mikolajczak n'avait que 5 propositions : moins souvent classé (40 % des lecteurs), donc moins souvent dans le top 6 (15 %). Complété à 8 le même jour, il revient à 27 %, comme les autres qui n'ont jamais siégé. Un manque de données, pas un sens politique.

**Scrutins** : ils orientent le résultat quand on dit surtout oui ou surtout non. 36 des 42 textes ont été adoptés, donc votés « pour » par la majorité. Un lecteur qui dit oui à tout place en tête les candidats qui n'ont jamais siégé (aucun scrutin pour les faire baisser) ; parmi les sortants, il préfère la majorité (Attal a voté « pour » 35 fois sur 40). Un lecteur qui dit non à tout donne un top 6 d'opposants : Mélenchon, Ruffin, Dupont-Aignan, Lassalle, Roussel, Tondelier, Batho (67 % du top 6 pour les trois premiers, réponses réalistes).

| Façon de répondre (réaliste) | Top 6 le plus fréquent                                                     | Écart entre candidats |
| ---------------------------- | -------------------------------------------------------------------------- | --------------------- |
| Tout +2 et pour              | Les 12 qui n'ont jamais siégé ; les sortants sous 7 %                      | 0 à 51 %              |
| Plutôt oui (80 %)            | Ceux qui n'ont jamais siégé, puis Becht, Attal (33 %)                      | 3 à 38 %              |
| Au hasard                    | Personne : top 6 ≈ 6 derniers pour chacun                                  | 18 à 27 %             |
| Mélange                      | Personne                                                                   | 19 à 27 %             |
| Plutôt non (80 %)            | Dupont-Aignan, Mélenchon, Ruffin, Lassalle                                 | 11 à 45 %             |
| Tout -2 et contre            | Mélenchon, Ruffin, Dupont-Aignan, puis Tondelier, Batho, Roussel, Lassalle | 0 à 67 %              |

**Au hasard, les écarts restants ne sont pas un sens politique** : ceux qui n'ont jamais siégé sont un peu plus souvent en tête (26 % contre 23 %), mais aussi plus souvent en bas, dans les mêmes proportions. Leur score repose sur moins de votes, donc il varie plus (voir plus haut).

Lecture : les questions sont neutres ; le sens vient des scrutins, parce que les textes suivis sont surtout ceux de la majorité. Dire oui ou non à tout n'est pas une opinion réelle, mais un lecteur qui penche (« plutôt non ») voit déjà ce sens. Pistes, à décider :

1. Équilibrer les scrutins : ajouter des textes de l'opposition rejetés par la majorité (journées réservées des groupes), pour qu'à peu près autant de textes soient votés « pour » par chaque camp.
2. Ajouter des « contre » dans d'autres questions communes, pour que Labib et Retailleau ne soient plus les seuls.
