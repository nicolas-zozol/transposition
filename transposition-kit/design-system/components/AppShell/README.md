# AppShell

Le cadre d'un écran : Sidebar à gauche, Topbar puis contenu défilant à droite, sur le fond lavande `background`. Le consommateur fournit `sidebar` (une Sidebar), `topbar` (une Topbar), le contenu en `children`, et au besoin `footer` pour la barre d'actions collée en bas.

- Donner à l'AppShell toute la hauteur de la fenêtre (`height: 100vh` sur son conteneur). Seul le contenu défile.
- Le contenu est une pile de Card espacées de `space-4` : bandeau de Stat, puis Tabs + DataTable + Pagination dans une même carte.
- `footer` pour « Enregistrer / Enregistrer et fermer / Annuler » d'une fiche : alignés à droite, action principale en premier.
- La Sidebar garde son coin haut-droit arrondi (`radius-xl`) : ne pas la coller sous un bandeau pleine largeur.
