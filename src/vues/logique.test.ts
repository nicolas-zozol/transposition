/* Repris de prototype/essais/essai-logique.js : Repérage, Règles, saisies, import, Dépendances, Gherkin, sélecteur. */

import { describe, expect, it } from 'vitest'
import type { FichierDeDonnees } from '@/domaine/format'
import { gherkin } from '@/domaine/gherkin'
import { creerMagasin } from '@/magasin/magasin'
import { lireJeu, lireTexte, magasin, txt } from '@/essais-unitaires/donnees'
import { vueCoquille } from './coquille'
import { vueDependances } from './dependances'
import { vueGraphe } from './graphe'
import { vueRegles } from './regles'
import { vueReperage } from './reperage'

describe('Repérage', () => {
  it("arbre de F07.1 : mesures, lignes, fiche de la signature", () => {
    const m = magasin({ fonctionnalite: 'F07.1' })
    const v = vueReperage(m)
    expect(v.stats.map((s) => txt(s.valeur)).join('|')).toBe('12|1 100|2|5|17|3|2')
    expect(v.stats.map((s) => s.libelle)).toEqual(['Fonctions', 'Lignes de code', 'Niveaux', 'DataWindows', 'Appels non résolus', 'Arrêts', 'Appels en différé'])
    expect(v.lignes).toHaveLength(10)
    const rendu = v.lignes.map((l) => '  '.repeat(l.niveau - 1) + l.prefixe + l.nom + ' [' + l.marques.map((x) => txt(x.texte)).join(', ') + '] ' + txt(l.precision) + ' ' + txt(l.lignes) + ' l / ' + l.fonctions + ' fn / ' + l.part + '%' + (l.suivre ? ' -> ' + txt(l.suivreLabel) : ''))
    expect(rendu).toEqual([
      'w_sejour.ue_recalcul_sejour [] signature mère 1 100 l / 12 fn / 100%',
      '  u_bandeau.uf_affiche [Arrêt] technique — l / — fn / 0%',
      '  f_lit_parametre [Socle]  31 l / 1 fn / 3%',
      '  uf_lire_dossier []  125 l / 3 fn / 11%',
      '    f_date_vide [Socle]  6 l / 1 fn / 2%',
      '    f_lit_parametre [Renvoi, Socle]  — l / — fn / 0% -> Aller à son développement',
      "  uf_calcul_supplements [Autre arbre F07.1.a]  723 l / 7 fn / 66% -> Ouvrir l'arbre de F07.1.a, Supplément pour chambre particulière",
      "  u_calcul_ghs.uf_calcule [Arrêt] vers F09.1 — l / — fn / 0% -> Ouvrir l'arbre de F09.1, Calcul des GHS",
      "  uo_mutuelle.uf_prise_en_charge [Arrêt] vers F12.1 — l / — fn / 0% -> Ouvrir l'arbre de F12.1, Prise en charge par la mutuelle",
      "  ue_repartition_payeurs [Autre arbre F07.1.b, En différé]  163 l / 3 fn / 15% -> Ouvrir l'arbre de F07.1.b, Répartition entre les payeurs",
    ])
    expect(v.fiche?.id).toBe('w_sejour.ue_recalcul_sejour')
    expect(txt(v.fiche?.emplacement)).toBe('Ligne 2010, 126 lignes')
    expect(v.fiche?.signatureTexte).toBe('Signature mère de F07.1 Recalcul des frais de séjour')
  })

  it("fiche d'une fonction bloquée, et suivre l'arrêt", () => {
    const m = magasin({ fonctionnalite: 'F07.1', fonction: 'u_calcul_ghs.uf_calcule' })
    let v = vueReperage(m)
    const f = v.fiche!
    expect(f.arret?.visees[0].id).toBe('F09.1')
    expect([f.arret?.classe.texte, f.arret?.etat.texte, txt(f.arret?.confiance)]).toEqual(['Autre fonctionnalité', 'Proposé', 'Confiance 95 %'])
    expect(f.arret?.raison).toBe('Calcule le tarif du séjour selon son groupe homogène, décrit page 49 du manuel.')
    expect(f.appelleVide).toBe("Non développée ici : l'arbre s'arrête à cet objet.")
    expect(f.ailleurs.map((x) => x.id)).toEqual(['F09.1'])
    expect(f.appeleePar.map((x) => x.nom + ' ' + txt(x.ligne))).toEqual(['ue_recalcul_sejour ligne 2071'])
    v.lignes.find((l) => l.id === 'u_calcul_ghs.uf_calcule')!.suivre!()
    v = vueReperage(m)
    expect(m.etat.fonctionnaliteId).toBe('F09.1')
    expect(v.fiche?.id).toBe('u_calcul_ghs.uf_calcule')
  })

  it('fonction lancée en différé, sous-fonctionnalité', () => {
    const m = magasin({ fonctionnalite: 'F07.1', fonction: 'w_sejour.ue_repartition_payeurs' })
    const f = vueReperage(m).fiche!
    expect(f.differes.map((x) => x.fonction + ' ' + txt(x.ligne) + ' ' + x.lieu)).toEqual(['w_sejour.ue_recalcul_sejour ligne 2131 '])
    expect(f.signatureTexte).toBe('Signature mère de F07.1.b Répartition entre les payeurs')
    expect(f.marques.map((x) => txt(x.texte))).toEqual(['Autre arbre F07.1.b', 'En différé'])
  })

  it('recherche dans tous les arbres', () => {
    const m = magasin({ fonctionnalite: 'F07.1', recherche: 'f_lit_parametre' })
    let v = vueReperage(m)
    expect(v.resultatsOuverts).toBe(true)
    expect(txt(v.resumeResultats)).toBe('6 appels dans 5 arbres')
    expect(v.groupes.map((g) => g.id + ' ' + txt(g.compte) + ' (' + g.items.map((i) => txt(i.contexte)).join(' / ') + ')').join(' ; ')).toBe(
      'F03.1 1 appel (ligne 1222 · dans ue_forfait_journalier) ; F07.1 2 appels (ligne 2024 · dans ue_recalcul_sejour / ligne 1671 · dans uf_lire_dossier) ; F07.1.a 1 appel (ligne 3071 · dans ue_dernier_jour) ; F09.1 1 appel (ligne 4112 · dans ue_calcule_ghs) ; F12.1 1 appel (ligne 261 · dans uf_prise_en_charge)'
    )
    v.groupes[2].items[0].choisir()
    v = vueReperage(m)
    expect(m.etat.fonctionnaliteId).toBe('F07.1.a')
    expect(v.fiche?.id).toBe('f_lit_parametre.f_lit_parametre')
    expect(v.resultatsOuverts).toBe(false)
  })

  it('fonctionnalité sans arbre', () => {
    const v = vueReperage(magasin({ fonctionnalite: 'F15.1' }))
    expect(v.aArbre).toBe(false)
    expect(v.vide.titre).toBe('Arbre non extrait')
    expect(v.vide.texte).toBe("Le chemin de F15.1 vers le code n'est pas établi : la signature mère proposée reste à confirmer (confiance basse). Sans signature confirmée, pas d'arbre.")
    expect(v.vide.signature).toBe('w_bordereau.ue_editer')
    expect(v.vide.ordre).toBe("Hors de l'ordre")
    expect(v.badges.map((b) => b.texte).join(',')).toBe('Arbre non extrait,Chemin non établi,Périmètre non étudié')
  })

  it('dépliage par défaut et « Tout replier » qui garde la racine ouverte', () => {
    const m = magasin({ jeu: 'depart', fonctionnalite: 'F22.1' })
    expect(vueReperage(m).lignes).toHaveLength(21)
    m.toutBasculer(true)
    expect(vueReperage(m).lignes.length).toBeGreaterThan(200)
    m.toutBasculer(false)
    expect(vueReperage(m).lignes).toHaveLength(21)
  })
})

describe('Règles et saisies', () => {
  it('liste, filtres, fiche de F07.1.a', () => {
    const m = magasin({ onglet: 'regles', fonctionnalite: 'F07.1.a' })
    const v = vueRegles(m)
    expect(v.liste.map((l) => l.id + ' ' + l.extraction.texte + ' ' + txt(l.reglesTexte) + ' ' + (l.verdict ? l.verdict.texte : 'Sans test')).join(' ; ')).toBe(
      'F03.1 Extraite 2/2 règles validées Conforme ; F07.1 Non extraite Aucune règle Sans test ; F07.1.a Extraite 1/3 règles validées Écart expliqué ; F07.1.b Non extraite Aucune règle Sans test ; F09.1 Extraite sans ses dépendances 0/2 règles validées En échec ; F12.1 Non extraite Aucune règle Sans test ; F15.1 Non extraite Aucune règle Sans test'
    )
    expect(v.filtres.map((f) => f.label + ' ' + f.count).join(', ')).toBe('Toutes 7, Avec règles 3, À valider 2')
    const f = v.fiche!
    expect([f.id, f.titre, txt(f.page), f.mereTexte, f.statRegles, f.libRegles, f.statUnitaires, f.statIntegration]).toEqual([
      'F07.1.a',
      'Supplément pour chambre particulière',
      'Page 27 du manuel',
      'F07.1 Recalcul des frais de séjour',
      '1/3',
      'Règles validées',
      '2/2',
      '4',
    ])
    expect(f.integration.map((x) => txt(x.texte)).join(', ')).toBe('2 identiques, 1 écart expliqué, 1 non comparable')
    expect([f.depNote, f.depDe, f.depPar, f.depManquantes]).toEqual(['Celles de sa mère F07.1', '2', '0', '2'])
    expect(txt(f.decoupage)).toBe('6 morceaux de code gardés : 4 couverts par une règle, 1 technique, 1 sans test ; 2 coupés')
    expect(f.regles.map((r) => r.id + ' ' + r.verdict.texte + ' / ' + r.avis.texte + ' / ' + r.exemplesOuverts + ' / ' + txt(r.signature))).toEqual([
      'RM-CHAMBREPART-1 Conforme / Validée / false / DURAND Claire · 14/11/2026',
      'RM-CHAMBREPART-2 Écart expliqué / À revoir / true / DURAND Claire · 14/11/2026',
      'RM-CHAMBREPART-3 Non vérifié / À valider / true / ',
    ])
    expect(f.regles[1].exemples.map((x) => x.verdict.texte + '[' + x.tests.map((t) => t.id + ':' + t.texte).join(',') + ']').join(' ')).toBe(
      'Conforme[U-02:Réussi,dossier-25-743:Identique,dossier-25-962:Identique] Écart expliqué[dossier-26-90:Écart expliqué]'
    )
  })

  it("première saisie : le nom d'abord, puis l'avis signé ; export", () => {
    const m = magasin({ onglet: 'regles', fonctionnalite: 'F07.1.a' })
    let f = vueRegles(m).fiche!
    f.regles[2].choisirValidee()
    expect(m.etat.dialogue).toBe('nom')
    m.maj({ nomSaisi: 'MARTIN Paul' })
    m.validerNom()
    f = vueRegles(m).fiche!
    expect(f.regles[2].avis.texte).toBe('Validée')
    expect(m.etat.saisies.regles['RM-CHAMBREPART-3'].auteur).toBe('MARTIN Paul')
    /* Donner un avis ne replie pas les exemples sous les yeux de la personne. */
    expect(f.regles[2].exemplesOuverts).toBe(true)
    let c = vueCoquille(m)
    expect(c.libelleExporter).toBe('Exporter les saisies · 1')
    f.questions[1].surReponse('Non.')
    c = vueCoquille(m)
    expect([c.libelleExporter, c.exporter.nbAvis, c.exporter.nbReponses]).toEqual(['Exporter les saisies · 2', '5', '2'])
    const json = JSON.parse(c.exporter.json)
    expect(json.versionFormat).toBe(1)
    expect('fonctionnalites' in json).toBe(false)
    /* Recliquer l'avis déjà donné ne fait rien ; changer d'avis garde le commentaire. */
    m.commenter('RM-CHAMBREPART-3', 'À relire')
    const avant = JSON.stringify(m.etat.saisies.regles['RM-CHAMBREPART-3'])
    m.choisirAvis('RM-CHAMBREPART-3', 'validee')
    expect(JSON.stringify(m.etat.saisies.regles['RM-CHAMBREPART-3'])).toBe(avant)
    m.choisirAvis('RM-CHAMBREPART-3', 'aRevoir')
    expect(m.etat.saisies.regles['RM-CHAMBREPART-3'].commentaire).toBe('À relire')
    /* Un commentaire vidé disparaît de la saisie ; une réponse vidée supprime la saisie. */
    m.commenter('RM-CHAMBREPART-3', '')
    expect('commentaire' in m.etat.saisies.regles['RM-CHAMBREPART-3']).toBe(false)
    f.questions[1].surReponse('')
    expect(m.etat.saisies.questions[f.questions[1].id]).toBeUndefined()
  })

  it('F09.1 extraite sans ses dépendances, F07.1 sans règle', () => {
    let f = vueRegles(magasin({ onglet: 'regles', fonctionnalite: 'F09.1' })).fiche!
    expect([f.aAlerte, txt(f.alerte), f.statUnitaires, f.verdictTests.texte, f.depDe, f.depPar, f.depManquantes]).toEqual([
      true,
      'Extraite sans ses dépendances. Manquante : F12.1 Prise en charge par la mutuelle.',
      '1/2',
      'En échec',
      '1',
      '1',
      '1',
    ])
    expect(f.badges.map((b) => txt(b.texte)).join(',')).toBe('Extraite sans ses dépendances,Périmètre validé,Rang 2')
    expect(txt(f.decoupage)).toBe('4 morceaux de code gardés : 3 couverts par une règle, 1 technique, aucun sans test ; aucun coupé')
    f = vueRegles(magasin({ onglet: 'regles', fonctionnalite: 'F07.1' })).fiche!
    expect(f.aRegles).toBe(false)
    expect(f.vide.texte).toBe("Les règles de F07.1 s'écrivent dans ses sous-fonctionnalités, extraites et testées seules.")
    expect(f.vide.sous.map((s) => s.id + ' ' + txt(s.detail) + ' ' + s.extraction.texte).join(' ; ')).toBe('F07.1.a 3 règles, 1 validée Extraite ; F07.1.b Aucune règle Non extraite')
  })

  it('une mère écartée par le filtre reste visible, estompée', () => {
    const m = magasin({ onglet: 'regles', filtre: 'avecRegles' })
    const l = vueRegles(m).liste
    expect(l.map((x) => x.id + (x.estompee ? '*' : ''))).toEqual(['F03.1', 'F07.1*', 'F07.1.a', 'F09.1'])
  })
})

describe('Import', () => {
  it('JSON invalide, saisies, données, saisie orpheline, version inconnue', () => {
    const m = magasin({})
    m.ouvrirDialogue('importer')
    m.importer()
    expect(m.etat.importErreur).toBe('Collez un JSON ou déposez un fichier.')
    m.maj({ importTexte: '{ pas du json' })
    m.importer()
    expect(m.etat.importErreur).toMatch(/^JSON invalide près du caractère 3\. Vérifiez que le texte est complet : il commence par \{ et finit par \}\.$/)
    m.maj({ importTexte: lireTexte('saisies-exemple.json') })
    m.importer()
    expect(txt(m.etat.importMessage)).toBe('4 avis et 1 réponse fusionnés')
    expect(vueRegles(m).orphelinesTexte).toMatch(/RM-ANCIENNE-7/)
    m.maj({ importTexte: JSON.stringify(lireJeu('exemple')) })
    m.importer()
    /* Les saisies du fichier plus anciennes que celles importées juste avant restent en place. */
    expect(txt(m.etat.importMessage)).toBe('Données du 13/11/2026 : 7 fonctionnalités, 6 arbres. 3 avis et 1 réponse fusionnés.')
    m.maj({ importTexte: '{"saisies":{"regles":{"RM-CHAMBREPART-1":{"avis":"aRevoir","auteur":"X","date":"2000-01-01"}}}}' })
    m.importer()
    expect(m.etat.importMessage).toBe("Aucune saisie plus récente : rien n'a changé.")
    m.maj({ importTexte: '{"versionFormat":2,"saisies":{}}' })
    m.importer()
    expect(m.etat.importErreur).toBe('Version de format 2 non reconnue : cette application lit la version 1.')
    m.maj({ importTexte: '[1,2]' })
    m.importer()
    expect(m.etat.importErreur).toBe("Ce JSON n'est ni un fichier de données ni un fichier de saisies.")
  })

  it("le message d'un fichier de données de volumes", () => {
    const m = creerMagasin(lireJeu('exemple'), {})
    m.maj({ importTexte: JSON.stringify(lireJeu('depart')) })
    m.importer()
    expect(txt(m.etat.importMessage)).toBe('Données du 13/11/2026 : 62 fonctionnalités, 1 arbre. 8 avis et 2 réponses fusionnés.')
  })

  it('une saisie importée remplace la plus ancienne et cesse d’être non exportée', () => {
    const m = magasin({ auteur: 'MARTIN Paul', onglet: 'regles', fonctionnalite: 'F07.1.a' })
    m.choisirAvis('RM-CHAMBREPART-3', 'validee')
    expect(Object.keys(m.etat.locales.regles)).toEqual(['RM-CHAMBREPART-3'])
    m.maj({ importTexte: JSON.stringify({ saisies: { regles: { 'RM-CHAMBREPART-3': { avis: 'aRevoir', auteur: 'DURAND Claire', date: '2999-01-01' } } } }) })
    m.importer()
    expect(m.etat.saisies.regles['RM-CHAMBREPART-3'].avis).toBe('aRevoir')
    expect(Object.keys(m.etat.locales.regles)).toEqual([])
  })
})

describe('Dépendances', () => {
  it('Stat, alertes, graphe, panneau, socle, hors de l’ordre', () => {
    const m = magasin({ onglet: 'dependances', fonctionnalite: 'F07.1' })
    const v = vueDependances(m)
    expect(v.stats.map((s) => s.valeur + ' ' + s.libelle).join(' | ')).toBe("5 Fonctionnalités | 1 Extraite | 1 Extractible | 1 Extraite sans ses dépendances | 1 Hors de l'ordre")
    expect(v.alertes.map((a) => a.id + ' -> ' + a.manquantes.map((x) => x.id).join(',')).join(' ; ')).toBe('F09.1 -> F12.1')
    const g = vueGraphe(m, 1150)!
    expect(g.largeur + 'x' + g.hauteur).toBe('1150x384')
    expect(g.colonnes.map((k) => txt(k.titre) + ' ' + txt(k.sous)).join(', ')).toBe('Rang 0 Socle, Rang 1 2 fonctionnalités, Rang 2 1 fonctionnalité, Rang 3 1 fonctionnalité')
    expect(g.noeuds.map((n) => n.id + ' ' + n.x + ',' + n.y + ' ' + n.w + 'x' + n.h + ' ' + n.extraction.texte + (n.extractible ? ' [Extractible]' : '') + (n.sous ? ' ' + n.sous : ''))).toEqual([
      'F12.1 294,60 200x124 Non extraite [Extractible]',
      'F03.1 294,212 200x124 Extraite',
      'F09.1 612,60 200x124 Extraite sans ses dépendances',
      'F07.1 930,60 200x124 Non extraite 2',
    ])
    expect(g.traits.map((t) => t.d + ' ' + t.marqueur + ' ' + t.titre + (t.pointille ? ' pointillée' : ' pleine'))).toEqual([
      'M 612 122 C 554.5 122, 554.5 116, 497 116 faible F09.1 dépend de F12.1 par uo_mutuelle (Validé) pleine',
      'M 930 116 C 872.5 116, 872.5 122, 815 122 forte F07.1 dépend de F09.1 par u_calcul_ghs (Proposé) pointillée',
      'M 930 128 L 920 128 Q 910 128 910 138 L 910 188 Q 910 198 900 198 L 528 198 Q 518 198 518 188 L 518 138 Q 518 128 508 128 L 497 128 forte F07.1 dépend de F12.1 par uo_mutuelle (Proposé) pointillée',
    ])
    expect(g.etiquettes.map((x) => x.texte + '@' + x.x + ',' + x.y).join(' ')).toBe('u_calcul_ghs@873,119 uo_mutuelle@714,198 uo_mutuelle@555,119')
    expect(txt(g.socle.compte) + ' ' + g.socle.items.map((x) => x.objet + ' ' + x.compte + ' ' + (x.atteint ? 600 : 400)).join(', ')).toBe(
      '4 utilitaires partagés f_lit_parametre 4 600, f_arrondi 3 600, f_date_vide 2 600, f_tarif_produit 2 600'
    )
    const p = v.panneau!
    expect(p.id + ' ' + p.badges.map((b) => txt(b.texte)).join(',')).toBe('F07.1 Rang 3,Non extraite,Périmètre proposé,Chemin établi')
    expect(p.dependDe.map((x) => x.id + ' ' + x.objet + ' ' + x.etat.texte + ' ' + txt(x.confiance)).join(' ; ')).toBe('F09.1 u_calcul_ghs Proposé confiance 95 % ; F12.1 uo_mutuelle Proposé confiance haute')
    expect([p.requisePar.length, p.manquantes.map((x) => x.id).join(','), p.sous.map((x) => x.id).join(',')]).toEqual([0, 'F09.1,F12.1', 'F07.1.a,F07.1.b'])
    expect(v.lignesHors.map((r) => r.id + ' ' + r.perimetre + ' / ' + r.chemin + ' / ' + r.cause).join(' ; ')).toBe('F15.1 Périmètre non étudié / Chemin non établi / ')
    expect(v.socle.map((u) => u.objet + ' ' + txt(u.compte) + ' ' + u.part + '%').join(', ')).toBe('f_lit_parametre 4 100%, f_arrondi 3 75%, f_date_vide 2 50%, f_tarif_produit 2 50%')
  })
})

describe('Gherkin', () => {
  it('mots-clés, variables, tableaux alignés', () => {
    const d = lireJeu('exemple') as FichierDeDonnees
    const lignes = gherkin(d.fonctionnalites[2].regles![1].exemples[0].gherkin)
    expect(lignes.map((l) => l.segs.map((s) => (s.w === 600 ? '«' + s.t + '»' : s.t)).join(''))).toEqual([
      '«Plan du scénario:» Sortie avant 14 h',
      '  «Étant donné» le dossier témoin "«<dossier>»"',
      '  «Et» une sortie le «<sortie>» à «<heure>»',
      '  «Quand» on calcule les frais de séjour',
      '  «Alors» le dernier supplément facturé est celui du «<dernier jour>»',
      ' ',
      '  «Exemples:»',
      '    |« dossier »|« sortie     »|« heure »|« dernier jour »|',
      '    | 25-743  | 09/01/2025 | 11 h  | 08/01/2025   |',
      '    | 25-962  | 12/01/2025 | 11 h  | 11/01/2025   |',
    ])
  })
})

describe("Sélecteur d'arbre : deux niveaux au plus", () => {
  const selecteur = (options: { value: string; niveau: number }[]) => options.map((o) => (o.niveau === 3 ? '>>' : o.niveau === 2 ? '>' : '') + o.value).join(' ')
  it('exemple', () => {
    expect(selecteur(vueReperage(magasin({ fonctionnalite: 'F07.1' })).optionsArbres)).toBe('F03.1 F07.1 >F07.1.a >F07.1.b F09.1 F12.1 F15.1')
    expect(selecteur(vueReperage(magasin({ fonctionnalite: 'F03.1' })).optionsArbres)).toBe('F03.1 F07.1 F09.1 F12.1 F15.1')
    expect(selecteur(vueReperage(magasin({ fonctionnalite: 'F07.1.a' })).optionsArbres)).toBe('F03.1 F07.1 >F07.1.a >F07.1.b F09.1 F12.1 F15.1')
    const o = vueReperage(magasin({ fonctionnalite: 'F03.1' })).optionsArbres
    expect(o[3].label).toBe('F12.1 — Prise en charge par la mutuelle')
    expect(o[4].label).toMatch(/\(arbre non extrait\)$/)
  })
  it('trois niveaux de sous-fonctionnalités : le troisième n’est jamais proposé', () => {
    const profond = {
      versionFormat: 1,
      produitLe: '2026-11-13',
      application: 'essai',
      fonctions: {},
      arbres: {},
      dependances: { socle: [], aretes: [] },
      fonctionnalites: [
        { id: 'A.1', titre: 'Un' },
        { id: 'A.1.a', mere: 'A.1', titre: 'Un a' },
        { id: 'A.1.a.i', mere: 'A.1.a', titre: 'Un a i' },
        { id: 'A.1.a.ii', mere: 'A.1.a', titre: 'Un a ii' },
        { id: 'A.1.b', mere: 'A.1', titre: 'Un b' },
        { id: 'A.2', titre: 'Deux' },
        { id: 'A.2.a', mere: 'A.2', titre: 'Deux a' },
        { id: 'X.9.a', mere: 'X.9', titre: 'Mère absente du fichier' },
      ].map((f) => ({ page: 1, reperage: { delimitation: 'aucune' }, extraction: 'notExtracted', ...f })),
    } as unknown as FichierDeDonnees
    const s = (id: string) => selecteur(vueReperage(creerMagasin(profond, { fonctionnalite: id })).optionsArbres)
    expect(s('A.1')).toBe('A.1 >A.1.a >A.1.b A.2 X.9.a')
    expect(s('A.1.a')).toBe('A.1 >A.1.a >A.1.b A.2 X.9.a')
    expect(s('A.1.a.ii')).toBe('A.1 >A.1.a >>A.1.a.ii >A.1.b A.2 X.9.a')
    expect(s('A.2')).toBe('A.1 A.2 >A.2.a X.9.a')
    expect(s('X.9.a')).toBe('A.1 A.2 X.9.a')
  })
  it('volumes réels : 61 entrées', () => {
    for (const jeu of ['depart', 'intermediaire'] as const) {
      const m = magasin({ jeu, fonctionnalite: 'F22.1' })
      expect(vueReperage(m).optionsArbres).toHaveLength(61)
    }
  })
})
