/* Le format du fichier de données et du fichier de saisies, version 1.
   Transcrit champ pour champ du « Modèle typé » de reference/application-validation.donnees.md. */

export type IdFonction = string
export type IdFonctionnalite = string
export type IdRegle = string
export type IdQuestion = string
export type IdTest = string
/** "AAAA-MM-JJ" */
export type DateIso = string

export interface FichierDeDonnees {
  versionFormat: 1
  produitLe: DateIso
  application: string
  fonctions: Record<IdFonction, Fonction>
  /** La clé est la signature. */
  arbres: Record<IdFonction, Arbre>
  /** Ordre du manuel ; une sous-fonctionnalité suit sa mère. */
  fonctionnalites: Fonctionnalite[]
  dependances: Dependances
  saisies?: Saisies
}

export interface FichierDeSaisies {
  versionFormat: 1
  saisies: Saisies
}

/* ── Repérage : fonctions et arbres ── */

export type NatureFonction = 'fonctionGlobale' | 'fonctionObjet' | 'evenement'

export interface Fonction {
  objet: string
  nature: NatureFonction
  fichier: string
  debut?: number
  lignes?: number
  datawindows?: string[]
  nonResolus?: number
}

export interface Arbre {
  taille: Taille
  arrets?: Arret[]
  appels: Appel[]
}

export type ModeAppel = 'developpement' | 'reference' | 'autreArbre' | 'arret'

export interface Appel {
  fonction: IdFonction
  ligne: number
  mode: ModeAppel
  post?: true
  taille?: Taille
  appels?: Appel[]
}

export interface Taille {
  fonctions: number
  lignes: number
  profondeur: number
  datawindows: number
  nonResolus: number
  arrets: number
  posts: number
}

export type ClasseArret = 'technique' | 'autreFonctionnalite'
export type EtatJugement = 'candidate' | 'retenue'
export type Confiance = 'haute' | number

export interface Arret {
  objet: string
  classe: ClasseArret
  raison: string
  etat: EtatJugement
  confiance: Confiance
  fonctionnalites?: IdFonctionnalite[]
}

/* ── Fonctionnalités ── */

export type Extraction = 'notExtracted' | 'extractedSansDependances' | 'extracted'

export interface Fonctionnalite {
  id: IdFonctionnalite
  mere?: IdFonctionnalite
  titre: string
  page: number
  infix?: string
  reperage: Reperage
  extraction: Extraction
  decoupage?: Decoupage
  regles?: Regle[]
  questions?: Question[]
  tests?: Tests
}

export type StatutCorrespondance = 'cli' | 'repli' | 'sans-correspondance'
export type Delimitation = 'aucune' | 'candidate' | 'retenue'

export interface Reperage {
  signature?: IdFonction
  correspondance?: { statut: StatutCorrespondance; confiance: 'haute' | 'moyenne' | 'basse' }
  delimitation: Delimitation
  ordre?: Ordre
}

export type StatutOrdre = 'ordonnee' | 'partielle' | 'signalee'

export interface Ordre {
  rang?: number
  bloc?: IdFonctionnalite[]
  statut: StatutOrdre
  extractible: boolean
  manquantes?: IdFonctionnalite[]
  causes?: IdFonctionnalite[]
  horsManuel?: string[]
}

export interface Decoupage {
  gardees: number
  coupees: number
  couvertes: number
  techniques: number
  sansTest: number
}

/* ── Règles métier, questions, tests ── */

export interface Regle {
  id: IdRegle
  enonce: string
  code?: EmplacementCode[]
  exemples: Exemple[]
}

export interface EmplacementCode {
  regle: string
  fonction: IdFonction
  debut: number
  fin: number
}

export type Verdict = 'conforme' | 'ecartExplique' | 'echec' | 'nonVerifie'

export interface Exemple {
  titre: string
  francais: string
  gherkin: string
  tests?: IdTest[]
  verdict: Verdict
  explication?: string
}

export interface Question {
  id: IdQuestion
  texte: string
  regles?: IdRegle[]
}

export type VerdictTest = 'ok' | 'echec' | 'identique' | 'ecartExplique' | 'nonComparable' | 'ecart' | 'erreur' | 'delai'

export interface Tests {
  verdict: Verdict
  unitaires: Compte
  integration: Compte
  liste: Test[]
}

export type Compte = { total: number } & Partial<Record<VerdictTest, number>>

export interface Test {
  id: IdTest
  nature: 'unitaire' | 'integration'
  libelle: string
  verdict: VerdictTest
  explication?: string
}

/* ── Dépendances ── */

export interface Dependances {
  socle: Utilitaire[]
  aretes: Arete[]
}

export interface Utilitaire {
  objet: string
  origine: 'fanIn' | 'jugement'
  fonctionnalites: IdFonctionnalite[]
}

export interface Arete {
  source: IdFonctionnalite
  cible: IdFonctionnalite
  objet: string
  origine: 'jugement' | 'signatureMere'
  etat: EtatJugement
  confiance: Confiance
}

/* ── Saisies ── */

export interface Saisies {
  regles?: Record<IdRegle, Avis>
  questions?: Record<IdQuestion, Reponse>
}

export type ValeurAvis = 'validee' | 'aRevoir'

export interface Avis {
  avis: ValeurAvis
  commentaire?: string
  auteur: string
  date: DateIso
}

export interface Reponse {
  reponse: string
  auteur: string
  date: DateIso
}

/** Un fichier sans contenu : l'état de l'application quand aucune donnée n'est chargée. */
export function fichierVide(): FichierDeDonnees {
  return { versionFormat: 1, produitLe: '', application: '', fonctions: {}, arbres: {}, fonctionnalites: [], dependances: { socle: [], aretes: [] } }
}
