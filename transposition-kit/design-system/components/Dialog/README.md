# Dialog

Une fenêtre modale pour confirmer ou saisir peu de choses. Ajout volontaire : absent des captures, indispensable aux démos pour confirmer une action. Le consommateur fournit `open` et `onOpenChange`, un `title`, une `description`, un contenu éventuel en `children` et les boutons en `footer`.

- Le titre est la question ou l'action (« Transmettre 4 factures ? »), la description dit la conséquence, le bouton reprend le verbe du titre (« Transmettre »), jamais « OK ».
- Pied : « Annuler » en `outline` puis l'action en `default` — ou `destructive` pour une suppression.
- Un seul Dialog à la fois, 480 px de large par défaut. Une saisie de plus de quatre champs mérite un écran.
