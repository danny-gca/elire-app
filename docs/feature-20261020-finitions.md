# Finitions : fête de fin, vibrations, salle des scrutins, signalement, logo et captures

Demandes du 2026-10-20 (`todo.md`, section « Dev à faire »). Branche `feature/finitions` (ancienne `chore/design`, renommée en local ; `origin/chore/design` existe encore). Le site aura sa branche pour les lots 6 et 8.

Légende : **[Danny]** = demandé tel quel, **[Proposition]** = ma proposition, pas encore validée, **[À trancher]** = Danny décide avant la suite, **[Décidé]** = validé ensemble, **[Fait]** = dans le code.

## 0. Tri du todo

### Dans cette feature

| Lot | Sujet | État |
| --- | --- | --- |
| 1 | Fête de fin : fêtes en série, « J'ai voté à tout ! », bouton Partager sur Voter | [Fait] |
| 2 | « Réinitialiser mes votes » : grande fête | [Fait] |
| 3 | Plus de vibrations, sans abuser | [Fait] |
| 4 | Brouhaha refait à partir de voix | [Fait], à écouter |
| 5 | La salle : apparition progressive, sièges entiers, plus de place, fluidité | [Fait], à tester sur Android |
| 6 | Signaler une erreur par un formulaire Google | [Fait] côté app, formulaire à créer par Danny |
| 7 | Logo : la France d'un trait (6a3), remplacé partout | [Fait] |
| 8 | Captures d'écran : stores (app) et site | à faire (lot 7 fait) |
| 9 | Correctifs restants de la feature Android (`feature-20261019-android-opti.md`) | à faire |
| 10 | Bug : Réglages passe sous les boutons Android | [Fait], à tester sur Android |

Le lot 8 reprend aussi la ligne « Site : refaire les captures d'écran de l'app » de la section « Aspect légales ».

### Hors feature (reste dans `todo.md`)

- **Infos candidats** : travail éditorial, avec les skills `collecter-donnees` et `verifier-donnees`, sur sa propre branche.
- **Relecture par un avocat** : hors code. Le lot 6 change le paragraphe « Signaler une erreur » des mentions légales : à relire dans la même passe.
- **Compléter `docs/feature-20261015-smaller-updates.md`** : documentation d'une feature passée.

---

## 1. Fête de fin : « J'ai voté à tout ! »

**[Danny]** Quand on termine tous les votes : plusieurs `celebrate('big')` d'affilée, avec un peu d'espacement. Un message sur le Classement et dans « Partager » (« J'ai voté à tout ! »). Sur Voter : « Vous avez rempli tous les votes, partagez votre classement ! » et un bouton « Partager ».

**[Fait]**

- `allVoted()` (`src/lib/progress.ts`, testé) : chaque proposition et chaque scrutin a une réponse, « Je ne sais pas » compris. Voter, Cahier et Partager lisent cette fonction.
- `celebration-store.ts` : `current` devient `active[]`, les fêtes se chevauchent sans se couper. `celebrateSeries(size, count = 3, gapMs = 600)` lance une série et renvoie de quoi l'annuler. Pas deux fois la même variante dans une série. Son : `palier` pour la première, `festif` pour les suivantes.
- Voter (`index.tsx`) : 3 grandes fêtes à la dernière question, une seule avec « Réduire les animations » (un seul son). Les bilans gardent une seule fête.
- `FinishedView` : « Vous avez rempli tous les votes, partagez votre classement ! », bouton « Partager mon classement » (principal) puis « Voir le classement ». Il ouvre le Cahier avec la feuille de partage ouverte (`/cahier?partager=1`) : les scores restent calculés à un seul endroit.
- Cas limite : sans candidat classé (tout en « Je ne sais pas »), pas de bouton Partager et l'ancien texte reste.
- `AllVotedNote` (`src/components/all-voted-note.tsx`) : « J'ai voté à tout ! » en Caveat sur un trait du surligneur du lecteur. Affichée au-dessus du Classement, en haut de la feuille Partager et sur l'image.
- Image (`share-card.tsx`) : avec la note, 7 lignes au lieu de 8, la carte garde sa hauteur. Texte d'accompagnement : « J'ai voté à tout sur élire : N questions répondues à l'aveugle. » (testé).
- Les astuces du Cahier attendent la fermeture de la feuille de partage (elles passaient dessous).

**À vérifier à la main** : voter la dernière question, 3 fêtes différentes et espacées ; rouvrir Voter, pas de nouvelle fête.

## 2. « Réinitialiser mes votes » : grande fête

**[Fait]** `reglages.tsx` : `celebrate('big')` + vibration de réussite. Une seule fête : la série reste pour la fin de tous les votes. (Remplace la petite fête du § 5 de `feature-20261019-barre-onglets.md`.)

## 3. Vibrations

**[Fait]** `buzz('selection' | 'light' | 'success' | 'warning')` dans `src/lib/sound.ts`. Sur Android, `performAndroidHapticsAsync` (recommandé par la doc `expo-haptics` v57, pas de vibreur simulé). Toujours coupé avec les sons et sur le web.

| Geste | Vibration |
| --- | --- |
| Vote sur une proposition | `light` |
| Vote sur un scrutin (tampon) | `light` (déjà là) |
| Changement d'onglet (pas en retouchant l'onglet actif) | `selection` |
| Choix du surligneur | `selection` |
| Vote modifié (feuille, « Mes votes ») | `light` |
| Image partagée | `success` |
| Bilan, fin, fin de l'onboarding, réinitialisation | `success` (une par série) |
| « Réinitialiser mes votes » passe en rouge (1er appui) | `warning` |

**À vérifier** sur un vrai téléphone (le web et l'émulateur ne vibrent pas).

## 4. Brouhaha refait à partir de voix

**[Danny]** Le son du brouhaha est trop étrange et beaucoup trop bas. Le refaire avec des voix différentes qui parlent (« Blablabla bababa babababa BAH baba ! »), puis les superposer.

**[Fait]** `scripts/build-sounds.mjs` :

- 8 voix (hauteur, conduit vocal homme ou femme, débit, expressivité, souffle, rugosité), chacune exportée seule dans `assets/sounds/voix/voix-1.m4a` à `voix-8.m4a` pour l'écouter (non embarquées dans l'app).
- Une vraie syllabe : consonnes b, l, m, d, p (occlusion, explosion, glissement des formants), puis voyelle (a surtout, o, é, e) ; synthèse par onde glottale et 4 formants en cascade.
- Phrases de 3 à 6 mots de « bla », un « BAH » appuyé de temps en temps, fin exclamative, intonation qui descend.
- Brouhaha : chaque voix parle 3 fois, à 3 distances (quelques voisins nets, beaucoup de voix lointaines plus sourdes), dans la réverbération de salle. Boucle de 16 s, sans le grave artificiel (-15 %) de l'ancienne version.
- Plus fort : +3 dB dans le fichier, et `BROUHAHA_VOLUME` passe de 0,018 à 0,04 (≈ +10 dB au total). La rumeur monte en 1,4 s, au rythme de la salle.

**[Danny]** Le brouhaha est pas mal, mais les voix sont trop robotiques et pas assez variées : pas que « bla », aussi « blo », « pa », « po », « pi », « pu », « la », « lo », « lu », « va », « vo »…

**[Fait]** Deuxième version des voix :

- syllabes tirées au hasard : 14 attaques (b, p, d, t, g, k, m, n, l, v, f, bl, pl, aucune) et 9 voyelles (a, o, i, u, ou, é, è, e, eu), avec parfois un mot répété (« papapa ») ; v et f en friction, k et g placés selon la voyelle ;
- phrases en affirmation, question ou exclamation, montée de continuation en fin de groupe, « euh » et pauses, mots appuyés, débit qui varie ;
- moins robotique : la hauteur glisse dans chaque syllabe et dérive lentement, l'ouverture de la glotte et la brillance suivent le volume (plus de souffle quand c'est doux, moins d'aigus), F1 et F2 bougent à chaque voyelle, formants propres à chaque voix ;
- dans la salle, chacune des 24 personnes tire sa variante de voix (hauteur, débit, expressivité, formants) ; niveau inchangé.

**[À trancher]** Danny écoute `voix-1` à `voix-8` et `brouhaha.m4a`. Réglages possibles : `ONSETS` et `VOWELS` (poids des syllabes), liste `VOICES`, `BROUHAHA_VOLUME`.

## 5. La salle derrière les scrutins

**[Danny]** Le rendu est bon. Mais la salle apparaît d'un coup (à faire progressivement), les sièges sont coupés au bord, et elle doit prendre plus de place dans le fond.

**[Fait]** `src/components/crowd-backdrop.tsx` :

- Apparition : la salle se remplit rang par rang depuis la tribune, en 1,4 s (un groupe SVG par rang, opacité animée). Rien d'animé avec « Réduire les animations ».
- Sièges : un siège n'est dessiné que s'il tient en entier à l'écran.
- Place : la tribune remonte (centre à 22 % de la hauteur au lieu de 40 %), le premier rang est plus proche, le dégradé démarre plus haut.
- Fluidité : plan calculé une fois par taille de fenêtre (`useMemo`, il était refait à chaque rendu), composant mémoïsé (Voter se redessine à chaque seconde du compte à rebours), fondus en texture (`renderToHardwareTextureAndroid`, `shouldRasterizeIOS`).

**À vérifier** sur un Android milieu de gamme : enchaîner 3 scrutins, pas d'à-coup.

## 6. Signaler une erreur par un formulaire Google

**[Décidé]** Formulaire Google.

**[Fait]** `src/constants/app.ts` : `reportUrl(ref, titre)` construit le lien pré-rempli (référence, titre, version, date des données, plateforme) dès que `REPORT_FORM.url` est rempli ; vide, il ouvre encore GitHub. Les mentions légales (`legal.ts`) basculent toutes seules sur le texte du formulaire.

**Ce que fait Danny** :

1. Google Forms : nouveau formulaire « élire : signaler une erreur ».
2. Champs : Référence, Titre, Ce qui est faux (obligatoire), Source qui le prouve, Version, Date des données, Plateforme, Adresse mail (facultative).
3. Paramètres : pas de collecte d'adresse, pas de « Limiter à 1 réponse » (aucune connexion Google demandée).
4. ⋮ > « Obtenir le lien prérempli » : un mot test par champ, puis « Obtenir le lien ».
5. Me donner ce lien : j'en tire l'URL et les `entry.` pour `REPORT_FORM`.
6. Réponses : lier à une Google Sheet et activer la notification par mail.

Reste ensuite : même texte des mentions sur le site (`elire-website/src/data/legal.ts`).

## 7. Logo aux 4 couleurs

**[Danny]** 4 couleurs de surligneur ; aussi un rond gribouillé comme les astuces, un cercle avec des petits traits comme les fêtes, ou une autre fête. Retirer le trait de marge, inutile. À la limite, un essai sur fond de cahier avec le scotch des fiches du Classement.

**Premier tour** (A à G) : A retirée (quatre bandes de couleur, trop proche du drapeau LGBT, pas neutre), E (gerbe) et G (gribouillis) retirées, B, C et D à mélanger à F. **[Décidé]** F (la fiche du Classement) est la base.

**Deuxième tour** (6 variantes de la fiche) : 2, 4, 5 et 6 retirées, on garde la fiche de base et la fiche avec la boucle.

**[Fait] Troisième tour** : les 2 fiches gardées, et 3 pistes sans rapport, faites selon les règles d'une icône d'app (une seule forme forte, lisible à 16 px, fond de couleur plein cadre pour ne pas se perdre sur un fond d'écran clair, tout dans la zone sûre du rond Android, 2 ou 3 couleurs, jamais les 4 couleurs empilées en bandes) :

Retirées ensuite : « é » sur jaune et ligne surlignée.

Retirées ensuite : la fiche de base (1) et l'hémicycle (beau, mais pas le bon virage).

**[Fait] Cinquième tour** : 4 variantes de chacune des deux pistes restantes, pour choisir. Elles changent l'ordre des couleurs, la taille, l'épaisseur, le nombre de passages, et le tracé de chaque passage (centre décalé, forme plus ou moins tremblée, boucle qui dépasse plus ou moins son départ).

| N° | Piste | Variante |
| --- | --- | --- |
| 2a | Fiche et boucle | 4 passages, jaune, rose, vert, bleu |
| 2b | Fiche et boucle | 6 passages plus tremblés |
| 2c | Fiche et boucle | feutre épais, « é » plus grand |
| 2d | Fiche et boucle | boucle plus large que la fiche |
| 4a | Boucle seule | 8 passages serrés |
| 4b | Boucle seule | très tremblée et décentrée (des traits passent sous le « é ») |
| 4c | Boucle seule | 5 passages épais, « é » plus grand (la plus lisible en 16 px) |
| 4d | Boucle seule | 12 passages fins, plus petite |

**[Danny]** Coup de cœur pour la 4d, avec l'idée de lui donner la forme de la France.

**[Fait]** 4 variantes « France au feutre » : chaque passage retrace un contour simplifié de la France métropolitaine (coins arrondis, tremblé, décalage et dépassement propres à chaque passage), le « é » au centre, fond papier uni.

| N° | Variante |
| --- | --- |
| 5a | 12 passages fins, comme la 4d |
| 5b | 8 passages plus épais |
| 5c | 12 passages et la Corse (cadrée avec le reste, dans la zone visible) |
| 5d | contour net, peu tremblé |

Retirées ensuite : toutes sauf 4d, 5a et 5d.

**[Fait] Piste 6, la France d'un trait** : un seul trait de feutre, peu tremblé, coupé en 4 morceaux de même longueur, un par couleur, qui se chevauchent un peu aux raccords. L'ordre se lit depuis Dunkerque, dans le sens des aiguilles d'une montre (nord-est, sud-est, sud-ouest, nord-ouest).

| N° | Ordre des couleurs |
| --- | --- |
| 6a | jaune, rose, vert, bleu |
| 6b | rose, bleu, jaune, vert |
| 6c | vert, jaune, bleu, rose |
| 6d | bleu, vert, rose, jaune |

La plus nette des pistes France : contour et « é » se lisent en 48 px ; en 16 px, il reste un contour coloré. Le monochrome garde le trait, ses 4 morceaux en 4 transparences.

**[Décidé]** La 6a. Retirées : toutes les autres.

**[Danny]** Le « é » au centre de la France, le centre de la France au centre du logo ; tout ne paraît pas bien centré, le centre géométrique n'est pas le bon.

**Mesures** :

- le « é » : le centre de son encre est en (544, 531) dans `mark.svg`, 50 px plus bas et 15 px plus à gauche que le centre de sa boîte (559, 481), à cause de l'accent. La 6a le centrait par sa boîte : il paraissait trop haut ;
- la France : son centre de masse est environ 40 px à droite du centre de sa boîte (la Bretagne, fine, allonge la boîte vers l'ouest sans peser). Son plus grand vide intérieur a un rayon de 216 px (sur 1024).

**[Fait] 3 placements**, comparés à la 6a d'origine (croix de repère au centre dans les grands aperçus) :

| N° | Placement | Vides haut, bas, gauche, droite (px sur 1024) |
| --- | --- | --- |
| 6a | d'origine : boîtes centrées | 155, 153, 142, 145 |
| 6a1 | centre de masse de la France au centre, « é » posé par son encre sur ce point | 148, 160, 104, 183 |
| 6a2 | plus grand vide intérieur au centre, « é » agrandi dedans | 187, 121, 106, 181 |
| 6a3 | équilibre optique : entre boîte et masse, remonté de 2 %, « é » entre encre et boîte | 132, 176, 123, 164 |

La 6a1 met le « é » au cœur de la France, mais décale la carte vers la gauche ; la 6a3 est le compromis le plus équilibré à l'œil.

**[Décidé]** La 6a3.

**[Fait] Le logo remplacé partout** :

- sources : `assets/brand/mark.svg` (le logo), `mark-monochrome.svg` (mêmes traits en blanc, quatre transparences, pour l'icône à thème Android), `e.svg` (la lettre seule, reprise de l'ancien `mark.svg`) ;
- `scripts/build-brand.mjs` relancé : `icon.png`, `logo.png`, `icon-512.png` (Play Store, ajouté au script), icône adaptative Android (fond, premier plan, monochrome), `favicon.png`, `splash-icon.png`, et les SVG de `assets/brand/` ;
- `feature-graphic.png` (bannière Play Store, faite à la main) : seule la tuile de l'icône est remplacée, au même endroit, bordure et ombre gardées ;
- dans l'app : `Brand` (barre en grand écran, pied de page) et l'image de partage recadrés sur le dessin entier (x 61-430, y 65-424 sur 512) au lieu du seul « é » ; l'onboarding était déjà aligné ;
- site (branche `feature/finitions`, partie de `origin/main`, l'ancienne `feature/tuto-et-sons` étant fusionnée) : `public/favicon.svg` et le logo en ligne de la barre du haut (`src/layouts/Base.astro`) ;
- docs : `README.md` et `DESIGN.md` de l'app (le logo porte les quatre surligneurs : exception ajoutée à la règle du surligneur), `DESIGN.md` du site.

**Reste** : l'icône est native, il faut un nouveau build EAS (`eas update` ne suffit pas) ; captures des stores et du site (lot 8).

À noter : la carte de France figure aussi sur des affiches de partis ; en couleurs pastel mêlées et sans bleu-blanc-rouge, elle reste neutre, mais à garder en tête.

Le monochrome (icônes à thème Android 13) reprend les mêmes traits que l'icône en une seule couleur : fiche et ruban en transparence, boucle à 45 %, « é » plein.

**Aperçus comparés** : iOS (coins arrondis), Android rond, squircle et goutte (seul le centre de 72 dp sur 108 est visible), écran d'accueil 48 px, favicon 32 et 16 px, monochrome, puis chaque proposition en grand.

Les propositions, leur script et leurs planches d'aperçu (`assets/brand/propositions/`) ont été retirés une fois le logo choisi : seul le résultat reste dans `assets/brand/`.

Le trait de marge est retiré de `scripts/build-brand.mjs` (les PNG actuels l'ont encore jusqu'au choix).

**[À trancher]** Le choix. Ensuite : il remplace `mark.svg`, je relance `node scripts/build-brand.mjs`, j'adapte le monochrome (il ne blanchit que les `fill`, pas les `stroke` des boucles et éclats) et le calque de fond Seyès de l'icône Android et le recadrage `BOX` de `Brand` et `ShareCard`. L'icône est native : nouveau build EAS, `eas update` ne suffit pas.

## 8. Captures d'écran (stores et site)

**[Fait] Stores** : `scripts/build-screenshots.mjs` refait toutes les captures depuis l'export web (`npx expo export --platform web --output-dir <dossier>`, puis `node scripts/build-screenshots.mjs <dossier>`), avec Chrome sans interface.

| Dossier (`assets/images/screenshots/`) | Store | Taille |
| --- | --- | --- |
| `iphone-6.9` | App Store, iPhone (obligatoire) | 1320 x 2868 |
| `ipad-13` | App Store, iPad (seulement si l'app déclare l'iPad : `ios.supportsTablet` est absent de `app.json`, donc `false`) | 2064 x 2752 |
| `android-telephone` | Play Store, téléphone (9:16) | 1080 x 1920 |
| `android-tablette-7` | Play Store, tablette 7 pouces (9:16) | 1206 x 2144 |
| `android-tablette-10` | Play Store, tablette 10 pouces (paysage, barre d'onglets en haut) | 2880 x 1620 |

7 écrans par format : présentation, Voter (une proposition), un scrutin dans sa salle, Classement, Lois, Explorer, une thématique. PNG sans transparence.

- Même jeu de votes partout : 4 propositions par candidat et 5 scrutins (103 avis, pas de bilan à l'écran), ordre de passage fixé, astuces déjà vues, surligneur jaune.
- **[Danny]** Neutralité : aucun candidat mis en avant. Sur chaque capture, les noms deviennent « Candidat A » à « Candidat Y », les partis « Parti A »…, les photos des pastilles à lettre, les anneaux et liserés aux couleurs des partis passent en gris.
- Animations réduites (état final, identique d'une fois à l'autre), sauf la présentation, qui n'apparaît qu'au bout de son fondu.
- Les 5 anciennes captures (1080 x 1920, ancien design) sont retirées.

**[Danny]** Bannière du Play Store : trop de jaune, texte à mieux aligner sur l'icône, en haut.

**[Fait]** `assets/brand/feature-graphic.html`, rendue en `assets/images/feature-graphic.png` par `build-brand.mjs` : le haut du titre (l'accent du « é ») sur le haut de l'icône (mesuré au pixel), « Présidentielle 2027 » au surligneur vert, « qui parle » au rose, plus de trait de marge.

**Reste** :

- **Site** : `elire-website/public/images/explorer.webp` et son `.json`, même méthode (export web, Chrome sans interface en 390 x 844 à 2x, recadré 780 x 1200, WebP qualité 82).
- Même jeu de votes de démo pour toutes les images.

## 9. Critique de la feature Android (`feature-20261019-android-opti.md`)

### Ce qui est bien en place

- R8 et réduction des ressources (`expo-build-properties` dans `app.json`) : présents.
- `"orientation": "default"` : présent.

### Ce qui manque ou pose question

1. **Dépendances natives inutilisées** : `@expo/ui`, `expo-glass-effect` et `expo-symbols` ne sont importées nulle part dans `src/`. Le doc conseillait même de mettre à jour `@expo/ui`. Elles grossissent l'APK, le but même de la feature. **À faire** : les retirer (`npm uninstall`), puis `npx expo-doctor`.
2. **Paysage sur téléphone** : `"default"` débloque aussi la rotation des téléphones, pas seulement des tablettes. Rien n'indique un test en paysage (Voter, barre du bas, salle des scrutins). **À faire** : tester, ou limiter au portrait sur téléphone si le paysage est cassé.
3. **Marges du bas en dur** : `BottomTabInset` vaut 80 sur Android quel que soit l'appareil (navigation par gestes ou 3 boutons, paysage), au lieu des vraies marges du système. Le bug de Réglages vient de la même famille : bord à bord imposé par Android 15. **À faire** : revoir après le correctif de Danny.
4. **Résultat R8 non vérifié** : « > 75 % » est une attente, pas une mesure. **À faire** : relever le taux dans la Play Console après la prochaine release, et vérifier que le fichier `mapping.txt` y est envoyé (sinon les rapports de plantage sont illisibles).
5. **Règles `-keep` larges** : garder tout `com.swmansion.reanimated.**` et `worklets.**` limite l'obscurcissement, alors que ces bibliothèques fournissent déjà leurs règles. À n'alléger qu'après un test en release.
6. **Aucun test d'un build release consigné** : R8 casse souvent au lancement ou sur une fonction rare. **À faire** : build `preview` sur un vrai téléphone, puis partage d'image (`view-shot`), sons, votes enregistrés (`expo-sqlite`), vibrations.
7. **Mise à jour des dépendances** : en partie seulement, des PR Dependabot sont encore ouvertes.

---

## 10. Bug : Réglages passe sous les boutons Android

**[Danny]** Sur la page Réglages, le bas de la page passe derrière les boutons du système (barre de navigation), alors que les écrans à onglets non.

**Cause** : `Screen` ne réservait que la marge du haut (`edges={['top']}`). Sur les onglets, c'est la barre d'onglets qui prend la marge du bas (`insets.bottom`, `app-tabs.tsx`). Hors onglets, rien ne la réservait : depuis le bord à bord d'Android 15, le contenu passe sous la barre de navigation transparente.

**[Fait]** `BottomBarContext` (`screen.tsx`), fourni par `AppTabs` : vrai sous la barre d'onglets du bas. `Screen` ajoute la marge du bas partout ailleurs : Réglages, fiche candidat, thème, Crédits, Mentions légales, Méthode et corrections, et les onglets en grand écran (barre en haut dès 900 px).

**Reste** : Lois et Explorer ont leur propre `SafeAreaView` (haut seulement), même manque en grand écran. À revoir avec le point 3 du § 9.

## Vérification

```bash
npx expo lint
npx tsc --noEmit
npx jest
npx expo-doctor
```

Fait le 2026-10-20 : lint, typecheck et 50 tests passent. Puis à la main : web, Android, iOS.
