/* Le magasin : l'état unique de l'application et ses actions. Porté de creerMagasin, dans prototype/transposition.js.
   Les vues lisent m.etat et appellent ces actions ; chaque action notifie les abonnés. */

import type { FichierDeDonnees, Saisies, ValeurAvis } from '@/domaine/format'
import { fichierVide } from '@/domaine/format'
import { aujourdhui, compte, dateFr, majuscule } from '@/domaine/formats'
import type { ArbreIndexe, Noeud } from '@/domaine/indexation'
import { arbreDe, indexer } from '@/domaine/indexation'
import type { Onglet } from '@/domaine/libelles'
import { fichierSaisies, fusionner, phraseFusion, saisiesDe } from '@/domaine/saisies'
import {
  arbreCourant,
  carteOuverte,
  enfantsCarte,
  estOuvert,
  NIVEAUX_CARTE,
  type Attente,
  type Dialogue,
  type Etat,
  type FiltreListe,
  type Jeu,
} from './etat'

/** Les réglages de départ : ceux du fragment de l'URL, et ceux qui rejouent un état d'écran. */
export interface Options {
  jeu?: string
  onglet?: string
  theme?: string
  fonctionnalite?: string
  fonction?: string
  occurrence?: string
  recherche?: string
  mode?: string
  filtre?: string
  dialogue?: string
  auteur?: string
  saisiesLocales?: boolean | string
  importTexte?: string
  importErreur?: string
  importMessage?: string
  deplier?: string
  renvois?: boolean | string
  zoom?: string | number
  niveaux?: string | number
  /** Aucune fonctionnalité choisie : pour un essai. */
  sansSelection?: boolean
}

export type CibleSuivi = { genre: 'renvoi'; noeud: Noeud } | { genre: 'arbre' | 'arret'; id: string } | null

export interface Magasin {
  etat: Etat
  /** Croît à chaque notification : l'instantané que React compare. */
  version: number
  abonner(f: () => void): () => void
  notifier(): void
  maj(partiel: Partial<Etat>): void
  // Navigation
  allerOnglet(v: Onglet): void
  basculerTheme(): void
  ouvrirFonctionnalite(id: string, opts?: { onglet?: Onglet; fonction?: string; cle?: string } | null): void
  // Repérage
  selectionnerNoeud(n: Noeud): void
  basculerNoeud(a: ArbreIndexe, n: Noeud): void
  toutBasculer(ouvert: boolean): void
  cibleSuivi(a: ArbreIndexe, n: Noeud): CibleSuivi
  suivre(a: ArbreIndexe, n: Noeud): void
  // Carte
  basculerCarte(a: ArbreIndexe, n: Noeud): void
  deplierCarte(tout: boolean): void
  niveauCarte(sens: number): void
  montrerRenvois(oui: boolean): void
  // Saisies
  choisirAvis(id: string, avis: ValeurAvis): void
  commenter(id: string, texte: string): void
  ouvrirCommentaire(id: string): void
  /** Rend le champ à focaliser, et l'oublie. */
  prendreFocus(): string | null
  repondre(id: string, texte: string): void
  // Dialogues
  ouvrirDialogue(nom: Dialogue): void
  fermerDialogue(): void
  validerNom(): void
  importer(): void
  lireFichier(fichier: File | null | undefined): void
  copierExport(): void
  telechargerExport(): void
  /** Remplace les données, comme un import, sans message : le chargement de départ. */
  chargerDonnees(d: FichierDeDonnees, jeu?: Jeu): void
}

const ONGLETS: Onglet[] = ['reperage', 'carte', 'regles', 'dependances']

function donneesCompletes(obj: Partial<FichierDeDonnees>): FichierDeDonnees {
  return {
    ...fichierVide(),
    ...obj,
    fonctions: obj.fonctions || {},
    arbres: obj.arbres || {},
    fonctionnalites: obj.fonctionnalites || [],
    dependances: obj.dependances || { socle: [], aretes: [] },
  } as FichierDeDonnees
}

export function creerMagasin(donnees: FichierDeDonnees | null, options?: Options): Magasin {
  const o = options || {}
  let abonnes: Array<() => void> = []
  const d0 = donneesCompletes(donnees || fichierVide())
  const zoom = o.zoom === 'ajuste' ? 'ajuste' : Number(o.zoom) > 0 ? Number(o.zoom) : 1
  const e: Etat = {
    jeu: o.jeu === 'depart' || o.jeu === 'intermediaire' ? o.jeu : 'exemple',
    onglet: ONGLETS.indexOf(o.onglet as Onglet) >= 0 ? (o.onglet as Onglet) : 'reperage',
    theme: o.theme === 'dark' ? 'dark' : 'light',
    donnees: d0,
    index: indexer(d0),
    fonctionnaliteId: null,
    cleSel: 'r',
    ouverts: {},
    carte: {},
    carteRenvois: o.renvois === 'oui' || o.renvois === true,
    carteZoomDepart: zoom,
    recherche: o.recherche || '',
    rechercheOuverte: !!o.recherche,
    filtre: o.filtre === 'avecRegles' || o.filtre === 'aValider' ? (o.filtre as FiltreListe) : 'toutes',
    rechercheFonc: '',
    mode: o.mode === 'gherkin' ? 'gherkin' : 'francais',
    sections: {},
    filtreRegles: 'toutes',
    pageHors: 1,
    triHors: null,
    toutDeplie: o.deplier === 'tout',
    saisies: saisiesDe(d0),
    locales: { regles: {}, questions: {} },
    auteur: o.auteur || '',
    nomSaisi: o.auteur || '',
    enAttente: null,
    dialogue: o.dialogue === 'importer' || o.dialogue === 'exporter' || o.dialogue === 'nom' ? o.dialogue : null,
    importTexte: o.importTexte || '',
    importErreur: o.importErreur || '',
    importMessage: o.importMessage || '',
    importFichier: '',
    copie: false,
    focus: null,
  }

  const m = { etat: e, version: 0 } as Magasin

  m.abonner = (f) => {
    abonnes.push(f)
    return () => {
      abonnes = abonnes.filter((x) => x !== f)
    }
  }
  m.notifier = () => {
    m.version++
    abonnes.slice().forEach((f) => f())
  }
  m.maj = (partiel) => {
    Object.assign(e, partiel)
    m.notifier()
  }

  function selectionner(idFonction: string, cle?: string | null): boolean {
    const a = arbreCourant(e)
    if (!a) return false
    const n = (cle && a.parCle[cle]) || a.dev[idFonction] || (a.parFonction[idFonction] || [])[0]
    if (!n) return false
    e.cleSel = n.cle
    /* Le chemin jusqu'à la sélection se déplie dans l'arbre de Repérage comme sur la carte. */
    const t = (e.ouverts[a.signature] = e.ouverts[a.signature] || {})
    const c = (e.carte[a.signature] = e.carte[a.signature] || {})
    for (let p = n.parent; p; p = p.parent) {
      t[p.cle] = true
      c[p.cle] = true
    }
    return true
  }

  function premiereAvecArbre(): string | null {
    const ix = e.index
    const f0 = ix.liste.filter((f) => arbreDe(ix, f))[0] || ix.liste[0]
    return f0 ? f0.id : null
  }

  /* Départ : la fonctionnalité demandée, sinon la première qui a un arbre, sinon la première du fichier. */
  if (e.dialogue === 'nom' && !e.auteur) e.enAttente = { genre: 'premiere' }
  if (o.saisiesLocales === true || o.saisiesLocales === 'oui') {
    Object.keys(e.saisies.regles).forEach((k) => {
      e.locales.regles[k] = true
      if (!e.auteur) e.auteur = e.saisies.regles[k].auteur || ''
    })
    Object.keys(e.saisies.questions).forEach((k) => {
      e.locales.questions[k] = true
    })
    e.nomSaisi = e.auteur
  }
  e.fonctionnaliteId = o.sansSelection ? null : (o.fonctionnalite && e.index.parId[o.fonctionnalite] ? o.fonctionnalite : premiereAvecArbre())
  if (o.fonction) selectionner(o.fonction, o.occurrence)
  if (o.deplier === 'tout') {
    const a0 = arbreCourant(e)
    if (a0) {
      const t0: Record<string, boolean> = (e.ouverts[a0.signature] = {})
      const c0: Record<string, boolean> = (e.carte[a0.signature] = {})
      a0.noeuds.forEach((n) => {
        if (n.enfants.length) {
          t0[n.cle] = true
          c0[n.cle] = true
        }
      })
    }
  }
  /* niveaux : le nombre de niveaux que la carte déplie au départ, pour un état à montrer. Le chemin de la sélection reste ouvert. */
  if (Number(o.niveaux) >= 1) {
    const a1 = arbreCourant(e)
    if (a1) {
      const c1 = (e.carte[a1.signature] = e.carte[a1.signature] || {})
      a1.noeuds.forEach((n) => {
        if (n.enfants.length && c1[n.cle] == null) c1[n.cle] = n.profondeur < Number(o.niveaux)
      })
    }
  }

  /* Navigation */
  m.allerOnglet = (v) => m.maj({ onglet: v, rechercheOuverte: false })
  m.basculerTheme = () => m.maj({ theme: e.theme === 'dark' ? 'light' : 'dark' })
  m.ouvrirFonctionnalite = (id, opts) => {
    if (!e.index.parId[id]) return
    e.fonctionnaliteId = id
    e.cleSel = 'r'
    e.rechercheOuverte = false
    if (opts && opts.onglet) e.onglet = opts.onglet
    if (opts && opts.fonction) selectionner(opts.fonction, opts.cle)
    m.notifier()
  }

  /* Repérage */
  m.selectionnerNoeud = (n) => {
    selectionner(n.fonction, n.cle)
    m.notifier()
  }
  m.basculerNoeud = (a, n) => {
    const t = (e.ouverts[a.signature] = e.ouverts[a.signature] || {})
    t[n.cle] = !estOuvert(e, a, n)
    m.notifier()
  }
  /* « Tout replier » laisse la racine ouverte. */
  m.toutBasculer = (ouvert) => {
    const a = arbreCourant(e)
    if (!a) return
    const t: Record<string, boolean> = (e.ouverts[a.signature] = {})
    a.noeuds.forEach((n) => {
      if (n.enfants.length) t[n.cle] = ouvert || n.mode === 'racine'
    })
    m.notifier()
  }
  m.cibleSuivi = (a, n) => {
    const fn = e.donnees.fonctions[n.fonction]
    if (n.mode === 'reference') {
      const d = a.dev[n.fonction]
      return d && d !== n ? { genre: 'renvoi', noeud: d } : null
    }
    if (n.mode === 'autreArbre') {
      const id = e.index.parSignature[n.fonction]
      return id ? { genre: 'arbre', id } : null
    }
    if (n.mode === 'arret') {
      const ar = fn ? a.arrets[fn.objet] : undefined
      const cible = ar && ar.fonctionnalites && ar.fonctionnalites[0]
      return cible && e.index.parId[cible] ? { genre: 'arret', id: cible } : null
    }
    return null
  }
  m.suivre = (a, n) => {
    const c = m.cibleSuivi(a, n)
    if (!c) return
    if (c.genre === 'renvoi') m.selectionnerNoeud(c.noeud)
    else m.ouvrirFonctionnalite(c.id, c.genre === 'arret' ? { fonction: n.fonction } : null)
  }

  /* Carte */
  /* Quand un repli cache la fonction sélectionnée, la sélection remonte au nœud qui la cache. */
  function rattraperSelection(a: ArbreIndexe) {
    const n = a.parCle[e.cleSel]
    if (!n) return
    let visible = n
    for (let p = n.parent; p; p = p.parent) if (!carteOuverte(e, a, p)) visible = p
    e.cleSel = visible.cle
  }
  m.basculerCarte = (a, n) => {
    const t = (e.carte[a.signature] = e.carte[a.signature] || {})
    t[n.cle] = !carteOuverte(e, a, n)
    rattraperSelection(a)
    m.notifier()
  }
  m.deplierCarte = (tout) => {
    const a = arbreCourant(e)
    if (!a) return
    if (tout) {
      const t: Record<string, boolean> = (e.carte[a.signature] = {})
      a.noeuds.forEach((n) => {
        if (n.enfants.length) t[n.cle] = true
      })
    } else delete e.carte[a.signature]
    rattraperSelection(a)
    m.notifier()
  }
  /* Un niveau de plus : chaque nœud affiché encore replié se déplie. Un niveau de moins : les parents des nœuds
     les plus profonds se replient. Les branches dépliées à la main gardent leur avance. */
  m.niveauCarte = (sens) => {
    const a = arbreCourant(e)
    if (!a) return
    const t = (e.carte[a.signature] = e.carte[a.signature] || {})
    const affiches: Noeud[] = []
    let fond = 0
    const voir = (n: Noeud) => {
      affiches.push(n)
      if (n.profondeur > fond) fond = n.profondeur
      enfantsCarte(e, a, n).forEach(voir)
    }
    voir(a.racine)
    if (sens > 0)
      affiches.forEach((n) => {
        if (n.enfants.length && !carteOuverte(e, a, n)) t[n.cle] = true
      })
    else if (fond > 1)
      affiches.forEach((n) => {
        if (n.profondeur === fond - 1 && n.enfants.length) t[n.cle] = false
      })
    rattraperSelection(a)
    m.notifier()
  }
  m.montrerRenvois = (oui) => m.maj({ carteRenvois: !!oui })

  /* Saisies */
  function demanderNom(attente: Attente | null) {
    e.enAttente = attente
    e.nomSaisi = e.auteur || ''
    e.dialogue = 'nom'
    m.notifier()
  }
  m.choisirAvis = (id, avis) => {
    if (!e.auteur) return demanderNom({ genre: 'avis', id, valeur: avis })
    const s = e.saisies.regles[id]
    if (s && s.avis === avis) return
    /* Donner un avis ne replie pas les exemples sous les yeux de la personne. */
    if (e.sections['ex:' + id] == null) e.sections['ex:' + id] = !s || s.avis === 'aRevoir'
    const n: Etat['saisies']['regles'][string] = { avis, auteur: e.auteur, date: aujourdhui() }
    if (s && s.commentaire) n.commentaire = s.commentaire
    e.saisies.regles[id] = { avis: n.avis, ...(n.commentaire ? { commentaire: n.commentaire } : {}), auteur: n.auteur, date: n.date }
    e.locales.regles[id] = true
    m.notifier()
  }
  m.commenter = (id, texte) => {
    const s = e.saisies.regles[id]
    if (!s) return
    if (!e.auteur) return demanderNom({ genre: 'commentaire', id, valeur: texte })
    e.sections['com:' + id] = true
    e.saisies.regles[id] = { avis: s.avis, ...(texte ? { commentaire: texte } : {}), auteur: e.auteur, date: aujourdhui() }
    e.locales.regles[id] = true
    m.notifier()
  }
  m.ouvrirCommentaire = (id) => {
    e.sections['com:' + id] = true
    e.focus = 'tp-com-' + id
    m.notifier()
  }
  m.prendreFocus = () => {
    const id = e.focus
    e.focus = null
    return id
  }
  m.repondre = (id, texte) => {
    if (!e.auteur) return demanderNom({ genre: 'reponse', id, valeur: texte })
    if (!texte) {
      delete e.saisies.questions[id]
      delete e.locales.questions[id]
      return m.notifier()
    }
    e.saisies.questions[id] = { reponse: texte, auteur: e.auteur, date: aujourdhui() }
    e.locales.questions[id] = true
    m.notifier()
  }

  /* Dialogues */
  m.ouvrirDialogue = (nom) => {
    if (nom === 'nom') return demanderNom(null)
    m.maj({ dialogue: nom, importErreur: '', importMessage: '', importTexte: nom === 'importer' ? '' : e.importTexte, importFichier: '', copie: false })
  }
  m.fermerDialogue = () => m.maj({ dialogue: null, enAttente: null })
  m.validerNom = () => {
    const nom = String(e.nomSaisi || '').trim()
    if (!nom) return
    const att = e.enAttente
    e.auteur = nom
    e.dialogue = null
    e.enAttente = null
    if (att && att.genre === 'avis') m.choisirAvis(att.id, att.valeur)
    else if (att && att.genre === 'commentaire') m.commenter(att.id, att.valeur)
    else if (att && att.genre === 'reponse') m.repondre(att.id, att.valeur)
    else m.notifier()
  }

  function remplacerDonnees(obj: FichierDeDonnees) {
    const avant = e.saisies
    const locales = e.locales
    e.donnees = obj
    e.index = indexer(obj)
    e.saisies = avant
    e.locales = locales
    e.ouverts = {}
    e.carte = {}
    const r = fusionner(e.saisies, e.locales, obj.saisies)
    if (!e.index.parId[e.fonctionnaliteId || '']) e.fonctionnaliteId = premiereAvecArbre()
    e.cleSel = 'r'
    return r
  }

  m.chargerDonnees = (d, jeu) => {
    const obj = donneesCompletes(d)
    e.jeu = jeu || 'exemple'
    e.donnees = obj
    e.index = indexer(obj)
    e.saisies = saisiesDe(obj)
    e.locales = { regles: {}, questions: {} }
    e.ouverts = {}
    e.carte = {}
    if (!e.index.parId[e.fonctionnaliteId || '']) e.fonctionnaliteId = premiereAvecArbre()
    e.cleSel = 'r'
    m.notifier()
  }

  m.importer = () => {
    const txt = String(e.importTexte || '').trim()
    if (!txt) return m.maj({ importErreur: 'Collez un JSON ou déposez un fichier.', importMessage: '' })
    let obj: unknown
    try {
      obj = JSON.parse(txt)
    } catch (err) {
      const pos = /position (\d+)/.exec(String((err as Error)?.message || ''))
      return m.maj({
        importErreur: 'JSON invalide' + (pos ? ' près du caractère ' + (Number(pos[1]) + 1) : '') + '. Vérifiez que le texte est complet : il commence par { et finit par }.',
        importMessage: '',
      })
    }
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return m.maj({ importErreur: "Ce JSON n'est ni un fichier de données ni un fichier de saisies.", importMessage: '' })
    const x = obj as { versionFormat?: unknown; fonctionnalites?: unknown; saisies?: unknown; produitLe?: string; arbres?: object }
    if (x.versionFormat != null && x.versionFormat !== 1)
      return m.maj({ importErreur: 'Version de format ' + String(x.versionFormat) + ' non reconnue : cette application lit la version 1.', importMessage: '' })
    if (Array.isArray(x.fonctionnalites)) {
      const donnees = donneesCompletes(x as Partial<FichierDeDonnees>)
      e.jeu = 'exemple'
      const r1 = remplacerDonnees(donnees)
      const p1 = phraseFusion(r1)
      return m.maj({
        importErreur: '',
        importMessage:
          'Données du ' + dateFr(donnees.produitLe) + ' : ' + compte(donnees.fonctionnalites.length, 'fonctionnalité', 'fonctionnalités') + ', ' + compte(Object.keys(donnees.arbres).length, 'arbre', 'arbres') + (p1 ? '. ' + majuscule(p1) + '.' : ''),
      })
    }
    if (x.saisies && typeof x.saisies === 'object') {
      const p2 = phraseFusion(fusionner(e.saisies, e.locales, x.saisies as Saisies))
      return m.maj({ importErreur: '', importMessage: p2 ? majuscule(p2) : "Aucune saisie plus récente : rien n'a changé." })
    }
    m.maj({ importErreur: "Ce JSON n'est ni un fichier de données ni un fichier de saisies.", importMessage: '' })
  }

  m.lireFichier = (fichier) => {
    if (!fichier || typeof FileReader === 'undefined') return
    const lecteur = new FileReader()
    lecteur.onload = () => m.maj({ importTexte: String(lecteur.result || ''), importFichier: fichier.name || '', importErreur: '', importMessage: '' })
    lecteur.onerror = () => m.maj({ importErreur: 'Le fichier ' + (fichier.name || '') + " n'a pas pu être lu.", importMessage: '' })
    lecteur.readAsText(fichier)
  }

  function marquerExportees() {
    e.locales = { regles: {}, questions: {} }
  }
  m.copierExport = () => {
    const json = JSON.stringify(fichierSaisies(e.saisies), null, 2)
    const fini = () => {
      marquerExportees()
      m.maj({ copie: true })
      setTimeout(() => {
        if (e.copie) m.maj({ copie: false })
      }, 2400)
    }
    const secours = () => {
      try {
        const z = document.getElementById('tp-export-json') as HTMLTextAreaElement | null
        if (z) {
          z.focus()
          z.select()
          document.execCommand('copy')
        }
      } catch {
        /* la zone reste sélectionnée : Ctrl+C */
      }
      fini()
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(json).then(fini, secours)
      else secours()
    } catch {
      secours()
    }
  }
  m.telechargerExport = () => {
    try {
      const json = JSON.stringify(fichierSaisies(e.saisies), null, 2)
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
      const lien = document.createElement('a')
      lien.href = url
      lien.download = 'saisies-' + aujourdhui() + '.json'
      document.body.appendChild(lien)
      lien.click()
      lien.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      /* sans téléchargement possible, « Copier » reste disponible */
    }
    marquerExportees()
    m.notifier()
  }

  return m
}

export { NIVEAUX_CARTE }
