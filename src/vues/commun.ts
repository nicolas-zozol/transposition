/* Ce que Repérage et la Carte partagent : taille, marques et précision d'un nœud, cible de suivi, listes coupées,
   sélecteur d'arbre, mesures d'une signature, état « arbre non extrait ». */

import type { Fonctionnalite, Taille } from '@/domaine/format'
import { nb, NBSP, pl } from "@/domaine/formats"
import type { ArbreIndexe, Index, Noeud } from '@/domaine/indexation'
import { arbreDe } from '@/domaine/indexation'
import { LIB, libelleConfiance, libelleOrdre, marque, type Marque } from "@/domaine/libelles"
import type { Etat } from '@/magasin/etat'
import type { CibleSuivi, Magasin } from '@/magasin/magasin'

export function tailleNoeud(e: Etat, a: ArbreIndexe, n: Noeud): Partial<Taille> | null {
  const fn = e.donnees.fonctions[n.fonction]
  if (n.mode === 'racine') return a.arbre.taille || null
  if (n.mode === 'developpement') return n.taille || { fonctions: 1, lignes: fn && fn.lignes != null ? fn.lignes : undefined }
  if (n.mode === 'autreArbre') {
    const b = e.index.arbres[n.fonction]
    return (b && b.arbre.taille) || null
  }
  return null
}

export function marquesNoeud(e: Etat, _a: ArbreIndexe, n: Noeud): Marque[] {
  const ix = e.index
  const fn = e.donnees.fonctions[n.fonction]
  const out: Marque[] = []
  if (n.mode === 'reference') out.push(marque(LIB.mode.reference))
  if (n.mode === 'autreArbre') out.push(marque(LIB.mode.autreArbre, 'Autre arbre' + (ix.parSignature[n.fonction] ? NBSP + ix.parSignature[n.fonction] : '')))
  if (n.mode === 'arret') out.push(marque(LIB.mode.arret))
  if (n.post) out.push(marque(LIB.post))
  if (fn && fn.objet && ix.socle[fn.objet]) out.push(marque(LIB.socle))
  return out
}

export function precisionNoeud(e: Etat, a: ArbreIndexe, n: Noeud): string {
  if (n.mode === 'racine') return 'signature mère'
  if (n.mode !== 'arret') return ''
  const fn = e.donnees.fonctions[n.fonction]
  const ar = fn ? a.arrets[fn.objet] : undefined
  if (!ar) return ''
  if (ar.classe === 'technique') return 'technique'
  return ar.fonctionnalites && ar.fonctionnalites.length ? 'vers' + NBSP + ar.fonctionnalites.join(', ') : ''
}

export function libelleSuivi(e: Etat, c: CibleSuivi): string {
  if (!c) return ''
  if (c.genre === 'renvoi') return 'Aller à son développement'
  const f = e.index.parId[c.id]
  return "Ouvrir l'arbre de " + c.id + (f ? ', ' + f.titre : '')
}

/** Une longue liste montre ses premiers éléments ; le reste se déplie à la demande. */
export function couper<T>(m: Magasin, cle: string, liste: T[], limite: number) {
  const e = m.etat
  const ouverte = !!e.sections[cle]
  const longue = liste.length > limite + 1
  return {
    liste: longue && !ouverte ? liste.slice(0, limite) : liste,
    plus: {
      a: longue,
      texte: ouverte ? 'Réduire la liste' : 'Voir les ' + (liste.length - limite) + ' autres',
      icone: ouverte ? 'chevron-up' : 'chevron-down',
      basculer: () => {
        e.sections[cle] = !ouverte
        m.notifier()
      },
    },
  }
}

/* Le sélecteur s'arrête au deuxième niveau : dans un vrai projet, les sous-parties se comptent par milliers.
   Niveau 1 : toutes les fonctionnalités du manuel. Niveau 2 : les sous-fonctionnalités directes de la seule
   fonctionnalité affichée, sous elle. Plus bas, rien n'est proposé : on y arrive par l'arbre, nœud « Autre arbre »,
   ou par la recherche. L'arbre affiché reste toujours nommé, même plus bas, pour dire où l'on est. */
export function lignee(ix: Index, f: Fonctionnalite | null): Fonctionnalite[] {
  const out: Fonctionnalite[] = []
  const vus: Record<string, true> = {}
  for (let x: Fonctionnalite | null = f; x && !vus[x.id]; x = x.mere ? ix.parId[x.mere] || null : null) {
    vus[x.id] = true
    out.unshift(x)
  }
  return out
}

export interface OptionArbre {
  value: string
  label: string
  /** 1 : fonctionnalité du manuel ; 2 : sous-fonctionnalité ; 3 : l'arbre affiché, plus bas. */
  niveau: number
}

export function optionsArbres(ix: Index, affichee: Fonctionnalite | null): OptionArbre[] {
  const chemin = lignee(ix, affichee)
  const out: OptionArbre[] = []
  const option = (x: Fonctionnalite, niveau: number): OptionArbre => {
    let retrait = ''
    for (let i = 1; i < niveau; i++) retrait += NBSP + NBSP + NBSP + NBSP
    return { value: x.id, label: retrait + x.id + ' — ' + x.titre + (arbreDe(ix, x) ? '' : ' (arbre non extrait)'), niveau }
  }
  ix.liste.forEach((x) => {
    if (x.mere && ix.parId[x.mere]) return
    out.push(option(x, 1))
    if (chemin[0] !== x) return
    ;(ix.enfants[x.id] || []).forEach((y) => {
      out.push(option(y, 2))
      if (chemin.length > 2 && chemin[1] === y && affichee) out.push(option(affichee, 3))
    })
  })
  if (affichee && !out.some((o) => o.value === affichee.id)) out.push(option(affichee, 1))
  return out
}

type CleMesure = 'fonctions' | 'lignes' | 'profondeur' | 'datawindows' | 'nonResolus' | 'arrets' | 'posts'
const MESURES: Record<CleMesure, [string, string]> = {
  fonctions: ['fonction', 'fonctions'],
  lignes: ['ligne de code', 'lignes de code'],
  profondeur: ['niveau', 'niveaux'],
  datawindows: ['DataWindow', 'DataWindows'],
  nonResolus: ['appel non résolu', 'appels non résolus'],
  arrets: ['arrêt', 'arrêts'],
  posts: ['appel en différé', 'appels en différé'],
}

export function mesuresArbre(t: Taille | null | undefined, cles: CleMesure[]): Array<{ valeur: string; libelle: string }> {
  const v = (x: number | undefined) => (t && x != null ? nb(x) : '—')
  const n = (x: number | undefined) => (t && x != null ? x : 2)
  return cles.map((k) => ({ valeur: v(t ? t[k] : undefined), libelle: pl(n(t ? t[k] : undefined), MESURES[k][0], MESURES[k][1]) }))
}

export function arbreVide(m: Magasin, f: Fonctionnalite | null) {
  if (!f) return { titre: 'Aucune fonctionnalité', texte: 'Importez un fichier de données.', signature: '', aSignature: false, ordre: '', allerDependances: () => {} }
  const rep = f.reperage || { delimitation: 'aucune' }
  const c = rep.correspondance
  const sig = rep.signature
  let texte: string
  if (c && c.statut === 'repli')
    texte = 'Le chemin de ' + f.id + " vers le code n'est pas établi : la signature mère proposée reste à confirmer (confiance " + libelleConfiance(c.confiance) + "). Sans signature confirmée, pas d'arbre."
  else if (c && c.statut === 'sans-correspondance') texte = "Aucune signature mère n'a été trouvée pour cette ligne du manuel."
  else if (sig) texte = "La signature mère est connue, mais son arbre d'appels n'est pas encore extrait."
  else texte = "Cette fonctionnalité n'a pas encore de signature mère : son arbre d'appels ne peut pas être extrait."
  return {
    titre: 'Arbre non extrait',
    texte,
    signature: sig || '',
    aSignature: !!sig,
    ordre: f.mere ? '' : libelleOrdre(rep.ordre),
    allerDependances: () => m.allerOnglet('dependances'),
  }
}

