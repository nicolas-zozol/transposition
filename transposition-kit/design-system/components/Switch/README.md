# Switch

Un interrupteur pour un réglage à effet immédiat. Ajout volontaire : absent des captures, présent dans shadcn et utile aux démos (thème sombre, relances automatiques). Le consommateur fournit `checked`/`onChange` ou `defaultChecked`, et le libellé en `children`.

- L'effet est immédiat, sans bouton « Enregistrer ». S'il faut valider, c'est une Checkbox.
- Le libellé nomme le réglage, pas l'état : « Relances automatiques », pas « Activé ».
