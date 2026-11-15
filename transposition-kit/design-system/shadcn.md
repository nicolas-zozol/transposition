# Brancher sur shadcn/ui

Le thème ci-dessous donne à une application shadcn/ui (Tailwind v4) les mêmes valeurs que ce système. Les noms sont ceux de shadcn : aucun composant n'est à renommer.

## Le thème

Dans `globals.css`, remplacer les blocs `:root` et `.dark` générés par `shadcn init` par ceux-ci, et ajouter ce bloc `@theme inline` à côté de celui de shadcn, qui reste en place. Ce fichier a été compilé avec Tailwind 4.1.11. Garder `--radius: 0.625rem` : l'échelle de rayons de ce système est celle de shadcn pour cette valeur.

```css
/* BL Demo — thème shadcn/ui pour Tailwind v4. Généré depuis tokens.json : ne pas éditer à la main. */

:root {
  --radius: 0.625rem;

  /* Variables shadcn/ui */
  --background: #f7f5ff;
  --foreground: #16142b;
  --card: #ffffff;
  --card-foreground: var(--foreground);
  --popover: #ffffff;
  --popover-foreground: var(--foreground);
  --primary: #382e95;
  --primary-foreground: #ffffff;
  --secondary: #ebeafc;
  --secondary-foreground: #382e95;
  --muted: #efedf8;
  --muted-foreground: #625f7d;
  --accent: #ebeafc;
  --accent-foreground: #16142b;
  --destructive: #be123c;
  --border: #e4e1f2;
  --input: #8683a6;
  --ring: #5f58ba;
  --chart-1: #feb265;
  --chart-2: #ffd878;
  --chart-3: #5fb5ee;
  --chart-4: #70cdcd;
  --chart-5: #5f58ba;
  --sidebar: #382e95;
  --sidebar-foreground: #ffffff;
  --sidebar-primary: #ffffff;
  --sidebar-primary-foreground: #382e95;
  --sidebar-accent: #5452bc;
  --sidebar-accent-foreground: #ffffff;
  --sidebar-border: #5048a2;
  --sidebar-ring: #ffffff;

  /* Ajouts BL Demo */
  --destructive-foreground: #ffffff;
  --destructive-soft: #fff1f2;
  --success: #15803d;
  --success-soft: #f0fdf4;
  --warning: #b45309;
  --warning-soft: #fffbeb;
  --info: #2563eb;
  --info-soft: #eff6ff;
  --overlay: #16142b80;
  --memo-lime: #e7f3b8;
  --memo-yellow: #fff4c6;
  --memo-orange: #ffdcaa;
  --memo-sky: #d2eef9;
  --bl-shadow-xs: 0 1px 2px #382e9512;
  --bl-shadow-sm: 0 1px 3px #382e9514, 0 6px 16px -4px #382e951f;
  --bl-shadow-md: 0 4px 8px -2px #16142b1f, 0 16px 32px -4px #16142b2e;
  --bl-focus-ring: 0 0 0 2px #ffffff, 0 0 0 4px #5f58ba;
  --bl-focus-ring-sidebar: 0 0 0 2px #382e95, 0 0 0 4px #ffffff;
}

.dark {
  --background: #110f24;
  --foreground: #f3f1ff;
  --card: #1a1833;
  --card-foreground: var(--foreground);
  --popover: #201e3d;
  --popover-foreground: var(--foreground);
  --primary: #a8a3f2;
  --primary-foreground: #16142b;
  --secondary: #2b2856;
  --secondary-foreground: #dedbff;
  --muted: #232140;
  --muted-foreground: #a7a4c2;
  --accent: #2b2856;
  --accent-foreground: #f3f1ff;
  --destructive: #fb7185;
  --border: #302d52;
  --input: #7673a0;
  --ring: #a8a3f2;
  --chart-1: #feb265;
  --chart-2: #ffd878;
  --chart-3: #5fb5ee;
  --chart-4: #70cdcd;
  --chart-5: #8f89e0;
  --sidebar: #2d2580;
  --sidebar-foreground: #ffffff;
  --sidebar-primary: #ffffff;
  --sidebar-primary-foreground: #382e95;
  --sidebar-accent: #4540a3;
  --sidebar-accent-foreground: #ffffff;
  --sidebar-border: #3f3893;
  --sidebar-ring: #ffffff;

  --destructive-foreground: #16142b;
  --destructive-soft: #45101f;
  --success: #4ade80;
  --success-soft: #0d2b1a;
  --warning: #fbbf24;
  --warning-soft: #3a2706;
  --info: #60a5fa;
  --info-soft: #13264d;
  --overlay: #00000099;
  --memo-lime: #323d18;
  --memo-yellow: #453a12;
  --memo-orange: #4a3115;
  --memo-sky: #173b4a;
  --bl-shadow-xs: 0 1px 2px #00000066;
  --bl-shadow-sm: 0 1px 3px #00000080, 0 6px 16px -4px #00000099;
  --bl-shadow-md: 0 4px 8px -2px #000000a6, 0 16px 32px -4px #000000cc;
  --bl-focus-ring: 0 0 0 2px #110f24, 0 0 0 4px #a8a3f2;
  --bl-focus-ring-sidebar: 0 0 0 2px #2d2580, 0 0 0 4px #ffffff;
}

@theme inline {
  /* Couleurs ajoutées (les --color-* de shadcn restent dans le CSS global du projet) */
  --color-destructive-foreground: var(--destructive-foreground);
  --color-destructive-soft: var(--destructive-soft);
  --color-success: var(--success);
  --color-success-soft: var(--success-soft);
  --color-warning: var(--warning);
  --color-warning-soft: var(--warning-soft);
  --color-info: var(--info);
  --color-info-soft: var(--info-soft);
  --color-overlay: var(--overlay);
  --color-memo-lime: var(--memo-lime);
  --color-memo-yellow: var(--memo-yellow);
  --color-memo-orange: var(--memo-orange);
  --color-memo-sky: var(--memo-sky);

  /* Polices : Inter pour le texte, Poppins pour les titres et la navigation (classe font-display) */
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-display: "Poppins", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;

  /* Coin haut-droit de la barre latérale (rounded-tr-4xl) */
  --radius-4xl: calc(var(--radius) * 2.6);

  /* Ombres teintées, différentes en clair et en sombre */
  --shadow-xs: var(--bl-shadow-xs);
  --shadow-sm: var(--bl-shadow-sm);
  --shadow-md: var(--bl-shadow-md);
}
```

Charger Inter (variable) et Poppins 500, 600, 700 depuis le dossier `fonts/` de ce système, sous les noms de famille « Inter » et « Poppins ». Avec le paquet `@fontsource-variable/inter`, la famille s'appelle « Inter Variable » : l'ajouter en tête de `--font-sans`. Dans le bloc `@theme inline` du projet, retirer les `--font-sans` qui pointent vers une autre police.

## Les réglages par composant

Le thème seul donne les couleurs, les rayons et les polices. Ces quelques classes, dans `components/ui/`, donnent le reste :

| Fichier shadcn | Réglage | Pourquoi |
| --- | --- | --- |
| `button.tsx` | `rounded-md` → `rounded-full` ; variante `outline` : `border-input bg-card` ; variante `destructive` : `text-white` → `text-destructive-foreground` | La pilule est la signature ; le contour tient 3:1 ; en sombre le rouge s'éclaircit et veut un texte sombre |
| tous les contrôles | Focus : `focus-visible:ring-2 ring-ring ring-offset-2` à la place de l'anneau translucide `ring-ring/50` | À 50 %, l'anneau ne tient qu'environ 2,2:1 sur blanc |
| `badge.tsx` | Ajouter les variantes `success`, `warning`, `info` et passer `destructive` en doux : `bg-success-soft text-success`, etc. ; `rounded-md` | Statuts en teinte douce, comme Badge ici |
| `tabs.tsx` | Files d'un tableau : `TabsList` sans fond, avec un filet bas (`bg-transparent border-b rounded-none`) ; onglet actif souligné de 2 px en `border-primary`. Bascule segmentée : garder la forme d'origine, en `rounded-full`, onglet actif en `bg-primary text-primary-foreground` | Deux usages, deux formes |
| `sidebar.tsx` | Entrée active (`SidebarMenuButton`) : `bg-sidebar-primary text-sidebar-primary-foreground` à la place de `sidebar-accent` ; `rounded-tr-4xl` sur le conteneur ; `font-display` | La pilule blanche sur l'indigo |
| `card.tsx` | Rien : `rounded-xl` vaut déjà 14 px. Titre en `font-display` | |
| `table.tsx` | `TableCell` : `h-12` ; `TableHead` : `text-muted-foreground` | Lignes de 48 px |
| `input.tsx`, `select.tsx`, `checkbox.tsx` | Rien : `border-input` et `rounded-md` donnent déjà le bon contour | |

## Correspondance des composants

| Ici (`window.BLDemo`) | shadcn/ui |
| --- | --- |
| Button, Badge, Avatar, Card, Checkbox, Switch, Breadcrumb, Progress, Tabs, Dialog, Popover, DropdownMenu, Pagination | le composant du même nom |
| Input, Select, Field | Input, Select (Radix), Field |
| DataTable | Table + TanStack Table (recette « Data Table ») |
| Sidebar, AppShell | Sidebar (`SidebarProvider`, `SidebarInset`) |
| Icon | `lucide-react`, mêmes noms en PascalCase |
| StatusDot, Stat, Topbar | pas d'équivalent : quelques lignes de Tailwind avec les mêmes tokens |

## Ce qui diffère de shadcn par défaut

- `border` reste clair et décoratif, mais `input` est nettement plus foncé que chez shadcn : c'est voulu, pour tenir 3:1 sur les contours de contrôle (RGAA, critère 3.3).
- `destructive-foreground` n'existe plus dans le thème shadcn par défaut ; il est rétabli ici parce que le rouge du thème sombre demande un texte sombre.
- `success`, `warning`, `info`, leurs `-soft` et les `memo-*` sont des ajouts : shadcn n'a qu'un `destructive`.
