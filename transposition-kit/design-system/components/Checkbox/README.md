# Checkbox

Une case à cocher et son libellé cliquable. Le consommateur fournit les attributs natifs (`checked`/`onChange` ou `defaultChecked`), le libellé en `children`, et `indeterminate` pour un « tout sélectionner » partiel.

- Pour un choix qui s'applique à la validation (colonnes affichées, lignes sélectionnées). Effet immédiat sur un réglage : Switch.
- Sans libellé visible (cellule de tableau), donner un `aria-label`.
- Libellé affirmatif : « Afficher le montant », pas « Ne pas masquer le montant ».
