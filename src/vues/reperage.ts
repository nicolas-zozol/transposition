/* Repérage : lignes de l'arbre, fiche de la fonction, recherche. */

import { compte, nb, NBSP } from '@/domaine/formats'
import type { ArbreIndexe, Noeud } from '@/domaine/indexation'
import { arbreDe, nomDansArbre, nomFonction } from '@/domaine/indexation'
import { def, LIB, libelleConfiance, marque, QUESTIONS, type Marque } from '@/domaine/libelles'
import { estOuvert } from '@/magasin/etat'
import type { Magasin } from '@/magasin/magasin'
import { arbreVide, couper, libelleSuivi, marquesNoeud, mesuresArbre, optionsArbres, precisionNoeud, tailleNoeud } from './commun'

function lignesArbre(m: Magasin, a: ArbreIndexe) {
  const e = m.etat
  const total = (a.arbre.taille && a.arbre.taille.lignes) || 0
  /* Un arbre profond resserre ses filets de niveau : le nom de la fonction garde sa place. */
  const pasGuide = ((a.arbre.taille && a.arbre.taille.profondeur) || 0) > 6 ? 1 : 5
  const out: Array<ReturnType<typeof ligne>> = []
  function ligne(n: Noeud) {
    const nom = nomDansArbre(e.donnees, a, n.fonction, n.mode === 'racine')
    const aEnfants = n.enfants.length > 0
    const ouverte = aEnfants && estOuvert(e, a, n)
    const t = tailleNoeud(e, a, n)
    const cible = m.cibleSuivi(a, n)
    const sel = n.cle === e.cleSel
    const aLignes = !!t && t.lignes != null
    const part = aLignes && total ? Math.max(2, Math.round(((t.lignes as number) / total) * 100)) : 0
    return {
      cle: n.cle,
      id: n.fonction,
      prefixe: nom.prefixe,
      nom: nom.nom,
      niveau: n.profondeur + 1,
      guides: n.profondeur,
      pasGuide,
      aEnfants,
      ouverte,
      basculeLabel: (ouverte ? 'Replier ' : 'Déplier ') + nom.nom,
      basculer: () => m.basculerNoeud(a, n),
      selectionnee: sel,
      selectionner: () => m.selectionnerNoeud(n),
      marques: marquesNoeud(e, a, n),
      precision: precisionNoeud(e, a, n),
      suivre: cible ? () => m.suivre(a, n) : null,
      suivreLabel: libelleSuivi(e, cible),
      lignes: aLignes ? nb(t.lignes) : '—',
      fonctions: t && t.fonctions != null ? nb(t.fonctions) : '—',
      aLignes,
      part,
      partLabel: aLignes ? part + " % des lignes de l'arbre" : 'Hors de la taille',
    }
  }
  const visiter = (n: Noeud) => {
    const l = ligne(n)
    out.push(l)
    if (l.ouverte) n.enfants.forEach(visiter)
  }
  visiter(a.racine)
  return out
}

export type LigneArbre = ReturnType<typeof lignesArbre>[number]

/* cote = 'appelant' : la ligne montre le parent de n ; 'appele' : elle montre n.
   Côté appelant, la fonction appelée est celle de la fiche : seule la marque propre à l'appel, « En différé », se répète. */
function appelVue(m: Magasin, a: ArbreIndexe, n: Noeud, cote: 'appelant' | 'appele') {
  const e = m.etat
  const montre = (cote === 'appelant' ? n.parent : n) as Noeud
  const nom = nomDansArbre(e.donnees, a, montre.fonction, montre.mode === 'racine')
  const marques: Marque[] = cote === 'appelant' ? (n.post ? [marque(LIB.post)] : []) : marquesNoeud(e, a, n)
  return {
    prefixe: nom.prefixe,
    nom: nom.nom,
    id: montre.fonction,
    ligne: n.ligne != null ? 'ligne' + NBSP + n.ligne : '',
    marques,
    aller: () => m.selectionnerNoeud(montre),
  }
}

function ficheFonction(m: Magasin, a: ArbreIndexe, n: Noeud) {
  const e = m.etat
  const ix = e.index
  const fn = e.donnees.fonctions[n.fonction]
  const dev = n.mode === 'racine' ? n : a.dev[n.fonction] || null
  const t = n.mode === 'reference' && dev ? tailleNoeud(e, a, dev) : tailleNoeud(e, a, n)
  const morceaux: string[] = []
  if (t) {
    if (t.fonctions != null) morceaux.push(compte(t.fonctions, 'fonction', 'fonctions'))
    if (t.lignes != null) morceaux.push(compte(t.lignes, 'ligne', 'lignes'))
    if (t.profondeur != null) morceaux.push(compte(t.profondeur, 'niveau', 'niveaux'))
    if (t.datawindows) morceaux.push(compte(t.datawindows, 'DataWindow', 'DataWindows'))
    if (t.nonResolus) morceaux.push(compte(t.nonResolus, 'appel non résolu', 'appels non résolus'))
    if (t.arrets) morceaux.push(compte(t.arrets, 'arrêt', 'arrêts'))
    if (t.posts) morceaux.push(compte(t.posts, 'appel en différé', 'appels en différé'))
  }
  const idSig = ix.parSignature[n.fonction]
  const fSig = idSig ? ix.parId[idSig] : undefined
  const ar = n.mode === 'arret' && fn ? a.arrets[fn.objet] : null
  const differes: Array<{ fonction: string; ligne: string; lieu: string; aller: () => void }> = []
  Object.keys(ix.arbres).forEach((sig) => {
    const b = ix.arbres[sig]
    ;(b.parFonction[n.fonction] || []).forEach((x) => {
      if (!x.post || !x.parent) return
      const idArbre = ix.parSignature[sig]
      const ici = b === a
      const parent = x.parent
      differes.push({
        fonction: parent.fonction,
        ligne: 'ligne' + NBSP + x.ligne,
        lieu: ici ? '' : "dans l'arbre de " + (idArbre || sig),
        aller: () => {
          if (ici) m.selectionnerNoeud(parent)
          else if (idArbre) m.ouvrirFonctionnalite(idArbre, { fonction: parent.fonction })
        },
      })
    })
  })
  const appeleeParTous = (a.parFonction[n.fonction] || []).filter((x) => x.parent).map((x) => appelVue(m, a, x, 'appelant'))
  const appelleTous = dev ? dev.enfants.map((x) => appelVue(m, a, x, 'appele')) : []
  let appelleVide = ''
  if (!appelleTous.length) {
    if (n.mode === 'arret') appelleVide = "Non développée ici : l'arbre s'arrête à cet objet."
    else if (n.mode === 'autreArbre') appelleVide = "Développée dans l'arbre de " + (idSig || 'sa fonctionnalité') + '.'
    else appelleVide = 'Aucun appel résolu.'
  }
  const ailleurs = (ix.presence[n.fonction] || [])
    .filter((sig) => sig !== a.signature && ix.parSignature[sig])
    .map((sig) => {
      const id = ix.parSignature[sig]
      const f = ix.parId[id]
      return { id, titre: f ? f.titre : '', ouvrir: () => m.ouvrirFonctionnalite(id, { fonction: n.fonction }) }
    })
  const coupeAppeleePar = couper(m, 'par:' + a.signature + ':' + n.fonction, appeleeParTous, 8)
  const coupeAppelle = couper(m, 'vers:' + a.signature + ':' + n.fonction, appelleTous, 8)
  const classe = ar ? def(LIB.classeArret, ar.classe) : null
  return {
    id: n.fonction,
    nature: (fn && LIB.nature[fn.nature]) || 'Nature inconnue',
    marques: marquesNoeud(e, a, n),
    fichier: (fn && fn.fichier) || '—',
    emplacement: fn && fn.debut != null ? 'Ligne' + NBSP + fn.debut + (fn.lignes != null ? ', ' + compte(fn.lignes, 'ligne', 'lignes') : '') : '—',
    datawindows: (fn && fn.datawindows) || [],
    nonResolus: nb((fn && fn.nonResolus) || 0),
    tailles: morceaux,
    tailleVide: n.mode === 'arret' ? "Hors de la taille : l'arbre s'arrête ici." : '—',
    aSignature: !!fSig,
    signatureTexte: fSig ? 'Signature mère de ' + idSig + ' ' + fSig.titre : '',
    signatureAilleurs: !!fSig && n.mode !== 'racine',
    ouvrirSignature: () => {
      if (idSig) m.ouvrirFonctionnalite(idSig)
    },
    signatureBouton: idSig ? "Ouvrir l'arbre de " + idSig : '',
    arret: ar
      ? {
          objet: ar.objet,
          classe: marque(classe),
          etat: marque(def(LIB.etat, ar.etat)),
          confiance: 'Confiance ' + libelleConfiance(ar.confiance),
          raison: ar.raison || '',
          visees: (ar.fonctionnalites || []).map((id) => {
            const f = ix.parId[id]
            return {
              id,
              titre: f ? f.titre : 'hors des données',
              ouvrir: () => {
                if (f) m.ouvrirFonctionnalite(id, { fonction: n.fonction })
              },
            }
          }),
        }
      : null,
    differes,
    nbAppeleePar: 'Appelée par · ' + appeleeParTous.length,
    appeleePar: coupeAppeleePar.liste,
    plusAppeleePar: coupeAppeleePar.plus,
    appeleeParVide: n.mode === 'racine' ? "Point d'entrée de l'arbre : aucune fonction de cet arbre ne l'appelle." : '—',
    nbAppelle: 'Appelle · ' + appelleTous.length,
    appelle: coupeAppelle.liste,
    plusAppelle: coupeAppelle.plus,
    appelleVide,
    ailleurs,
  }
}

export type FicheFonction = ReturnType<typeof ficheFonction>

function chercher(m: Magasin, texte: string) {
  const e = m.etat
  const ix = e.index
  const q = String(texte || '').trim().toLowerCase()
  if (q.length < 2) return null
  const groupes: Array<{ id: string; titre: string; compte: string; items: Array<{ prefixe: string; nom: string; contexte: string; marques: Marque[]; choisir: () => void }> }> = []
  let total = 0
  ix.liste.forEach((f) => {
    const a = arbreDe(ix, f)
    if (!a) return
    const items = a.noeuds.filter((n) => n.fonction.toLowerCase().indexOf(q) >= 0)
    if (!items.length) return
    total += items.length
    groupes.push({
      id: f.id,
      titre: f.titre,
      compte: compte(items.length, 'appel', 'appels'),
      items: items.slice(0, 30).map((n) => {
        const nom = nomFonction(n.fonction)
        const parent = n.parent ? nomFonction(n.parent.fonction) : null
        return {
          prefixe: nom.prefixe,
          nom: nom.nom,
          contexte: n.parent && parent ? 'ligne' + NBSP + n.ligne + ' · dans ' + parent.nom : 'signature mère',
          marques: marquesNoeud(e, a, n),
          choisir: () => m.ouvrirFonctionnalite(f.id, { fonction: n.fonction, cle: n.cle }),
        }
      }),
    })
  })
  return { groupes, total }
}

export function vueReperage(m: Magasin) {
  const e = m.etat
  const ix = e.index
  const f = ix.parId[e.fonctionnaliteId || ''] || null
  const a = f ? arbreDe(ix, f) : null
  const rep = f && f.reperage
  const t = a && a.arbre.taille
  const res = e.rechercheOuverte ? chercher(m, e.recherche) : null
  const badges: Marque[] = []
  if (f && rep) {
    if (!a) badges.push(marque({ ton: 'neutral', icone: 'minus' }, 'Arbre non extrait'))
    if (rep.correspondance) badges.push(marque(def(LIB.correspondance, rep.correspondance.statut)))
    badges.push(marque(def(LIB.perimetre, rep.delimitation || 'aucune')))
  }
  const stats = mesuresArbre(t, ['fonctions', 'lignes', 'profondeur', 'datawindows', 'nonResolus', 'arrets', 'posts']).map((s) => ({
    valeur: s.valeur,
    libelle: s.libelle.charAt(0).toUpperCase() + s.libelle.slice(1),
  }))
  const noeud = a ? a.parCle[e.cleSel] || a.racine : null
  return {
    question: QUESTIONS.reperage,
    optionsArbres: optionsArbres(ix, f),
    fonctionnaliteId: e.fonctionnaliteId || '',
    surChoixArbre: (id: string) => m.ouvrirFonctionnalite(id),
    recherche: e.recherche,
    surRecherche: (texte: string) => m.maj({ recherche: texte, rechercheOuverte: true }),
    surFocusRecherche: () => {
      if (e.recherche && !e.rechercheOuverte) m.maj({ rechercheOuverte: true })
    },
    fermerRecherche: () => m.maj({ rechercheOuverte: false }),
    resultatsOuverts: !!res,
    groupes: res ? res.groupes : [],
    resumeResultats: res ? (res.total ? compte(res.total, 'appel', 'appels') + ' dans ' + compte(res.groupes.length, 'arbre', 'arbres') : 'Aucun résultat') : '',
    aucunResultat: !!res && !res.total,
    badges,
    stats,
    aArbre: !!a,
    signature: a ? a.signature : '',
    lignes: a ? lignesArbre(m, a) : [],
    toutDeplier: () => m.toutBasculer(true),
    toutReplier: () => m.toutBasculer(false),
    allerCarte: () => m.allerOnglet('carte'),
    vide: arbreVide(m, f && !a ? f : null),
    fiche: a && noeud ? ficheFonction(m, a, noeud) : null,
  }
}

export type VueReperage = ReturnType<typeof vueReperage>
