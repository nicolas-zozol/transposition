import { cn } from 'cn'
import type { Marque as DefMarque, Ton } from '@/domaine/libelles'
import { Badge } from '@/composants/ui/badge'
import { Icone } from './Icone'
import { nomIcone } from './icone-du-ton'

/** Un statut en Badge : une icône et un mot, jamais la couleur seule. */
export function Marque({ marque, className }: { marque: DefMarque; className?: string }) {
  const icone = nomIcone(marque.icone, marque.ton)
  return (
    <Badge variant={marque.ton} contour={marque.variante === 'outline'} className={className}>
      {icone && <Icone nom={icone} taille={14} />}
      {marque.texte}
    </Badge>
  )
}

export function Marques({ marques, className }: { marques: DefMarque[]; className?: string }) {
  return (
    <>
      {marques.map((q, i) => (
        <Marque key={i} marque={q} className={className} />
      ))}
    </>
  )
}

const POINTS: Record<Ton, string> = {
  neutral: 'before:bg-muted-foreground',
  primary: 'before:bg-primary',
  success: 'before:bg-success',
  warning: 'before:bg-warning',
  info: 'before:bg-info',
  destructive: 'before:bg-destructive',
}

/** Une pastille de couleur et un mot court, pour les colonnes d'état denses. */
export function PointStatut({ ton, children, className }: { ton: Ton; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[13px]/[18px] whitespace-nowrap text-foreground before:size-1.5 before:flex-none before:rounded-full before:content-['']",
        POINTS[ton],
        className
      )}
    >
      {children}
    </span>
  )
}

const TONS_STAT: Partial<Record<Ton, string>> = {
  success: '*:text-success',
  warning: '*:text-warning',
  info: '*:text-info',
  destructive: '*:text-destructive',
  primary: '*:text-primary',
}

/** Chiffre clé et libellé : « inline » pour un bandeau, « empile » pour une tuile. */
export function Stat({ valeur, libelle, ton, disposition = 'inline' }: { valeur: React.ReactNode; libelle: React.ReactNode; ton?: Ton; disposition?: 'inline' | 'empile' }) {
  return (
    <div className={cn('inline-flex items-baseline gap-2', disposition === 'empile' && 'flex-col-reverse items-start gap-0.5', ton && TONS_STAT[ton])}>
      <span className="text-xl/7 font-bold tracking-[-0.01em] whitespace-nowrap text-foreground tabular-nums">{valeur}</span>
      <span className="text-[13px]/[18px] text-muted-foreground">{libelle}</span>
    </div>
  )
}

/** Un identifiant en petite pastille grise, en chasse fixe. */
export function Code({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('rounded-sm bg-muted px-1.5 font-mono text-xs/5', className)}>{children}</span>
}

/** Initiales de la personne qui saisit, comme l'Avatar de BL Demo. */
export function Avatar({ nom }: { nom: string }) {
  const initiales = nom
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
  return (
    <span role="img" aria-label={nom} className="inline-grid size-8 flex-none place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground select-none">
      {initiales}
    </span>
  )
}

/** Un état vide : une icône ronde, un titre, un texte, des actions. */
export function EtatVide({ icone, titre, children, className }: { icone: React.ReactNode; titre: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('grid max-w-[640px] justify-items-start gap-3 py-5', className)}>
      <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">{icone}</span>
      <h3 className="m-0 font-display text-lg/[26px] font-semibold text-foreground">{titre}</h3>
      {children}
    </div>
  )
}
