# Stat

Un chiffre clé et ce qu'il mesure. Le consommateur fournit `value` (déjà formaté), `label`, `layout` (`inline` pour un bandeau de KPI, `stacked` pour une tuile) et un `tone` quand le chiffre appelle une action.

- Formats français : « 40 700 € », « 12,1 j », « 97,87 % » — espace insécable avant l'unité, virgule décimale.
- Le libellé dit la mesure et sa période (« Mt GHS cumulé », « Sortie depuis (moy.) »), en casse de phrase.
- `tone="warning"` ou `destructive` seulement si le chiffre demande d'agir (« 8 En retard (> 5 j) ») ; sinon neutre.
- Quatre à cinq Stat au plus dans un bandeau, espacés de `space-8`.
