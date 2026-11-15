# Button

Le bouton en pilule, seule forme de bouton du système. Le consommateur fournit le libellé (`children`), la `variant`, la taille `size` et, au besoin, une icône Lucide par son nom (`icon`, `iconRight`).

- `default` (aplat `primary`) : l'action que l'écran attend, **une seule par zone d'action** — « Enregistrer », « Facturer ».
- `outline` : les actions voisines (« Enregistrer et fermer », « Annuler ») et les actions de ligne d'un tableau, en `size="sm"` avec `iconRight="chevron-right"`.
- `secondary` : action utile mais non prioritaire, pagination. `ghost` : barre d'outils (« Export Excel », « Affichage ») et boutons d'icône.
- `destructive` : suppression, toujours confirmée par un Dialog. `link` : « Voir plus ».
- Libellé à l'infinitif, casse de phrase, sans point : « Enregistrer et fermer », jamais « ENREGISTRER » ni « Enregistrer et Fermer ».
- Un bouton sans libellé reçoit un `aria-label`. Pied de page : action principale à gauche du groupe, « Annuler » en dernier.
