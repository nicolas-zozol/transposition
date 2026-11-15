/* Saisies : fusion, fichier d'export, saisies orphelines. */

import { clone, compte, NBSP } from './formats'
import { LIB } from './libelles'
import type { Avis, FichierDeDonnees, FichierDeSaisies, Reponse, Saisies } from './format'
import type { Index } from './indexation'

export interface SaisiesCompletes {
  regles: Record<string, Avis>
  questions: Record<string, Reponse>
}

/** Les identifiants des saisies faites ici et pas encore exportées. */
export interface Locales {
  regles: Record<string, true>
  questions: Record<string, true>
}

export function saisiesDe(d: FichierDeDonnees | null | undefined): SaisiesCompletes {
  const s: Saisies = (d && d.saisies) || {}
  return { regles: clone(s.regles || {}), questions: clone(s.questions || {}) }
}

/** Une saisie importée remplace la saisie de même identifiant quand sa date est égale ou postérieure.
 *  Une saisie remplacée n'est plus « non exportée ». */
export function fusionner(saisies: SaisiesCompletes, locales: Locales, importees: Saisies | null | undefined): { avis: number; reponses: number } {
  const r = { avis: 0, reponses: 0 }
  const imp = importees || {}
  Object.keys(imp.regles || {}).forEach((id) => {
    const n = (imp.regles || {})[id]
    const a = saisies.regles[id]
    if (!n || !n.avis) return
    if (!a || String(n.date || '') >= String(a.date || '')) {
      saisies.regles[id] = clone(n)
      delete locales.regles[id]
      r.avis++
    }
  })
  Object.keys(imp.questions || {}).forEach((id) => {
    const n = (imp.questions || {})[id]
    const a = saisies.questions[id]
    if (!n || n.reponse == null) return
    if (!a || String(n.date || '') >= String(a.date || '')) {
      saisies.questions[id] = clone(n)
      delete locales.questions[id]
      r.reponses++
    }
  })
  return r
}

export function phraseFusion(r: { avis: number; reponses: number }): string {
  const parts: string[] = []
  if (r.avis) parts.push(r.avis + NBSP + 'avis')
  if (r.reponses) parts.push(compte(r.reponses, 'réponse', 'réponses'))
  if (!parts.length) return ''
  const accord = r.avis ? (r.avis + r.reponses > 1 ? 'fusionnés' : 'fusionné') : r.reponses > 1 ? 'fusionnées' : 'fusionnée'
  return parts.join(' et ') + ' ' + accord
}

export function fichierSaisies(saisies: SaisiesCompletes): FichierDeSaisies {
  return { versionFormat: 1, saisies: { regles: saisies.regles, questions: saisies.questions } }
}

export interface Orpheline {
  id: string
  genre: 'Avis' | 'Réponse'
  detail: string
}

/** Une saisie dont la règle ou la question n'est plus dans les données : gardée, listée à part, exportée. */
export function orphelines(saisies: SaisiesCompletes, ix: Index): Orpheline[] {
  const out: Orpheline[] = []
  Object.keys(saisies.regles).forEach((id) => {
    const avis = saisies.regles[id].avis
    if (!ix.regles[id]) out.push({ id, genre: 'Avis', detail: (avis === 'validee' || avis === 'aRevoir' ? LIB.avis[avis] : LIB.avis.aucun).texte })
  })
  Object.keys(saisies.questions).forEach((id) => {
    if (!ix.questions[id]) out.push({ id, genre: 'Réponse', detail: saisies.questions[id].reponse })
  })
  return out
}
