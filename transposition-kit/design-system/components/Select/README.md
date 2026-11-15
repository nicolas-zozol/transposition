# Select

Une liste déroulante native, habillée comme le déclencheur shadcn. Le consommateur fournit `options` (chaînes ou `{ value, label }`), `value`/`onChange`, un `placeholder` éventuel, `size` et `pill`.

- `pill` pour les filtres d'une barre d'outils (« Service », « Facturier ») et le sélecteur d'établissement de la Topbar ; rectangulaire dans un formulaire, sous un Field.
- Le placeholder d'un filtre est le nom du critère ; celui d'un champ de formulaire est « Sélectionner… ».
- La liste ouverte est celle du système : dans l'application réelle, le Select shadcn (Radix) la remplace sans changer le déclencheur.
