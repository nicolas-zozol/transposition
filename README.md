# Transposition

Application de validation de la transposition en Java d'une application de facturation clinique écrite en PowerBuilder. Quatre onglets : **Repérage** (l'arbre d'appels d'une fonctionnalité), **Carte** (le même arbre en nœuds et flèches), **Règles** (les règles métier, leurs tests, les avis des experts), **Dépendances** (l'ordre d'extraction).

C'est le portage en React du prototype validé de `transposition-kit/` (lecture seule ; voir `transposition-kit/PROMPT.md`).

## Lancer

Node 22 ou plus.

```sh
npm install
npm run dev          # http://localhost:5173, sur les données d'exemple
```

En développement seulement, deux jeux de volumes fictifs se chargent par l'adresse : `http://localhost:5173/#jeu=depart` ou `#jeu=intermediaire`.

## Construire, partager

```sh
npm run build
```

`dist/` contient deux fichiers, à copier ensemble :

- `index.html` : toute l'application (JavaScript, styles, polices Inter et Poppins incluses). Elle s'ouvre par double-clic, en `file://`, sans serveur et sans réseau ;
- `donnees.js` : les données, sous la forme `window.TRANSPOSITION_DONNEES = { … };`.

### Remplacer les données

Les données sont un fichier JSON au format de `transposition-kit/donnees/exemple.json` (`versionFormat: 1`). Trois façons :

1. **Pour tout le monde** : réécrire `donnees.js` à partir du JSON, puis redistribuer le dossier.
   ```sh
   node scripts/ecrire-donnees.mjs chemin/vers/donnees.json dist/donnees.js
   ```
   Le script vérifie le format et échappe ce qu'il faut pour que le JSON tienne dans une balise `<script>`.
2. **Derrière un serveur web** (pas en `file://`, le navigateur l'interdit) : supprimer `donnees.js` et déposer `donnees.json` à côté de `index.html`.
3. **Pour soi** : bouton « Importer », coller le JSON ou déposer le fichier. Un fichier de données remplace les données et fusionne ses saisies ; un fichier qui n'a que `saisies` fusionne les avis.

Ordre de chargement : `window.TRANSPOSITION_DONNEES`, puis `./donnees.json`, sinon un état vide qui invite à importer.

### Les saisies

Les avis, commentaires et réponses des experts restent dans le navigateur (`localStorage`, clé `transposition.saisies.v1`) avec le thème et le nom de l'auteur. « Exporter les saisies » les donne en JSON, à renvoyer à l'équipe. À l'import, une saisie remplace celle de même identifiant quand sa date est égale ou postérieure ; une saisie du navigateur jamais exportée l'emporte toujours sur celle du fichier de données.

### L'adresse

L'écran courant s'écrit dans le fragment (`#onglet=carte&fonctionnalite=F07.1&fonction=w_sejour.uf_lire_dossier`) : un lien copié rouvre le même endroit, et Précédent / Suivant naviguent. Les autres paramètres (`theme`, `mode`, `filtre`, `recherche`, `deplier`, `renvois`, `niveaux`, `zoom`, `dialogue`, `auteur`, `saisiesLocales`, `jeu`) servent à rejouer les états des captures.

## Vérifier

```sh
npm run typecheck    # TypeScript strict
npm run lint         # oxlint
npm test             # Vitest : domaine, vues, disposition de la carte, persistance (38 tests)
npm run build        # nécessaire avant l'essai depuis le disque
npm run e2e          # Playwright : 72 essais
```

Les essais Playwright (`essais/`) :

| Fichier | Ce qu'il vérifie |
| --- | --- |
| `captures.spec.ts` | les 31 états de `transposition-kit/captures/` ; chaque capture va dans `essais/captures-app/` (ignoré par git), aucune erreur ni avertissement en console |
| `parcours.spec.ts` | le parcours de bout en bout de `PROMPT.md`, en dix étapes, date figée au 14/11/2026 |
| `interactions.spec.ts` | la carte réelle à 1 440 px (91 nœuds, quatre colonnes dans la zone) ; la carte à la souris (clic, repli sur place, glisser, molette, Ctrl + molette, boutons de zoom, suivi d'un renvoi, focus hors champ) ; le clavier (anneau de focus sur chaque élément atteint par Tab, Échap, focus retenu et rendu par les dialogues, Entrée dans le dialogue du nom) ; à 1 280 px, aucune page ne défile en largeur et seuls la carte, le graphe et le bloc Gherkin défilent dans leur cadre |
| `disque.spec.ts` | `dist/index.html` ouvert en `file://` (données, polices, carte, adresse) puis servi en HTTP sous `/dist/` ; aucune requête hors des deux fichiers |

Playwright utilise Chromium ; s'il manque : `npx playwright install chromium`.

### Les essais du prototype

Les trois scripts du kit sont en CommonJS ; ce dépôt est en modules ES (`"type": "module"`), donc Node refuse de les lancer depuis le dépôt. Ils se lancent depuis une copie du kit :

```sh
D=$(mktemp -d) && cp -r transposition-kit/prototype transposition-kit/donnees "$D" && cd "$D"
node prototype/essais/essai-logique.js prototype         # logique : tout passe
node prototype/essais/essai-carte-logique.js prototype   # carte : tout passe
node prototype/essais/essai-volumes.js prototype         # volumes : tout passe
```

## Organisation

```
src/
  domaine/     types du format, libellés, formats français, index des arbres, fusion des saisies, Gherkin — TypeScript pur
  magasin/     l'état de l'application, ses actions, la persistance, l'adresse, le chargement des données
  vues/        une fonction pure par écran : du magasin aux objets affichés et à leurs gestionnaires (testées par Vitest)
  composants/  les composants de l'application (arbre, carte, graphe, tableau, Gherkin…) ; ui/ : les composants shadcn
  ecrans/      la coquille (barre latérale, en-tête, dialogues) et les quatre onglets
essais/        Playwright
scripts/       ecrire-donnees.mjs
```

Le magasin est un objet mutable avec un numéro de version ; React s'y abonne par `useSyncExternalStore`. Les vues reprennent `transposition.js` fonction par fonction, ce qui garde les tests du prototype applicables tels quels.

Pile : Vite 8, React 19, TypeScript 7, Tailwind CSS 4, shadcn/ui (style new-york-v4, thème BL Demo de `transposition-kit/design-system/`), React Flow 12 (`@xyflow/react`) pour la carte, `vite-plugin-singlefile` pour le fichier unique.

## Écarts au prompt

- L'application est à la racine du dépôt, à côté du kit, et non dans un sous-dossier.
- Les composants shadcn ont été recopiés depuis les sources du registre sur GitHub (new-york-v4) : `ui.shadcn.com` n'était pas joignable depuis la session de développement, donc pas de `npx shadcn add`. Leur code est celui du registre, retouché pour le thème BL Demo (bouton en pilule, anneau de focus, variantes de Badge, deux formes de Tabs).
- Pas de `@tanstack/react-table` : les deux tableaux triables (tests des Règles, fonctionnalités des Dépendances) passent par un petit composant, `Tableau.tsx`, sur la `Table` de shadcn.
- Ni Zustand ni `useReducer` : un magasin maison (`src/magasin/magasin.ts`), objet mutable lu par `useSyncExternalStore`, pour garder les actions du prototype telles quelles et les tester sans React.
- Le sélecteur d'arbre est un `Select` Radix, pas un `<select>` natif.
- Erreur de JSON invalide : le message donne la position que calcule le navigateur (« caractère 129 » sur le texte de la capture), là où la capture de référence, écrite à la main, dit 124.
- Le dialogue « Exporter » donne le focus au champ JSON à l'ouverture (comportement de Radix) ; la capture de référence ne le montre pas.
- La liste des résultats de recherche, calée sur le bord gauche du champ comme dans le prototype, se cale sur son bord droit quand la fenêtre n'a pas la place (à 1 280 px, le prototype la faisait sortir de l'écran).
- L'attribution « React Flow » reste affichée : la retirer demande un abonnement, à décider.

Les questions restées ouvertes, avec la proposition appliquée, sont dans `QUESTIONS.md`.
