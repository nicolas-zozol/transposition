# DropdownMenu

Le menu d'actions qui s'ouvre sous un bouton. Le consommateur fournit `trigger` (un Button, souvent l'icône `ellipsis-vertical`) et `items` : `{ label, icon?, onSelect, destructive?, disabled? }`, `{ separator: true }` ou `{ heading }`.

- Pour les actions secondaires d'une ligne ou d'une carte ; l'action principale reste un Button visible.
- Verbes à l'infinitif (« Modifier les droits », « Relancer le PMSI »). Sept entrées au plus.
- L'action destructrice est en dernier, après un séparateur, avec `destructive`.
