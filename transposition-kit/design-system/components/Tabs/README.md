# Tabs

Les vues d'une même liste (soulignées) ou la bascule entre deux ou trois modes (segmentées). Le consommateur fournit `items` (`{ value, label, count?, icon?, disabled? }`), `value`/`onValueChange` ou `defaultValue`, et `variant`. Tabs ne rend que la rangée d'onglets : le consommateur affiche le contenu selon `value`.

- `underline` : files de travail d'un tableau, avec leur compteur (« À traiter · 4 »). L'onglet actif porte le filet `primary`.
- `segmented` : deux ou trois modes exclusifs d'un même panneau (« Mémos / Rappels »). Au-delà de trois, revenir à `underline`.
- Libellés d'un à trois mots, casse de phrase. Un onglet vide reste visible et `disabled`, il ne disparaît pas.
