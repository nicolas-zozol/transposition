# Card

La surface blanche à coins doux qui regroupe un sujet. Le consommateur fournit le contenu en `children` et, au choix, `title`, `description`, `action` (boutons d'en-tête), `footer`, `flush` (contenu bord à bord, pour un tableau), `raised`, `collapsible` et `tone`.

- Une carte = un sujet (« Inscriptions budgétaires », « Familles liées »). Pas de carte dans une carte : séparer par un filet `border` ou un titre.
- `collapsible` pour les sections d'une fiche longue ; ouvertes par défaut, `defaultOpen={false}` pour les sections secondaires.
- `tone` (`lime`, `yellow`, `orange`, `sky`) réservé aux mémos et aux cartes de catégorie ; jamais pour signaler un statut — c'est le rôle de Badge.
- `raised` pour les cartes qu'on parcourt (actualités, contacts) ; les cartes de travail restent à plat.
