# Field

Le libellé au-dessus d'un contrôle, avec son aide ou son erreur. Le consommateur fournit `label`, un seul contrôle enfant (Input, Select), et au besoin `hint`, `error`, `required`.

- Field relie le libellé, l'aide et l'erreur au contrôle (`id`, `aria-describedby`, `invalid`) : ne pas les câbler à la main.
- Libellé court, casse de phrase, sans deux-points : « Numéro de l'assurance ».
- `error` remplace `hint` et dit comment corriger : « Saisissez une adresse du type nom@domaine.fr », pas « Champ invalide ».
- Formulaires en grille de deux colonnes, gouttière `space-4` ; une seule colonne sous 640 px.
