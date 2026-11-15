/* L'état de l'application et les lectures qui en dépendent, partagées par le magasin et les vues. */

import type { FichierDeDonnees, ValeurAvis } from '@/domaine/format'
import type { ArbreIndexe, Index, Noeud } from '@/domaine/indexation'
import { arbreDe } from '@/domaine/indexation'
import type { Onglet } from '@/domaine/libelles'
import type { Locales, SaisiesCompletes } from '@/domaine/saisies'

export type Jeu = 'exemple' | 'depart' | 'intermediaire'
export type Theme = 'light' | 'dark'
export type Dialogue = 'importer' | 'exporter' | 'nom'
export type FiltreListe = 'toutes' | 'avecRegles' | 'aValider'
export type FiltreRegles = 'toutes' | 'aValider' | 'aRevoir' | 'validees'
export type Mode = 'francais' | 'gherkin'
export type Tri = { key: string; dir: 'asc' | 'desc' } | null

/** Une saisie en attente du nom de la personne. */
export type Attente =
  | { genre: 'premiere' }
  | { genre: 'avis'; id: string; valeur: ValeurAvis }
  | { genre: 'commentaire'; id: string; valeur: string }
  | { genre: 'reponse'; id: string; valeur: string }

export interface Etat {
  jeu: Jeu
  onglet: Onglet
  theme: Theme
  donnees: FichierDeDonnees
  index: Index
  fonctionnaliteId: string | null
  /** L'occurrence sélectionnée dans l'arbre courant ; « r » pour la racine. */
  cleSel: string
  /** Dépliage de l'arbre de Repérage, par signature puis par clé de nœud. */
  ouverts: Record<string, Record<string, boolean>>
  /** Dépliage de la carte, distinct de celui de Repérage. */
  carte: Record<string, Record<string, boolean>>
  carteRenvois: boolean
  /** Échelle de départ de la carte, pour rejouer une capture : « ajuste » ou un nombre. Lue une fois par la carte. */
  carteZoomDepart: number | 'ajuste'
  recherche: string
  rechercheOuverte: boolean
  filtre: FiltreListe
  rechercheFonc: string
  mode: Mode
  sections: Record<string, boolean>
  filtreRegles: FiltreRegles
  pageHors: number
  triHors: Tri
  toutDeplie: boolean
  saisies: SaisiesCompletes
  locales: Locales
  auteur: string
  nomSaisi: string
  enAttente: Attente | null
  dialogue: Dialogue | null
  importTexte: string
  importErreur: string
  importMessage: string
  importFichier: string
  copie: boolean
  /** Le champ à focaliser au prochain rendu : un dialogue, un commentaire. */
  focus: string | null
}

export function arbreCourant(e: Etat): ArbreIndexe | null {
  return arbreDe(e.index, e.index.parId[e.fonctionnaliteId || ''])
}

/** Dépliage par défaut de Repérage : tout l'arbre s'il compte 40 nœuds ou moins, sinon le premier niveau. */
export function estOuvert(e: Etat, a: ArbreIndexe, n: Noeud): boolean {
  const o = e.ouverts[a.signature]
  if (o && o[n.cle] != null) return o[n.cle]
  return a.noeuds.length <= 40 ? true : n.profondeur < 1
}

/** Carte : les trois premiers niveaux d'appels sont dépliés ; au-delà, un nœud se déplie à la demande. */
export const NIVEAUX_CARTE = 3

export function carteOuverte(e: Etat, a: ArbreIndexe, n: Noeud): boolean {
  const o = e.carte[a.signature]
  if (o && o[n.cle] != null) return o[n.cle]
  return n.profondeur < NIVEAUX_CARTE
}

/** Les renvois ne s'affichent qu'à la demande. Un renvoi sélectionné reste affiché, sans quoi la sélection venue de
 *  Repérage disparaîtrait. */
export function affichable(e: Etat, n: Noeud): boolean {
  return e.carteRenvois || n.mode !== 'reference' || n.cle === e.cleSel
}

/** Les appels affichés sous un nœud de la carte : aucun s'il est replié. */
export function enfantsCarte(e: Etat, a: ArbreIndexe, n: Noeud): Noeud[] {
  if (!n.enfants.length || !carteOuverte(e, a, n)) return []
  return n.enfants.filter((x) => affichable(e, x))
}
