# Kit de portage : Transposition en React et shadcn/ui

Ce dossier donne à Claude Code de quoi porter le prototype validé de « Transposition » en application React, TypeScript, Tailwind et shadcn/ui, au thème BL Demo, sans backend.

## Mode d'emploi

1. Dézipper ce dossier à la racine du dépôt où l'application doit vivre.
2. Ouvrir `PROMPT.md` et vérifier la section « Réglages » : dossier de l'application, gestionnaire de paquets, diffusion, React Flow pour la carte.
3. Lancer Claude Code à la racine du dépôt et lui dire : « Lis `transposition-kit/PROMPT.md` en entier et suis-le. Commence par la phase 0 et rends-moi ton plan avant de coder. »

Le prompt est découpé en neuf phases, de la lecture aux finitions. Chacune se termine par des tests et une comparaison avec les captures : elles peuvent se lancer une par une.

## Deuxième version : l'onglet Carte

Ce kit remplace le premier, celui des trois onglets. Il ajoute un quatrième onglet, « Carte », entre Repérage et Règles : l'arbre d'appels en nœuds et en flèches, trois niveaux affichés, une pastille par branche repliée.

- Le format des données ne change pas : la carte lit les arbres que Repérage lit déjà.
- Nouveaux dans `prototype/` : `Carte.dc.html`, `CarteAppels.dc.html`, huit états `etats/Carte-*.dc.html`, `planches/Planche-carte.dc.html`, `essais/essai-carte-logique.js`. Modifiés : `transposition.js`, `Main.dc.html`, `Reperage.dc.html` (bouton « Voir la carte »), `ArbreAppels.dc.html` (un nom de fonction ne se coupe plus tant que son préfixe peut céder la place), `canvas.json`.
- `PROMPT.md` : la carte a sa section de comportements (C1 à C16), sa phase de travail, son étape dans le parcours, et une section « Dessiner la carte avec React Flow ».
- Si le portage a déjà commencé avec l'ancien kit : remplacer le dossier du kit, puis demander à Claude Code de lire dans `PROMPT.md` les sections « Dessiner la carte avec React Flow » et « Carte », et de faire la phase 4.

## Troisième version : le sélecteur d'arbre s'arrête au deuxième niveau

Mise à jour du 15/11/2026. Dans Repérage et dans la Carte, le sélecteur ne propose plus toutes les sous-fonctionnalités : dans le vrai projet, elles se comptent par milliers.

- La règle : toutes les fonctionnalités du manuel, et sous la seule fonctionnalité affichée ses sous-fonctionnalités directes. Rien plus bas. Elle est écrite au point « 4 bis » de `PROMPT.md`.
- Modifiés : `prototype/transposition.js` (fonction `optionsArbres`), `prototype/essais/essai-logique.js` (section 11), `PROMPT.md` (point 4 bis, étapes 1 et 3 du parcours, table des lignes, « À ne pas faire »).
- `prototype/Main.dc.html` porte en plus un contrôle de chargement propre au canevas, `etatDuChargement` : à ne pas porter.
- Les captures ne changent pas : fermé, le sélecteur affiche le même libellé.
- Si le portage a déjà commencé : remplacer le dossier du kit, puis demander à Claude Code de lire le point « 4 bis » de `PROMPT.md` et de reprendre le sélecteur des onglets Repérage et Carte, avec ses tests.

## Contenu

| Dossier | Contenu |
| --- | --- |
| `PROMPT.md` | Les instructions pour Claude Code |
| `reference/` | Le format des données et le prompt de design d'origine |
| `prototype/` | Les sources du prototype : la logique (`transposition.js`), les neuf gabarits, les trente états, les planches de variantes, trois scripts d'essai |
| `donnees/` | Les données en JSON : l'exemple, les deux jeux de volumes, un fichier de saisies |
| `captures/` | Une capture par état, et `INDEX.md` qui donne les paramètres de chacune |
| `design-system/` | BL Demo tel que publié : règles, thème shadcn (`shadcn.md`), tokens, polices, sources des composants |

## À savoir

- Les gabarits `.dc.html` ne s'exécutent pas hors du canevas d'origine : ils servent de référence de structure et de style. Le prototype vivant reste dans le canevas.
- Les trois scripts d'essai s'exécutent depuis la racine du kit : `node prototype/essais/essai-logique.js prototype`, `node prototype/essais/essai-carte-logique.js prototype` et `node prototype/essais/essai-volumes.js prototype`.
- Dans le prototype, le déplacement, le zoom et la vue d'ensemble de la carte sont faits à la main. Dans l'application, le prompt les confie à React Flow, pour la carte seulement ; la disposition des nœuds, elle, se porte du prototype. Ce choix se change dans la section « Réglages ».
- Les jeux de volumes ont les volumes réels de la chaîne au 13/11/2026, mais un contenu fictif : noms de fonctions, titres du manuel, règles du ticket modérateur.
- Les captures sont à l'échelle 1, en 1 440 px de large pour les écrans, 1 920 px pour trois d'entre eux. Celles de plus de 2 000 px de haut sont découpées en parties.
