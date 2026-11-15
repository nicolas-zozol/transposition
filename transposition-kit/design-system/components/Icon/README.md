# Icon

Une icône Lucide au trait, qui prend la couleur du texte. Le consommateur fournit `name` (un nom de `Icon.names`, 80 icônes embarquées), `size` en pixels (16 par défaut) et, si l'icône porte seule le sens, un `label`.

- 16 px dans les boutons et champs, 14 px dans un Badge, 20 px dans la Sidebar. Trait de 2 px, jamais rempli.
- Décorative par défaut (masquée aux lecteurs d'écran) ; `label` la rend lisible quand il n'y a pas de texte à côté.
- Button, Badge, Sidebar et DropdownMenu acceptent directement un nom d'icône : n'utiliser Icon que hors de ces composants.
- Dans l'application shadcn, les mêmes noms existent dans `lucide-react` (« triangle-alert » → `TriangleAlert`).
