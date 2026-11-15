# StatusDot

Un point de couleur et un mot court, pour les colonnes d'état serrées d'un tableau (Adm, PMSI, Fact). Le consommateur fournit le `tone` et le mot (`children`).

- Réservé aux cellules où un Badge serait trop lourd ; ailleurs, préférer Badge.
- Toujours un mot à côté du point (« OK », « Incoh. », « à calculer »). Valeur absente : ton `neutral` et un tiret cadratin « — ».
- Mêmes significations de ton que Badge.
