# Sidebar

La barre latérale indigo, signature des écrans. Le consommateur fournit `items` (`{ value, label, icon, badge?, items? }` ou `{ section }` pour un intertitre), `value`/`onValueChange` ou `defaultValue`, un `title` (nom du module, en texte), et au besoin `collapsed`/`onCollapsedChange` et `footer`.

- L'entrée active est la pilule blanche (`sidebar-primary`) ; le survol est `sidebar-accent`. Une seule entrée active.
- Une icône Lucide par entrée de premier niveau, libellé d'un à deux mots (« Suivi des échanges »). Les sous-entrées n'ont pas d'icône ; un groupe s'ouvre au « + ».
- Sept entrées de premier niveau au plus ; au-delà, regrouper sous un intertitre `section`.
- Repliée, elle devient un rail d'icônes de 56 px : chaque entrée garde son libellé en infobulle.
- Pas de logo fourni : le nom du module se compose en Poppins, jamais en image reconstituée.
