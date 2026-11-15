import { cn } from 'cn'
import { Button } from '@/composants/ui/button'
import type { LigneArbre } from '@/vues/reperage'
import { Icone } from './Icone'
import { Marques } from './Marques'

/** L'arbre d'appels de Repérage : une ligne par appel, ses marques, sa taille, une barre proportionnelle aux lignes. */
export function ArbreAppels({ lignes }: { lignes: LigneArbre[] }) {
  return (
    <div role="tree" aria-label="Arbre d'appels" className="flex min-w-0 flex-col pb-2 text-foreground">
      <div aria-hidden="true" className="mb-1 flex h-10 items-center gap-2 border-b pr-4 pl-3 text-[13px]/[18px] font-medium text-muted-foreground">
        <span className="flex-1 pl-[38px]">Fonction</span>
        <span className="w-[52px] flex-none text-right">Lignes</span>
        <span className="w-11 flex-none" />
        <span className="w-[58px] flex-none text-right">Fonctions</span>
      </div>
      {lignes.map((l) => (
        <div
          key={l.cle}
          role="treeitem"
          aria-level={l.niveau}
          aria-selected={l.selectionnee}
          aria-expanded={l.aEnfants ? l.ouverte : undefined}
          className={cn('flex min-h-9 items-center gap-2 pr-4 pl-3 hover:bg-[color-mix(in_oklab,var(--muted)_70%,transparent)]', l.selectionnee && 'bg-secondary hover:bg-secondary')}
        >
          <span aria-hidden="true" className="flex flex-none self-stretch">
            {Array.from({ length: l.guides }, (_, i) => (
              <span key={i} className="ml-[11px] flex-none border-l" style={{ width: l.pasGuide }} />
            ))}
          </span>
          {l.aEnfants ? (
            <button
              type="button"
              aria-label={l.basculeLabel}
              aria-expanded={l.ouverte}
              onClick={l.basculer}
              className="grid size-6 flex-none cursor-pointer place-items-center rounded-full text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-anneau"
            >
              <Icone nom={l.ouverte ? 'chevron-down' : 'chevron-right'} />
            </button>
          ) : (
            <span aria-hidden="true" className="w-6 flex-none" />
          )}
          <button
            type="button"
            onClick={l.selectionner}
            title={l.id}
            className="flex h-7 min-w-[72px] flex-1 cursor-pointer items-center overflow-hidden rounded-sm px-1.5 font-mono text-[13px]/[18px] whitespace-nowrap text-muted-foreground outline-none focus-anneau"
          >
            <span className="min-w-0 flex-[0_1_auto] truncate">{l.prefixe}</span>
            <span className="max-w-full flex-none truncate font-semibold text-foreground">{l.nom}</span>
          </button>
          <Marques marques={l.marques} />
          {l.precision && <span className="flex-none text-xs/4 whitespace-nowrap text-muted-foreground">{l.precision}</span>}
          {l.suivre ? (
            <Button variant="ghost" size="icon-sm" aria-label={l.suivreLabel} title={l.suivreLabel} onClick={l.suivre}>
              <Icone nom="arrow-right" taille={14} />
            </Button>
          ) : (
            <span aria-hidden="true" className="w-8 flex-none" />
          )}
          <span className={cn('w-[52px] flex-none text-right text-[13px]/[18px] tabular-nums', l.aLignes ? 'text-foreground' : 'text-muted-foreground')}>{l.lignes}</span>
          <span role="img" aria-label={l.partLabel} className={cn('h-1.5 w-11 flex-none overflow-hidden rounded-full bg-muted', !l.aLignes && 'invisible')}>
            <span className="block h-full rounded-[inherit] bg-primary" style={{ width: l.part + '%' }} />
          </span>
          <span className="w-[58px] flex-none text-right text-[13px]/[18px] text-muted-foreground tabular-nums">{l.fonctions}</span>
        </div>
      ))}
    </div>
  )
}
