/* Index des données : fonctionnalités, arbres aplatis en nœuds, présence d'une fonction dans les arbres, socle. */

import type {
  Arbre,
  Arret,
  FichierDeDonnees,
  Fonctionnalite,
  IdFonction,
  IdFonctionnalite,
  ModeAppel,
  Question,
  Regle,
  Taille,
  Utilitaire,
} from './format'

export type ModeNoeud = ModeAppel | 'racine'

/** Un appel de l'arbre, identifié par sa position depuis la racine : « r », « r.0 », « r.0.2 ». */
export interface Noeud {
  cle: string
  fonction: IdFonction
  ligne: number | null
  mode: ModeNoeud
  post: boolean
  profondeur: number
  parent: Noeud | null
  enfants: Noeud[]
  taille: Taille | null
}

export interface ArbreIndexe {
  signature: IdFonction
  arbre: Arbre
  racine: Noeud
  noeuds: Noeud[]
  parCle: Record<string, Noeud>
  parFonction: Record<IdFonction, Noeud[]>
  /** L'occurrence où la fonction est développée (ou la racine). */
  dev: Record<IdFonction, Noeud>
  arrets: Record<string, Arret>
}

export interface Index {
  liste: Fonctionnalite[]
  parId: Record<IdFonctionnalite, Fonctionnalite>
  enfants: Record<IdFonctionnalite, Fonctionnalite[]>
  parSignature: Record<IdFonction, IdFonctionnalite>
  arbres: Record<IdFonction, ArbreIndexe>
  presence: Record<IdFonction, IdFonction[]>
  socle: Record<string, Utilitaire>
  regles: Record<string, { regle: Regle; fonctionnalite: Fonctionnalite }>
  questions: Record<string, { question: Question; fonctionnalite: Fonctionnalite }>
}

const a_ = Object.prototype.hasOwnProperty
export const possede = (o: object, k: string): boolean => a_.call(o, k)

export function construireArbre(signature: IdFonction, arbre: Arbre): ArbreIndexe {
  const racine: Noeud = { cle: 'r', fonction: signature, ligne: null, mode: 'racine', post: false, profondeur: 0, parent: null, enfants: [], taille: arbre.taille || null }
  const a: ArbreIndexe = { signature, arbre, racine, noeuds: [], parCle: {}, parFonction: {}, dev: {}, arrets: {} }
  ;(arbre.arrets || []).forEach((x) => {
    a.arrets[x.objet] = x
  })
  const ajouter = (n: Noeud) => {
    a.noeuds.push(n)
    a.parCle[n.cle] = n
    ;(a.parFonction[n.fonction] = a.parFonction[n.fonction] || []).push(n)
    if ((n.mode === 'racine' || n.mode === 'developpement') && !a.dev[n.fonction]) a.dev[n.fonction] = n
  }
  ajouter(racine)
  const descendre = (parent: Noeud, appels: Arbre['appels'] | undefined) => {
    ;(appels || []).forEach((x, i) => {
      const n: Noeud = {
        cle: parent.cle + '.' + i,
        fonction: x.fonction,
        ligne: x.ligne,
        mode: x.mode,
        post: !!x.post,
        profondeur: parent.profondeur + 1,
        parent,
        enfants: [],
        taille: x.taille || null,
      }
      parent.enfants.push(n)
      ajouter(n)
      if (x.appels && x.appels.length) descendre(n, x.appels)
    })
  }
  descendre(racine, arbre.appels)
  return a
}

export function indexer(d: FichierDeDonnees): Index {
  const ix: Index = { liste: d.fonctionnalites || [], parId: {}, enfants: {}, parSignature: {}, arbres: {}, presence: {}, socle: {}, regles: {}, questions: {} }
  ix.liste.forEach((f) => {
    ix.parId[f.id] = f
    if (f.mere) (ix.enfants[f.mere] = ix.enfants[f.mere] || []).push(f)
    const s = f.reperage && f.reperage.signature
    if (s && !ix.parSignature[s]) ix.parSignature[s] = f.id
    ;(f.regles || []).forEach((r) => {
      ix.regles[r.id] = { regle: r, fonctionnalite: f }
    })
    ;(f.questions || []).forEach((q) => {
      ix.questions[q.id] = { question: q, fonctionnalite: f }
    })
  })
  Object.keys(d.arbres || {}).forEach((sig) => {
    ix.arbres[sig] = construireArbre(sig, d.arbres[sig])
  })
  Object.keys(ix.arbres).forEach((sig) => {
    Object.keys(ix.arbres[sig].parFonction).forEach((fn) => {
      ;(ix.presence[fn] = ix.presence[fn] || []).push(sig)
    })
  })
  ;((d.dependances && d.dependances.socle) || []).forEach((u) => {
    ix.socle[u.objet] = u
  })
  return ix
}

export function arbreDe(ix: Index, f: Fonctionnalite | null | undefined): ArbreIndexe | null {
  const s = f && f.reperage && f.reperage.signature
  return (s && ix.arbres[s]) || null
}

/** Nom d'une fonction : l'objet en préfixe discret, la fonction en clair. Une fonction globale répète son nom : on l'écrit une fois. */
export function nomFonction(id: string): { prefixe: string; nom: string } {
  const i = id.lastIndexOf('.')
  if (i < 0) return { prefixe: '', nom: id }
  const objet = id.slice(0, i)
  const nom = id.slice(i + 1)
  return objet === nom ? { prefixe: '', nom } : { prefixe: objet + '.', nom }
}

/** Dans un arbre, une fonction du même objet que la signature se lit sans son préfixe ; la racine garde le sien. */
export function nomDansArbre(d: FichierDeDonnees, a: ArbreIndexe, id: string, racine: boolean): { prefixe: string; nom: string } {
  const nom = nomFonction(id)
  if (racine || !nom.prefixe) return nom
  const objet = (d.fonctions[a.signature] || {}).objet
  return objet && nom.prefixe === objet + '.' ? { prefixe: '', nom: nom.nom } : nom
}
