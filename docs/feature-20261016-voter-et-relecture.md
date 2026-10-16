# Voter sans défiler, chargement visible et textes plus clairs

Décisions du 2026-10-16, après les premiers retours de testeurs.

## Problèmes

- « Il faut scroller » : sur un téléphone, les boutons de vote passaient sous la ligne de flottaison dès qu'un titre faisait 4 lignes.
- Après un scrutin, le filet de 2 pt qui montrait le temps avant la question suivante passait inaperçu ; pareil pour « Dernier vote ».
- Des questions de scrutin et des titres de proposition si neutres ou si techniques qu'on ne comprenait pas ce qu'ils changent.

## Boutons de vote fixes

- Les choix (Impossible à Parfait et « Je ne sais pas », ou Contre / Abstention / Pour) sont dans un bandeau fixe au bas de Voter, au-dessus des onglets ; la feuille défile au-dessus.
- `Screen` prend un `footer` : posé sous le défilement (Android et le web placent l'écran au-dessus des onglets ; sur iOS, le bandeau ajoute la hauteur des onglets).
- Après un scrutin, le bandeau devient « Question suivante » : plus besoin de descendre sous l'hémicycle pour avancer.
- Les phrases d'aide (« L'auteur reste masqué… », « N candidats ont voté ce texte… ») restent sous la feuille.
- Taille du titre gardée (24 pt) : le bandeau suffit à voir la question et les boutons ensemble. À revoir si les testeurs trouvent encore la feuille trop haute.

## Chargement dans le bouton

- `CountdownFill` : un fond qui se retire de droite à gauche, la part restante du temps.
- « Question suivante » (5 s) : bande graphite sur le bouton encre ; elle disparaît dès qu'on touche ou défile (la suite ne part plus seule), et jamais avec un lecteur d'écran.
- « Dernier vote » (10 s) : la ligne entière porte le fond gris clair qui se retire, à la place du filet.

## Relecture des textes (sans recherche web)

- Scrutins : 15 questions et 23 enjeux réécrits sur 42 (une idée par question, jargon expliqué dans l'enjeu : 49.3, ratification, moratoire…). Sens vérifié : « Pour » correspond toujours à la position « pour » du scrutin, y compris pour les trois scrutins de rejet (Mercosur, CETA, recettes du budget 2025).
- Propositions : 61 titres et 74 contextes réécrits sur 194 (verbe d'action, mots courants, contexte qui explique la mesure). Les citations (`description`), sources et dates n'ont pas bougé.
- Titres qui disaient plus que la citation, ramenés à la citation (le reste passe dans le contexte) : prop-br-3, prop-dl-3, prop-ez-5, prop-fa-3, prop-fr-2, prop-na-5, prop-nda-2, prop-nda-5, prop-rg-5.
- À valider contre la source : prop-dl-5 et prop-fr-6 (titre plus large que la citation, gardé), prop-nda-3 (« soignants exclus » reste flou).
