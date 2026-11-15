# Application de validation : format des données

**Dernière mise à jour :** 2026-11-13
**Feature :** application-validation
**Epic :** outillage
**Infix :** APPVALID
**Status :** DRAFT, format à valider avant le design et le code

L'application de validation est une page HTML sans serveur. Elle lit un fichier de données en JSON et rend les saisies du PO en JSON. Ce document fixe le format de ces deux fichiers, écrit en YAML pour la relecture, et le montre sur un exemple restreint.

Elle a trois onglets :

- Repérage : l'arbre d'appels d'une fonctionnalité, la taille d'une partie du code, ses arrêts et ses appels en différé. Lecture seule, pour l'équipe de transposition.
- Règles : par fonctionnalité, les règles métier en français, leurs exemples en français ou en Gherkin, les tests et l'extraction. Le PO y donne son avis et répond aux questions.
- Dépendances : le graphe des fonctionnalités et l'ordre d'extraction. Lecture seule.

## Circuit des données

```
  Data goes one way. The only way back is the export of entries.

  chain outputs ──→ data file, YAML ──→ data file, JSON ──→ application
  TSV, JSON         read by the team    same content        three tabs
                                                                 │
  entries file, JSON ←───── export of the saisies block ←────────┘
         │
         └──→ merged at the next load, by rule id and question id
```

- Le YAML est la forme relue par l'équipe. Le JSON a les mêmes clés et les mêmes valeurs : la conversion est mécanique.
- L'application lit le JSON livré avec la page. « Importer » le remplace par un fichier de données collé, ou y fusionne un fichier de saisies.
- L'application n'écrit que le bloc `saisies`. « Exporter » rend ce bloc seul, à copier.
- L'application ne calcule ni taille, ni ordre d'extraction, ni dépendance manquante : le fichier les porte.

## Les cinq blocs

```
  Arrow = refers to, by id.

                  saisies
                     │ rule id, question id
                     ↓
              fonctionnalites ←─── source, cible ─── dependances
              │             │
    signature │             │ function id,
              ↓             │ code of a rule
           arbres           │
              │             │
  function id └→ fonctions ←┘
```

- `fonctions` : le registre des fonctions PowerBuilder rencontrées. Écrit par le repérage, lu par l'onglet Repérage.
- `arbres` : un arbre d'appels par signature. Écrit par le repérage, lu par l'onglet Repérage.
- `fonctionnalites` : les lignes du manuel et les sous-fonctionnalités, chacune avec son repérage, son extraction, ses règles métier, ses questions et ses tests. Lu par les onglets Règles et Dépendances.
- `dependances` : le socle et les dépendances entre fonctionnalités du manuel. Écrit par le repérage, lu par l'onglet Dépendances.
- `saisies` : les avis du PO et ses réponses. Écrit par l'application seule.

## Modèle typé

Notation : `cle?` est facultative ; `[T]` est une liste ; `{id: T}` une table par identifiant ; `a | b` des valeurs fermées. Les valeurs fermées reprennent celles des sorties de la chaîne.

```yaml
FichierDeDonnees:
  versionFormat: 1
  produitLe: date                        # "AAAA-MM-JJ", entre guillemets
  application: string                    # nom de l'application transposée
  fonctions: {idFonction: Fonction}
  arbres: {idFonction: Arbre}            # la clé est la signature
  fonctionnalites: [Fonctionnalite]      # ordre du manuel ; une sous-fonctionnalité suit sa mère
  dependances: Dependances
  saisies?: Saisies

FichierDeSaisies:                        # l'export de l'application
  versionFormat: 1
  saisies: Saisies

# ── Repérage : fonctions et arbres ──

Fonction:
  objet: string                          # objet PowerBuilder de premier niveau
  nature: fonctionGlobale | fonctionObjet | evenement
  fichier: string
  debut?: integer                        # première ligne dans le fichier
  lignes?: integer                       # debut et lignes manquent pour une fonction jamais développée
  datawindows?: [string]                 # DataWindows nommées par la fonction
  nonResolus?: integer                   # appels non résolus, 0 si absent

Arbre:
  taille: Taille                         # taille de la signature
  arrets?: [Arret]
  appels: [Appel]                        # appels de la signature

Appel:
  fonction: idFonction
  ligne: integer                         # ligne de l'appel dans le fichier de l'appelant
  mode: developpement | reference | autreArbre | arret
  post?: true                            # appel lancé en différé
  taille?: Taille                        # mode developpement, quand la fonction a des appels
  appels?: [Appel]                       # mode developpement

Taille:
  fonctions: integer
  lignes: integer
  profondeur: integer
  datawindows: integer
  nonResolus: integer
  arrets: integer
  posts: integer

Arret:
  objet: string
  classe: technique | autreFonctionnalite
  raison: string                         # en termes métier
  etat: candidate | retenue
  confiance: haute | integer             # entier de 0 à 100 pour un arrêt jugé
  fonctionnalites?: [idFonctionnalite]   # lignes du manuel visées, classe autreFonctionnalite

# ── Fonctionnalités ──

Fonctionnalite:
  id: idFonctionnalite
  mere?: idFonctionnalite                # présent pour une sous-fonctionnalité
  titre: string                          # casse de phrase, sigles en capitales
  page: integer                          # page du manuel, celle de la mère pour une sous-fonctionnalité
  infix?: string                         # obligatoire avec des règles ou des questions
  reperage: Reperage
  extraction: notExtracted | extractedSansDependances | extracted
  decoupage?: Decoupage
  regles?: [Regle]
  questions?: [Question]
  tests?: Tests

Reperage:
  signature?: idFonction                 # signature mère ; absente sans correspondance
  correspondance?: {statut: cli | repli | sans-correspondance, confiance: haute | moyenne | basse}
  delimitation: aucune | candidate | retenue
  ordre?: Ordre                          # correspondance et ordre : lignes du manuel seulement

Ordre:
  rang?: integer
  bloc?: [idFonctionnalite]
  statut: ordonnee | partielle | signalee
  extractible: boolean
  manquantes?: [idFonctionnalite]
  causes?: [idFonctionnalite]
  horsManuel?: [string]

Decoupage:                               # découpage du code en règles de code
  gardees: integer                       # couvertes + techniques + sansTest
  coupees: integer
  couvertes: integer                     # citées par une règle métier
  techniques: integer                    # sans énoncé métier
  sansTest: integer                      # exercées par aucun test

# ── Règles métier, questions, tests ──

Regle:
  id: idRegle
  enonce: string                         # en français, sans donnée de test
  code?: [EmplacementCode]
  exemples: [Exemple]                    # un au moins

EmplacementCode:
  regle: string                          # règle de code, G-<INFIX>-n
  fonction: idFonction
  debut: integer                         # lignes du fichier
  fin: integer

Exemple:
  titre: string
  francais: string                       # l'exemple en une ou deux phrases
  gherkin: string                        # le scénario, mots-clés français, données de test
  tests?: [idTest]                       # tests de la fonctionnalité qui le prouvent
  verdict: conforme | ecartExplique | echec | nonVerifie
  explication?: string                   # attendue hors conforme

Question:
  id: idQuestion
  texte: string
  regles?: [idRegle]

Tests:
  verdict: conforme | ecartExplique | echec | nonVerifie
  unitaires: Compte
  integration: Compte
  liste: [Test]

Compte:
  total: integer
  <verdict>?: integer                    # un nombre par verdict présent dans la liste

Test:
  id: idTest
  nature: unitaire | integration
  libelle: string
  verdict: ok | echec | identique | ecartExplique | nonComparable | ecart | erreur | delai
  explication?: string

# ── Dépendances ──

Dependances:
  socle: [Utilitaire]
  aretes: [Arete]

Utilitaire:
  objet: string
  origine: fanIn | jugement
  fonctionnalites: [idFonctionnalite]    # lignes du manuel qui l'atteignent

Arete:
  source: idFonctionnalite
  cible: idFonctionnalite
  objet: string                          # objet d'arrêt qui porte la dépendance
  origine: jugement | signatureMere
  etat: candidate | retenue
  confiance: haute | integer

# ── Saisies ──

Saisies:
  regles?: {idRegle: Avis}
  questions?: {idQuestion: Reponse}

Avis:
  avis: validee | aRevoir
  commentaire?: string
  auteur: string
  date: date

Reponse:
  reponse: string
  auteur: string
  date: date
```

## Règles de lecture

### Identifiants

- Fonction : l'identifiant de nœud de l'orchestrateur, `objet.fonction` ou `objet.sousObjet.evenement`. Une fonction globale répète son nom : `f_date_vide.f_date_vide`.
- Fonctionnalité : la ligne du manuel, `F07.1`. Sous-fonctionnalité : la ligne de sa mère suivie d'une lettre, `F07.1.a`.
- Règle métier : `RM-<INFIX>-n`. Règle de code : `G-<INFIX>-n` gardée, `C-<INFIX>-n` coupée. Question : `Q-<INFIX>-n`. Un `infix` appartient à une seule fonctionnalité : ces identifiants sont uniques dans le fichier.
- Une règle métier et une question gardent leur identifiant d'une production du fichier à la suivante, et un identifiant retiré ne resert pas : les saisies s'y rattachent.
- Test : `U-nn` pour un test unitaire, `dossier-<année>-<numéro>` pour le dossier témoin d'un test d'intégration. Unique dans sa fonctionnalité.
- `fonctions` contient chaque signature d'arbre et chaque fonction nommée par un appel. La signature d'une fonctionnalité sans arbre n'y est pas.

### Appels

Un arbre donne les appels de sa signature ; chaque appel porte un mode.

- `developpement` : la fonction est développée à cet endroit, `appels` donne les siens. Une fonction n'est développée qu'une fois par arbre.
- `reference` : la fonction est développée ailleurs dans le même arbre.
- `autreArbre` : la fonction est la signature d'un autre arbre du fichier. Elle n'est pas redéveloppée ; l'application mène à cet arbre. Une sous-fonctionnalité apparaît ainsi dans l'arbre de sa mère.
- `arret` : l'objet de la fonction est un arrêt de cet arbre. La fonction, dite bloquée, n'est pas développée, même quand elle est la signature d'un autre arbre. `arrets` donne la classe de l'objet, sa raison, son état et les fonctionnalités visées.
- `post: true` s'ajoute au mode : l'appelant lance la fonction en différé par `post event`. La cible d'un `post` est une fonction du registre comme une autre, et l'application la suit selon son mode.

### Taille

`taille` mesure ce qu'il faut extraire pour faire tourner une fonction : les fonctions atteintes depuis elle, elle comprise, en suivant les appels `developpement`, `reference` et `autreArbre`, directs ou `post`, sans franchir un `arret`. Chaque fonction compte une fois.

- `fonctions` : leur nombre.
- `lignes` : la somme de leurs lignes.
- `datawindows` : le nombre de DataWindows distinctes qu'elles nomment.
- `nonResolus` : la somme de leurs appels non résolus.
- `arrets` : le nombre d'objets d'arrêt distincts qu'elles appellent.
- `posts` : le nombre d'appels `post` qu'elles passent.
- `profondeur` : le nombre de niveaux d'appels sous la fonction dans son arbre ; un appel `reference`, `autreArbre` ou `arret` compte pour un niveau.

La taille d'un arbre est celle de sa signature. La taille d'une mère comprend celle de ses sous-fonctionnalités.

### Verdicts

- Le verdict de synthèse se lit sur des tests, ceux d'un exemple ou toute la `liste` d'une fonctionnalité : `echec` dès qu'un test est `echec`, `ecart`, `erreur` ou `delai` ; sinon `ecartExplique` dès qu'un test l'est ; sinon `conforme` dès qu'un test est `ok` ou `identique` ; sinon `nonVerifie`.
- `unitaires` et `integration` comptent la `liste` par nature : `total`, puis un nombre par verdict présent.
- Un test d'intégration rejoue un dossier témoin de la base de recette. `ecartExplique` : la recette donne un autre résultat pour une raison connue, dite dans `explication`. `nonComparable` : l'attendu de la recette n'est pas fiable.

### Ordre d'extraction

Les champs d'`ordre` et de `dependances` reprennent le graphe des fonctionnalités.

- `rang` : la place dans l'ordre d'extraction. Le socle est au rang 0 ; une fonctionnalité suit celles qu'elle atteint. Absent pour une `signalee`.
- `bloc` : les fonctionnalités d'un cycle ou d'une même signature, extraites d'un seul tenant. Absent quand la fonctionnalité est seule dans son bloc.
- `statut` : `ordonnee` ; `partielle` quand sa frontière garde un objet à juger ; `signalee`, hors de l'ordre, quand elle n'est pas délimitée, porte une dépendance hors manuel ou atteint une telle fonctionnalité. `causes` nomme alors les fonctionnalités en cause, `horsManuel` les objets que le manuel ne décrit pas.
- `extractible` : vrai quand toutes les fonctionnalités atteintes hors de son bloc sont `extracted`. Une `signalee` ne l'est jamais.
- `manquantes` : les fonctionnalités atteintes, à toute profondeur, qui ne sont pas `extracted`.
- Une arête naît d'un arrêt `autreFonctionnalite` compté dans la taille de sa source ; elle en reprend l'objet, l'état et la confiance.
- Un objet du socle n'est jamais un arrêt.
- Une sous-fonctionnalité n'a ni `ordre` ni arête : elle n'entre pas dans le graphe.

### Saisies

- Le PO donne un avis par règle métier, `validee` ou `aRevoir`, avec un commentaire facultatif, et une réponse par question. Chaque saisie porte son auteur et sa date : la validation est nominative et datée, comme le propose OQ-STORYVALIDEE-1 de [story-validee](../../stories-metier/story-validee/story-validee.story.md).
- L'export est un fichier de saisies, sans les données.
- À l'import d'un fichier de saisies, une saisie importée remplace la saisie de même identifiant quand sa date est égale ou postérieure. L'import d'un fichier de données remplace les données et fusionne ses saisies de la même façon.
- Une saisie dont l'identifiant n'est plus dans les données est gardée et exportée ; l'application la montre à part.

## Exemple

Cinq fonctionnalités fictives d'un manuel de facturation clinique et deux sous-fonctionnalités : 22 fonctions, 6 arbres, 7 règles métier.

- F03.1, extraite, testée, conforme : le cas simple.
- F07.1, non extraite : le plus gros arbre, trois arrêts proposés, deux dépendances manquantes.
- F07.1.a, sous-fonctionnalité extraite : trois règles, un écart expliqué, un exemple non vérifié, deux questions pour le métier.
- F07.1.b, sous-fonctionnalité que sa mère lance en différé : déclarée, non extraite.
- F09.1, extraite sans ses dépendances : un test en échec.
- F12.1, périmètre validé, extractible, non extraite.
- F15.1, chemin non établi : sans arbre, hors de l'ordre d'extraction.

L'exemple ne montre ni bloc de plusieurs fonctionnalités, ni dépendance hors manuel.

```
  Call tree of F07.1, signature w_sejour.ue_recalcul_sejour.
  One line per call, its mode on the right.

  ue_recalcul_sejour
   ├── u_bandeau.uf_affiche ············ arret, technique
   ├── f_lit_parametre ················· developpement
   ├── uf_lire_dossier ················· developpement
   │    ├── f_date_vide ················ developpement
   │    └── f_lit_parametre ············ reference
   ├── uf_calcul_supplements ··········· autreArbre → F07.1.a
   ├── u_calcul_ghs.uf_calcule ········· arret → F09.1
   ├── uo_mutuelle.uf_prise_en_charge ·· arret → F12.1
   └── ue_repartition_payeurs ·········· autreArbre → F07.1.b, post
```

```
  Extraction order of the example. Arrow = depends on.

  rank 0          rank 1          rank 2          rank 3

  socle ←──────── F03.1
        ←──────── F12.1 ←──────── F09.1 ←──────── F07.1
                    ↑                               │
                    └───────────────────────────────┘

  out of order    F15.1, not delimited
```

Le prompt Claude Design, [application-validation.claude-design.md](application-validation.claude-design.md), recopie cet exemple : il se recopie quand l'exemple change.

```yaml
# Exemple restreint : cinq fonctionnalités fictives d'un manuel de facturation clinique et deux sous-fonctionnalités.
versionFormat: 1
produitLe: "2026-11-13"
application: "Facturation clinique"

# ── Registre des fonctions PowerBuilder ──
fonctions:
  w_sejour.ue_forfait_journalier: {objet: w_sejour, nature: evenement, fichier: admin/sejour.pbl.src/w_sejour.srw, debut: 1210, lignes: 148, datawindows: [d_lignes_sejour], nonResolus: 2}
  w_sejour.uf_exoneration: {objet: w_sejour, nature: fonctionObjet, fichier: admin/sejour.pbl.src/w_sejour.srw, debut: 1402, lignes: 64}
  w_sejour.uf_lire_dossier: {objet: w_sejour, nature: fonctionObjet, fichier: admin/sejour.pbl.src/w_sejour.srw, debut: 1620, lignes: 88, datawindows: [d_dossier], nonResolus: 3}
  w_sejour.ue_recalcul_sejour: {objet: w_sejour, nature: evenement, fichier: admin/sejour.pbl.src/w_sejour.srw, debut: 2010, lignes: 126, nonResolus: 1}
  w_sejour.uf_calcul_supplements: {objet: w_sejour, nature: fonctionObjet, fichier: admin/sejour.pbl.src/w_sejour.srw, debut: 2140, lignes: 412, datawindows: [d_lignes_sejour, d_mouvements], nonResolus: 9}
  w_sejour.uf_type_chambre: {objet: w_sejour, nature: fonctionObjet, fichier: admin/sejour.pbl.src/w_sejour.srw, debut: 2560, lignes: 36}
  w_sejour.ue_dernier_jour: {objet: w_sejour, nature: evenement, fichier: admin/sejour.pbl.src/w_sejour.srw, debut: 3050, lignes: 182, nonResolus: 1}
  w_sejour.ue_tri_lignes: {objet: w_sejour, nature: evenement, fichier: admin/sejour.pbl.src/w_sejour.srw, debut: 3240, lignes: 14}
  w_sejour.ue_repartition_payeurs: {objet: w_sejour, nature: evenement, fichier: admin/sejour.pbl.src/w_sejour.srw, debut: 3300, lignes: 96, datawindows: [d_lignes_sejour], nonResolus: 2}
  w_sejour.uf_part_mutuelle: {objet: w_sejour, nature: fonctionObjet, fichier: admin/sejour.pbl.src/w_sejour.srw, debut: 3410, lignes: 58}
  w_sejour.ue_calcule_ghs: {objet: w_sejour, nature: evenement, fichier: admin/sejour.pbl.src/w_sejour.srw, debut: 4100, lignes: 204, datawindows: [d_ghs], nonResolus: 6}
  u_calcul_ghs.uf_calcule: {objet: u_calcul_ghs, nature: fonctionObjet, fichier: commun/taa.pbl.src/u_calcul_ghs.sru, debut: 310, lignes: 138, nonResolus: 4}
  u_calcul_ghs.uf_cherche_ghs: {objet: u_calcul_ghs, nature: fonctionObjet, fichier: commun/taa.pbl.src/u_calcul_ghs.sru, debut: 460, lignes: 112, datawindows: [d_tarifs_ghs], nonResolus: 2}
  u_calcul_ghs.ue_controle_bornes: {objet: u_calcul_ghs, nature: evenement, fichier: commun/taa.pbl.src/u_calcul_ghs.sru, debut: 590, lignes: 44}
  uo_mutuelle.uf_prise_en_charge: {objet: uo_mutuelle, nature: fonctionObjet, fichier: admin/mutuelle.pbl.src/uo_mutuelle.sru, debut: 220, lignes: 164, datawindows: [d_contrats_mutuelle], nonResolus: 5}
  uo_mutuelle.uf_taux_contrat: {objet: uo_mutuelle, nature: fonctionObjet, fichier: admin/mutuelle.pbl.src/uo_mutuelle.sru, debut: 400, lignes: 73, datawindows: [d_contrats_mutuelle], nonResolus: 1}
  u_bandeau.uf_affiche: {objet: u_bandeau, nature: fonctionObjet, fichier: commun/presentation.pbl.src/u_bandeau.sru}
  f_date_vide.f_date_vide: {objet: f_date_vide, nature: fonctionGlobale, fichier: commun/outils.pbl.src/f_date_vide.srf, debut: 1, lignes: 6}
  f_lit_parametre.f_lit_parametre: {objet: f_lit_parametre, nature: fonctionGlobale, fichier: commun/outils.pbl.src/f_lit_parametre.srf, debut: 1, lignes: 31, datawindows: [d_parametres]}
  f_arrondi.f_arrondi: {objet: f_arrondi, nature: fonctionGlobale, fichier: commun/outils.pbl.src/f_arrondi.srf, debut: 1, lignes: 9}
  f_tarif_produit.f_tarif_produit: {objet: f_tarif_produit, nature: fonctionGlobale, fichier: commun/tarifs.pbl.src/f_tarif_produit.srf, debut: 1, lignes: 42, datawindows: [d_tarifs], nonResolus: 1}
  f_coefficient_mco.f_coefficient_mco: {objet: f_coefficient_mco, nature: fonctionGlobale, fichier: commun/taa.pbl.src/f_coefficient_mco.srf, debut: 1, lignes: 52, datawindows: [d_coefficients]}

# ── Un arbre d'appels par signature ──
arbres:
  w_sejour.ue_forfait_journalier:            # F03.1
    taille: {fonctions: 5, lignes: 291, profondeur: 2, datawindows: 3, nonResolus: 3, arrets: 0, posts: 0}
    appels:
      - {fonction: f_lit_parametre.f_lit_parametre, ligne: 1222, mode: developpement}
      - fonction: w_sejour.uf_exoneration
        ligne: 1248
        mode: developpement
        taille: {fonctions: 2, lignes: 70, profondeur: 1, datawindows: 0, nonResolus: 0, arrets: 0, posts: 0}
        appels:
          - {fonction: f_date_vide.f_date_vide, ligne: 1420, mode: developpement}
      - {fonction: f_tarif_produit.f_tarif_produit, ligne: 1290, mode: developpement}
      - {fonction: f_date_vide.f_date_vide, ligne: 1301, mode: reference}

  w_sejour.ue_recalcul_sejour:               # F07.1
    taille: {fonctions: 12, lignes: 1100, profondeur: 2, datawindows: 5, nonResolus: 17, arrets: 3, posts: 2}
    arrets:
      - {objet: u_bandeau, classe: technique, raison: "Bandeau de titre affiché en tête de fenêtre, sans règle de facturation.", etat: candidate, confiance: 90}
      - {objet: u_calcul_ghs, classe: autreFonctionnalite, raison: "Calcule le tarif du séjour selon son groupe homogène, décrit page 49 du manuel.", etat: candidate, confiance: 95, fonctionnalites: [F09.1]}
      - {objet: uo_mutuelle, classe: autreFonctionnalite, raison: "Détermine la part du séjour prise en charge par la mutuelle, décrite page 44 du manuel.", etat: candidate, confiance: haute, fonctionnalites: [F12.1]}
    appels:
      - {fonction: u_bandeau.uf_affiche, ligne: 2018, mode: arret}
      - {fonction: f_lit_parametre.f_lit_parametre, ligne: 2024, mode: developpement}
      - fonction: w_sejour.uf_lire_dossier
        ligne: 2031
        mode: developpement
        taille: {fonctions: 3, lignes: 125, profondeur: 1, datawindows: 2, nonResolus: 3, arrets: 0, posts: 0}
        appels:
          - {fonction: f_date_vide.f_date_vide, ligne: 1644, mode: developpement}
          - {fonction: f_lit_parametre.f_lit_parametre, ligne: 1671, mode: reference}
      - {fonction: w_sejour.uf_calcul_supplements, ligne: 2064, mode: autreArbre}                     # sous-fonctionnalité F07.1.a
      - {fonction: u_calcul_ghs.uf_calcule, ligne: 2071, mode: arret}
      - {fonction: uo_mutuelle.uf_prise_en_charge, ligne: 2080, mode: arret}
      - {fonction: w_sejour.ue_repartition_payeurs, ligne: 2131, mode: autreArbre, post: true}       # sous-fonctionnalité F07.1.b, lancée en différé

  w_sejour.uf_calcul_supplements:            # F07.1.a
    taille: {fonctions: 7, lignes: 723, profondeur: 2, datawindows: 4, nonResolus: 11, arrets: 1, posts: 1}
    arrets:
      - {objet: u_bandeau, classe: technique, raison: "Bandeau de titre affiché en tête de fenêtre, sans règle de facturation.", etat: retenue, confiance: 90}
    appels:
      - {fonction: u_bandeau.uf_affiche, ligne: 2160, mode: arret}
      - {fonction: w_sejour.uf_type_chambre, ligne: 2196, mode: developpement}
      - {fonction: f_tarif_produit.f_tarif_produit, ligne: 2302, mode: developpement}
      - fonction: w_sejour.ue_dernier_jour
        ligne: 2330
        mode: developpement
        taille: {fonctions: 3, lignes: 219, profondeur: 1, datawindows: 1, nonResolus: 1, arrets: 0, posts: 0}
        appels:
          - {fonction: f_lit_parametre.f_lit_parametre, ligne: 3071, mode: developpement}
          - {fonction: f_date_vide.f_date_vide, ligne: 3118, mode: developpement}
      - {fonction: f_date_vide.f_date_vide, ligne: 2518, mode: reference}
      - {fonction: w_sejour.ue_tri_lignes, ligne: 2549, mode: developpement, post: true}         # tri d'affichage, lancé en différé

  w_sejour.ue_repartition_payeurs:           # F07.1.b
    taille: {fonctions: 3, lignes: 163, profondeur: 1, datawindows: 1, nonResolus: 2, arrets: 0, posts: 0}
    appels:
      - {fonction: w_sejour.uf_part_mutuelle, ligne: 3322, mode: developpement}
      - {fonction: f_arrondi.f_arrondi, ligne: 3388, mode: developpement}

  w_sejour.ue_calcule_ghs:                   # F09.1
    taille: {fonctions: 7, lignes: 590, profondeur: 3, datawindows: 4, nonResolus: 12, arrets: 1, posts: 1}
    arrets:
      - {objet: uo_mutuelle, classe: autreFonctionnalite, raison: "Détermine la part du séjour prise en charge par la mutuelle, décrite page 44 du manuel.", etat: retenue, confiance: haute, fonctionnalites: [F12.1]}
    appels:
      - {fonction: f_lit_parametre.f_lit_parametre, ligne: 4112, mode: developpement}
      - fonction: u_calcul_ghs.uf_calcule
        ligne: 4150
        mode: developpement
        taille: {fonctions: 5, lignes: 355, profondeur: 2, datawindows: 2, nonResolus: 6, arrets: 0, posts: 1}
        appels:
          - {fonction: u_calcul_ghs.uf_cherche_ghs, ligne: 334, mode: developpement}
          - {fonction: f_coefficient_mco.f_coefficient_mco, ligne: 371, mode: developpement}
          - fonction: u_calcul_ghs.ue_controle_bornes
            ligne: 440
            mode: developpement
            post: true
            taille: {fonctions: 2, lignes: 53, profondeur: 1, datawindows: 0, nonResolus: 0, arrets: 0, posts: 0}
            appels:
              - {fonction: f_arrondi.f_arrondi, ligne: 612, mode: developpement}
      - {fonction: uo_mutuelle.uf_prise_en_charge, ligne: 4268, mode: arret}

  uo_mutuelle.uf_prise_en_charge:            # F12.1
    taille: {fonctions: 4, lignes: 277, profondeur: 1, datawindows: 2, nonResolus: 6, arrets: 0, posts: 0}
    appels:
      - {fonction: uo_mutuelle.uf_taux_contrat, ligne: 252, mode: developpement}
      - {fonction: f_lit_parametre.f_lit_parametre, ligne: 261, mode: developpement}
      - {fonction: f_arrondi.f_arrondi, ligne: 370, mode: developpement}

# ── Fonctionnalités du manuel et sous-fonctionnalités ──
fonctionnalites:
  - id: F03.1                                # extraite, testée, conforme
    titre: "Calcul du forfait journalier"
    page: 18
    infix: FORFAITJOUR
    reperage:
      signature: w_sejour.ue_forfait_journalier
      correspondance: {statut: cli, confiance: haute}
      delimitation: retenue
      ordre: {rang: 1, statut: ordonnee, extractible: true}
    extraction: extracted
    decoupage: {gardees: 3, coupees: 1, couvertes: 2, techniques: 1, sansTest: 0}
    regles:
      - id: RM-FORFAITJOUR-1
        enonce: "Le forfait journalier est dû pour chaque jour de présence du patient, jour de sortie compris."
        code:
          - {regle: G-FORFAITJOUR-1, fonction: w_sejour.ue_forfait_journalier, debut: 1236, fin: 1301}
        exemples:
          - titre: "Séjour de quatre jours"
            francais: "Un patient hospitalisé du 3 au 6 mars 2025 doit quatre forfaits journaliers, soit 80 € au tarif de 20 €."
            gherkin: |
              Scénario: Séjour de quatre jours
                Étant donné un séjour du 03/03/2025 au 06/03/2025
                Et un forfait journalier à 20 €
                Quand on calcule le forfait journalier
                Alors la ligne facturée est :
                  | produit | du         | au         | quantité | montant |
                  | FJ      | 03/03/2025 | 06/03/2025 | 4        | 80 €    |
            tests: [U-01, dossier-25-412]
            verdict: conforme
      - id: RM-FORFAITJOUR-2
        enonce: "Un patient exonéré ne doit aucun forfait journalier."
        code:
          - {regle: G-FORFAITJOUR-2, fonction: w_sejour.uf_exoneration, debut: 1402, fin: 1465}
        exemples:
          - titre: "Séjour en maternité"
            francais: "Une patiente hospitalisée en maternité du 3 au 6 mars 2025 ne doit aucun forfait journalier."
            gherkin: |
              Scénario: Séjour en maternité
                Étant donné un séjour en maternité du 03/03/2025 au 06/03/2025
                Quand on calcule le forfait journalier
                Alors aucun forfait journalier n'est facturé
            tests: [U-02, dossier-25-518]
            verdict: conforme
    tests:
      verdict: conforme
      unitaires: {total: 2, ok: 2}
      integration: {total: 3, identique: 3}
      liste:
        - {id: U-01, nature: unitaire, libelle: "Quatre jours de présence", verdict: ok}
        - {id: U-02, nature: unitaire, libelle: "Patiente exonérée", verdict: ok}
        - {id: dossier-25-412, nature: integration, libelle: "Médecine, quatre jours", verdict: identique}
        - {id: dossier-25-518, nature: integration, libelle: "Maternité, quatre jours", verdict: identique}
        - {id: dossier-24-1930, nature: integration, libelle: "Médecine, un jour", verdict: identique}

  - id: F07.1                                # non extraite, gros arbre, deux dépendances manquantes
    titre: "Recalcul des frais de séjour"
    page: 27
    reperage:
      signature: w_sejour.ue_recalcul_sejour
      correspondance: {statut: cli, confiance: haute}
      delimitation: candidate
      ordre: {rang: 3, statut: ordonnee, extractible: false, manquantes: [F09.1, F12.1]}
    extraction: notExtracted

  - id: F07.1.a                              # sous-fonctionnalité extraite, un écart expliqué, deux questions
    mere: F07.1
    titre: "Supplément pour chambre particulière"
    page: 27
    infix: CHAMBREPART
    reperage:
      signature: w_sejour.uf_calcul_supplements
      delimitation: retenue
    extraction: extracted
    decoupage: {gardees: 6, coupees: 2, couvertes: 4, techniques: 1, sansTest: 1}
    regles:
      - id: RM-CHAMBREPART-1
        enonce: "Chaque nuit passée en chambre particulière donne lieu à un supplément, au tarif de la chambre occupée."
        code:
          - {regle: G-CHAMBREPART-1, fonction: w_sejour.uf_calcul_supplements, debut: 2196, fin: 2291}
          - {regle: G-CHAMBREPART-2, fonction: w_sejour.uf_type_chambre, debut: 2560, fin: 2595}
        exemples:
          - titre: "Deux chambres pendant le séjour"
            francais: "Un patient passe trois nuits dans une chambre à 75 €, puis deux nuits dans une chambre à 62 € : il doit cinq suppléments, sur deux lignes, soit 349 €."
            gherkin: |
              Scénario: Deux chambres pendant le séjour
                Étant donné un séjour du 07/01/2025 au 12/01/2025, sortie à 11 h
                Et les lignes de séjour suivantes :
                  | chambre | tarif | du         | au         |
                  | P3      | 75 €  | 07/01/2025 | 09/01/2025 |
                  | P2      | 62 €  | 10/01/2025 | 12/01/2025 |
                Quand on calcule les frais de séjour
                Alors les suppléments facturés sont :
                  | produit | du         | au         | quantité | prix unitaire | montant |
                  | SH3     | 07/01/2025 | 09/01/2025 | 3        | 75 €          | 225 €   |
                  | SH2     | 10/01/2025 | 11/01/2025 | 2        | 62 €          | 124 €   |
            tests: [U-01, dossier-25-962]
            verdict: conforme
      - id: RM-CHAMBREPART-2
        enonce: "Le jour de sortie ne donne pas lieu à un supplément."
        code:
          - {regle: G-CHAMBREPART-3, fonction: w_sejour.ue_dernier_jour, debut: 3050, fin: 3231}
        exemples:
          - titre: "Sortie avant 14 h"
            francais: "Un patient sorti le 9 janvier à 11 h doit son dernier supplément pour la nuit du 8 janvier."
            gherkin: |
              Plan du scénario: Sortie avant 14 h
                Étant donné le dossier témoin "<dossier>"
                Et une sortie le <sortie> à <heure>
                Quand on calcule les frais de séjour
                Alors le dernier supplément facturé est celui du <dernier jour>

                Exemples:
                  | dossier | sortie     | heure | dernier jour |
                  | 25-743  | 09/01/2025 | 11 h  | 08/01/2025   |
                  | 25-962  | 12/01/2025 | 11 h  | 11/01/2025   |
            tests: [U-02, dossier-25-743, dossier-25-962]
            verdict: conforme
          - titre: "Sortie à 14 h ou après"
            francais: "Un patient entré le 11 septembre 2026 et sorti le 18 septembre à 18 h doit sept suppléments : le jour de sortie n'est pas compté."
            gherkin: |
              Scénario: Sortie à 14 h ou après
                Étant donné un séjour du 11/09/2026 au 18/09/2026 en chambre P3 à 75 €
                Et une sortie à 18 h
                Quand on calcule les frais de séjour
                Alors les suppléments facturés sont :
                  | produit | du         | au         | quantité | prix unitaire | montant |
                  | SH3     | 11/09/2026 | 17/09/2026 | 7        | 75 €          | 525 €   |
            tests: [dossier-26-90]
            verdict: ecartExplique
            explication: "La recette facture huit suppléments : sa version, plus récente que le code extrait, compte le jour de sortie à partir de 14 h."
      - id: RM-CHAMBREPART-3
        enonce: "Quand la mutuelle du patient fixe son propre tarif, ce tarif remplace celui de la chambre."
        code:
          - {regle: G-CHAMBREPART-4, fonction: w_sejour.uf_calcul_supplements, debut: 2302, fin: 2340}
        exemples:
          - titre: "Mutuelle au tarif de 40 €"
            francais: "Un patient en chambre à 75 € dont la mutuelle fixe le supplément à 40 € doit 40 € par nuit."
            gherkin: |
              Scénario: Mutuelle au tarif de 40 €
                Étant donné un séjour du 07/01/2025 au 09/01/2025 en chambre P3 à 75 €
                Et une mutuelle qui fixe le supplément à 40 €
                Quand on calcule les frais de séjour
                Alors les suppléments facturés sont :
                  | produit | du         | au         | quantité | prix unitaire | montant |
                  | SH3     | 07/01/2025 | 08/01/2025 | 2        | 40 €          | 80 €    |
            verdict: nonVerifie
            explication: "Aucun dossier de la recette ne porte ce cas."
    questions:
      - {id: Q-CHAMBREPART-1, texte: "Faut-il facturer le jour de sortie quand le patient sort à 14 h ou après ?", regles: [RM-CHAMBREPART-2]}
      - {id: Q-CHAMBREPART-2, texte: "Un séjour sans date de sortie doit-il produire des suppléments ?", regles: [RM-CHAMBREPART-1]}
    tests:
      verdict: ecartExplique
      unitaires: {total: 2, ok: 2}
      integration: {total: 4, identique: 2, ecartExplique: 1, nonComparable: 1}
      liste:
        - {id: U-01, nature: unitaire, libelle: "Tarif de la chambre occupée", verdict: ok}
        - {id: U-02, nature: unitaire, libelle: "Dernier jour facturé, sortie à 11 h", verdict: ok}
        - {id: dossier-25-962, nature: integration, libelle: "Deux chambres, sortie à 11 h", verdict: identique}
        - {id: dossier-25-743, nature: integration, libelle: "Une chambre, sortie à 11 h", verdict: identique}
        - {id: dossier-26-90, nature: integration, libelle: "Une chambre, sortie à 18 h", verdict: ecartExplique, explication: "La recette facture huit suppléments, le code extrait sept : la recette compte le jour de sortie à partir de 14 h."}
        - {id: dossier-26-101, nature: integration, libelle: "Séjour sans date de sortie", verdict: nonComparable, explication: "L'attendu de la recette n'est pas fiable : douze lignes sans date de fin ni quantité."}

  - id: F07.1.b                              # sous-fonctionnalité lancée en différé par sa mère, déclarée, non extraite
    mere: F07.1
    titre: "Répartition entre les payeurs"
    page: 27
    reperage:
      signature: w_sejour.ue_repartition_payeurs
      delimitation: aucune
    extraction: notExtracted

  - id: F09.1                                # extraite sans ses dépendances, un test en échec
    titre: "Calcul des GHS"
    page: 49
    infix: GHS
    reperage:
      signature: w_sejour.ue_calcule_ghs
      correspondance: {statut: cli, confiance: moyenne}
      delimitation: retenue
      ordre: {rang: 2, statut: ordonnee, extractible: false, manquantes: [F12.1]}
    extraction: extractedSansDependances
    decoupage: {gardees: 4, coupees: 0, couvertes: 3, techniques: 1, sansTest: 0}
    regles:
      - id: RM-GHS-1
        enonce: "Le tarif du GHS est multiplié par le coefficient de l'établissement en vigueur à la date de sortie."
        code:
          - {regle: G-GHS-1, fonction: u_calcul_ghs.uf_calcule, debut: 322, fin: 380}
          - {regle: G-GHS-2, fonction: f_coefficient_mco.f_coefficient_mco, debut: 1, fin: 52}
        exemples:
          - titre: "Coefficient de 1,05"
            francais: "Pour un GHS au tarif de 2 000 € et un coefficient de 1,05 à la date de sortie, le montant facturé est de 2 100 €."
            gherkin: |
              Scénario: Coefficient de 1,05
                Étant donné un GHS au tarif de 2 000 €
                Et un coefficient d'établissement de 1,05 en vigueur le 14/02/2025
                Et une sortie le 14/02/2025
                Quand on calcule le GHS
                Alors le montant du GHS est de 2 100 €
            tests: [U-01, dossier-25-311]
            verdict: conforme
      - id: RM-GHS-2
        enonce: "Au-delà de la borne haute du GHS, chaque journée supplémentaire est facturée au tarif journalier du GHS."
        code:
          - {regle: G-GHS-3, fonction: u_calcul_ghs.ue_controle_bornes, debut: 590, fin: 633}
        exemples:
          - titre: "Trois journées au-delà de la borne haute"
            francais: "Pour un séjour de 15 jours et une borne haute de 12 jours, trois journées supplémentaires sont facturées, soit 450 € au tarif journalier de 150 €."
            gherkin: |
              Scénario: Trois journées au-delà de la borne haute
                Étant donné un GHS de borne haute 12 jours et de tarif journalier 150 €
                Et un séjour de 15 jours
                Quand on calcule le GHS
                Alors 3 journées supplémentaires sont facturées, pour 450 €
            tests: [U-02]
            verdict: echec
            explication: "Le code extrait facture deux journées au lieu de trois."
    questions:
      - {id: Q-GHS-1, texte: "La borne haute se compte-t-elle en journées ou en nuitées ?", regles: [RM-GHS-2]}
    tests:
      verdict: echec
      unitaires: {total: 2, ok: 1, echec: 1}
      integration: {total: 1, identique: 1}
      liste:
        - {id: U-01, nature: unitaire, libelle: "Coefficient en vigueur à la date de sortie", verdict: ok}
        - {id: U-02, nature: unitaire, libelle: "Trois journées au-delà de la borne haute", verdict: echec, explication: "Attendu : 3 journées supplémentaires ; obtenu : 2."}
        - {id: dossier-25-311, nature: integration, libelle: "Chirurgie, coefficient de 1,05", verdict: identique}

  - id: F12.1                                # périmètre validé, prête à extraire
    titre: "Prise en charge par la mutuelle"
    page: 44
    reperage:
      signature: uo_mutuelle.uf_prise_en_charge
      correspondance: {statut: cli, confiance: haute}
      delimitation: retenue
      ordre: {rang: 1, statut: ordonnee, extractible: true}
    extraction: notExtracted

  - id: F15.1                                # chemin non établi, sans arbre, hors de l'ordre d'extraction
    titre: "Édition du bordereau de facturation"
    page: 61
    reperage:
      signature: w_bordereau.ue_editer
      correspondance: {statut: repli, confiance: basse}
      delimitation: aucune
      ordre: {statut: signalee, extractible: false, causes: [F15.1]}
    extraction: notExtracted

# ── Socle et dépendances entre fonctionnalités du manuel ──
dependances:
  socle:
    - {objet: f_date_vide, origine: fanIn, fonctionnalites: [F03.1, F07.1]}
    - {objet: f_lit_parametre, origine: fanIn, fonctionnalites: [F03.1, F07.1, F09.1, F12.1]}
    - {objet: f_arrondi, origine: fanIn, fonctionnalites: [F07.1, F09.1, F12.1]}
    - {objet: f_tarif_produit, origine: jugement, fonctionnalites: [F03.1, F07.1]}
  aretes:
    - {source: F07.1, cible: F09.1, objet: u_calcul_ghs, origine: jugement, etat: candidate, confiance: 95}
    - {source: F07.1, cible: F12.1, objet: uo_mutuelle, origine: signatureMere, etat: candidate, confiance: haute}
    - {source: F09.1, cible: F12.1, objet: uo_mutuelle, origine: signatureMere, etat: retenue, confiance: haute}

# ── Saisies du PO, seul bloc écrit par l'application ──
saisies:
  regles:
    RM-FORFAITJOUR-1: {avis: validee, auteur: "DURAND Claire", date: "2026-11-14"}
    RM-FORFAITJOUR-2: {avis: validee, auteur: "DURAND Claire", date: "2026-11-14"}
    RM-CHAMBREPART-1: {avis: validee, auteur: "DURAND Claire", date: "2026-11-14"}
    RM-CHAMBREPART-2: {avis: aRevoir, commentaire: "Depuis la version d'août 2026, le jour de sortie se facture quand le patient sort à 14 h ou après.", auteur: "DURAND Claire", date: "2026-11-14"}
  questions:
    Q-CHAMBREPART-1: {reponse: "Oui, depuis la version d'août 2026.", auteur: "DURAND Claire", date: "2026-11-14"}
```

## Passage aux vraies données

Source de chaque bloc dans les sorties de la chaîne :

- `fonctions` et `arbres` : `arbre.json`, les JSON de nœud et `cloture.json` de l'orchestrateur d'extraction.
- `arrets` : `frontiere.tsv` et la liste du délimiteur, candidate (`objets-arret.candidate.txt`) ou retenue (`objets-arret.txt`).
- `reperage` et `extraction` : `correspondances.tsv`, `sous-fonctionnalites.tsv` et `ordre.tsv`.
- `decoupage`, `regles[].code`, `questions` et `tests` : l'entrée de traçabilité de la fonctionnalité, `output/tracabilite/<id>/`.
- `dependances` : `aretes.tsv` et `socle.tsv`.

Les sorties de la chaîne au 2026-11-13 :

- 61 lignes du manuel, toutes `signalee` ; 15 dépendances candidates, toutes de F22.1 ; un socle de 38 objets.
- Un arbre, celui de F22.1 : 90 fonctions, 2 696 lignes, 9 niveaux, 13 DataWindows, 192 appels non résolus, 11 appels `post`.
- Une entrée de traçabilité, F04.1.a : 55 règles de code, 14 règles Gherkin, 35 scénarios, 14 tests unitaires, 29 dossiers témoins, 5 questions.

Ce que la chaîne ne produit pas :

- La cible d'un appel `post`. L'orchestrateur la laisse en frontière : aucune des 11 cibles de F22.1 n'est dans son arbre. Le format la demande dans `fonctions` et dans l'arbre : c'est une réouverture de l'orchestrateur, dans l'épique extraction, suivie d'un recalcul des tailles.
- La version française d'un exemple, et les identifiants `RM-` et `Q-`. L'énoncé d'une règle se lit dans la ligne `Règle:` du Gherkin.
- Le mode `autreArbre`, les tailles et les verdicts de synthèse : calculs du convertisseur qui écrira le fichier.
- Le convertisseur et l'application.

## Décisions

- 2026-11-13 — Les saisies se limitent à l'avis du PO par règle métier et à sa réponse par question ; l'onglet Repérage est en lecture seule. Pourquoi : le refus d'un arrêt reste à `-Valider -Refus`, seul à écrire la liste retenue.
- 2026-11-13 — L'export ne contient que les saisies. Pourquoi : il survit à une régénération des données et reste copiable.
- 2026-11-13 — L'onglet Repérage montre un arbre repliable et une fiche par fonction ; les données sont un graphe d'appels. Pourquoi : l'arbre de F22.1 compte 19 fonctions à plusieurs appelants et 114 appels de renvoi, illisibles en graphe libre.
- 2026-11-13 — Le PO lit les règles métier. Le découpage du code en règles gardées et coupées devient un détail de chaque règle et un compteur par fonctionnalité.
- 2026-11-13 — Les tests portent leur nombre, leur verdict et leur explication, sans lignes attendues ni obtenues ni contexte de dossier. Pourquoi : ce détail reste dans le site de traçabilité.
- 2026-11-13 — L'application a un onglet Dépendances dès la première version.
- 2026-11-13 — Un appel `post` nomme toujours sa cible, et la taille compte le code lancé en différé. Pourquoi : ce code fait partie de la fonctionnalité, et l'équipe doit pouvoir le suivre jusqu'à la sous-fonctionnalité qu'il lance.
- 2026-11-13 — L'énoncé d'une règle et la version française de chaque exemple sont obligatoires ; le Gherkin s'écrit avec les mots-clés français.
- 2026-11-13 — Une fonction qui est la signature d'un autre arbre n'est pas redéveloppée, mode `autreArbre`. Pourquoi : les sous-parties connues se voient dans l'arbre de leur mère, et le fichier ne répète pas leur code.
- 2026-11-13 — Les arbres sont imbriqués, appel sous appel, et non en liste d'arêtes comme `arbre.json`. Pourquoi : le YAML se relit comme l'arbre s'affiche.
- 2026-11-13 — Les fonctionnalités sont à plat, une sous-fonctionnalité nomme sa mère. Les identifiants `RM-<INFIX>-n` et `Q-<INFIX>-n` sont distincts des règles de code `G-` et `C-`.
- 2026-11-13 — Les valeurs fermées reprennent celles des sorties de la chaîne (`extracted`, `cli`, `ecartExplique`). Pourquoi : le convertisseur les recopie.

## Open Questions & Gaps

- OQ-APPVALID-9 : Un avis du PO reste-t-il attaché à sa règle quand l'énoncé est réécrit, ou l'application le montre-t-elle « à relire » ?
- Proposition : il reste attaché, sans signal ; une règle dont le sens change reçoit un nouvel identifiant.
- Rationale : l'option la plus légère ; le signal demanderait de garder dans chaque avis l'énoncé lu.
- Rloq : true
- Resolution: lgtm
