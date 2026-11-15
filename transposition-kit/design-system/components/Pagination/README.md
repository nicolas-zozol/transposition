# Pagination

Le pied d'un tableau : plage affichée, lignes par page, navigation. Le consommateur fournit `page`, `pageCount` et `onPageChange` ; pour la plage et le sélecteur, `total`, `pageSize`, `pageSizeOptions` et `onPageSizeChange`.

- Sous le DataTable, dans le `footer` de sa Card. Toujours visible, même sur une seule page (boutons désactivés).
- Tailles de page proposées : 25, 50, 100.
