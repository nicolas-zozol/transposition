import { useState } from 'react'
import { cn } from 'cn'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/composants/ui/table'
import { Icone } from './Icone'

export interface Colonne<L> {
  cle: keyof L & string
  titre: string
  triable?: boolean
  largeur?: number
  attenue?: boolean
  fort?: boolean
  retour?: boolean
  rendu?: (ligne: L) => React.ReactNode
}

export type Tri = { key: string; dir: 'asc' | 'desc' } | null

/** Un tableau dense aux lignes de 40 px, triable par colonne. Le tri se pilote de l'extérieur (tri, surTri) ou se garde ici. */
export function Tableau<L extends { id: string }>({
  colonnes,
  lignes,
  legende,
  vide,
  tri: triExterne,
  surTri,
  surLigne,
}: {
  colonnes: Colonne<L>[]
  lignes: L[]
  legende: string
  vide?: string
  tri?: Tri
  surTri?: (t: Tri) => void
  surLigne?: (ligne: L) => void
}) {
  const [triInterne, setTriInterne] = useState<Tri>(null)
  const tri = surTri ? (triExterne ?? null) : triInterne
  const changer = (cle: string) => {
    const t: Tri = !tri || tri.key !== cle ? { key: cle, dir: 'asc' } : tri.dir === 'asc' ? { key: cle, dir: 'desc' } : null
    if (surTri) surTri(t)
    else setTriInterne(t)
  }
  let rangees = lignes
  if (!surTri && tri) {
    const k = tri.key as keyof L
    rangees = lignes.slice().sort((x, y) => {
      const r = String(x[k] ?? '').localeCompare(String(y[k] ?? ''), 'fr', { numeric: true })
      return tri.dir === 'desc' ? -r : r
    })
  }
  return (
    <Table>
      <TableCaption className="sr-only">{legende}</TableCaption>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {colonnes.map((c) => {
            const actif = tri && tri.key === c.cle
            return (
              <TableHead key={c.cle} style={c.largeur ? { width: c.largeur } : undefined} aria-sort={actif ? (tri.dir === 'asc' ? 'ascending' : 'descending') : c.triable ? 'none' : undefined}>
                {c.triable ? (
                  <button type="button" onClick={() => changer(c.cle)} className="-mx-1 inline-flex cursor-pointer items-center gap-1 rounded-sm px-1 outline-none hover:text-foreground focus-anneau">
                    {c.titre}
                    <Icone nom={actif ? (tri.dir === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down'} taille={14} />
                  </button>
                ) : (
                  c.titre
                )}
              </TableHead>
            )
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rangees.length ? (
          rangees.map((l) => (
            <TableRow
              key={l.id}
              onClick={surLigne ? () => surLigne(l) : undefined}
              onKeyDown={
                surLigne
                  ? (ev) => {
                      if (ev.key === 'Enter' || ev.key === ' ') {
                        ev.preventDefault()
                        surLigne(l)
                      }
                    }
                  : undefined
              }
              tabIndex={surLigne ? 0 : undefined}
              className={cn('hover:bg-[color-mix(in_oklab,var(--muted)_55%,transparent)]', surLigne && 'cursor-pointer outline-none focus-anneau-dedans')}
            >
              {colonnes.map((c) => (
                <TableCell key={c.cle} className={cn('h-10 py-1', c.retour && 'whitespace-normal', c.attenue && 'text-muted-foreground', c.fort && 'font-semibold')}>
                  {c.rendu ? c.rendu(l) : String(l[c.cle] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={colonnes.length} className="h-[120px] text-center text-muted-foreground">
              {vide || '—'}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
