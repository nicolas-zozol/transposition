/* Dépendances : cinq Stat, alertes, panneau de la sélection, socle, tableau « Hors de l'ordre ». */

import type { Arete, Fonctionnalite } from '@/domaine/format'
import { compte, majuscule, nb, NBSP, pl } from '@/domaine/formats'
import type { Index } from '@/domaine/indexation'
import { def, LIB, libelleConfiance, libelleOrdre, marque, point, QUESTIONS, type Marque, type Ton } from '@/domaine/libelles'
import type { Tri } from '@/magasin/etat'
import type { Magasin } from '@/magasin/magasin'
import { couper } from './commun'
import { largeurMinGraphe, rangsDuGraphe, selectionGraphe } from './graphe'

/* La cause d'une fonctionnalité hors de l'ordre, en une phrase. Dans le tableau, le périmètre et la correspondance
   ont leur colonne : sansStatuts ne garde que les autres causes. */
function causeHorsOrdre(_ix: Index, f: Fonctionnalite, sansStatuts = false): string {
  const rep = f.reperage || { delimitation: 'aucune' }
  const o = rep.ordre || { statut: 'ordonnee', extractible: false }
  const causes = o.causes || []
  const morceaux: string[] = []
  if (!sansStatuts && (!causes.length || causes.indexOf(f.id) >= 0)) {
    if (rep.delimitation !== 'retenue') morceaux.push((def(LIB.perimetre, rep.delimitation || 'aucune') || { texte: '' }).texte.toLowerCase())
    if (rep.correspondance && rep.correspondance.statut !== 'cli') morceaux.push((def(LIB.correspondance, rep.correspondance.statut) || { texte: '' }).texte.toLowerCase())
  }
  if (o.horsManuel && o.horsManuel.length) morceaux.push(pl(o.horsManuel.length, 'objet', 'objets') + ' hors manuel : ' + o.horsManuel.join(', '))
  const autres = causes.filter((id) => id !== f.id)
  if (autres.length) morceaux.push('atteint ' + (autres.length > 4 ? autres.slice(0, 4).join(', ') + ' et ' + (autres.length - 4) + ' autres' : autres.join(', ')) + ", hors de l'ordre")
  return majuscule(morceaux.join(' ; ')) || (sansStatuts ? '' : '—')
}

function panneauDependances(m: Magasin, f: Fonctionnalite) {
  const e = m.etat
  const ix = e.index
  const rep = f.reperage || { delimitation: 'aucune' }
  const o = rep.ordre || { statut: undefined, extractible: false, manquantes: [], horsManuel: [] }
  const aretes = (e.donnees.dependances && e.donnees.dependances.aretes) || []
  const lien = (x: Arete, id: string) => {
    const g = ix.parId[id]
    return {
      id,
      titre: g ? g.titre : 'hors des données',
      objet: x.objet,
      etat: marque(def(LIB.etat, x.etat)),
      confiance: 'confiance ' + libelleConfiance(x.confiance),
      ouvrir: () => {
        if (g) m.ouvrirFonctionnalite(id)
      },
    }
  }
  const dependDe = aretes.filter((x) => x.source === f.id).map((x) => lien(x, x.cible))
  const requisePar = aretes.filter((x) => x.cible === f.id).map((x) => lien(x, x.source))
  const manquantes = (o.manquantes || []).map((id) => {
    const g = ix.parId[id]
    return {
      id,
      titre: g ? g.titre : '',
      extraction: g ? point(def(LIB.extraction, g.extraction)) : point(null),
      ouvrir: () => {
        if (g) m.ouvrirFonctionnalite(id)
      },
    }
  })
  const enfants = (ix.enfants[f.id] || []).map((x) => ({
    id: x.id,
    titre: x.titre,
    extraction: point(def(LIB.extraction, x.extraction)),
    ouvrir: () => m.ouvrirFonctionnalite(x.id, { onglet: 'regles' }),
  }))
  const ordre = rep.ordre || null
  const badges: Marque[] = [
    marque({ ton: o.statut === 'signalee' ? 'warning' : 'neutral', icone: o.statut === 'signalee' ? true : 'list-checks' }, libelleOrdre(ordre) || 'Sans ordre'),
    marque(def(LIB.extraction, f.extraction)),
  ]
  if (o.extractible && f.extraction === 'notExtracted') badges.push(marque({ ton: 'info', icone: true }, 'Extractible'))
  badges.push(marque(def(LIB.perimetre, rep.delimitation || 'aucune')))
  if (rep.correspondance) badges.push(marque(def(LIB.correspondance, rep.correspondance.statut)))
  const cDependDe = couper(m, 'dep:' + f.id, dependDe, 6)
  const cRequisePar = couper(m, 'req:' + f.id, requisePar, 6)
  const cManquantes = couper(m, 'manq:' + f.id, manquantes, 6)
  return {
    id: f.id,
    titre: f.titre,
    page: 'Page' + NBSP + f.page + ' du manuel',
    badges,
    nbDependDe: 'Dépend de · ' + dependDe.length,
    dependDe: cDependDe.liste,
    plusDependDe: cDependDe.plus,
    nbRequisePar: 'Requise par · ' + requisePar.length,
    requisePar: cRequisePar.liste,
    plusRequisePar: cRequisePar.plus,
    nbManquantes: 'Manquantes · ' + manquantes.length,
    manquantes: cManquantes.liste,
    plusManquantes: cManquantes.plus,
    nbHorsManuel: 'Objets hors manuel · ' + (o.horsManuel || []).length,
    horsManuel: o.horsManuel || [],
    nbSous: 'Sous-fonctionnalités · ' + enfants.length,
    sous: enfants,
    cause: o.statut === 'signalee' ? causeHorsOrdre(ix, f) : '',
    allerRegles: () => m.ouvrirFonctionnalite(f.id, { onglet: 'regles' }),
    allerReperage: () => m.ouvrirFonctionnalite(f.id, { onglet: 'reperage' }),
  }
}

export type PanneauDependances = ReturnType<typeof panneauDependances>

export interface LigneHors {
  id: string
  titre: string
  perimetre: string
  tonPerimetre: Ton
  chemin: string
  tonChemin: Ton
  cause: string
}

export function vueDependances(m: Magasin) {
  const e = m.etat
  const ix = e.index
  const d = e.donnees
  const manuel = ix.liste.filter((f) => !f.mere)
  const sel = selectionGraphe(e)
  let ordonnees = 0
  const n = { extraites: 0, extractibles: 0, sansDep: 0, hors: 0 }
  const alertes: Array<{ id: string; titre: string; manquantes: Array<{ id: string; titre: string; ouvrir: () => void }>; ouvrir: () => void }> = []
  let hors: LigneHors[] = []
  const perim = { aucune: 0, candidate: 0, retenue: 0 }
  const chemins = { repli: 0, 'sans-correspondance': 0 }
  manuel.forEach((f) => {
    const rep = f.reperage || { delimitation: 'aucune' }
    const o = rep.ordre
    if (f.extraction === 'extracted') n.extraites++
    if (f.extraction === 'extractedSansDependances') {
      n.sansDep++
      alertes.push({
        id: f.id,
        titre: f.titre,
        manquantes: ((o && o.manquantes) || []).map((id) => {
          const g = ix.parId[id]
          return { id, titre: g ? g.titre : '', ouvrir: () => m.ouvrirFonctionnalite(id) }
        }),
        ouvrir: () => m.ouvrirFonctionnalite(f.id),
      })
    }
    if (o && o.extractible && f.extraction === 'notExtracted') n.extractibles++
    if (o && o.statut && o.statut !== 'signalee' && o.rang != null) ordonnees++
    if (o && o.statut === 'signalee') {
      n.hors++
      perim[rep.delimitation || 'aucune']++
      if (rep.correspondance && rep.correspondance.statut !== 'cli') chemins[rep.correspondance.statut]++
      const c = rep.correspondance ? def(LIB.correspondance, rep.correspondance.statut) || { texte: '—', ton: 'neutral' as Ton } : { texte: '—', ton: 'neutral' as Ton }
      const p = def(LIB.perimetre, rep.delimitation || 'aucune') || { texte: '—', ton: 'neutral' as Ton }
      hors.push({ id: f.id, titre: f.titre, perimetre: p.texte, tonPerimetre: p.ton, chemin: c.texte, tonChemin: c.ton, cause: causeHorsOrdre(ix, f, true) })
    }
  })
  const socle = ((d.dependances && d.dependances.socle) || []).slice().sort((x, y) => y.fonctionnalites.length - x.fonctionnalites.length || (x.objet < y.objet ? -1 : 1))
  const maxSocle = socle.length ? socle[0].fonctionnalites.length : 1
  const manque: string[] = []
  if (perim.aucune) manque.push(compte(perim.aucune, 'périmètre non étudié', 'périmètres non étudiés'))
  if (perim.candidate) manque.push(compte(perim.candidate, 'périmètre proposé à valider', 'périmètres proposés à valider'))
  if (chemins.repli) manque.push(compte(chemins.repli, 'chemin non établi', 'chemins non établis'))
  if (chemins['sans-correspondance']) manque.push(compte(chemins['sans-correspondance'], 'ligne sans correspondance', 'lignes sans correspondance'))
  const nbAretes = ((d.dependances && d.dependances.aretes) || []).length
  const tri: Tri = e.triHors || null
  if (tri) {
    const k = tri.key as keyof LigneHors
    hors.sort((x, y) => {
      const r = String(x[k] == null ? '' : x[k]).localeCompare(String(y[k] == null ? '' : y[k]), 'fr', { numeric: true })
      return tri.dir === 'desc' ? -r : r
    })
  }
  const PAR_PAGE = 25
  const pages = Math.max(1, Math.ceil(hors.length / PAR_PAGE))
  const page = Math.min(Math.max(1, e.pageHors || 1), pages)
  const nbHors = hors.length
  hors = hors.slice((page - 1) * PAR_PAGE, page * PAR_PAGE)
  /* Le panneau de la sélection ne tient à côté du graphe que si le graphe garde sa largeur minimale. */
  const parRang = rangsDuGraphe(ix)
  const nRangs = Object.keys(parRang).length
  const maxLignes = nRangs ? Math.max(...Object.keys(parRang).map((r) => parRang[Number(r)].length)) : 0
  return {
    question: QUESTIONS.dependances,
    baseGraphe: nRangs ? largeurMinGraphe(nRangs, maxLignes, socle.length > 0) + 2 : 0,
    stats: [
      { valeur: nb(manuel.length), libelle: pl(manuel.length, 'Fonctionnalité', 'Fonctionnalités'), ton: undefined as Ton | undefined },
      { valeur: nb(n.extraites), libelle: pl(n.extraites, 'Extraite', 'Extraites'), ton: undefined as Ton | undefined },
      { valeur: nb(n.extractibles), libelle: pl(n.extractibles, 'Extractible', 'Extractibles'), ton: (n.extractibles ? 'info' : undefined) as Ton | undefined },
      {
        valeur: nb(n.sansDep),
        libelle: pl(n.sansDep, 'Extraite sans ses dépendances', 'Extraites sans leurs dépendances'),
        ton: (n.sansDep ? 'warning' : undefined) as Ton | undefined,
      },
      { valeur: nb(n.hors), libelle: "Hors de l'ordre", ton: undefined as Ton | undefined },
    ],
    triHors: tri,
    surTriHors: (t: Tri) => m.maj({ triHors: t || null, pageHors: 1 }),
    pageHors: page,
    pagesHors: pages,
    totalHors: nbHors,
    parPageHors: PAR_PAGE,
    surPageHors: (p: number) => m.maj({ pageHors: p }),
    alertes,
    aGraphe: ordonnees > 0,
    videTitre: "Aucune fonctionnalité n'est encore dans l'ordre d'extraction",
    videTexte: "Une fonctionnalité prend un rang quand son périmètre est validé et que tout ce qu'elle atteint reste dans le manuel.",
    videManque: manque.length ? 'Il manque : ' + manque.join(', ') + '.' : '',
    videAretes: nbAretes ? compte(nbAretes, 'dépendance déjà relevée', 'dépendances déjà relevées') + ', ' + compte(socle.length, 'objet', 'objets') + ' au socle.' : '',
    panneau: sel ? panneauDependances(m, sel) : null,
    titreSocle: 'Socle · ' + socle.length,
    socle: socle.map((u) => {
      const touche = !!sel && u.fonctionnalites.indexOf(sel.id) >= 0
      return {
        objet: u.objet,
        compte: nb(u.fonctionnalites.length),
        lecture: u.objet + ' : ' + compte(u.fonctionnalites.length, 'fonctionnalité', 'fonctionnalités'),
        part: Math.max(4, Math.round((u.fonctionnalites.length / maxSocle) * 100)),
        touche,
        titre: u.fonctionnalites.join(', '),
      }
    }),
    socleNote: sel ? 'En indigo : les utilitaires que ' + sel.id + ' atteint.' : '',
    titreHors: "Hors de l'ordre · " + nbHors,
    lignesHors: hors,
    choisirHors: (id: string) => m.ouvrirFonctionnalite(id),
  }
}

export type VueDependances = ReturnType<typeof vueDependances>
