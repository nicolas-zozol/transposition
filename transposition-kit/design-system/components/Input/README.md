# Input

Le champ de saisie d'une ligne. Le consommateur fournit les attributs natifs d'un `<input>` (`value`, `onChange`, `placeholder`, `type`…), plus `icon` pour une icône en tête, `size`, `pill` et `invalid`.

- Dans un formulaire, toujours enveloppé d'un Field qui porte le libellé : le placeholder n'est pas un libellé.
- Recherche : `icon="search"` et un placeholder qui dit quoi chercher (« Rechercher un dossier ou un patient… »).
- `pill` + `size="lg"` uniquement pour la recherche du bandeau d'accueil.
- Le champ prend la largeur de son conteneur ; c'est la grille qui fixe la largeur.
