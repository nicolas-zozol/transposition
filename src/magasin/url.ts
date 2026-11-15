/* L'état dans l'URL.
   - Le fragment porte ce qui se partage : #onglet=regles&fonctionnalite=F07.1.a&fonction=w_sejour.ue_dernier_jour.
     Lu au chargement, réécrit à chaque navigation par history.replaceState, relu sur hashchange.
   - Les autres paramètres servent aux essais et aux captures ; ils sont lus une fois, au chargement. */

import { arbreCourant } from './etat'
import type { Magasin, Options } from './magasin'

const PARAMETRES = ['onglet', 'fonctionnalite', 'fonction', 'occurrence', 'mode', 'theme', 'filtre', 'recherche', 'deplier', 'renvois', 'niveaux', 'zoom', 'dialogue', 'auteur', 'saisiesLocales', 'jeu'] as const

/** Les paramètres de l'adresse : ceux de la requête, puis ceux du fragment, qui l'emportent. */
export function lireParametres(adresse: { search: string; hash: string }): Options {
  const o: Record<string, string> = {}
  const lire = (texte: string) => {
    new URLSearchParams(texte.replace(/^[?#]/, '')).forEach((v, k) => {
      if ((PARAMETRES as readonly string[]).indexOf(k) >= 0 && v !== '') o[k] = v
    })
  }
  lire(adresse.search || '')
  lire(adresse.hash || '')
  return o as Options
}

/** Le fragment qui décrit l'écran courant. */
export function fragment(m: Magasin): string {
  const e = m.etat
  const p = new URLSearchParams()
  p.set('onglet', e.onglet)
  if (e.fonctionnaliteId) p.set('fonctionnalite', e.fonctionnaliteId)
  const a = arbreCourant(e)
  const n = a && e.cleSel !== 'r' ? a.parCle[e.cleSel] : null
  if (n && a) {
    p.set('fonction', n.fonction)
    /* L'occurrence ne s'écrit que si ce n'est pas celle que la fonction ouvre d'elle-même. */
    const premiere = a.dev[n.fonction] || (a.parFonction[n.fonction] || [])[0]
    if (premiere !== n) p.set('occurrence', n.cle)
  }
  return '#' + p.toString()
}

/** Suit la navigation dans l'adresse, et l'adresse dans la navigation. Rend la fonction qui arrête le suivi. */
export function suivreAdresse(m: Magasin): () => void {
  let dernier = ''
  const ecrire = () => {
    const f = fragment(m)
    if (f === dernier) return
    dernier = f
    try {
      history.replaceState(history.state, '', f)
    } catch {
      /* certains navigateurs refusent en file:// : l'application continue sans mettre l'adresse à jour */
    }
  }
  const relire = () => {
    if (location.hash === dernier) return
    const o = lireParametres({ search: '', hash: location.hash })
    const e = m.etat
    if (o.fonctionnalite && (o.fonctionnalite !== e.fonctionnaliteId || o.fonction)) {
      m.ouvrirFonctionnalite(o.fonctionnalite, {
        onglet: o.onglet === 'reperage' || o.onglet === 'carte' || o.onglet === 'regles' || o.onglet === 'dependances' ? o.onglet : undefined,
        fonction: o.fonction,
        cle: o.occurrence,
      })
    } else if (o.onglet === 'reperage' || o.onglet === 'carte' || o.onglet === 'regles' || o.onglet === 'dependances') m.allerOnglet(o.onglet)
    ecrire()
  }
  ecrire()
  const off = m.abonner(ecrire)
  window.addEventListener('hashchange', relire)
  return () => {
    off()
    window.removeEventListener('hashchange', relire)
  }
}
