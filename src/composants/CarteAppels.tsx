import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  EdgeLabelRenderer,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useViewport,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import { cn } from 'cn'
import { Button } from '@/composants/ui/button'
import { Switch } from '@/composants/ui/switch'
import { NBSP } from '@/domaine/formats'
import { useMagasin } from '@/magasin/contexte'
import { CARTE as G, TRAIT_CARTE, vueCarteAppels, ZOOMS, type AreteCarte, type NoeudCarte, type VueCarteAppels } from '@/vues/carte'
import { Icone } from './Icone'
import { Marques } from './Marques'

/* La carte des appels. La disposition (disposerCarte) et le choix des appels affichés viennent des vues ;
   React Flow ne dispose rien : il porte le déplacement, le zoom et la vue d'ensemble. */

type DonneesNoeud = { n: NoeudCarte; basculer: () => void; reveler: (cle: string) => void }
type NoeudRF = Node<DonneesNoeud, 'appel'>
type AreteRF = Edge<{ a: AreteCarte }, 'appel'>

const ETIQUETTES_ARIA = {
  'node.a11yDescription.default': '',
  'node.a11yDescription.keyboardDisabled': '',
  'node.a11yDescription.ariaLiveMessage': () => '',
  'edge.a11yDescription.default': '',
  'minimap.ariaLabel': "Vue d'ensemble de la carte",
}

const PASTILLES = {
  repliee: 'border-transparent bg-secondary text-secondary-foreground',
  depliee: 'border-input bg-transparent text-muted-foreground',
}

function NoeudAppel({ data }: NodeProps<NoeudRF>) {
  const n = data.n
  const pastille = n.pastille === 'fixe' ? cn('border-transparent text-foreground', n.teinte ? 'bg-card' : 'bg-muted') : PASTILLES[n.pastille]
  return (
    <div
      role="group"
      aria-label={n.libelle}
      onFocus={() => data.reveler(n.cle)}
      className="pointer-events-auto relative box-border flex size-full items-center gap-0.5 rounded-lg pr-1.5"
      style={{ background: n.fond, border: '1px ' + n.trait + ' ' + n.bord, boxShadow: n.selectionnee ? '0 0 0 1px var(--primary)' : undefined }}
    >
      <Handle type="target" position={Position.Left} isConnectable={false} className="pointer-events-none! opacity-0!" />
      <button
        type="button"
        onClick={n.choisir}
        onDoubleClick={n.aBascule ? data.basculer : undefined}
        aria-pressed={n.selectionnee}
        title={n.id}
        className="flex min-w-0 flex-1 cursor-pointer flex-col justify-center gap-0.5 self-stretch rounded-[inherit] py-0 pr-1 pl-3 text-left outline-none focus-anneau"
      >
        <span className="flex min-w-0 font-mono text-[13px]/[18px] whitespace-nowrap text-muted-foreground">
          <span className="min-w-0 flex-[0_1_auto] truncate">{n.prefixe}</span>
          <span className="max-w-full flex-none truncate font-semibold text-foreground">{n.nom}</span>
        </span>
        <span className="flex h-6 min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap">
          <Marques marques={n.marques} />
          <span className="min-w-0 flex-[0_1_auto] truncate text-xs/4 text-muted-foreground tabular-nums">{n.detail}</span>
        </span>
      </button>
      {n.aBascule && (
        <button
          type="button"
          onClick={data.basculer}
          aria-expanded={n.ouverte}
          aria-label={n.basculeLabel}
          title={n.basculeLabel}
          className={cn(
            'inline-flex h-6 min-w-6 flex-none cursor-pointer items-center justify-center rounded-full border text-xs/4 font-semibold tabular-nums outline-none hover:bg-accent hover:text-accent-foreground focus-anneau',
            pastille,
            n.compte ? 'pr-[3px] pl-2' : 'p-0'
          )}
        >
          {n.compte && <span>{n.compte}</span>}
          <Icone nom={n.ouverte ? 'chevron-left' : 'chevron-right'} taille={14} />
        </button>
      )}
      {n.aCompteFixe && (
        <span title={n.compteTitre} className={cn('box-border inline-flex h-6 min-w-6 flex-none items-center justify-center rounded-full border px-[7px] text-xs/4 font-semibold tabular-nums', pastille)}>
          <span aria-hidden="true">{n.compte}</span>
          <span className="sr-only">{n.compteTitre}</span>
        </span>
      )}
      {n.suivre && (
        <button
          type="button"
          onClick={n.suivre}
          aria-label={n.suivreLabel}
          title={n.suivreLabel}
          className="grid size-6 flex-none cursor-pointer place-items-center rounded-full text-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-anneau"
        >
          <Icone nom="arrow-right" taille={14} />
        </button>
      )}
      <Handle type="source" position={Position.Right} isConnectable={false} className="pointer-events-none! opacity-0!" />
    </div>
  )
}

/** La flèche : un coude arrondi dont le tronc part près du parent, la pointe du côté de la fonction appelée,
 *  l'horloge « en différé » sur la branche qui arrive au nœud. */
function AreteAppel({ data }: EdgeProps<AreteRF>) {
  if (!data) return null
  const a = data.a
  return (
    <>
      <path d={a.d} fill="none" stroke={a.fort ? 'var(--primary)' : TRAIT_CARTE} strokeWidth={a.fort ? 2 : 1.5} markerEnd={'url(#' + (a.fort ? 'tp-carte-pointe-forte' : 'tp-carte-pointe') + ')'} />
      {a.differe && (
        <EdgeLabelRenderer>
          <span
            title="Appel en différé"
            className="absolute grid size-5 place-items-center rounded-full bg-info-soft text-info shadow-[0_0_0_2px_var(--background)]"
            style={{ transform: 'translate(-50%, -50%) translate(' + (a.xArrivee - 21) + 'px, ' + a.yArrivee + 'px)', pointerEvents: 'all' }}
          >
            <Icone nom="clock" taille={13} />
          </span>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

const TYPES_NOEUDS = { appel: NoeudAppel }
const TYPES_ARETES = { appel: AreteAppel }

/** La place laissée à la carte : la hauteur de la fenêtre qui défile, moins ce que la page montre au-dessus et
 *  au-dessous de la zone. 360 px au moins. */
function plafondMesure(zone: HTMLElement): number {
  let c: HTMLElement | null = zone.parentElement
  while (c && c !== document.body) {
    const oy = getComputedStyle(c).overflowY
    if (oy === 'auto' || oy === 'scroll') break
    c = c.parentElement
  }
  const rz = zone.getBoundingClientRect()
  let hauteur: number
  let haut: number
  let basContenu: number
  let marge = 0
  if (c && c !== document.body) {
    const rc = c.getBoundingClientRect()
    const dernier = c.lastElementChild
    hauteur = c.clientHeight
    haut = rz.top - rc.top + c.scrollTop
    basContenu = dernier ? dernier.getBoundingClientRect().bottom - rc.top + c.scrollTop : haut + zone.offsetHeight
    marge = parseFloat(getComputedStyle(c).paddingBottom) || 0
  } else {
    hauteur = window.innerHeight
    haut = rz.top + window.scrollY
    basContenu = document.body.getBoundingClientRect().bottom + window.scrollY
  }
  const dessous = Math.max(0, basContenu - haut - zone.offsetHeight) + marge
  return Math.max(360, Math.floor(hauteur - haut - dessous))
}

export function CarteAppels() {
  return (
    <ReactFlowProvider>
      <CarteInterne />
    </ReactFlowProvider>
  )
}

function CarteInterne() {
  const m = useMagasin()
  const v = vueCarteAppels(m) as VueCarteAppels
  const rf = useReactFlow<NoeudRF, AreteRF>()
  const { zoom } = useViewport()
  const zone = useRef<HTMLDivElement>(null)
  const [mesure, setMesure] = useState({ largeur: 0, plafond: 0 })
  const ancre = useRef<{ cle: string; x: number; y: number } | null>(null)
  const revele = useRef<string | null>(null)
  const ajusterAuDepart = useRef(m.etat.carteZoomDepart === 'ajuste')
  const vu = useRef(v)
  useLayoutEffect(() => {
    vu.current = v
  })

  const mesurer = useCallback(() => {
    const z = zone.current
    if (!z) return
    const w = Math.floor(z.offsetWidth)
    const h = plafondMesure(z)
    setMesure((p) => (w > 0 && (Math.abs(w - p.largeur) > 2 || Math.abs(h - p.plafond) > 1) ? { largeur: w, plafond: h } : p))
  }, [])

  useEffect(() => {
    mesurer()
    const z = zone.current
    const o = typeof ResizeObserver !== 'undefined' && z ? new ResizeObserver(() => mesurer()) : null
    if (o && z) {
      o.observe(z)
      const fenetre = z.closest('[data-zone=contenu]')
      if (fenetre) o.observe(fenetre)
    }
    window.addEventListener('resize', mesurer)
    return () => {
      o?.disconnect()
      window.removeEventListener('resize', mesurer)
    }
  }, [mesurer])
  /* Un en-tête ou un pied qui change de hauteur déplace la zone : la place se remesure après chaque rendu. */
  useEffect(() => {
    const t = setTimeout(mesurer, 0)
    return () => clearTimeout(t)
  })

  const hauteurZone = mesure.plafond ? Math.min(mesure.plafond, v.hauteur) : Math.min(v.hauteur, 480)

  /** Amène la sélection dans la fenêtre si elle n'y est pas tout entière. À l'ouverture d'un arbre, elle se centre
   *  en hauteur ; en largeur, la carte ne bouge que si la sélection est hors champ, pour garder la signature à gauche. */
  const reveler = useCallback(
    (cle: string, force: boolean, echelle?: number) => {
      const z = zone.current
      const c = vu.current
      const p = c.pos[cle]
      if (!z || !p) return
      const vp = rf.getViewport()
      const s = echelle ?? vp.zoom
      const W = z.clientWidth
      const H = z.clientHeight
      const marge = 16
      const gauche = p.x * s
      const haut = p.y * s
      const droite = gauche + G.nw * s
      const bas = haut + G.nh * s
      let sl = force ? 0 : -vp.x
      let st = -vp.y
      if (force || !(haut >= st + marge && bas <= st + H - marge)) st = (haut + bas) / 2 - H / 2
      if (!(gauche >= sl + marge && droite <= sl + W - marge)) sl = (gauche + droite) / 2 - W / 2
      st = Math.max(0, Math.min(st, c.hauteur * s - H))
      sl = Math.max(0, Math.min(sl, c.largeur * s - W))
      if (sl !== -vp.x || st !== -vp.y || s !== vp.zoom) rf.setViewport({ x: -sl, y: -st, zoom: s })
    },
    [rf]
  )

  /* Après chaque rendu : garder en place le nœud qu'on vient de déplier, ou amener la sélection à l'écran. */
  useLayoutEffect(() => {
    if (!mesure.largeur) return
    if (ancre.current) {
      const q = v.pos[ancre.current.cle]
      if (q) {
        const vp = rf.getViewport()
        rf.setViewport({ x: vp.x - (q.x - ancre.current.x) * vp.zoom, y: vp.y - (q.y - ancre.current.y) * vp.zoom, zoom: vp.zoom })
      }
      ancre.current = null
      revele.current = v.signature + '/' + v.selCle
      return
    }
    const cle = v.signature + '/' + v.selCle
    if (cle === revele.current) return
    const nouvelArbre = !revele.current || revele.current.split('/')[0] !== v.signature
    revele.current = cle
    if (nouvelArbre && ajusterAuDepart.current) {
      /* React Flow mesure sa zone après ce rendu : l'ajustement attend qu'il connaisse la hauteur finale. */
      ajusterAuDepart.current = false
      reveler(v.selCle, true, 1)
      requestAnimationFrame(() => requestAnimationFrame(() => void rf.fitView({ padding: 0.01, minZoom: 0.1, maxZoom: 1 })))
      return
    }
    reveler(v.selCle, nouvelArbre, nouvelArbre ? 1 : undefined)
  })

  const noeuds: NoeudRF[] = v.noeuds.map((n) => ({
    id: n.cle,
    type: 'appel',
    position: { x: n.x, y: n.y },
    width: G.nw,
    height: G.nh,
    style: { width: G.nw, height: G.nh },
    draggable: false,
    selectable: false,
    connectable: false,
    focusable: false,
    data: {
      n,
      basculer: () => {
        ancre.current = { cle: n.cle, x: n.x, y: n.y }
        n.basculer()
      },
      reveler: (cle: string) => {
        const z = zone.current
        const p = vu.current.pos[cle]
        if (!z || !p) return
        const vp = rf.getViewport()
        const gauche = p.x * vp.zoom + vp.x
        const haut = p.y * vp.zoom + vp.y
        if (gauche < 0 || haut < 0 || gauche + G.nw * vp.zoom > z.clientWidth || haut + G.nh * vp.zoom > z.clientHeight) void rf.setCenter(p.x + G.nw / 2, p.y + G.nh / 2, { zoom: vp.zoom })
      },
    },
  }))
  const aretes: AreteRF[] = v.aretes.map((a) => ({ id: a.id, source: a.source, target: a.cible, type: 'appel', data: { a }, selectable: false, focusable: false, interactionWidth: 0 }))

  const r = v.reglages
  const plusBas = ZOOMS.filter((z) => z < zoom - 0.005).pop()
  const plusHaut = ZOOMS.filter((z) => z > zoom + 0.005)[0]
  const pourcent = Math.round(zoom * 100) + NBSP + '%'
  /* La vue d'ensemble n'apparaît que si les nœuds débordent franchement de la zone. */
  const deborde = mesure.largeur > 0 && ((v.largeur - 2 * G.pad) * zoom > mesure.largeur + 24 || (v.hauteur - 2 * G.pad) * zoom > hauteurZone + 24)

  return (
    <div className="flex min-w-0 flex-col">
      <div className="box-border flex min-h-11 flex-wrap items-center gap-x-5 gap-y-1 border-b py-1 pr-3 pl-5">
        <span role="status" className="flex-[1_1_200px] text-[13px]/[18px] text-muted-foreground tabular-nums">
          {v.resume}
        </span>
        {r.aRenvois && (
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <Switch checked={r.renvoisActifs} onCheckedChange={(oui) => r.surRenvois(oui)} />
            <span>{r.libelleRenvois}</span>
          </label>
        )}
        <span role="group" aria-label="Niveaux affichés" className="inline-flex items-center gap-0.5">
          <span aria-hidden="true" className="pr-1 text-[13px]/[18px] text-muted-foreground">
            Niveaux
          </span>
          <Button variant="ghost" size="icon-sm" aria-label="Replier d'un niveau" title="Replier d'un niveau" disabled={r.sansMoins} onClick={r.moins}>
            <Icone nom="chevrons-left" taille={14} />
          </Button>
          <span title={r.libelleNiveau} className="min-w-5 text-center text-[13px]/[18px] font-semibold text-foreground tabular-nums">
            <span aria-hidden="true">{r.niveau}</span>
            <span className="sr-only">{r.libelleNiveau}</span>
          </span>
          <Button variant="ghost" size="icon-sm" aria-label="Déplier d'un niveau" title="Déplier d'un niveau" disabled={r.sansPlus} onClick={r.plus}>
            <Icone nom="chevrons-right" taille={14} />
          </Button>
        </span>
        <span className="inline-flex items-center gap-0.5">
          <Button variant="ghost" size="sm" disabled={r.toutDeplie} onClick={r.toutDeplier}>
            Tout déplier
          </Button>
          <Button variant="ghost" size="sm" disabled={r.parDefaut} onClick={r.revenir}>
            {r.libelleRevenir}
          </Button>
        </span>
        <span role="group" aria-label="Zoom de la carte" className="ml-auto inline-flex items-center gap-0.5">
          <Button variant="ghost" size="icon-sm" aria-label="Zoom arrière" title="Zoom arrière" disabled={plusBas == null} onClick={() => plusBas != null && void rf.zoomTo(plusBas)}>
            <Icone nom="minus" taille={14} />
          </Button>
          <Button variant="ghost" size="sm" aria-label={'Zoom à ' + pourcent + '. Revenir à 100' + NBSP + '%'} title={'Revenir à 100' + NBSP + '%'} className="min-w-[58px] justify-center tabular-nums" onClick={() => void rf.zoomTo(1)}>
            {pourcent}
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Zoom avant" title="Zoom avant" disabled={plusHaut == null} onClick={() => plusHaut != null && void rf.zoomTo(plusHaut)}>
            <Icone nom="plus" taille={14} />
          </Button>
          <Button variant="outline" size="sm" title="Faire tenir toute la carte dans la zone" onClick={() => void rf.fitView({ padding: 0.01, minZoom: 0.1, maxZoom: 1 })}>
            Ajuster
          </Button>
        </span>
      </div>

      <div ref={zone} role="group" aria-label={'Carte des appels de ' + v.signature} className="relative bg-background" style={{ height: hauteurZone }}>
        <svg aria-hidden="true" width="0" height="0" className="absolute">
          <defs>
            <marker id="tp-carte-pointe" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={8} markerHeight={8} markerUnits="userSpaceOnUse" orient="auto">
              <path d="M0 0.5 L7.5 4 L0 7.5 Z" style={{ fill: TRAIT_CARTE }} />
            </marker>
            <marker id="tp-carte-pointe-forte" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={9} markerHeight={9} markerUnits="userSpaceOnUse" orient="auto">
              <path d="M0 0.5 L7.5 4 L0 7.5 Z" style={{ fill: 'var(--primary)' }} />
            </marker>
          </defs>
        </svg>
        <ReactFlow<NoeudRF, AreteRF>
          nodes={noeuds}
          edges={aretes}
          nodeTypes={TYPES_NOEUDS}
          edgeTypes={TYPES_ARETES}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.1}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          panOnScroll
          zoomOnScroll={false}
          zoomOnPinch
          zoomOnDoubleClick={false}
          autoPanOnNodeFocus={false}
          colorMode={m.etat.theme}
          ariaLabelConfig={ETIQUETTES_ARIA}
          style={{ background: 'var(--background)' }}
        >
          {deborde && (
            <MiniMap<NoeudRF>
              aria-hidden="true"
              ariaLabel={null}
              pannable
              nodeColor={(n) => (n.data.n.selectionnee ? 'var(--primary)' : n.data.n.mini)}
              nodeBorderRadius={10}
              nodeStrokeWidth={0}
              bgColor="var(--card)"
              maskColor="color-mix(in oklab, var(--background) 55%, transparent)"
              style={{ width: 180, height: 140 }}
            />
          )}
        </ReactFlow>
      </div>
    </div>
  )
}
