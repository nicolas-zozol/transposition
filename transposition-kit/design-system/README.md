Un système pour des démos interactives d'applications de gestion (collectivités, santé) : la structure et les noms de shadcn/ui, l'indigo, les pilules et les pastels des produits. Les tokens portent les noms des variables shadcn (`background`, `primary`, `sidebar-accent`…) ; les composants sont dans `components/bundle.js` sous `window.BLDemo` et attendent React 18.

## Ton et contenu

- Écrire en français, au vouvoiement, en phrases courtes : « Comment puis-je vous aider ? ». Jamais de tutoiement.
- Casse de phrase partout — titres, boutons, onglets, en-têtes de colonnes : « Supervision de la facturation », « Enregistrer et fermer ». Pas de capitales décoratives.
- Écrire une personne NOM en capitales puis prénom : « LEMOINE Jean-Yves ». Initiales dans l'Avatar.
- Boutons à l'infinitif, sans article superflu : « Enregistrer », « Vérifier mutuelle », « Relancer PMSI ». Statuts en constat : « Terminée », « CRH manquant », « Contrôles OK », « Réponse mutuelle attendue ».
- Formats français : « 40 700 € », « 12,1 j », « 22/06/2026 », « 46/47 (97,87 %) ». Valeur absente : un tiret cadratin « — », jamais une cellule vide ni « N/A ».
- Garder les sigles métier tels quels dans l'interface (PMSI, GHS, AMO, CRH) : l'utilisateur les connaît.
- Un placeholder dit ce qu'on peut chercher : « Rechercher un dossier ou un patient… ». Une aide dit la règle : « Dossier, Patient et Action sont toujours affichés. »
- Pas d'emoji. Le point d'exclamation est réservé au bandeau d'accueil : « Un nouveau jour, une nouvelle opportunité, Marie ! ».

## Couleur

- L'indigo `primary` est la marque. Il remplit la barre latérale (`sidebar`) ; ailleurs il reste rare : le bouton principal, la case cochée, l'onglet actif, le titre de page. Un seul aplat `primary` par zone d'action.
- La page est lavande (`background`), jamais blanche. Le blanc (`card`) est réservé aux surfaces qui portent du contenu : cartes, tableaux, champs.
- `secondary` et `accent` (indigo très clair) pour les boutons secondaires, les survols et la ligne sélectionnée. `muted` pour les aplats neutres.
- Quatre statuts, chacun un couple texte/fond : `success` sur `success-soft`, `warning` sur `warning-soft`, `destructive` sur `destructive-soft`, `info` sur `info-soft`. Un statut porte toujours une icône et un mot : le vert et le rouge ne se distinguent pas par la couleur seule.
- `chart-1` à `chart-5` pour les graphiques, dans cet ordre : orange, jaune, bleu, turquoise, indigo. Ce sont des aplats pastel, jamais du texte ni un trait fin, et toujours avec une légende.
- `memo-lime`, `memo-yellow`, `memo-orange`, `memo-sky` pour les mémos et les cartes de catégorie, jamais pour un statut.
- `border` est un filet décoratif. Tout contour de contrôle (champ, case, bouton outline) utilise `input`, qui tient 3:1 sur les surfaces.
- Thème sombre : `data-theme="dark"` sur `<html>`. `primary` s'y éclaircit et son texte devient sombre : poser `primary-foreground` sur `primary`, jamais du blanc en dur. La barre latérale reste indigo dans les deux thèmes.

## Typographie

- Poppins (`--font-display`) est la voix des produits : nom du module, titres (`display`, `h1`, `h2`, `h3`) et entrées de navigation (`nav`). Graisses 500, 600 et 700 seulement.
- Inter (`--font-sans`) pour tout ce qui se lit ou se compare : `body`, `body-strong`, `small`, `label`, `caption`, `kpi`.
- 14 px est la taille de base, 12 px le plancher. Chiffres tabulaires dans les colonnes de nombres.
- Le titre de page (`h1`) est en `primary` ; les autres titres en `foreground`. `display` une fois par écran au plus, dans le bandeau d'accueil.

## Formes, espacements, ombres

- Tout ce qui se clique est une pilule (`radius-full`) : boutons, filtres, Tabs segmenté. Les surfaces sont douces : `radius-xl` pour les cartes, `radius-lg` pour ce qui flotte, `radius-md` pour champs et badges, `radius-xs` pour la case à cocher.
- `radius-4xl` ne sert qu'au coin haut-droit de la barre latérale.
- Base 4 px : `space-2` dans un contrôle, `space-4` entre deux cartes, `space-5` dans une carte, `space-6` en marge de page.
- Contrôles à `control-md` (36 px) ; `control-sm` (32 px) dans les tableaux et barres d'outils ; `control-lg` (40 px) pour les actions de pied de page. Lignes de tableau à `row-height` (48 px).
- Ombres légères, teintées d'indigo : `shadow-xs` au repos, `shadow-sm` pour les cartes qu'on parcourt, `shadow-md` pour ce qui flotte. Pas de dégradé, pas de flou d'arrière-plan.
- Focus clavier : l'ombre `focus-ring` (2 px de fond puis 2 px pleins de `ring`) ; sur l'indigo, `focus-ring-sidebar`.
- Mouvement : transitions de couleur de 150 ms, repli de la barre latérale en 200 ms, rien d'autre.

## Mise en page

- Un écran est un AppShell : Sidebar indigo à gauche (`sidebar-width`, ou rail `sidebar-rail`), Topbar, puis une pile de Card sur fond lavande.
- Écran de liste : une Card avec la recherche et les Stat, puis une Card `flush` qui contient Tabs, DataTable et Pagination.
- Fiche : Breadcrumb, une Card `collapsible` par section, champs en deux colonnes sous des Field, actions dans le pied de l'AppShell (« Enregistrer », « Enregistrer et fermer », « Annuler »).
- Densité de travail : pas de grand vide, pas de héros. Le seul bandeau décoratif est celui de l'accueil.

## Iconographie

- Lucide, au trait de 2 px, en `currentColor` : 80 icônes embarquées dans le composant `Icon` (`BLDemo.Icon.names`). 16 px dans les boutons et champs, 14 px dans un Badge, 20 px dans la barre latérale.
- Substitution volontaire : les écrans d'origine utilisent des pictogrammes Material ; Lucide, le jeu de shadcn/ui, les remplace ici.
- Pas d'emoji ni de glyphe Unicode en guise d'icône. Seules exceptions typographiques : « — » pour une valeur absente, « · » avant le compteur d'un onglet.

## Logo et images

- Aucun logo n'est fourni. Le nom du module s'écrit en Poppins 600 (prop `title` de la Sidebar) ; ne jamais redessiner ni imiter un logo.
- Pas d'illustration ni de photo dans le système. Avatar affiche des initiales tant qu'aucune photo n'est fournie.

## Composants

- Actions et statuts : Button, Badge, StatusDot.
- Formulaires : Input, Select, Field, Checkbox, Switch.
- Données : Avatar, Card, Stat, Progress, DataTable.
- Navigation : Tabs, Breadcrumb, Pagination.
- Structure : Sidebar, Topbar, AppShell.
- Superpositions : Popover, DropdownMenu, Dialog.
- Ajouts volontaires, absents des écrans d'origine mais nécessaires à une démo : Switch (réglage immédiat) et Dialog (confirmation).
- Pour porter un écran dans l'application shadcn/ui, la section « Brancher sur shadcn/ui » donne le thème à coller et les réglages par composant.
