# Popover

Un panneau flottant ancré à son déclencheur, pour des réglages qui ne méritent pas un écran. Le consommateur fournit `trigger` (un Button), le contenu en `children` (ou une fonction recevant `{ close }`), et au besoin `title`, `footer`, `align` (`start` ou `end`), `width`, `open`/`onOpenChange`.

- Pour « Affichage » (colonnes visibles), des filtres avancés, un sélecteur de période.
- Se ferme au clic extérieur et à Échap ; les réglages s'appliquent tout de suite, sans bouton « Valider ».
- Le pied reçoit l'action de retour à l'état initial (« Réinitialiser les colonnes »), en `Button variant="ghost" size="sm"`.
- Pas de confirmation ni de formulaire long dans un Popover : c'est un Dialog.
