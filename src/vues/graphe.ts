/* Graphe en couches des dépendances : une colonne par rang, le socle au rang 0. Porté sans simplification :
   gabarit, géométrie, disposition par barycentre, couloirs des sauts de rang, étiquettes. */

import type { Fonctionnalite } from '@/domaine/format'
import { compte, moyenne, nb, NBSP } from '@/domaine/formats'
import type { Index } from '@/domaine/indexation'
import { def, LIB, point, type Point } from '@/domaine/libelles'
import type { Etat } from '@/magasin/etat'
import type { Magasin } from '@/magasin/magasin'
import { cheminArrondi } from './geometrie'

/** Une flèche étrangère à la sélection reste lisible, en retrait. */
export const TRAIT_FAIBLE = 'color-mix(in oklab, var(--muted-foreground) 42%, var(--card))'

/* Géométrie du graphe. Les gouttières prennent la place libre : assez larges, elles portent le nom de l'objet
   sur la flèche. Quand la place manque, le socle puis les nœuds se resserrent jusqu'à leur largeur minimale ;
   au-delà, le graphe défile. */
export function gabarit(nRangs: number, maxLignes: number) {
  const dense = nRangs > 4 || maxLignes > 5
  return dense
    ? { dense: true, pad: 20, nw: 192, nh: 124, gy: 24, sw: 148, gxMin: 56, nwMin: 164, swMin: 132, gx: 0 }
    : { dense: false, pad: 20, nw: 200, nh: 124, gy: 28, sw: 156, gxMin: 76, nwMin: 200, swMin: 156, gx: 0 }
}

/** Sans socle, la colonne du rang 0 et sa gouttière disparaissent. */
export function largeurMinGraphe(nRangs: number, maxLignes: number, aSocle: boolean): number {
  const G = gabarit(nRangs, maxLignes)
  return 2 * G.pad + (aSocle ? G.swMin + G.gxMin : 0) + nRangs * G.nwMin + (nRangs - 1) * G.gxMin
}

export function geometrie(nRangs: number, maxLignes: number, dispo: number, aSocle: boolean) {
  const G = gabarit(nRangs, maxLignes)
  if (!aSocle) G.sw = G.swMin = 0
  const gouttieres = Math.max(1, nRangs - (aSocle ? 0 : 1))
  G.gx = Math.floor((dispo - 2 * G.pad - G.sw - nRangs * G.nw) / gouttieres)
  if (G.gx < G.gxMin) {
    G.gx = G.gxMin
    let manque = 2 * G.pad + G.sw + nRangs * G.nw + gouttieres * G.gx - dispo
    const surSocle = Math.min(manque, G.sw - G.swMin)
    G.sw -= surSocle
    manque -= surSocle
    if (manque > 0) G.nw = Math.max(G.nwMin, G.nw - Math.ceil(manque / nRangs))
  }
  G.gx = Math.min(132, G.gx)
  return G
}

export function rangsDuGraphe(ix: Index): Record<number, Fonctionnalite[]> {
  const parRang: Record<number, Fonctionnalite[]> = {}
  ix.liste.forEach((f) => {
    const o = !f.mere && f.reperage && f.reperage.ordre
    if (o && o.statut !== 'signalee' && o.rang != null) (parRang[o.rang] = parRang[o.rang] || []).push(f)
  })
  return parRang
}

export interface TraitGraphe {
  ordre: number
  d: string
  couleur: string
  epaisseur: number
  pointille: boolean
  marqueur: 'normale' | 'forte' | 'faible'
  titre: string
}

export interface NoeudGraphe {
  id: string
  titre: string
  x: number
  y: number
  w: number
  h: number
  bord: string
  ombre: string
  estompe: boolean
  selectionnee: boolean
  extraction: Point
  extractible: boolean
  partielle: boolean
  sous: number
  sousTitre: string
  choisir: () => void
}

/** nu : le graphe seul, sans en-têtes de rang. */
function disposerGraphe(m: Magasin, selId: string | null, largeurDispo: number, nu: boolean) {
  const e = m.etat
  const ix = e.index
  const d = e.donnees
  const aretes = (d.dependances && d.dependances.aretes) || []
  const socle = ((d.dependances && d.dependances.socle) || []).slice().sort((x, y) => y.fonctionnalites.length - x.fonctionnalites.length)
  const parRang = rangsDuGraphe(ix)
  const rangs = Object.keys(parRang)
    .map(Number)
    .sort((x, y) => x - y)
  if (!rangs.length) return null

  /* Ordre dans chaque rang : deux passes de barycentre pour rapprocher une fonctionnalité de ses voisines. */
  const pos: Record<string, number> = {}
  const ordonner = (r: number, voisins: (f: Fonctionnalite) => string[]) => {
    const liste = parRang[r].map((f, i) => {
      const ys = voisins(f)
        .filter((id) => pos[id] != null)
        .map((id) => pos[id])
      return { f, i, b: ys.length ? moyenne(ys) : 1e6 }
    })
    liste.sort((x, y) => x.b - y.b || x.i - y.i)
    parRang[r] = liste.map((x) => x.f)
    parRang[r].forEach((f, i) => {
      pos[f.id] = i
    })
  }
  rangs.forEach((r) => ordonner(r, (f) => aretes.filter((x) => x.source === f.id).map((x) => x.cible)))
  rangs
    .slice()
    .reverse()
    .forEach((r) => ordonner(r, (f) => aretes.filter((x) => x.cible === f.id).map((x) => x.source)))

  const maxLignes = Math.max(...rangs.map((r) => parRang[r].length))
  const aSocle = socle.length > 0 && !nu
  const G = geometrie(rangs.length, maxLignes, nu ? 1e5 : Math.max(640, largeurDispo || 1100), aSocle)
  if (nu) G.gx = 148
  const PAD = G.pad
  const HAUT = nu ? 0 : 32
  const x0 = PAD + (aSocle ? G.sw + G.gx : 0)
  const xCol = (c: number) => x0 + c * (G.nw + G.gx)
  const yLigne = (i: number) => HAUT + G.gy + i * (G.nh + G.gy)
  const yVoie = (k: number) => HAUT + G.gy + k * (G.nh + G.gy) - G.gy / 2
  const largeur = x0 + rangs.length * G.nw + (rangs.length - 1) * G.gx + PAD
  const hautLignes = maxLignes * (G.nh + G.gy) - G.gy
  const hautZone = aSocle ? Math.max(hautLignes, 200) : hautLignes
  const hauteur = HAUT + G.gy + hautZone + G.gy + (nu ? 0 : PAD)

  type R = { x: number; y: number; c: number; i: number }
  type Lien = { a: (typeof aretes)[number]; s: R; t: R; saut?: boolean; voie?: number }
  const rect: Record<string, R> = {}
  rangs.forEach((r, c) =>
    parRang[r].forEach((f, i) => {
      rect[f.id] = { x: xCol(c), y: yLigne(i), c, i }
    })
  )
  const liens: Lien[] = aretes.filter((x) => rect[x.source] && rect[x.cible]).map((x) => ({ a: x, s: rect[x.source], t: rect[x.cible] }))
  const sorties: Record<string, Lien[]> = {}
  const entrees: Record<string, Lien[]> = {}
  const voies: Record<number, Lien[]> = {}
  const gouttieres: Record<number, Lien[]> = {}
  liens.forEach((l) => {
    ;(sorties[l.a.source] = sorties[l.a.source] || []).push(l)
    ;(entrees[l.a.cible] = entrees[l.a.cible] || []).push(l)
    l.saut = l.s.c - l.t.c > 1
    if (l.saut) {
      const yMoy = (l.s.y + l.t.y) / 2 + G.nh / 2
      let meilleur = 0
      let ecart = Infinity
      for (let k = 0; k <= maxLignes; k++) {
        const dk = Math.abs(yVoie(k) - yMoy)
        if (dk <= ecart) {
          ecart = dk
          meilleur = k
        }
      }
      l.voie = meilleur
      ;(voies[meilleur] = voies[meilleur] || []).push(l)
      ;(gouttieres[l.s.c - 1] = gouttieres[l.s.c - 1] || []).push(l)
      ;(gouttieres[l.t.c] = gouttieres[l.t.c] || []).push(l)
    }
  })
  Object.keys(sorties).forEach((id) => sorties[id].sort((p, q) => p.t.y - q.t.y || q.t.c - p.t.c))
  Object.keys(entrees).forEach((id) => entrees[id].sort((p, q) => p.s.y - q.s.y || p.s.c - q.s.c))
  const decal = (liste: Lien[], l: Lien, pas: number, max: number) => {
    const n = liste.length
    const p = n > 1 ? Math.min(pas, max / (n - 1)) : 0
    return (liste.indexOf(l) - (n - 1) / 2) * p
  }

  const lies: Record<string, boolean> = {}
  if (selId)
    aretes.forEach((x) => {
      if (x.source === selId) lies[x.cible] = true
      if (x.cible === selId) lies[x.source] = true
    })
  /* La sélection ne met le reste en retrait que si elle se voit dans le graphe, elle ou l'une de ses voisines. */
  const focus = !!selId && (!!rect[selId] || Object.keys(lies).some((id) => !!rect[id]))
  const toutes = liens.length <= 12
  const traits: TraitGraphe[] = []
  const etiquettes: Array<{ x: number; y: number; texte: string; fort: boolean }> = []
  liens.forEach((l) => {
    const x1 = l.s.x
    const y1 = l.s.y + G.nh / 2 + decal(sorties[l.a.source], l, 12, G.nh - 36)
    const x2 = l.t.x + G.nw + 3
    const y2 = l.t.y + G.nh / 2 + decal(entrees[l.a.cible], l, 12, G.nh - 36)
    let chemin: string
    let ex: number
    let ey: number
    if (l.saut) {
      const voie = l.voie as number
      const yv = yVoie(voie) + decal(voies[voie], l, 5, G.gy - 10)
      /* Les montées se tiennent près des nœuds : le milieu de la gouttière reste aux étiquettes. */
      const g1 = l.s.x - 20 + decal(gouttieres[l.s.c - 1], l, 6, 16)
      const g2 = l.t.x + G.nw + 24 + decal(gouttieres[l.t.c], l, 6, 16)
      chemin = cheminArrondi(
        [
          [x1, y1],
          [g1, y1],
          [g1, yv],
          [g2, yv],
          [g2, y2],
          [x2, y2],
        ],
        10
      )
      ex = (g1 + g2) / 2
      ey = yv
    } else {
      const xm = (x1 + x2) / 2
      chemin = Math.abs(y1 - y2) < 0.5 ? 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2 : 'M ' + x1 + ' ' + y1 + ' C ' + xm + ' ' + y1 + ', ' + xm + ' ' + y2 + ', ' + x2 + ' ' + y2
      ex = xm
      ey = (y1 + y2) / 2
    }
    const fort = !!selId && (l.a.source === selId || l.a.cible === selId)
    const faible = focus && !fort
    traits.push({
      ordre: fort ? 2 : faible ? 0 : 1,
      d: chemin,
      couleur: fort ? 'var(--primary)' : faible ? TRAIT_FAIBLE : 'var(--muted-foreground)',
      epaisseur: fort ? 2 : 1.5,
      pointille: l.a.etat === 'candidate',
      marqueur: fort ? 'forte' : faible ? 'faible' : 'normale',
      titre: l.a.source + ' dépend de ' + l.a.cible + ' par ' + l.a.objet + ' (' + (def(LIB.etat, l.a.etat) || { texte: '' }).texte + ')',
    })
    const tient = l.saut || Math.round(String(l.a.objet).length * 6.7) + 14 <= G.gx - 4
    if (fort || (toutes && tient)) etiquettes.push({ x: Math.round(ex), y: Math.round(ey), texte: l.a.objet, fort })
  })
  traits.sort((p, q) => p.ordre - q.ordre)

  const noeuds: NoeudGraphe[] = []
  rangs.forEach((r) => {
    parRang[r].forEach((f) => {
      const p = rect[f.id]
      const o = f.reperage.ordre as NonNullable<Fonctionnalite['reperage']['ordre']>
      const sel = f.id === selId
      const lie = !!lies[f.id]
      const enfants = ix.enfants[f.id] || []
      noeuds.push({
        id: f.id,
        titre: f.titre,
        x: p.x,
        y: p.y,
        w: G.nw,
        h: G.nh,
        bord: sel ? 'var(--primary)' : lie ? 'var(--ring)' : 'var(--border)',
        ombre: sel ? '0 0 0 1px var(--primary), var(--shadow-sm)' : 'var(--shadow-xs)',
        estompe: focus && !sel && !lie,
        selectionnee: sel,
        extraction: point(def(LIB.extraction, f.extraction)),
        extractible: !!o.extractible && f.extraction === 'notExtracted',
        partielle: o.statut === 'partielle',
        sous: enfants.length,
        sousTitre: compte(enfants.length, 'sous-fonctionnalité', 'sous-fonctionnalités'),
        choisir: () => m.ouvrirFonctionnalite(f.id),
      })
    })
  })

  const place = Math.max(0, Math.floor((hautZone - 72) / 26))
  const atteint = (u: (typeof socle)[number]) => !!selId && u.fonctionnalites.indexOf(selId) >= 0
  const visibles = socle.slice(0, socle.length > place ? Math.max(0, place - 1) : place)
  const colonnes = nu
    ? []
    : rangs.map((r, c) => ({ x: xCol(c), w: G.nw, titre: 'Rang' + NBSP + r, sous: compte(parRang[r].length, 'fonctionnalité', 'fonctionnalités') }))
  if (aSocle) colonnes.unshift({ x: PAD, w: G.sw, titre: 'Rang' + NBSP + '0', sous: 'Socle' })
  return {
    largeur,
    hauteur,
    colonnes,
    aSocle,
    socle: {
      x: PAD,
      y: yLigne(0),
      w: G.sw,
      h: hautZone,
      compte: compte(socle.length, 'utilitaire partagé', 'utilitaires partagés'),
      items: visibles.map((u) => ({ objet: u.objet, compte: nb(u.fonctionnalites.length), atteint: atteint(u) })),
      reste: socle.length > visibles.length ? 'et ' + compte(socle.length - visibles.length, 'autre', 'autres') : '',
    },
    traits,
    etiquettes,
    noeuds,
  }
}

export function selectionGraphe(e: Etat): Fonctionnalite | null {
  const choisie = e.index.parId[e.fonctionnaliteId || ''] || null
  return choisie ? (choisie.mere ? e.index.parId[choisie.mere] || null : choisie) : null
}

/** Le graphe en couches, calculé à la largeur que le composant mesure. */
export function vueGraphe(m: Magasin, largeur: number, nu = false) {
  const sel = selectionGraphe(m.etat)
  return disposerGraphe(m, sel ? sel.id : null, largeur, nu)
}

export type VueGraphe = NonNullable<ReturnType<typeof vueGraphe>>
