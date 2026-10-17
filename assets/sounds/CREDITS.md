# Sons d'élire

Tous les sons sont fabriqués par `scripts/build-sounds.mjs` (Node et ffmpeg), à partir de bruit filtré, de sinus (glissants pour le feutre) et, pour le brouhaha, d'une foule de voix synthétiques (hauteur, syllabes, formants de voyelles, réverbération de salle). Aucun enregistrement ni échantillon tiers : ils suivent la licence du code du dépôt (MIT).

| Fichier | Moment |
| --- | --- |
| `trait-1` à `trait-5` | trait du surligneur (vote, choix de la couleur, tuto qui entoure), tiré au hasard |
| `feuille-1`, `feuille-2` | « woosh » de la feuille votée qui se range en « A voté ! » |
| `tampon-1`, `tampon-2` | coup de tampon à l'arrivée d'un scrutin |
| `palier` | gerbe de traits : bilan tous les 10 votes, fin de la présentation |
| `festif` | trois coups de feutre distincts : petite fête (vote modifié, image partagée) |
| `brouhaha` | rumeur de l'hémicycle pendant un scrutin, en boucle (14 s) |

Pour les remplacer par des prises maison (feutre sur un tableau, tampon sur une table) : même nom, mono, AAC (`.m4a`), courtes (moins de 30 Ko), silence coupé au début. Une prise venue d'ailleurs doit être sous CC0, et créditée ici (auteur, licence, lien).
