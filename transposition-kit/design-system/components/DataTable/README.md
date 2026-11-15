# DataTable

Le tableau de travail : tri, sélection et cellules composées, piloté par les données. Le consommateur fournit `columns` (`{ key, header, sortable?, align?, width?, strong?, muted?, wrap?, render?(row), sortValue?(row) }`) et `rows` ; au besoin `rowKey` (« id » par défaut), `selectable`, `onSelectedChange`, `defaultSort`, `onRowClick`, `dense`, `empty`.

- À poser dans une `Card flush`, sous des Tabs et au-dessus d'une Pagination.
- Une colonne `strong` par tableau : l'identité de la ligne (« ROBERT Louis » — NOM en capitales, prénom ensuite). Identifiants et métadonnées en `muted`.
- Situation en Badge, états serrés en StatusDot, nombres alignés à droite (`align: 'right'`).
- Une action par ligne, en `Button variant="outline" size="sm"` dans la dernière colonne ; les autres dans un DropdownMenu.
- Cellule vide : le tableau affiche « — » de lui-même (sauf dans une colonne sans en-tête, comme celle des actions). Les cellules ne passent pas à la ligne ; `wrap: true` l'autorise sur une colonne de texte long. `empty` dit pourquoi la liste est vide et quoi faire.
