/* Libellés : le même mot pour la même valeur partout. Repris mot pour mot de LIB, dans prototype/transposition.js. */

import { NBSP } from './formats'
import type { Confiance, Ordre } from './format'

export type Ton = 'neutral' | 'primary' | 'success' | 'warning' | 'info' | 'destructive'

/** Une icône : true prend celle du ton ; sinon un nom d'icône Lucide en tirets, ou l'une des quatre icônes du prototype
 *  (renvoi, branche, socle, carte). */
export type IconeDef = true | string

export interface DefLibelle {
  texte: string
  ton: Ton
  icone?: IconeDef
  variante?: 'soft' | 'outline'
}

export interface DefTest {
  texte: string
  ton: Ton
  un: string
  plusieurs: string
}

export const LIB = {
  extraction: {
    extracted: { texte: 'Extraite', ton: 'success', icone: true },
    extractedSansDependances: { texte: 'Extraite sans ses dépendances', ton: 'warning', icone: true },
    notExtracted: { texte: 'Non extraite', ton: 'neutral', icone: 'minus' },
  },
  perimetre: {
    retenue: { texte: 'Périmètre validé', ton: 'success', icone: true },
    candidate: { texte: 'Périmètre proposé', ton: 'info', icone: true },
    aucune: { texte: 'Périmètre non étudié', ton: 'neutral', icone: 'circle-help' },
  },
  verdict: {
    conforme: { texte: 'Conforme', ton: 'success', icone: true },
    ecartExplique: { texte: 'Écart expliqué', ton: 'info', icone: true },
    echec: { texte: 'En échec', ton: 'destructive', icone: true },
    nonVerifie: { texte: 'Non vérifié', ton: 'neutral', icone: 'circle-help' },
  },
  test: {
    ok: { texte: 'Réussi', ton: 'success', un: 'réussi', plusieurs: 'réussis' },
    identique: { texte: 'Identique', ton: 'success', un: 'identique', plusieurs: 'identiques' },
    ecartExplique: { texte: 'Écart expliqué', ton: 'info', un: 'écart expliqué', plusieurs: 'écarts expliqués' },
    nonComparable: { texte: 'Non comparable', ton: 'neutral', un: 'non comparable', plusieurs: 'non comparables' },
    echec: { texte: 'En échec', ton: 'destructive', un: 'en échec', plusieurs: 'en échec' },
    ecart: { texte: 'Écart', ton: 'destructive', un: 'écart', plusieurs: 'écarts' },
    erreur: { texte: 'Erreur', ton: 'destructive', un: 'erreur', plusieurs: 'erreurs' },
    delai: { texte: 'Délai dépassé', ton: 'destructive', un: 'délai dépassé', plusieurs: 'délais dépassés' },
  },
  avis: {
    validee: { texte: 'Validée', ton: 'success', icone: true },
    aRevoir: { texte: 'À revoir', ton: 'warning', icone: true },
    aucun: { texte: 'À valider', ton: 'neutral', icone: 'clock' },
  },
  mode: {
    reference: { texte: 'Renvoi', ton: 'neutral', icone: 'renvoi' },
    autreArbre: { texte: 'Autre arbre', ton: 'primary', icone: 'branche' },
    arret: { texte: 'Arrêt', ton: 'warning', icone: 'ban' },
  },
  post: { texte: 'En différé', ton: 'info', icone: 'clock' },
  socle: { texte: 'Socle', ton: 'neutral', icone: 'socle', variante: 'outline' },
  classeArret: {
    technique: { texte: 'Technique', ton: 'neutral', icone: 'settings' },
    autreFonctionnalite: { texte: 'Autre fonctionnalité', ton: 'primary', icone: 'branche' },
  },
  etat: {
    candidate: { texte: 'Proposé', ton: 'info', icone: true },
    retenue: { texte: 'Validé', ton: 'success', icone: true },
  },
  correspondance: {
    cli: { texte: 'Chemin établi', ton: 'success', icone: true },
    repli: { texte: 'Chemin non établi', ton: 'warning', icone: true },
    'sans-correspondance': { texte: 'Sans correspondance', ton: 'neutral', icone: 'circle-help' },
  },
  nature: { fonctionGlobale: 'Fonction globale', fonctionObjet: "Fonction d'objet", evenement: 'Événement' },
  natureTest: { unitaire: 'Unitaire', integration: 'Intégration' },
} as const satisfies {
  extraction: Record<string, DefLibelle>
  perimetre: Record<string, DefLibelle>
  verdict: Record<string, DefLibelle>
  test: Record<string, DefTest>
  avis: Record<string, DefLibelle>
  mode: Record<string, DefLibelle>
  post: DefLibelle
  socle: DefLibelle
  classeArret: Record<string, DefLibelle>
  etat: Record<string, DefLibelle>
  correspondance: Record<string, DefLibelle>
  nature: Record<string, string>
  natureTest: Record<string, string>
}

export const SYNTHESE_VIDE: DefLibelle = { texte: 'Sans test', ton: 'neutral', icone: 'minus' }

/** Une marque : un Badge. */
export interface Marque {
  ton: Ton
  icone: IconeDef | false
  texte: string
  variante: 'soft' | 'outline'
}

/** Un point : un PointStatut, une pastille et un mot. */
export interface Point {
  ton: Ton
  texte: string
}

/** Lit une définition de libellé dans une table, pour une valeur venue des données. */
export function def<T extends Record<string, DefLibelle>>(table: T, cle: string | null | undefined): DefLibelle | null {
  return cle != null && Object.prototype.hasOwnProperty.call(table, cle) ? (table as Record<string, DefLibelle>)[cle] : null
}

export function marque(d: Partial<DefLibelle> | null | undefined, texte?: string): Marque {
  const x = d || { texte: '—', ton: 'neutral' as const }
  const icone = x.icone === true ? true : x.icone ? x.icone : false
  return { ton: x.ton || 'neutral', icone, texte: texte || x.texte || '—', variante: x.variante || 'soft' }
}

export function point(d: Partial<DefLibelle> | null | undefined, texte?: string): Point {
  const x = d || { texte: '—', ton: 'neutral' as const }
  return { ton: x.ton || 'neutral', texte: texte || x.texte || '—' }
}

export function libelleOrdre(o: Ordre | null | undefined): string {
  if (!o) return ''
  if (o.statut === 'signalee') return "Hors de l'ordre"
  if (o.statut === 'partielle') return 'Rang' + NBSP + o.rang + ', partielle'
  return 'Rang' + NBSP + o.rang
}

export function libelleConfiance(c: Confiance | string | null | undefined): string {
  if (c == null) return '—'
  return typeof c === 'number' ? c + NBSP + '%' : String(c)
}

export const QUESTIONS = {
  reperage: "Cette partie du code est-elle grosse, où s'arrête-t-elle, que lance-t-elle ?",
  carte: 'Qui appelle quoi, et que cache chaque branche ?',
  regles: "Que fait cette fonctionnalité, est-ce prouvé, le métier est-il d'accord ?",
  dependances: "Dans quel ordre extraire, et qu'est-ce qui bloque ?",
} as const

export const TITRES = { reperage: 'Repérage', carte: 'Carte', regles: 'Règles', dependances: 'Dépendances' } as const

export type Onglet = keyof typeof TITRES
