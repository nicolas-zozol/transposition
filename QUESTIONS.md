# Questions ouvertes

Aucune n'a bloqué le portage : chacune porte la proposition appliquée.

## 1. L'attribution « React Flow »

Elle reste affichée en bas à droite de la carte. La licence de React Flow (MIT) permet de la masquer (`proOptions.hideAttribution`), mais ses auteurs demandent de le faire seulement avec un abonnement React Flow Pro.
**Proposition** : la garder tant que la décision n'est pas prise. La retirer tient en une ligne dans `src/composants/CarteAppels.tsx`.

## 2. La liste des résultats de recherche à 1 280 px

Dans le prototype, la liste (600 px) part du bord gauche du champ. À 1 280 px, le champ est à droite de la carte et la liste sort de la fenêtre de 135 px.
**Appliqué** : la liste garde l'ancrage du prototype quand elle a la place (c'est le cas à 1 440 px, la capture de référence est inchangée), et se cale sur le bord droit du champ sinon.

## 3. Le graphe des Dépendances à 1 280 px

Sur les données d'exemple, le graphe mesure 1 024 px pour un cadre de 990 px : il défile de 34 px dans son cadre. C'est permis par le prompt (« seuls le graphe, la carte et le bloc Gherkin défilent dans leur cadre ») et c'est la disposition du prototype, portée sans changement.
**Proposition** : laisser ainsi.

## 4. Les essais du prototype et `"type": "module"`

Les trois scripts de `transposition-kit/prototype/essais/` sont en CommonJS ; le dépôt est en modules ES, donc Node refuse de les lancer depuis le dépôt (`require is not defined in ES module scope`). Le kit est en lecture seule : je ne les ai pas renommés.
**Proposition** : dans une prochaine version du kit, les nommer `.cjs`. D'ici là, le README dit comment les lancer depuis une copie ; les trois finissent par « tout passe ».

## 5. Les composants shadcn

`ui.shadcn.com` n'était pas joignable depuis la session de développement : les composants viennent des sources du registre sur GitHub (style new-york-v4), recopiés puis retouchés pour le thème BL Demo, et non de `npx shadcn add`.
**Proposition** : quand la CLI est joignable, lancer `npx shadcn add --diff` (ou comparer à la main) sur `button`, `badge`, `card`, `dialog`, `select`, `switch`, `tabs`, `table`, `sidebar` pour vérifier qu'aucun écart ne s'est glissé hors des retouches voulues.

## 6. Le focus dans les dialogues

Deux comportements de Radix, absents du prototype : à l'ouverture d'« Exporter les saisies », le focus va dans le champ JSON ; à la fermeture de tout dialogue, il revient au bouton qui l'a ouvert (ajouté : sans `DialogTrigger`, Radix le perdait).
**Proposition** : garder les deux, ils servent la navigation au clavier.
