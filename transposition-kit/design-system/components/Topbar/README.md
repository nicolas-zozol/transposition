# Topbar

Le bandeau haut d'un écran : le titre de page en Poppins indigo, son contexte, puis les actions globales à droite. Le consommateur fournit `title`, `meta` (contexte court ; `<strong>` pour la valeur), les actions en `children`, et `leading` pour un élément avant le titre.

- Un seul titre par écran, en casse de phrase : « Supervision de la facturation ».
- `meta` porte le contexte qui change la lecture de tout l'écran : date de traitement, exercice, collectivité.
- À droite, dans cet ordre : sélecteur d'établissement (Select `pill`), boutons d'icône `ghost`, Avatar de l'utilisateur en dernier.
- Les actions sur le contenu (« Enregistrer ») ne vont pas ici mais dans le pied de l'AppShell.
