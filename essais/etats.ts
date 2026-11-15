/* Les 31 états d'écran de transposition-kit/captures/INDEX.md, rejoués par l'adresse de l'application.
   Les deux états du dialogue « Importer » qui portent un texte collé ou un message se rejouent par des actions. */

export interface Etat {
  nom: string
  parametres: Record<string, string>
  largeur: number
  hauteur: number
  /** Ce qui se fait après le chargement, pour les états qui ne passent pas par l'adresse. */
  actions?: 'importer-erreur' | 'importer-resultat'
}

const P = (s: string): Record<string, string> => Object.fromEntries(new URLSearchParams(s))

export const ETATS: Etat[] = [
  { nom: 'Main', parametres: P('fonctionnalite=F07.1'), largeur: 1440, hauteur: 900 },
  { nom: 'Reperage-arbre', parametres: P('onglet=reperage&fonctionnalite=F07.1&fonction=w_sejour.uf_lire_dossier'), largeur: 1440, hauteur: 900 },
  { nom: 'Reperage-fonction-bloquee', parametres: P('onglet=reperage&fonctionnalite=F07.1&fonction=u_calcul_ghs.uf_calcule'), largeur: 1440, hauteur: 1160 },
  { nom: 'Reperage-fonction-differee', parametres: P('onglet=reperage&fonctionnalite=F07.1&fonction=w_sejour.ue_repartition_payeurs'), largeur: 1440, hauteur: 1160 },
  { nom: 'Reperage-recherche', parametres: P('onglet=reperage&fonctionnalite=F07.1&recherche=f_lit_parametre'), largeur: 1440, hauteur: 900 },
  { nom: 'Reperage-sans-arbre', parametres: P('onglet=reperage&fonctionnalite=F15.1'), largeur: 1440, hauteur: 900 },
  { nom: 'Reperage-sombre', parametres: P('onglet=reperage&theme=dark&fonctionnalite=F07.1&fonction=w_sejour.uf_calcul_supplements'), largeur: 1440, hauteur: 1160 },
  {
    nom: 'Reperage-arbre-reel',
    parametres: P('jeu=depart&onglet=reperage&fonctionnalite=F22.1&fonction=uf_time_convertdatetimeinseconds.uf_time_convertdatetimeinseconds&occurrence=r.9.2.3.0.0.0.0.0.0'),
    largeur: 1440,
    hauteur: 2340,
  },
  { nom: 'Carte-exemple', parametres: P('onglet=carte&fonctionnalite=F07.1&fonction=w_sejour.uf_lire_dossier'), largeur: 1440, hauteur: 900 },
  { nom: 'Carte-renvois', parametres: P('onglet=carte&fonctionnalite=F07.1&renvois=oui&fonction=f_lit_parametre.f_lit_parametre&occurrence=r.2.1'), largeur: 1440, hauteur: 900 },
  { nom: 'Carte-sans-arbre', parametres: P('onglet=carte&fonctionnalite=F15.1'), largeur: 1440, hauteur: 900 },
  { nom: 'Carte-reel', parametres: P('jeu=depart&onglet=carte&fonctionnalite=F22.1'), largeur: 1440, hauteur: 900 },
  { nom: 'Carte-sombre', parametres: P('theme=dark&jeu=depart&onglet=carte&fonctionnalite=F22.1&fonction=w_facturation.uf_ligne_prestation'), largeur: 1440, hauteur: 900 },
  { nom: 'Carte-reel-branche', parametres: P('jeu=depart&onglet=carte&fonctionnalite=F22.1&fonction=u_facture.uf_ecart_arrondi&occurrence=r.9.2.3.3.3.0.0.0'), largeur: 1920, hauteur: 1080 },
  {
    nom: 'Carte-reel-ajustee',
    parametres: P('jeu=depart&onglet=carte&fonctionnalite=F22.1&niveaux=1&fonction=u_facture.uf_ecart_arrondi&occurrence=r.9.2.3.3.3.0.0.0&zoom=ajuste'),
    largeur: 1920,
    hauteur: 1080,
  },
  { nom: 'Carte-reel-niveau-1', parametres: P('jeu=depart&onglet=carte&fonctionnalite=F22.1&niveaux=1&zoom=ajuste'), largeur: 1440, hauteur: 1640 },
  { nom: 'Regles-francais', parametres: P('onglet=regles&fonctionnalite=F07.1.a&auteur=DURAND Claire&saisiesLocales=oui'), largeur: 1440, hauteur: 2520 },
  { nom: 'Regles-gherkin', parametres: P('onglet=regles&fonctionnalite=F07.1.a&mode=gherkin&deplier=tout&auteur=DURAND Claire&saisiesLocales=oui'), largeur: 1440, hauteur: 3320 },
  { nom: 'Regles-echec', parametres: P('onglet=regles&fonctionnalite=F09.1&auteur=DURAND Claire&saisiesLocales=oui'), largeur: 1440, hauteur: 1840 },
  { nom: 'Regles-sans-regle', parametres: P('onglet=regles&fonctionnalite=F07.1&auteur=DURAND Claire&saisiesLocales=oui'), largeur: 1440, hauteur: 900 },
  { nom: 'Regles-sombre', parametres: P('onglet=regles&theme=dark&fonctionnalite=F07.1.a&mode=gherkin&filtre=avecRegles&auteur=DURAND Claire&saisiesLocales=oui'), largeur: 1440, hauteur: 3000 },
  { nom: 'Regles-fiche-reelle', parametres: P('jeu=depart&onglet=regles&fonctionnalite=F04.1.a&auteur=DURAND Claire&saisiesLocales=oui'), largeur: 1440, hauteur: 8980 },
  { nom: 'Dependances-exemple', parametres: P('onglet=dependances&fonctionnalite=F07.1'), largeur: 1440, hauteur: 1600 },
  { nom: 'Dependances-sombre', parametres: P('onglet=dependances&theme=dark&fonctionnalite=F09.1'), largeur: 1440, hauteur: 1500 },
  { nom: 'Dependances-depart', parametres: P('jeu=depart&onglet=dependances&fonctionnalite=F22.1'), largeur: 1440, hauteur: 3080 },
  { nom: 'Dependances-intermediaire', parametres: P('jeu=intermediaire&onglet=dependances&fonctionnalite=F07.1'), largeur: 1920, hauteur: 3660 },
  { nom: 'Dialogue-importer', parametres: P('onglet=regles&fonctionnalite=F07.1.a&dialogue=importer&auteur=DURAND Claire&saisiesLocales=oui'), largeur: 1440, hauteur: 900 },
  { nom: 'Dialogue-importer-erreur', parametres: P('onglet=regles&fonctionnalite=F07.1.a&dialogue=importer&auteur=DURAND Claire&saisiesLocales=oui'), largeur: 1440, hauteur: 900, actions: 'importer-erreur' },
  { nom: 'Dialogue-importer-resultat', parametres: P('onglet=regles&fonctionnalite=F07.1.a&dialogue=importer&auteur=DURAND Claire'), largeur: 1440, hauteur: 900, actions: 'importer-resultat' },
  { nom: 'Dialogue-exporter', parametres: P('onglet=regles&fonctionnalite=F07.1.a&dialogue=exporter&auteur=DURAND Claire&saisiesLocales=oui'), largeur: 1440, hauteur: 900 },
  { nom: 'Dialogue-nom', parametres: P('onglet=regles&fonctionnalite=F07.1.a&dialogue=nom'), largeur: 1440, hauteur: 900 },
]

export const adresse = (e: Etat) => '/#' + new URLSearchParams(e.parametres).toString()

/** Le texte collé de l'état « JSON invalide » : une virgule manque avant "date". */
export const JSON_INVALIDE = [
  '{',
  '  "versionFormat": 1,',
  '  "saisies": {',
  '    "regles": {',
  '      "RM-CHAMBREPART-3": { "avis": "validee", "auteur": "DURAND Claire" "date": "2026-11-14" }',
  '    }',
  '  }',
  '}',
].join('\n')
