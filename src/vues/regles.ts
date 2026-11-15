/* Règles : liste des fonctionnalités, fiche, carte de règle, questions, tests. */

import type { Avis, Fonctionnalite, Regle, Verdict } from '@/domaine/format'
import { compte, dateFr, nb, NBSP, pl } from '@/domaine/formats'
import { nomFonction } from '@/domaine/indexation'
import { def, LIB, libelleOrdre, marque, point, QUESTIONS, SYNTHESE_VIDE, type Marque, type Ton } from '@/domaine/libelles'
import { orphelines } from '@/domaine/saisies'
import type { Etat, FiltreListe, FiltreRegles, Mode } from '@/magasin/etat'
import type { Magasin } from '@/magasin/magasin'

/** Le verdict d'une règle : la synthèse de ceux de ses exemples. */
export function synthese(verdicts: Verdict[]): Verdict {
  if (verdicts.indexOf('echec') >= 0) return 'echec'
  if (verdicts.indexOf('ecartExplique') >= 0) return 'ecartExplique'
  if (verdicts.indexOf('conforme') >= 0) return 'conforme'
  return 'nonVerifie'
}

export function resumeRegles(e: Etat, f: Fonctionnalite) {
  const r = { total: 0, validees: 0, aRevoir: 0, aValider: 0 }
  ;(f.regles || []).forEach((x) => {
    const s = e.saisies.regles[x.id]
    r.total++
    if (!s) r.aValider++
    else if (s.avis === 'validee') r.validees++
    else r.aRevoir++
  })
  return r
}

function signer(s: { auteur?: string; date?: string } | null | undefined): string {
  return s && s.auteur ? s.auteur + ' · ' + dateFr(s.date) : ''
}

function phraseDecoupage(dc: NonNullable<Fonctionnalite['decoupage']>): string {
  const zero = (x: number, texte: string) => (x ? x + NBSP + texte : 'aucun ' + texte)
  return (
    compte(dc.gardees, 'morceau de code gardé', 'morceaux de code gardés') +
    ' : ' +
    zero(dc.couvertes, pl(dc.couvertes, 'couvert', 'couverts') + ' par une règle') +
    ', ' +
    zero(dc.techniques, pl(dc.techniques, 'technique', 'techniques')) +
    ', ' +
    zero(dc.sansTest, 'sans test') +
    ' ; ' +
    zero(dc.coupees, pl(dc.coupees, 'coupé', 'coupés'))
  )
}

function ligneListe(m: Magasin, f: Fonctionnalite, estContexte: boolean) {
  const e = m.etat
  const r = resumeRegles(e, f)
  return {
    id: f.id,
    titre: f.titre,
    sous: !!f.mere,
    selectionnee: f.id === e.fonctionnaliteId,
    estompee: estContexte,
    choisir: () => m.ouvrirFonctionnalite(f.id),
    extraction: point(def(LIB.extraction, f.extraction)),
    reglesTexte: r.total ? r.validees + '/' + r.total + NBSP + pl(r.total, 'règle validée', 'règles validées') : 'Aucune règle',
    verdict: f.tests ? marque(def(LIB.verdict, f.tests.verdict)) : null,
  }
}

function regleVue(m: Magasin, f: Fonctionnalite, r: Regle) {
  const e = m.etat
  const s: Avis | null = e.saisies.regles[r.id] || null
  const exemples = r.exemples || []
  const cleEx = 'ex:' + r.id
  const cleCode = 'code:' + r.id
  const exOuverts = e.sections[cleEx] != null ? e.sections[cleEx] : e.toutDeplie || !s || s.avis === 'aRevoir'
  const codeOuvert = !!e.sections[cleCode]
  const champCommentaire = !!s && (s.avis === 'aRevoir' || !!s.commentaire || !!e.sections['com:' + r.id])
  const tests: Record<string, NonNullable<Fonctionnalite['tests']>['liste'][number]> = {}
  ;((f.tests && f.tests.liste) || []).forEach((t) => {
    tests[t.id] = t
  })
  return {
    id: r.id,
    enonce: r.enonce,
    verdict: marque(def(LIB.verdict, synthese(exemples.map((x) => x.verdict)))),
    avis: marque(def(LIB.avis, s ? s.avis : 'aucun')),
    valideeChoisie: !!(s && s.avis === 'validee'),
    aRevoirChoisi: !!(s && s.avis === 'aRevoir'),
    choisirValidee: () => m.choisirAvis(r.id, 'validee'),
    choisirARevoir: () => m.choisirAvis(r.id, 'aRevoir'),
    champCommentaire,
    proposerCommentaire: !!s && !champCommentaire,
    ouvrirCommentaire: () => m.ouvrirCommentaire(r.id),
    idCommentaire: 'tp-com-' + r.id,
    commentaire: (s && s.commentaire) || '',
    aideCommentaire: s && s.avis === 'aRevoir' ? 'Dites ce qui est à revoir.' : 'Facultatif.',
    surCommentaire: (texte: string) => m.commenter(r.id, texte),
    signature: signer(s),
    nbExemples: 'Exemples · ' + exemples.length,
    exemplesOuverts: exOuverts,
    basculerExemples: () => {
      e.sections[cleEx] = !exOuverts
      m.notifier()
    },
    exemples: exemples.map((x) => {
      const ts = (x.tests || []).map((id) => {
        const t = tests[id]
        const d = t ? LIB.test[t.verdict] : null
        return { id, ton: (d ? d.ton : 'neutral') as Ton, texte: d ? d.texte : 'Absent des tests' }
      })
      const tonExp = x.verdict === 'echec' ? 'destructive' : x.verdict === 'ecartExplique' ? 'info' : 'neutre'
      return {
        titre: x.titre,
        francais: x.francais,
        gherkin: x.gherkin,
        verdict: marque(def(LIB.verdict, x.verdict)),
        explication: x.explication || '',
        tonExplication: tonExp as 'destructive' | 'info' | 'neutre',
        iconeExplication: x.verdict === 'echec' ? 'ban' : x.verdict === 'ecartExplique' ? 'info' : 'circle-help',
        tests: ts,
      }
    }),
    nbCode: 'Dans le code · ' + (r.code || []).length,
    aCode: !!(r.code && r.code.length),
    codeOuvert,
    basculerCode: () => {
      e.sections[cleCode] = !codeOuvert
      m.notifier()
    },
    code: (r.code || []).map((c) => {
      const nom = nomFonction(c.fonction)
      return {
        regle: c.regle,
        prefixe: nom.prefixe,
        nom: nom.nom,
        lignes: 'lignes' + NBSP + c.debut + ' à ' + c.fin,
        voir: () => m.ouvrirFonctionnalite(f.id, { onglet: 'reperage', fonction: c.fonction }),
      }
    }),
  }
}

export type VueRegle = ReturnType<typeof regleVue>

function ficheRegles(m: Magasin, f: Fonctionnalite) {
  const e = m.etat
  const ix = e.index
  const r = resumeRegles(e, f)
  const tests = f.tests || null
  const mere = f.mere ? ix.parId[f.mere] || null : null
  const enfants = ix.enfants[f.id] || []
  const manuel = mere || f
  const ordre = (manuel.reperage && manuel.reperage.ordre) || null
  const aretes = (e.donnees.dependances && e.donnees.dependances.aretes) || []
  const dependDe = aretes.filter((x) => x.source === manuel.id).length
  const requisePar = aretes.filter((x) => x.cible === manuel.id).length
  const manquantes = (ordre && ordre.manquantes) || []
  const integration: Array<{ ton: Ton; texte: string }> = []
  if (tests && tests.integration) {
    ;(Object.keys(LIB.test) as Array<keyof typeof LIB.test>).forEach((k) => {
      const x = tests.integration[k]
      if (x) integration.push({ ton: LIB.test[k].ton, texte: x + NBSP + pl(x, LIB.test[k].un, LIB.test[k].plusieurs) })
    })
  }
  const regles = (f.regles || []).filter((x) => {
    const s = e.saisies.regles[x.id]
    if (e.filtreRegles === 'aValider') return !s
    if (e.filtreRegles === 'aRevoir') return !!s && s.avis === 'aRevoir'
    if (e.filtreRegles === 'validees') return !!s && s.avis === 'validee'
    return true
  })
  let videTexte: string
  if (enfants.length) videTexte = 'Les règles de ' + f.id + " s'écrivent dans ses sous-fonctionnalités, extraites et testées seules."
  else if (f.extraction === 'notExtracted') videTexte = f.id + " n'est pas extraite : ses règles métier s'écriront après l'extraction."
  else videTexte = "Aucune règle métier n'est écrite pour " + f.id + '.'
  const badges: Marque[] = [marque(def(LIB.extraction, f.extraction)), marque(def(LIB.perimetre, (f.reperage && f.reperage.delimitation) || 'aucune'))]
  if (!f.mere && ordre)
    badges.push(marque({ ton: ordre.statut === 'signalee' ? 'warning' : 'neutral', icone: ordre.statut === 'signalee' ? true : 'list-checks' }, libelleOrdre(ordre)))
  return {
    id: f.id,
    titre: f.titre,
    page: 'Page' + NBSP + f.page + ' du manuel',
    mereTexte: mere ? mere.id + ' ' + mere.titre : '',
    ouvrirMere: () => {
      if (mere) m.ouvrirFonctionnalite(mere.id)
    },
    badges,
    statRegles: r.total ? r.validees + '/' + r.total : '—',
    libRegles: pl(r.total || 2, 'Règle validée', 'Règles validées'),
    statUnitaires: tests ? (tests.unitaires.ok || 0) + '/' + tests.unitaires.total : '—',
    libUnitaires: pl(tests ? tests.unitaires.total : 2, 'Test unitaire réussi', 'Tests unitaires réussis'),
    statIntegration: tests ? nb(tests.integration.total) : '—',
    libIntegration: pl(tests ? tests.integration.total : 2, "Test d'intégration", "Tests d'intégration"),
    integration,
    verdictTests: tests ? marque(def(LIB.verdict, tests.verdict)) : marque(SYNTHESE_VIDE),
    depDe: nb(dependDe),
    depPar: nb(requisePar),
    depManquantes: nb(manquantes.length),
    manquantesEnAlerte: manquantes.length > 0,
    depNote: mere ? 'Celles de sa mère ' + mere.id : '',
    allerDependances: () => m.ouvrirFonctionnalite(manuel.id, { onglet: 'dependances' }),
    aAlerte: f.extraction === 'extractedSansDependances',
    alerte:
      'Extraite sans ses dépendances. ' +
      pl(manquantes.length, 'Manquante', 'Manquantes') +
      ' : ' +
      manquantes
        .map((id) => {
          const x = ix.parId[id]
          return id + (x ? ' ' + x.titre : '')
        })
        .join(', ') +
      '.',
    modeItems: [
      { value: 'francais' as Mode, label: 'Français' },
      { value: 'gherkin' as Mode, label: 'Gherkin' },
    ],
    mode: e.mode,
    surMode: (v: Mode) => m.maj({ mode: v }),
    aRegles: r.total > 0,
    filtresRegles: [
      { value: 'toutes' as FiltreRegles, label: 'Toutes', count: r.total },
      { value: 'aValider' as FiltreRegles, label: 'À valider', count: r.aValider },
      { value: 'aRevoir' as FiltreRegles, label: 'À revoir', count: r.aRevoir },
      { value: 'validees' as FiltreRegles, label: 'Validées', count: r.validees },
    ],
    filtreRegles: e.filtreRegles,
    surFiltreRegles: (v: FiltreRegles) => m.maj({ filtreRegles: v }),
    regles: regles.map((x) => regleVue(m, f, x)),
    aucuneDansFiltre: r.total > 0 && !regles.length,
    decoupage: f.decoupage ? phraseDecoupage(f.decoupage) : '',
    vide: {
      titre: 'Aucune règle métier',
      texte: videTexte,
      sous: enfants.map((x) => {
        const rx = resumeRegles(e, x)
        return {
          id: x.id,
          titre: x.titre,
          extraction: point(def(LIB.extraction, x.extraction)),
          detail: rx.total ? compte(rx.total, 'règle', 'règles') + ', ' + rx.validees + NBSP + pl(rx.validees, 'validée', 'validées') : 'Aucune règle',
          ouvrir: () => m.ouvrirFonctionnalite(x.id),
        }
      }),
      allerDependances: () => m.ouvrirFonctionnalite(manuel.id, { onglet: 'dependances' }),
      allerReperage: () => m.ouvrirFonctionnalite(f.id, { onglet: 'reperage' }),
    },
    titreQuestions: 'Questions pour le métier · ' + (f.questions || []).length,
    questions: (f.questions || []).map((q) => {
      const s = e.saisies.questions[q.id] || null
      return {
        id: q.id,
        idChamp: 'tp-rep-' + q.id,
        texte: q.texte,
        regles: q.regles || [],
        reponse: (s && s.reponse) || '',
        surReponse: (texte: string) => m.repondre(q.id, texte),
        signature: signer(s),
        etat: s ? marque({ ton: 'success', icone: true }, 'Répondue') : marque({ ton: 'neutral', icone: 'clock' }, 'Sans réponse'),
      }
    }),
    titreTests: 'Tests · ' + ((tests && tests.liste) || []).length,
    lignesTests: ((tests && tests.liste) || []).map((t) => {
      const d = LIB.test[t.verdict] || { texte: t.verdict, ton: 'neutral' as Ton }
      return { id: t.id, nature: LIB.natureTest[t.nature] || t.nature, libelle: t.libelle, verdict: d.texte, ton: d.ton as Ton, explication: t.explication || '' }
    }),
  }
}

export type FicheRegles = ReturnType<typeof ficheRegles>

export function vueRegles(m: Magasin) {
  const e = m.etat
  const ix = e.index
  const q = String(e.rechercheFonc || '').trim().toLowerCase()
  const garde: Record<string, 'oui' | 'contexte'> = {}
  const compteurs = { toutes: 0, avecRegles: 0, aValider: 0 }
  ix.liste.forEach((f) => {
    const r = resumeRegles(e, f)
    compteurs.toutes++
    if (r.total) compteurs.avecRegles++
    if (r.aValider) compteurs.aValider++
    let ok = e.filtre === 'avecRegles' ? r.total > 0 : e.filtre === 'aValider' ? r.aValider > 0 : true
    if (ok && q) ok = (f.id + ' ' + f.titre).toLowerCase().indexOf(q) >= 0
    if (ok) garde[f.id] = 'oui'
  })
  /* Une mère que le filtre écarte reste visible, estompée, quand l'une de ses sous-fonctionnalités passe. */
  ix.liste.forEach((f) => {
    if (garde[f.id] === 'oui' && f.mere && !garde[f.mere]) garde[f.mere] = 'contexte'
  })
  const liste = ix.liste.filter((f) => garde[f.id]).map((f) => ligneListe(m, f, garde[f.id] === 'contexte'))
  const f = ix.parId[e.fonctionnaliteId || ''] || null
  const orph = orphelines(e.saisies, ix)
  return {
    question: QUESTIONS.regles,
    rechercheFonc: e.rechercheFonc,
    surRechercheFonc: (texte: string) => m.maj({ rechercheFonc: texte }),
    filtres: [
      { value: 'toutes' as FiltreListe, label: 'Toutes', count: compteurs.toutes },
      { value: 'avecRegles' as FiltreListe, label: 'Avec règles', count: compteurs.avecRegles },
      { value: 'aValider' as FiltreListe, label: 'À valider', count: compteurs.aValider },
    ],
    filtre: e.filtre,
    surFiltre: (v: FiltreListe) => m.maj({ filtre: v }),
    liste,
    orphelinesTexte: orph.length
      ? compte(orph.length, 'saisie', 'saisies') +
        ' sans règle ni question dans les données : ' +
        orph.map((o) => o.id).join(', ') +
        '. ' +
        pl(orph.length, 'Elle reste', 'Elles restent') +
        " dans l'export."
      : '',
    fiche: f ? ficheRegles(m, f) : null,
  }
}

export type VueRegles = ReturnType<typeof vueRegles>
