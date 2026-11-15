/* Coquille : barre latérale, bandeau, trois dialogues. */

import { compte, dateFr, nb, pl } from '@/domaine/formats'
import { marque, TITRES, type Onglet } from '@/domaine/libelles'
import { fichierSaisies, orphelines } from '@/domaine/saisies'
import type { Magasin } from '@/magasin/magasin'

export const NAV: Array<{ value: Onglet; label: string; icone: string }> = [
  { value: 'reperage', label: 'Repérage', icone: 'network' },
  { value: 'carte', label: 'Carte', icone: 'carte' },
  { value: 'regles', label: 'Règles', icone: 'list-checks' },
  { value: 'dependances', label: 'Dépendances', icone: 'link' },
]

export function vueCoquille(m: Magasin) {
  const e = m.etat
  const d = e.donnees
  const nAvis = Object.keys(e.saisies.regles).length
  const nRep = Object.keys(e.saisies.questions).length
  const nLoc = Object.keys(e.locales.regles).length + Object.keys(e.locales.questions).length
  const orph = orphelines(e.saisies, e.index)
  const apres = !!e.importMessage
  const sansDonnees = !e.index.liste.length
  return {
    nav: NAV,
    onglet: e.onglet,
    allerOnglet: (v: Onglet) => m.allerOnglet(v),
    titre: TITRES[e.onglet],
    contexte: sansDonnees
      ? null
      : { application: d.application || 'Application', date: dateFr(d.produitLe), fictif: e.jeu !== 'exemple' },
    sansDonnees,
    libelleExporter: 'Exporter les saisies' + (nLoc ? ' · ' + nLoc : ''),
    infoExporter: nLoc ? compte(nLoc, 'saisie non exportée', 'saisies non exportées') + ' : elles ne vivent que dans ce navigateur.' : 'Toutes les saisies sont exportées.',
    ouvrirImporter: () => m.ouvrirDialogue('importer'),
    ouvrirExporter: () => m.ouvrirDialogue('exporter'),
    ouvrirNom: () => m.ouvrirDialogue('nom'),
    fermerDialogue: () => m.fermerDialogue(),
    basculerTheme: () => m.basculerTheme(),
    iconeTheme: e.theme === 'dark' ? 'sun' : 'moon',
    libelleTheme: e.theme === 'dark' ? 'Thème clair' : 'Thème sombre',
    auteurConnu: !!e.auteur,
    auteur: e.auteur,
    libelleAuteur: e.auteur ? e.auteur + ' : changer de nom' : 'Indiquer votre nom',
    importer: {
      ouvert: e.dialogue === 'importer',
      texte: e.importTexte,
      surSaisie: (texte: string) => m.maj({ importTexte: texte, importErreur: '', importMessage: '', importFichier: '' }),
      lireFichier: (f: File | null | undefined) => m.lireFichier(f),
      aideDepot: e.importFichier ? 'Fichier lu : ' + e.importFichier : 'ou cliquez pour choisir un fichier de données ou de saisies',
      erreur: e.importErreur,
      aErreur: !!e.importErreur,
      message: e.importMessage,
      avant: !apres,
      apres,
      inactif: !String(e.importTexte || '').trim(),
      lancer: () => m.importer(),
      recommencer: () => m.ouvrirDialogue('importer'),
    },
    exporter: {
      ouvert: e.dialogue === 'exporter',
      nbAvis: nb(nAvis),
      libAvis: 'avis',
      nbReponses: nb(nRep),
      libReponses: pl(nRep, 'réponse', 'réponses'),
      etat: nLoc ? marque({ ton: 'warning', icone: true }, compte(nLoc, 'non exportée', 'non exportées')) : marque({ ton: 'success', icone: true }, 'Tout est exporté'),
      json: JSON.stringify(fichierSaisies(e.saisies), null, 2),
      aOrphelines: orph.length > 0,
      titreOrphelines:
        compte(orph.length, 'saisie', 'saisies') + ' sans règle ni question dans les données : ' + pl(orph.length, 'elle reste', 'elles restent') + " dans l'export.",
      orphelines: orph,
      copier: () => m.copierExport(),
      telecharger: () => m.telechargerExport(),
      libCopier: e.copie ? 'Copié' : 'Copier',
      iconeCopier: e.copie ? 'check' : 'copy',
    },
    nom: {
      ouvert: e.dialogue === 'nom',
      description: e.enAttente
        ? 'Votre nom signe vos avis et vos réponses. Il est demandé à la première saisie et reste dans ce navigateur.'
        : 'Votre nom signe vos avis et vos réponses. Il reste dans ce navigateur.',
      valeur: e.nomSaisi,
      surSaisie: (texte: string) => m.maj({ nomSaisi: texte }),
      inactif: !String(e.nomSaisi || '').trim(),
      valider: () => m.validerNom(),
      fermer: () => m.fermerDialogue(),
    },
  }
}

export type VueCoquille = ReturnType<typeof vueCoquille>
