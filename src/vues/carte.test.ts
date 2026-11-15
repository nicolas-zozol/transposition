/* Repris de prototype/essais/essai-carte-logique.js : disposition, repli, renvois, niveaux, sélection, suivi.
   Le zoom et la vue d'ensemble sont laissés à React Flow : leurs assertions vivent dans le parcours de bout en bout. */

import { describe, expect, it } from 'vitest'
import type { Noeud } from '@/domaine/indexation'
import { nb } from '@/domaine/formats'
import type { Magasin } from '@/magasin/magasin'
import { magasin, txt } from '@/essais-unitaires/donnees'
import { CARTE as G, disposerCarte, vueCarte, vueCarteAppels, type VueCarteAppels } from './carte'
import { vueCoquille } from './coquille'
import { vueReperage } from './reperage'

const SIG = 'w_facturation.ue_facturer_dossier'
const vue = (m: Magasin) => vueCarteAppels(m) as VueCarteAppels
const noeud = (v: VueCarteAppels, id: string) => v.noeuds.find((n) => n.id === id)!

/** Invariants de la disposition, vrais quel que soit l'état de dépliage. */
function invariants(m: Magasin) {
  const v = vue(m)
  const pos = v.pos
  let soucis: string[] = []
  const colonnes: Record<number, Array<{ y: number }>> = {}
  v.noeuds.forEach((n) => {
    const p = pos[n.cle]
    if (p.x !== G.pad + p.niveau * (G.nw + G.gx)) soucis.push('colonne ' + n.cle)
    ;(colonnes[p.niveau] = colonnes[p.niveau] || []).push(p)
    if (p.enfants.length) {
      const ys = p.enfants.map((c) => pos[c.cle].y)
      if (Math.abs(p.y - (ys[0] + ys[ys.length - 1]) / 2) > 1) soucis.push('centrage ' + n.cle)
      for (let i = 1; i < ys.length; i++) if (ys[i] < ys[i - 1] + G.nh + G.gy - 1) soucis.push('ordre des enfants ' + n.cle)
    }
    if (p.y < G.pad - 1 || p.y + G.nh > v.hauteur - G.pad + 1 || p.x + G.nw > v.largeur - G.pad + 1) soucis.push('débord ' + n.cle)
  })
  Object.keys(colonnes).forEach((k) => {
    const ps = colonnes[Number(k)]
    for (let i = 1; i < ps.length; i++) if (ps[i].y < ps[i - 1].y + G.nh + G.gy - 1) soucis.push('contact colonne ' + k)
  })
  if (v.aretes.length !== v.noeuds.length - 1) soucis.push('flèches ' + v.aretes.length)
  expect(soucis).toEqual([])
  soucis = []
  return v
}

describe('Carte : exemple', () => {
  it('F07.1 : deux niveaux, tout affiché, renvoi masqué', () => {
    const m = magasin({ fonctionnalite: 'F07.1' })
    const v = invariants(m)
    expect(v.noeuds).toHaveLength(9)
    expect(txt(v.resume)).toBe('8 appels, tous affichés, hors renvois')
    expect([v.reglages.niveau, v.reglages.sansPlus, v.reglages.toutDeplie, v.reglages.parDefaut]).toEqual(['2', true, true, true])
    expect([v.largeur, v.hauteur]).toEqual([2 * G.pad + 3 * G.nw + 2 * G.gx, 2 * G.pad + 7 * G.nh + 6 * G.gy])
    let n = noeud(v, 'w_sejour.uf_lire_dossier')
    expect([n.aBascule, n.ouverte, n.compte, txt(n.detail)]).toEqual([true, true, '3', '125 lignes · 1 renvoi'])
    n = noeud(v, 'w_sejour.uf_calcul_supplements')
    expect([n.aBascule, n.aCompteFixe, n.compte, !!n.suivre, n.marques[0].variante]).toEqual([false, true, '7', true, 'outline'])
    expect(n.marques[0].texte).toMatch(/F07\.1\.a/)
    n = noeud(v, 'w_sejour.ue_repartition_payeurs')
    expect([n.differe, n.marques.length]).toEqual([true, 1])
    expect(n.libelle).toMatch(/appelée en différé/)
    expect(v.aretes.find((x) => x.cible === n.cle)!.differe).toBe(true)
    n = noeud(v, 'u_calcul_ghs.uf_calcule')
    expect([txt(n.detail), !!n.suivre, n.aBascule, n.aCompteFixe]).toEqual(['vers F09.1', true, false, false])
    n = noeud(v, 'w_sejour.ue_recalcul_sejour')
    expect([n.selectionnee, txt(n.detail), n.compte]).toEqual([true, 'signature mère · 1 100 lignes', '12'])
  })

  it('renvois : masqués par défaut, affichés à la demande ; le renvoi sélectionné reste visible', () => {
    let m = magasin({ fonctionnalite: 'F07.1' })
    m.montrerRenvois(true)
    let v = invariants(m)
    expect([v.noeuds.length, txt(v.resume)]).toEqual([10, '9 appels, tous affichés'])
    expect(txt(noeud(v, 'w_sejour.uf_lire_dossier').detail)).toBe('125 lignes')
    m = magasin({ fonctionnalite: 'F07.1', fonction: 'f_lit_parametre.f_lit_parametre', occurrence: 'r.2.1' })
    v = vue(m)
    expect(v.noeuds).toHaveLength(10)
    expect(v.noeuds.filter((x) => x.selectionnee)[0].cle).toBe('r.2.1')
  })

  it('suivre : un renvoi mène à son développement, un arrêt à l’arbre visé sans changer d’onglet', () => {
    const m = magasin({ fonctionnalite: 'F07.1', renvois: 'oui', onglet: 'carte' })
    vue(m).noeuds.find((x) => x.cle === 'r.2.1')!.suivre!()
    expect(m.etat.cleSel).toBe('r.1')
    noeud(vue(m), 'u_calcul_ghs.uf_calcule').suivre!()
    expect([m.etat.fonctionnaliteId, m.etat.onglet]).toEqual(['F09.1', 'carte'])
  })

  it("l'onglet : navigation, légende, mesures, pied, état vide", () => {
    let m = magasin({ onglet: 'carte', fonctionnalite: 'F07.1' })
    const coq = vueCoquille(m)
    expect(coq.nav.map((x) => x.value).join(',')).toBe('reperage,carte,regles,dependances')
    expect(coq.titre).toBe('Carte')
    let c = vueCarte(m)
    expect(c.legende.map((x) => x.texte).join(',')).toBe('Développée,Arrêt,Autre arbre')
    expect(c.aDifferes).toBe(true)
    expect(c.stats.map((s) => txt(s.valeur) + ' ' + s.libelle).join(' | ')).toBe('12 fonctions | 1 100 lignes de code | 2 niveaux | 3 arrêts | 2 appels en différé')
    expect(txt(c.selection!.resume)).toBe("Point d'entrée de l'arbre · branche de 12 fonctions, 1 100 lignes, 2 niveaux")
    m.montrerRenvois(true)
    expect(vueCarte(m).legende.map((x) => x.texte).join(',')).toBe('Développée,Arrêt,Autre arbre,Renvoi')
    m = magasin({ onglet: 'carte', fonctionnalite: 'F15.1' })
    c = vueCarte(m)
    expect([c.aArbre, c.vide.titre, vueCarteAppels(m)]).toEqual([false, 'Arbre non extrait', null])
    expect(typeof vueReperage(magasin({ fonctionnalite: 'F07.1' })).allerCarte).toBe('function')
  })
})

describe('Carte : arbre réel de F22.1', () => {
  it('trois niveaux au départ, cinq branches repliées avec leur taille', () => {
    const m = magasin({ jeu: 'depart', fonctionnalite: 'F22.1' })
    const a = m.etat.index.arbres[SIG]
    const v = invariants(m)
    expect([v.noeuds.length, txt(v.resume), v.reglages.niveau]).toEqual([91, '90 appels affichés sur 116, hors renvois', '3'])
    expect(v.noeuds.every((x) => x.cle.split('.').length - 1 <= 3)).toBe(true)
    expect(v.largeur).toBe(2 * G.pad + 4 * G.nw + 3 * G.gx)
    expect(v.largeur + 'x' + v.hauteur).toBe('1128x3447')
    const replies = v.noeuds.filter((x) => x.aBascule && !x.ouverte)
    expect(replies.map((x) => x.nom + ' ' + x.compte)).toEqual(['f_cle_nir 3', 'f_code_regime 2', 'uf_fusionne 5', 'uf_ligne_prestation 30', 'ue_ecritures_pretes '])
    expect(txt(replies[3].basculeLabel)).toMatch(/^Déplier uf_ligne_prestation : \d+ appels, branche de 30 fonctions$/)
    /* La pastille reprend la taille du fichier, jamais un calcul de l'application. */
    a.noeuds
      .filter((x) => x.taille)
      .forEach((x) => {
        const y = v.noeuds.find((z) => z.cle === x.cle)
        if (y) expect(txt(y.compte)).toBe(x.taille!.fonctions > 1 ? txt(nb(x.taille!.fonctions)) : '')
      })
  })

  it('déplier puis replier un nœud', () => {
    const m = magasin({ jeu: 'depart', fonctionnalite: 'F22.1' })
    const cible = vue(m).noeuds.filter((x) => x.aBascule && !x.ouverte)[0]
    cible.basculer()
    let v = invariants(m)
    expect(v.noeuds.length).toBeGreaterThan(91)
    expect([v.reglages.niveau, v.reglages.parDefaut]).toEqual(['4', false])
    noeud(v, cible.id).basculer()
    v = vue(m)
    expect([v.noeuds.length, v.reglages.parDefaut]).toEqual([91, true])
  })

  it('niveaux : un de moins, un de plus, tout, retour', () => {
    const m = magasin({ jeu: 'depart', fonctionnalite: 'F22.1' })
    vue(m).reglages.moins()
    let v = invariants(m)
    expect(v.reglages.niveau).toBe('2')
    expect(v.noeuds).toHaveLength(59)
    v.reglages.moins()
    v = invariants(m)
    expect([v.reglages.niveau, v.noeuds.length, v.reglages.sansMoins]).toEqual(['1', 21, true])
    expect(v.hauteur).toBe(2 * G.pad + 20 * G.nh + 19 * G.gy)
    v.reglages.plus()
    vue(m).reglages.plus()
    v = vue(m)
    expect([v.noeuds.length, v.reglages.niveau]).toEqual([91, '3'])
    v.reglages.toutDeplier()
    v = invariants(m)
    expect([v.noeuds.length, txt(v.resume), v.reglages.toutDeplie, v.reglages.sansPlus]).toEqual([117, '116 appels, tous affichés, hors renvois', true, true])
    m.montrerRenvois(true)
    v = invariants(m)
    expect([v.noeuds.length, txt(v.resume), v.reglages.niveau]).toEqual([231, '230 appels, tous affichés', '9'])
    expect(v.largeur + 'x' + v.hauteur).toBe('2832x7496')
    v.reglages.revenir()
    v = vue(m)
    expect([v.noeuds.length, v.reglages.parDefaut]).toEqual([164, true])
  })

  it('sélection : le chemin se déplie ; un repli qui la cache la fait remonter', () => {
    let m = magasin({ jeu: 'depart', fonctionnalite: 'F22.1', fonction: 'u_facture.uf_ecart_arrondi', occurrence: 'r.9.2.3.3.3.0.0.0' })
    let v = invariants(m)
    expect([noeud(v, 'u_facture.uf_ecart_arrondi').selectionnee, v.reglages.niveau]).toEqual([true, '8'])
    expect(v.largeur).toBe(2 * G.pad + 9 * G.nw + 8 * G.gx)
    expect(v.aretes.filter((t) => t.fort)).toHaveLength(8)
    noeud(v, 'u_facture.uf_ajoute_ligne').basculer()
    v = vue(m)
    expect(m.etat.cleSel).toBe('r.9.2.3.3')
    expect(noeud(v, 'u_facture.uf_ajoute_ligne').selectionnee).toBe(true)
    m = magasin({ jeu: 'depart', fonctionnalite: 'F22.1' })
    m.selectionnerNoeud(m.etat.index.arbres[SIG].parCle['r.9.2.3.3.3.0'])
    expect(noeud(vue(m), 'u_facture.uf_total_facture').selectionnee).toBe(true)
  })

  it('niveaux=1 au départ garde le chemin de la sélection', () => {
    const m = magasin({ jeu: 'depart', fonctionnalite: 'F22.1', niveaux: 1 })
    expect(vue(m).noeuds).toHaveLength(21)
  })
})

describe('disposerCarte, sur un arbre fait à la main', () => {
  it('une feuille se loge à côté des descendants de sa voisine', () => {
    const f = (cle: string, enfants: Noeud[] = []) => ({ cle, enfants }) as unknown as Noeud
    const arbre = f('r', [f('a', [f('a1'), f('a2'), f('a3')]), f('b'), f('c', [f('c1')])])
    const L = disposerCarte(arbre, (x) => x.enfants)
    const y = (k: string) => L.pos[k].y
    expect(y('a')).toBe(y('a2'))
    expect(y('b')).toBe(y('a') + G.nh + G.gy)
    expect(y('b')).toBeLessThan(y('a3') + G.nh)
    expect(y('c1')).toBeGreaterThanOrEqual(y('a3') + G.nh + G.gyBranche)
    expect(y('c')).toBe(y('c1'))
    expect(y('r')).toBe((y('a') + y('c')) / 2)
    expect(L.profondeur).toBe(2)
    expect(L.ordre.map((x) => x.cle).join('')).toBe('raa1a2a3bcc1')
  })
})
