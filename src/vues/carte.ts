/* Carte : l'arbre d'appels en nœuds et en flèches, de gauche à droite.
   La disposition et le choix des appels affichés sont portés du prototype ; le déplacement, le zoom et la vue d'ensemble
   sont laissés à React Flow, dans le composant. */

import { compte, nb, NBSP } from '@/domaine/formats'
import type { ArbreIndexe, Noeud } from '@/domaine/indexation'
import { arbreDe, nomDansArbre } from '@/domaine/indexation'
import { LIB, QUESTIONS, type Marque } from '@/domaine/libelles'
import type { ModeNoeud } from '@/domaine/indexation'
import { affichable, arbreCourant, carteOuverte, enfantsCarte, NIVEAUX_CARTE, type Etat } from '@/magasin/etat'
import type { Magasin } from '@/magasin/magasin'
import { arbreVide, libelleSuivi, marquesNoeud, mesuresArbre, optionsArbres, precisionNoeud, tailleNoeud } from './commun'
import { cheminArrondi } from './geometrie'

/** Gabarit de la carte : largeur et hauteur d'un nœud, gouttière entre deux colonnes, écart entre deux frères et entre
 *  deux branches, marge, et longueur du tronc d'une flèche depuis son parent. */
export const CARTE = { nw: 236, nh: 54, gx: 48, gy: 8, gyBranche: 18, pad: 20, tronc: 14 }
export type GabaritCarte = typeof CARTE

/** Les crans du zoom par bouton. */
export const ZOOMS = [0.25, 0.33, 0.5, 0.67, 0.8, 1, 1.25, 1.5]

export const TRAIT_CARTE = 'color-mix(in oklab, var(--muted-foreground) 55%, var(--card))'

/* Le cadre dit la nature du nœud, lisible même quand la carte est réduite ; le badge la redit en un mot. */
export const CADRES_CARTE: Record<'developpement' | 'reference' | 'arret' | 'autreArbre', { texte: string; fond: string; bord: string; trait: 'solid' | 'dashed'; mini: string }> = {
  developpement: { texte: 'Développée', fond: 'var(--card)', bord: 'var(--border)', trait: 'solid', mini: 'color-mix(in oklab, var(--muted-foreground) 50%, var(--card))' },
  reference: { texte: 'Renvoi', fond: 'transparent', bord: 'var(--input)', trait: 'dashed', mini: 'var(--input)' },
  arret: { texte: 'Arrêt', fond: 'var(--warning-soft)', bord: 'color-mix(in oklab, var(--warning) 45%, var(--border))', trait: 'solid', mini: 'var(--warning)' },
  autreArbre: { texte: 'Autre arbre', fond: 'var(--secondary)', bord: 'color-mix(in oklab, var(--primary) 40%, var(--border))', trait: 'solid', mini: 'color-mix(in oklab, var(--primary) 70%, var(--card))' },
}
export function cadreCarte(mode: ModeNoeud) {
  return mode === 'racine' ? CADRES_CARTE.developpement : CADRES_CARTE[mode] || CADRES_CARTE.developpement
}

export interface PosCarte {
  enfants: Noeud[]
  niveau: number
  x: number
  y: number
  dec: number
}

/* Arbre rangé, de gauche à droite. Un parent se centre sur ses enfants ; deux branches voisines se rapprochent
   jusqu'à se toucher, colonne par colonne : une feuille se loge à côté des descendants de sa voisine.
   Fonction pure : la racine et les enfants affichés de chaque nœud donnent les positions. */
export function disposerCarte(racine: Noeud, enfantsDe: (n: Noeud) => Noeud[], G: GabaritCarte = CARTE) {
  const pos: Record<string, PosCarte> = {}
  const ordre: Noeud[] = []
  let profondeur = 0
  function placer(n: Noeud, niveau: number): Array<[number, number]> {
    const enfants = enfantsDe(n)
    const p: PosCarte = (pos[n.cle] = { enfants, niveau, x: 0, y: 0, dec: 0 })
    ordre.push(n)
    if (niveau > profondeur) profondeur = niveau
    if (!enfants.length) return [[0, G.nh]]
    const fusion: Array<[number, number]> = []
    enfants.forEach((c, i) => {
      const cc = placer(c, niveau + 1)
      let dec = 0
      if (i) for (let d = 0; d < cc.length && d < fusion.length; d++) dec = Math.max(dec, fusion[d][1] + (d ? G.gyBranche : G.gy) - cc[d][0])
      pos[c.cle].dec = dec
      for (let d = 0; d < cc.length; d++) {
        if (!fusion[d]) fusion[d] = [cc[d][0] + dec, cc[d][1] + dec]
        else {
          fusion[d][0] = Math.min(fusion[d][0], cc[d][0] + dec)
          fusion[d][1] = Math.max(fusion[d][1], cc[d][1] + dec)
        }
      }
    })
    const premier = pos[enfants[0].cle]
    const dernier = pos[enfants[enfants.length - 1].cle]
    p.y = (premier.dec + premier.y + dernier.dec + dernier.y) / 2
    return ([[p.y, p.y + G.nh]] as Array<[number, number]>).concat(fusion)
  }
  let bas = 0
  placer(racine, 0).forEach((c) => {
    if (c[1] > bas) bas = c[1]
  })
  const poser = (n: Noeud, base: number) => {
    const p = pos[n.cle]
    p.x = G.pad + p.niveau * (G.nw + G.gx)
    p.y = Math.round(G.pad + base + p.y)
    p.enfants.forEach((c) => poser(c, base + pos[c.cle].dec))
  }
  poser(racine, 0)
  return { pos, ordre, profondeur, largeur: 2 * G.pad + (profondeur + 1) * G.nw + profondeur * G.gx, hauteur: Math.round(bas) + 2 * G.pad }
}

/** Ce que la carte montre de l'arbre, sans la dessiner : de quoi écrire le résumé et griser les boutons. */
export function etatCarte(e: Etat, a: ArbreIndexe) {
  let affiches = -1
  let niveaux = 0
  let total = 0
  let niveauxMax = 0
  let renvois = 0
  let parDefaut = true
  const voir = (n: Noeud) => {
    affiches++
    if (n.profondeur > niveaux) niveaux = n.profondeur
    enfantsCarte(e, a, n).forEach(voir)
  }
  voir(a.racine)
  a.noeuds.forEach((n) => {
    if (n.mode === 'reference') renvois++
    if (n.enfants.length && carteOuverte(e, a, n) !== n.profondeur < NIVEAUX_CARTE) parDefaut = false
    if (!n.parent || !affichable(e, n)) return
    total++
    if (n.profondeur > niveauxMax) niveauxMax = n.profondeur
  })
  return { affiches, total, niveaux, niveauxMax, renvois, parDefaut }
}

function resumeSelection(m: Magasin, a: ArbreIndexe, n: Noeud) {
  const e = m.etat
  const fn = e.donnees.fonctions[n.fonction]
  const dev = n.mode === 'racine' ? n : a.dev[n.fonction] || null
  const t = n.mode === 'reference' && dev ? tailleNoeud(e, a, dev) : tailleNoeud(e, a, n)
  const morceaux: string[] = []
  if (t) {
    if (t.fonctions != null) morceaux.push(compte(t.fonctions, 'fonction', 'fonctions'))
    if (t.lignes != null) morceaux.push(compte(t.lignes, 'ligne', 'lignes'))
    if (t.profondeur) morceaux.push(compte(t.profondeur, 'niveau', 'niveaux'))
  }
  let appel = ''
  if (n.parent) {
    const parent = nomDansArbre(e.donnees, a, n.parent.fonction, n.parent.mode === 'racine')
    appel = 'Appelée par ' + parent.nom + (n.ligne != null ? ', ligne' + NBSP + n.ligne : '')
  }
  const precision = n.mode === 'racine' ? '' : precisionNoeud(e, a, n)
  return {
    id: n.fonction,
    nature: (fn && LIB.nature[fn.nature]) || 'Nature inconnue',
    marques: marquesNoeud(e, a, n),
    resume: [
      appel || "Point d'entrée de l'arbre",
      morceaux.length ? 'branche de ' + morceaux.join(', ') : n.mode === 'arret' ? "hors de la taille : l'arbre s'arrête ici" + (precision ? ', ' + precision : '') : '',
    ]
      .filter(Boolean)
      .join(' · '),
  }
}

/** L'onglet : le choix de l'arbre, ses mesures, la légende et la fonction sélectionnée. */
export function vueCarte(m: Magasin) {
  const e = m.etat
  const ix = e.index
  const f = ix.parId[e.fonctionnaliteId || ''] || null
  const a = f ? arbreDe(ix, f) : null
  const t = a && a.arbre.taille
  const sel = a ? a.parCle[e.cleSel] || a.racine : null
  const presents: Record<string, boolean> = {}
  let differes = false
  if (a)
    a.noeuds.forEach((n) => {
      presents[n.mode === 'racine' ? 'developpement' : n.mode] = true
      if (n.post) differes = true
    })
  const legende = (['developpement', 'arret', 'autreArbre', 'reference'] as const)
    .filter((k) => presents[k] && (k !== 'reference' || e.carteRenvois))
    .map((k) => {
      const K = CADRES_CARTE[k]
      return { texte: K.texte, fond: K.fond, bord: k === 'developpement' ? 'var(--input)' : K.bord, trait: K.trait }
    })
  return {
    question: QUESTIONS.carte,
    optionsArbres: optionsArbres(ix, f),
    fonctionnaliteId: e.fonctionnaliteId || '',
    surChoixArbre: (id: string) => m.ouvrirFonctionnalite(id),
    stats: mesuresArbre(t, ['fonctions', 'lignes', 'profondeur', 'arrets', 'posts']),
    aArbre: !!a,
    vide: arbreVide(m, f && !a ? f : null),
    legende,
    aDifferes: differes,
    selection: a && sel ? resumeSelection(m, a, sel) : null,
    allerReperage: () => m.allerOnglet('reperage'),
  }
}

export interface NoeudCarte {
  cle: string
  id: string
  prefixe: string
  nom: string
  x: number
  y: number
  mode: ModeNoeud
  libelle: string
  differe: boolean
  fond: string
  bord: string
  trait: 'solid' | 'dashed'
  mini: string
  selectionnee: boolean
  surChemin: boolean
  choisir: () => void
  marques: Marque[]
  detail: string
  aBascule: boolean
  ouverte: boolean
  compte: string
  pastille: 'repliee' | 'depliee' | 'fixe'
  teinte: boolean
  basculeLabel: string
  basculer: () => void
  aCompteFixe: boolean
  compteTitre: string
  suivre: (() => void) | null
  suivreLabel: string
}

export interface AreteCarte {
  id: string
  source: string
  cible: string
  d: string
  fort: boolean
  differe: boolean
  /** Le point d'arrivée de la flèche, pour poser l'horloge « en différé » sur la branche qui arrive au nœud. */
  xArrivee: number
  yArrivee: number
}

/** La carte elle-même : nœuds placés, flèches tracées, résumé et réglages. */
export function vueCarteAppels(m: Magasin) {
  const e = m.etat
  const a = arbreCourant(e)
  const G = CARTE
  if (!a) return null
  const L = disposerCarte(a.racine, (n) => enfantsCarte(e, a, n), G)
  const E = etatCarte(e, a)
  const sel = a.parCle[e.cleSel] || a.racine
  const cleSel = sel.cle
  const chemin: Record<string, boolean> = {}
  for (let p: Noeud | null = sel; p; p = p.parent) chemin[p.cle] = true

  const aretes: AreteCarte[] = []
  const noeuds: NoeudCarte[] = L.ordre.map((n) => {
    const P = L.pos[n.cle]
    const racine = n.mode === 'racine'
    const nom = nomDansArbre(e.donnees, a, n.fonction, racine)
    const t = tailleNoeud(e, a, n)
    const cible = m.cibleSuivi(a, n)
    const affichables = n.enfants.filter((x) => affichable(e, x)).length
    const masques = n.enfants.length - affichables
    const ouverte = affichables > 0 && carteOuverte(e, a, n)
    const estSel = n.cle === cleSel
    const surChemin = !!chemin[n.cle]
    const K = cadreCarte(n.mode)
    const teinte = n.mode === 'arret' || n.mode === 'autreArbre'
    /* « En différé » qualifie l'appel : sur la carte, la marque se pose sur la flèche, pas dans le nœud. */
    let marques = marquesNoeud(e, a, n).filter((q) => q.texte !== LIB.post.texte)
    if (teinte) marques = marques.map((q) => ({ ...q, variante: 'outline' as const }))
    const morceaux: string[] = []
    if (racine) morceaux.push('signature mère')
    else if (n.mode === 'arret') {
      const pr = precisionNoeud(e, a, n)
      if (pr) morceaux.push(pr)
    }
    if (t && t.lignes != null && n.mode !== 'autreArbre') morceaux.push(compte(t.lignes, 'ligne', 'lignes'))
    if (masques) morceaux.push(compte(masques, 'renvoi', 'renvois'))
    const nbFonctions = t && t.fonctions != null && t.fonctions > 1 ? nb(t.fonctions) : ''
    P.enfants.forEach((c) => {
      const C = L.pos[c.cle]
      const fort = !!chemin[c.cle]
      /* Le tronc part près du parent : la branche qui arrive au nœud garde la place de la marque « en différé ». */
      const x1 = P.x + G.nw
      const y1 = P.y + G.nh / 2
      const x2 = C.x - 1
      const y2 = C.y + G.nh / 2
      const xm = x1 + G.tronc
      aretes.push({ id: n.cle + '>' + c.cle, source: n.cle, cible: c.cle, d: cheminArrondi([[x1, y1], [xm, y1], [xm, y2], [x2, y2]], 8), fort, differe: c.post, xArrivee: C.x, yArrivee: y2 })
    })
    return {
      cle: n.cle,
      id: n.fonction,
      prefixe: nom.prefixe,
      nom: nom.nom,
      x: P.x,
      y: P.y,
      mode: n.mode,
      libelle: n.fonction + (n.post ? ', appelée en différé' : ''),
      differe: n.post,
      fond: K.fond,
      bord: estSel ? 'var(--primary)' : surChemin ? 'var(--ring)' : K.bord,
      trait: K.trait,
      mini: K.mini,
      selectionnee: estSel,
      surChemin,
      choisir: () => m.selectionnerNoeud(n),
      marques,
      detail: morceaux.join(' · '),
      aBascule: affichables > 0,
      ouverte,
      compte: nbFonctions,
      pastille: affichables > 0 && !ouverte ? 'repliee' : affichables > 0 ? 'depliee' : 'fixe',
      teinte,
      basculeLabel: ouverte ? 'Replier ' + nom.nom : 'Déplier ' + nom.nom + ' : ' + compte(affichables, 'appel', 'appels') + (nbFonctions ? ', branche de ' + nbFonctions + ' fonctions' : ''),
      basculer: () => m.basculerCarte(a, n),
      aCompteFixe: !affichables && !!nbFonctions,
      compteTitre: nbFonctions ? 'Branche de ' + nbFonctions + ' fonctions' : '',
      suivre: cible ? () => m.suivre(a, n) : null,
      suivreLabel: libelleSuivi(e, cible),
    }
  })
  /* Les flèches du chemin de la sélection se dessinent par-dessus les autres. */
  aretes.sort((p, q) => Number(p.fort) - Number(q.fort))

  const horsRenvois = E.renvois && !e.carteRenvois ? ', hors renvois' : ''
  let resume: string
  if (!E.total) resume = 'Aucun appel sous cette signature' + horsRenvois
  else if (E.affiches >= E.total) resume = compte(E.total, 'appel affiché', 'appels, tous affichés') + horsRenvois
  else resume = compte(E.affiches, 'appel affiché', 'appels affichés') + ' sur ' + nb(E.total) + horsRenvois
  const toutAffiche = E.affiches >= E.total

  return {
    signature: a.signature,
    selCle: cleSel,
    largeur: L.largeur,
    hauteur: L.hauteur,
    noeuds,
    aretes,
    pos: L.pos,
    resume,
    reglages: {
      aRenvois: E.renvois > 0,
      renvoisActifs: !!e.carteRenvois,
      libelleRenvois: 'Renvois · ' + nb(E.renvois),
      surRenvois: (oui: boolean) => m.montrerRenvois(oui),
      niveau: String(E.niveaux),
      libelleNiveau: compte(E.niveaux, 'niveau affiché', 'niveaux affichés'),
      moins: () => m.niveauCarte(-1),
      sansMoins: E.niveaux <= 1,
      plus: () => m.niveauCarte(1),
      sansPlus: toutAffiche,
      toutDeplier: () => m.deplierCarte(true),
      toutDeplie: toutAffiche,
      revenir: () => m.deplierCarte(false),
      parDefaut: E.parDefaut,
      libelleRevenir: 'Revenir à ' + NIVEAUX_CARTE + ' niveaux',
    },
  }
}

export type VueCarte = ReturnType<typeof vueCarte>
export type VueCarteAppels = NonNullable<ReturnType<typeof vueCarteAppels>>
