import { useEffect, useRef, useState } from 'react'
import { cn } from 'cn'
import { useMagasin } from '@/magasin/contexte'
import { TRAIT_FAIBLE, vueGraphe } from '@/vues/graphe'
import { Icone } from './Icone'
import { Marque, PointStatut } from './Marques'

/** Le graphe en couches : une colonne par rang, le socle au rang 0, une flèche par dépendance.
 *  Il se mesure par ResizeObserver et se redispose à la largeur disponible. */
export function GrapheCouches() {
  const m = useMagasin()
  const zone = useRef<HTMLDivElement>(null)
  const [largeur, setLargeur] = useState(0)
  useEffect(() => {
    const z = zone.current
    if (!z) return
    const mesurer = () => {
      const w = Math.floor(z.clientWidth)
      setLargeur((p) => (w > 0 && Math.abs(w - p) > 6 ? w : p))
    }
    mesurer()
    const o = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(mesurer) : null
    o?.observe(z)
    return () => o?.disconnect()
  }, [])
  const g = vueGraphe(m, largeur)
  return (
    <div ref={zone} className="overflow-x-auto rounded-xl">
      {g && (
        <div role="group" aria-label="Ordre d'extraction : une colonne par rang" className="relative font-sans text-foreground" style={{ width: g.largeur, height: g.hauteur }}>
          {g.colonnes.map((c) => (
            <div key={c.titre} className="absolute top-0 box-border flex h-9 items-baseline gap-2 pt-3.5 whitespace-nowrap" style={{ left: c.x, width: c.w }}>
              <span className="text-[13px]/[18px] font-semibold text-foreground">{c.titre}</span>
              <span className="text-xs/4 text-muted-foreground">{c.sous}</span>
            </div>
          ))}
          <svg aria-hidden="true" width={g.largeur} height={g.hauteur} viewBox={'0 0 ' + g.largeur + ' ' + g.hauteur} className="pointer-events-none absolute top-0 left-0 overflow-visible">
            <defs>
              {(
                [
                  ['normale', 'var(--muted-foreground)', 8],
                  ['forte', 'var(--primary)', 9],
                  ['faible', TRAIT_FAIBLE, 8],
                ] as const
              ).map(([id, couleur, taille]) => (
                <marker key={id} id={'tp-pointe-' + id} viewBox="0 0 8 8" refX={7} refY={4} markerWidth={taille} markerHeight={taille} markerUnits="userSpaceOnUse" orient="auto">
                  <path d="M0 0.5 L7.5 4 L0 7.5 Z" style={{ fill: couleur }} />
                </marker>
              ))}
            </defs>
            {g.traits.map((t, i) => (
              <path
                key={i}
                d={t.d}
                markerEnd={'url(#tp-pointe-' + t.marqueur + ')'}
                style={{ fill: 'none', stroke: t.couleur, strokeWidth: t.epaisseur, strokeLinecap: 'round', strokeDasharray: t.pointille ? '5 5' : undefined }}
              >
                <title>{t.titre}</title>
              </path>
            ))}
          </svg>
          {g.aSocle && (
            <div className="absolute box-border flex flex-col gap-0.5 overflow-hidden rounded-xl border border-dashed border-input bg-background p-3" style={{ left: g.socle.x, top: g.socle.y, width: g.socle.w, height: g.socle.h }}>
              <span className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-foreground">
                <Icone nom="socle" />
                <span>Socle</span>
              </span>
              <span className="mb-2 text-xs/4 text-muted-foreground">{g.socle.compte}</span>
              {g.socle.items.map((u) => (
                <span key={u.objet} title={u.objet} className={cn('flex min-h-6 items-center justify-between gap-2 font-mono text-xs/4', u.atteint ? 'font-semibold text-primary' : 'text-foreground')}>
                  <span className="truncate">{u.objet}</span>
                  <span className="font-sans tabular-nums">{u.compte}</span>
                </span>
              ))}
              {g.socle.reste && <span className="mt-1 text-xs/4 text-muted-foreground">{g.socle.reste}</span>}
            </div>
          )}
          {g.noeuds.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={n.choisir}
              aria-pressed={n.selectionnee}
              className="absolute box-border flex cursor-pointer flex-col gap-1 overflow-hidden rounded-xl border bg-card px-3 py-2.5 text-left transition-[border-color,opacity] duration-150 outline-none hover:border-ring! focus-anneau"
              style={{ left: n.x, top: n.y, width: n.w, height: n.h, borderColor: n.bord, boxShadow: n.ombre, opacity: n.estompe ? 0.6 : 1 }}
            >
              <span className="flex min-h-6 items-center gap-1.5">
                <span className="font-mono text-xs/4 font-medium text-muted-foreground">{n.id}</span>
                {n.sous > 0 && (
                  <span title={n.sousTitre} className="inline-flex h-5 items-center gap-[3px] rounded-full bg-muted px-1.5 text-xs/4 font-medium text-foreground">
                    <Icone nom="branche" taille={12} />
                    <span>{n.sous}</span>
                    <span className="sr-only">{n.sousTitre}</span>
                  </span>
                )}
                <span className="flex-1" />
                {n.extractible && <Marque marque={{ ton: 'info', icone: true, texte: 'Extractible', variante: 'soft' }} />}
                {n.partielle && <Marque marque={{ ton: 'neutral', icone: 'circle-help', texte: 'Partielle', variante: 'outline' }} />}
              </span>
              <span title={n.titre} className="line-clamp-2 text-[13px]/[18px] font-semibold text-foreground">
                {n.titre}
              </span>
              <span className="mt-auto flex">
                <PointStatut ton={n.extraction.ton} className="items-baseline text-left whitespace-normal">
                  {n.extraction.texte}
                </PointStatut>
              </span>
            </button>
          ))}
          {g.etiquettes.map((q, i) => (
            <span
              key={i}
              className="pointer-events-none absolute box-border h-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border bg-card px-1.5 font-mono text-[11px]/4 font-medium whitespace-nowrap"
              style={{ left: q.x, top: q.y, borderColor: q.fort ? 'var(--ring)' : 'var(--border)', color: q.fort ? 'var(--primary)' : 'var(--muted-foreground)' }}
            >
              {q.texte}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
