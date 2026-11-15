# Progress

Une barre d'avancement vers un total connu. Le consommateur fournit `value`, `max` (100 par défaut), un `label` qui dit ce qui avance, un `valueLabel` lisible (« 46/47 ») et un `tone`.

- `tone="success"` quand l'objectif est d'arriver au bout (sous-tâches terminées) ; `primary` pour une simple proportion.
- Toujours un libellé : la barre seule ne dit pas ce qu'elle mesure.
- Pas pour une attente de durée inconnue.
