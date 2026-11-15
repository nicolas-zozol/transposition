# Badge

La situation d'un dossier en un à quatre mots, sur une teinte douce. Le consommateur fournit le texte (`children`), le `tone` (`neutral`, `primary`, `success`, `warning`, `destructive`, `info`) et `icon` : `true` prend l'icône du ton, une chaîne nomme une icône Lucide.

- Le ton a un sens, jamais un rôle décoratif : `destructive` = bloquant, à corriger ; `warning` = pièce ou réponse attendue ; `success` = contrôles passés ; `info` = étape à venir.
- Un statut porte toujours son icône **et** son mot : le vert et le rouge ne se distinguent pas par la couleur seule.
- Le texte dit l'état ou ce qui manque (« CRH manquant », « Droits AMO à vérifier »), pas l'action — l'action est un Button.
- `variant="outline"` pour une métadonnée datée (« Voté le 01/02/2024 »). Pas de badge dans un bouton, pas plus d'un badge de situation par ligne.
