/* Repris de prototype/essais/essai-volumes.js : cohérence des deux jeux de volumes, et lecture sans erreur par
   l'application. Les vérifications du générateur des jeux (transposition-volumes.js) ne sont pas portées : l'application
   lit les fichiers JSON. */

import { describe, expect, it } from 'vitest'
import type { Appel } from '@/domaine/format'
import { indexer } from '@/domaine/indexation'
import { lireJeu, magasin, txt } from '@/essais-unitaires/donnees'
import { vueCarte, vueCarteAppels } from './carte'
import { vueCoquille } from './coquille'
import { vueDependances } from './dependances'
import { vueGraphe } from './graphe'
import { vueRegles } from './regles'
import { vueReperage } from './reperage'

const SIG = 'w_facturation.ue_facturer_dossier'

describe('Jeu de départ', () => {
  const d = lireJeu('depart')
  const manuel = d.fonctionnalites.filter((f) => !f.mere)
  it('le manuel, les dépendances, le socle', () => {
    expect(manuel).toHaveLength(61)
    expect(new Set(d.fonctionnalites.map((f) => f.id)).size).toBe(d.fonctionnalites.length)
    expect(manuel.every((f) => f.reperage.ordre!.statut === 'signalee' && f.reperage.ordre!.rang == null)).toBe(true)
    expect(Math.max(...d.fonctionnalites.map((f) => f.titre.length))).toBe(63)
    expect(d.dependances.aretes).toHaveLength(15)
    expect(d.dependances.aretes.every((a) => a.source === 'F22.1' && a.etat === 'candidate')).toBe(true)
    expect(d.dependances.socle).toHaveLength(38)
    expect(manuel.every((f) => (f.reperage.correspondance!.statut === 'sans-correspondance') === !f.reperage.signature)).toBe(true)
  })
  it("l'arbre de F22.1", () => {
    const arbre = d.arbres[SIG]
    expect(Object.keys(d.arbres)).toHaveLength(1)
    const t = arbre.taille
    expect([t.fonctions, t.lignes, t.profondeur, t.datawindows, t.nonResolus, t.posts]).toEqual([90, 2696, 9, 13, 192, 11])
    const noeuds: Appel[] = []
    const voir = (l: Appel[] | undefined) => (l || []).forEach((a) => (noeuds.push(a), voir(a.appels)))
    voir(arbre.appels)
    const renvois: Record<string, number> = {}
    noeuds.filter((n) => n.mode === 'reference').forEach((n) => (renvois[n.fonction] = (renvois[n.fonction] || 0) + 1))
    expect(Object.keys(renvois)).toHaveLength(19)
    expect(Object.values(renvois).reduce((x, y) => x + y, 0)).toBe(114)
    const dev = Object.keys(d.fonctions).filter((id) => d.fonctions[id].lignes != null)
    expect(dev).toHaveLength(90)
    expect(Math.max(...dev.map((id) => d.fonctions[id].lignes!))).toBe(433)
    expect(noeuds.every((n) => d.fonctions[n.fonction])).toBe(true)
    expect(arbre.arrets!.length).toBe(arbre.taille.arrets)
    const paires: string[] = []
    arbre.arrets!.forEach((x) => (x.fonctionnalites || []).forEach((c) => paires.push(x.objet + '>' + c)))
    expect(paires.sort()).toEqual(d.dependances.aretes.map((a) => a.objet + '>' + a.cible).sort())
  })
  it('la fiche F04.1.a', () => {
    const f = d.fonctionnalites.find((x) => x.id === 'F04.1.a')!
    const ex = f.regles!.flatMap((r) => r.exemples)
    expect([f.regles!.length, ex.length, f.tests!.unitaires.total, f.tests!.integration.total, f.questions!.length]).toEqual([14, 35, 14, 29, 5])
    const dc = f.decoupage!
    expect(dc.gardees).toBe(dc.couvertes + dc.techniques + dc.sansTest)
    expect(dc.gardees + dc.coupees).toBe(55)
    expect(Math.max(...ex.map((e) => e.gherkin.trimEnd().split('\n').length))).toBe(24)
    Object.keys(d.saisies!.regles!).forEach((id) => expect(f.regles!.some((r) => r.id === id)).toBe(true))
  })
})

describe('Jeu intermédiaire', () => {
  const di = lireJeu('intermediaire')
  it('rangs, arêtes, arbres de l’exemple intacts', () => {
    const man = di.fonctionnalites.filter((f) => !f.mere)
    expect(man).toHaveLength(61)
    const parRang: Record<number, number> = {}
    man.filter((f) => f.reperage.ordre!.statut !== 'signalee').forEach((f) => (parRang[f.reperage.ordre!.rang!] = (parRang[f.reperage.ordre!.rang!] || 0) + 1))
    expect(parRang).toEqual({ 1: 8, 2: 8, 3: 6, 4: 4, 5: 3, 6: 2 })
    expect(di.dependances.aretes).toHaveLength(54)
    expect(Object.keys(di.arbres)).toHaveLength(7)
    const ex = lireJeu('exemple')
    Object.keys(ex.arbres).forEach((s) => expect(di.arbres[s]).toEqual(ex.arbres[s]))
  })
})

describe("L'application lit les deux jeux", () => {
  it('toutes les vues, sans erreur', () => {
    for (const jeu of ['depart', 'intermediaire'] as const) {
      for (const onglet of ['reperage', 'carte', 'regles', 'dependances'] as const) {
        const m = magasin({ jeu, onglet, fonctionnalite: onglet === 'regles' ? 'F04.1.a' : 'F22.1' })
        vueCoquille(m)
        vueReperage(m)
        vueCarte(m)
        vueCarteAppels(m)
        vueRegles(m)
        vueDependances(m)
        vueGraphe(m, 1500)
      }
    }
  })
  it('valeurs de référence du prototype', () => {
    let m = magasin({ jeu: 'depart', fonctionnalite: 'F22.1' })
    const v = vueReperage(m)
    expect(v.stats.map((s) => txt(s.valeur)).join(' | ')).toBe('90 | 2 696 | 9 | 13 | 192 | 19 | 11')
    expect(v.lignes).toHaveLength(21)
    const profond = indexer(lireJeu('depart'))
      .arbres[SIG].noeuds.filter((n) => n.profondeur === 9)
      .map((n) => n.cle + ' ' + n.fonction)
    expect(profond).toEqual(['r.9.2.3.0.0.0.0.0.0 uf_time_convertdatetimeinseconds.uf_time_convertdatetimeinseconds', 'r.9.2.3.3.3.0.0.0.0 f_arrondi.f_arrondi'])
    m = magasin({ jeu: 'depart', onglet: 'dependances', fonctionnalite: 'F22.1' })
    let vd = vueDependances(m)
    expect(vd.stats.map((s) => s.valeur + ' ' + s.libelle).join(' | ')).toBe("61 Fonctionnalités | 0 Extraite | 0 Extractible | 0 Extraite sans ses dépendances | 61 Hors de l'ordre")
    expect(txt(vd.videManque)).toBe('Il manque : 60 périmètres non étudiés, 1 périmètre proposé à valider, 13 chemins non établis, 6 lignes sans correspondance.')
    m.maj({ pageHors: 2 })
    vd = vueDependances(m)
    const toutes = vueDependances((m.maj({ pageHors: 1 }), m)).lignesHors.concat(vd.lignesHors)
    expect(toutes.find((l) => l.id === 'F22.1')!.cause).toBe("Objets hors manuel : u_pmsi, u_stock_pharmacie ; atteint F03.1, F04.1, F05.1, F07.1 et 11 autres, hors de l'ordre")
    expect([vd.pagesHors, vd.totalHors]).toEqual([3, 61])
    m = magasin({ jeu: 'intermediaire', onglet: 'dependances', fonctionnalite: 'F07.1' })
    const vi = vueDependances(m)
    expect(vi.stats.map((s) => s.valeur + ' ' + s.libelle).join(' | ')).toBe("61 Fonctionnalités | 11 Extraites | 7 Extractibles | 2 Extraites sans leurs dépendances | 30 Hors de l'ordre")
    expect(vi.alertes.map((a) => a.id).join(',')).toBe('F09.1,F17.1')
    const g = vueGraphe(m, 1560)!
    expect([g.largeur + 'x' + g.hauteur, g.noeuds.length, g.traits.length, g.etiquettes.length]).toEqual(['1558x1260', 31, 36, 3])
  })
})
