import type * as React from 'react';

/** Nom d'une icône Lucide embarquée (liste complète : `Icon.names`). */
export type IconName = string;
/** Un nom d'icône Lucide, ou un nœud React déjà rendu. */
export type IconProp = IconName | React.ReactNode;
export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'destructive' | 'info';
export type ControlSize = 'sm' | 'md' | 'lg';

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  /** Nom Lucide en kebab-case : "triangle-alert", "chevron-right"… */
  name: IconName;
  /** Côté en pixels. 16 par défaut ; 14 dans un Badge, 20 dans la Sidebar. */
  size?: number;
  strokeWidth?: number;
  /** Texte alternatif quand l'icône porte seule le sens. Sans lui, l'icône est décorative. */
  label?: string;
}
export declare function Icon(props: IconProps): React.ReactElement | null;
export declare namespace Icon {
  const names: IconName[];
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** `default` = aplat indigo, une seule fois par zone d'action. */
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: ControlSize;
  /** Icône avant le libellé. Sans `children`, le bouton devient rond : donner un `aria-label`. */
  icon?: IconProp;
  /** Icône après le libellé ("chevron-right" pour une action de ligne). */
  iconRight?: IconProp;
  children?: React.ReactNode;
}
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  variant?: 'soft' | 'outline';
  /** `true` = l'icône du ton (success, warning, destructive, info) ; sinon un nom Lucide. */
  icon?: boolean | IconProp;
  children?: React.ReactNode;
}
export declare function Badge(props: BadgeProps): React.ReactElement;

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  /** Le mot court à côté du point : "OK", "Incoh.", "à calculer", "—". */
  children?: React.ReactNode;
}
export declare function StatusDot(props: StatusDotProps): React.ReactElement;

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Icône en tête de champ ("search"). */
  icon?: IconProp;
  size?: ControlSize;
  /** Champ en pilule : recherche du bandeau d'accueil uniquement. */
  pill?: boolean;
  invalid?: boolean;
}
export declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Chaînes, ou `{ value, label }`. À défaut, passer des `<option>` en enfants. */
  options?: Array<string | SelectOption>;
  /** Première option vide : le nom du critère pour un filtre, "Sélectionner…" dans un formulaire. */
  placeholder?: string;
  size?: ControlSize;
  /** Forme pilule, pour les filtres et le sélecteur de la Topbar. */
  pill?: boolean;
  invalid?: boolean;
}
export declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLSelectElement>>;

export interface FieldProps {
  label?: React.ReactNode;
  /** Aide sous le contrôle. */
  hint?: React.ReactNode;
  /** Message d'erreur : remplace `hint` et marque le contrôle invalide. */
  error?: React.ReactNode;
  required?: boolean;
  /** À fournir seulement si le contrôle enfant gère lui-même son `id`. */
  htmlFor?: string;
  className?: string;
  /** Un seul contrôle : Input ou Select. */
  children?: React.ReactNode;
}
export declare function Field(props: FieldProps): React.ReactElement;

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** État partiel d'un "tout sélectionner". */
  indeterminate?: boolean;
  /** Le libellé cliquable. */
  children?: React.ReactNode;
}
export declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>>;

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Le nom du réglage. */
  children?: React.ReactNode;
}
export declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLInputElement>>;

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** "Prénom Nom" : donne les initiales et le texte alternatif. */
  name?: string;
  /** URL d'une photo fournie ; sinon les initiales. */
  src?: string;
  /** Diamètre en pixels : 24, 32 (défaut), 40, 64. */
  size?: number;
}
export declare function Avatar(props: AvatarProps): React.ReactElement;

export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Boutons à droite de l'en-tête. */
  action?: React.ReactNode;
  /** Pied séparé par un filet : boutons, Pagination. */
  footer?: React.ReactNode;
  /** Teinte de mémo ou de catégorie ; jamais un statut. */
  tone?: 'lime' | 'yellow' | 'orange' | 'sky';
  /** Contenu bord à bord, pour un DataTable. */
  flush?: boolean;
  /** Ombre plus marquée, pour les cartes qu'on parcourt. */
  raised?: boolean;
  /** Section repliable par le chevron de l'en-tête. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}
export declare function Card(props: CardProps): React.ReactElement;

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Valeur déjà formatée : "40 700 €", "12,1 j". */
  value: React.ReactNode;
  label: React.ReactNode;
  tone?: Exclude<Tone, 'neutral'>;
  /** `inline` pour un bandeau de KPI, `stacked` pour une tuile. */
  layout?: 'inline' | 'stacked';
}
export declare function Stat(props: StatProps): React.ReactElement;

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  /** 100 par défaut. */
  max?: number;
  tone?: Exclude<Tone, 'neutral'>;
  /** Ce qui avance. */
  label?: React.ReactNode;
  /** Valeur lisible à droite : "46/47 (97,87 %)". */
  valueLabel?: React.ReactNode;
}
export declare function Progress(props: ProgressProps): React.ReactElement;

export interface DataTableColumn<Row = any> {
  /** Clé de la donnée dans la ligne, et identifiant de la colonne. */
  key: string;
  /** En-tête ; chaîne vide pour la colonne des actions. */
  header: React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
  /** Colonne d'identité de la ligne, en gras (une par tableau). */
  strong?: boolean;
  /** Identifiants et métadonnées, en `muted-foreground`. */
  muted?: boolean;
  /** Autorise le passage à la ligne dans cette colonne. */
  wrap?: boolean;
  /** Cellule composée : Badge, StatusDot, Button… */
  render?: (row: Row, index: number) => React.ReactNode;
  /** Valeur de tri quand elle diffère de `row[key]`. */
  sortValue?: (row: Row) => string | number;
}
export interface DataTableSort {
  key: string;
  dir: 'asc' | 'desc';
}
export interface DataTableProps<Row = any> extends React.HTMLAttributes<HTMLDivElement> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  /** Clé unique d'une ligne : nom de propriété ("id" par défaut) ou fonction. */
  rowKey?: string | ((row: Row, index: number) => string | number);
  /** Ajoute la colonne de cases à cocher. */
  selectable?: boolean;
  selected?: Array<string | number>;
  defaultSelected?: Array<string | number>;
  onSelectedChange?: (keys: Array<string | number>) => void;
  sort?: DataTableSort | null;
  defaultSort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  onRowClick?: (row: Row) => void;
  /** Lignes de 40 px au lieu de 48. */
  dense?: boolean;
  /** Message quand `rows` est vide. */
  empty?: React.ReactNode;
  /** Titre du tableau pour les lecteurs d'écran. */
  caption?: string;
}
export declare function DataTable<Row = any>(props: DataTableProps<Row>): React.ReactElement;

export interface TabItem {
  value: string;
  label: React.ReactNode;
  /** Compteur affiché après un point médian : "À traiter · 4". */
  count?: number;
  icon?: IconProp;
  disabled?: boolean;
}
export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** `underline` pour les vues d'une liste, `segmented` pour deux ou trois modes. */
  variant?: 'underline' | 'segmented';
}
export declare function Tabs(props: TabsProps): React.ReactElement;

export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  onClick?: (event: React.MouseEvent) => void;
}
export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /** Du parent à la page courante ; le dernier n'est pas cliquable. */
  items: BreadcrumbItem[];
}
export declare function Breadcrumb(props: BreadcrumbProps): React.ReactElement;

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  /** Avec `pageSize`, affiche la plage "26-50 sur 112". */
  total?: number;
  pageSize?: number;
  /** Affiche le sélecteur "Lignes par page" : [25, 50, 100]. */
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
}
export declare function Pagination(props: PaginationProps): React.ReactElement;

export interface SidebarLink {
  value: string;
  label: string;
  /** Icône Lucide, pour les entrées de premier niveau. */
  icon?: IconProp;
  /** Compteur à droite du libellé. */
  badge?: React.ReactNode;
  /** Sous-entrées : l'entrée devient un groupe qui s'ouvre au "+". */
  items?: Array<{ value: string; label: string }>;
}
export interface SidebarSection {
  /** Intertitre en capitales entre deux groupes d'entrées. */
  section: string;
}
export interface SidebarProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'defaultValue'> {
  items: Array<SidebarLink | SidebarSection>;
  /** `value` de l'entrée active. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Nom du module, composé en texte (aucun logo fourni). */
  title?: React.ReactNode;
  /** Bas de barre : aide, déconnexion. */
  footer?: React.ReactNode;
  /** Affiche le bouton de repli. `true` par défaut. */
  collapsible?: boolean;
}
export declare function Sidebar(props: SidebarProps): React.ReactElement;

export interface TopbarProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Titre de page, en casse de phrase. */
  title?: React.ReactNode;
  /** Contexte court à droite du titre ; `<strong>` pour la valeur. */
  meta?: React.ReactNode;
  /** Élément avant le titre (bouton retour). */
  leading?: React.ReactNode;
  /** Actions globales, à droite : Select `pill`, boutons d'icône `ghost`, Avatar. */
  children?: React.ReactNode;
}
export declare function Topbar(props: TopbarProps): React.ReactElement;

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Une `<Sidebar />`. */
  sidebar?: React.ReactNode;
  /** Une `<Topbar />`. */
  topbar?: React.ReactNode;
  /** Barre d'actions collée en bas : Enregistrer / Annuler. */
  footer?: React.ReactNode;
  /** Le contenu défilant : une pile de Card. */
  children?: React.ReactNode;
}
export declare function AppShell(props: AppShellProps): React.ReactElement;

export interface PopoverProps {
  /** Le bouton qui ouvre le panneau. */
  trigger: React.ReactElement;
  title?: React.ReactNode;
  /** Pied du panneau : action de réinitialisation. */
  footer?: React.ReactNode;
  /** Bord du déclencheur sur lequel le panneau s'aligne. */
  align?: 'start' | 'end';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  width?: number | string;
  className?: string;
  children?: React.ReactNode | ((api: { close: () => void }) => React.ReactNode);
}
export declare function Popover(props: PopoverProps): React.ReactElement;

export type DropdownMenuItem =
  | { label: React.ReactNode; icon?: IconProp; onSelect?: () => void; destructive?: boolean; disabled?: boolean }
  | { separator: true }
  | { heading: React.ReactNode };
export interface DropdownMenuProps {
  trigger: React.ReactElement;
  items: DropdownMenuItem[];
  align?: 'start' | 'end';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}
export declare function DropdownMenu(props: DropdownMenuProps): React.ReactElement;

export interface DialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  /** La question ou l'action : "Transmettre 4 factures ?". */
  title?: React.ReactNode;
  /** La conséquence, en une ou deux phrases. */
  description?: React.ReactNode;
  /** Boutons : "Annuler" en outline puis l'action. */
  footer?: React.ReactNode;
  /** Largeur maximale en pixels. 480 par défaut. */
  width?: number;
  /** `false` retire la croix et la fermeture par Échap ou clic extérieur. */
  dismissible?: boolean;
  className?: string;
  children?: React.ReactNode;
}
export declare function Dialog(props: DialogProps): React.ReactElement | null;

declare global {
  interface Window {
    BLDemo: {
      Icon: typeof Icon;
      Button: typeof Button;
      Badge: typeof Badge;
      StatusDot: typeof StatusDot;
      Input: typeof Input;
      Select: typeof Select;
      Field: typeof Field;
      Checkbox: typeof Checkbox;
      Switch: typeof Switch;
      Avatar: typeof Avatar;
      Card: typeof Card;
      Stat: typeof Stat;
      Progress: typeof Progress;
      DataTable: typeof DataTable;
      Tabs: typeof Tabs;
      Breadcrumb: typeof Breadcrumb;
      Pagination: typeof Pagination;
      Sidebar: typeof Sidebar;
      Topbar: typeof Topbar;
      AppShell: typeof AppShell;
      Popover: typeof Popover;
      DropdownMenu: typeof DropdownMenu;
      Dialog: typeof Dialog;
    };
  }
}
