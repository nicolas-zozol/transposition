/* Les saisies vivent dans le navigateur : une seule clé versionnée de localStorage garde les saisies, la liste des
   saisies non exportées, le nom de la personne et le thème. Jamais le fichier de données.
   La lecture est tolérante : un contenu illisible est ignoré, jamais une erreur à l'écran. */

import type { Avis, Reponse } from '@/domaine/format'
import type { Magasin } from './magasin'

export const CLE = 'transposition.saisies.v1'

export interface Stock {
  version: 1
  saisies: { regles: Record<string, Avis>; questions: Record<string, Reponse> }
  locales: { regles: Record<string, true>; questions: Record<string, true> }
  auteur: string
  theme: 'light' | 'dark'
}

const objet = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)

function stockage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

export function lireStock(): Stock | null {
  try {
    const brut = stockage()?.getItem(CLE)
    if (!brut) return null
    const x = JSON.parse(brut) as unknown
    if (!objet(x) || x.version !== 1) return null
    const s = objet(x.saisies) ? x.saisies : {}
    const l = objet(x.locales) ? x.locales : {}
    const regles: Record<string, Avis> = {}
    const questions: Record<string, Reponse> = {}
    if (objet(s.regles))
      Object.entries(s.regles).forEach(([id, v]) => {
        if (objet(v) && (v.avis === 'validee' || v.avis === 'aRevoir') && typeof v.auteur === 'string' && typeof v.date === 'string')
          regles[id] = { avis: v.avis, ...(typeof v.commentaire === 'string' && v.commentaire ? { commentaire: v.commentaire } : {}), auteur: v.auteur, date: v.date }
      })
    if (objet(s.questions))
      Object.entries(s.questions).forEach(([id, v]) => {
        if (objet(v) && typeof v.reponse === 'string' && typeof v.auteur === 'string' && typeof v.date === 'string') questions[id] = { reponse: v.reponse, auteur: v.auteur, date: v.date }
      })
    const ids = (o: unknown, garde: Record<string, unknown>) => {
      const out: Record<string, true> = {}
      if (objet(o)) Object.keys(o).forEach((k) => (garde[k] ? (out[k] = true) : null))
      return out
    }
    return {
      version: 1,
      saisies: { regles, questions },
      locales: { regles: ids(l.regles, regles), questions: ids(l.questions, questions) },
      auteur: typeof x.auteur === 'string' ? x.auteur : '',
      theme: x.theme === 'dark' ? 'dark' : 'light',
    }
  } catch {
    return null
  }
}

export function ecrireStock(m: Magasin): void {
  const e = m.etat
  const stock: Stock = { version: 1, saisies: e.saisies, locales: e.locales, auteur: e.auteur, theme: e.theme }
  try {
    stockage()?.setItem(CLE, JSON.stringify(stock))
  } catch {
    /* stockage plein ou refusé : les saisies restent en mémoire, l'export reste possible */
  }
}

/** Au démarrage : on part des saisies du fichier de données, puis on pose celles du navigateur.
 *  Une saisie du navigateur non exportée l'emporte toujours ; une saisie déjà exportée suit la règle du format :
 *  celle du fichier la remplace quand sa date est égale ou postérieure. */
export function poserStock(m: Magasin, stock: Stock, garder: { auteur?: boolean; theme?: boolean } = {}): void {
  const e = m.etat
  ;(['regles', 'questions'] as const).forEach((genre) => {
    const venues = stock.saisies[genre] as Record<string, Avis | Reponse>
    const ici = e.saisies[genre] as Record<string, Avis | Reponse>
    Object.keys(venues).forEach((id) => {
      const s = venues[id]
      const f = ici[id]
      if (stock.locales[genre][id]) {
        ici[id] = s
        e.locales[genre][id] = true
      } else if (!f || String(f.date || '') < String(s.date || '')) ici[id] = s
    })
  })
  if (!garder.auteur && stock.auteur) {
    e.auteur = stock.auteur
    e.nomSaisi = stock.auteur
  }
  if (!garder.theme) e.theme = stock.theme
}
