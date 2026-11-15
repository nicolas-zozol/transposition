# Prompt Claude Design : application « Transposition »

Concevez l'interface d'une application web d'une seule page, nommée « Transposition », avec le design system BL Demo. Le résultat attendu est un prototype cliquable de trois onglets et de trois dialogues, rempli avec les données d'exemple fournies en fin de prompt.

## Contexte

Une équipe transpose en Java une application de facturation clinique écrite en PowerBuilder. Une chaîne d'outils repère le code de chaque fonctionnalité du manuel utilisateur, l'extrait, en tire des règles métier et les teste contre une base de recette. L'application montre ce travail et recueille l'avis du métier.

Elle remplace un site statique trop fouillé : une page par fonctionnalité y empile un bilan de quinze chiffres, une fiche par morceau de code, tout le Gherkin, puis chaque test avec ses lignes attendues et obtenues. La nouvelle application se lit simplement.

## Contraintes

- Une page HTML sans serveur ni base de données. Elle lit un fichier JSON livré avec elle.
- L'utilisateur ne saisit que deux choses : un avis sur une règle métier, une réponse à une question. Ses saisies restent dans le navigateur et sortent par « Exporter les saisies », en JSON à copier.
- Les données portent déjà les calculs : tailles, ordre d'extraction, dépendances manquantes. L'interface affiche, filtre et relie ; elle n'invente aucun champ.
- Écran de bureau d'abord, 1280 px et plus, utilisable sur un portable. Thèmes clair et sombre du design system.
- Interface en français.

## Utilisateurs

- L'équipe de transposition, des développeurs : onglets Repérage et Dépendances. Elle veut savoir si une partie du code est grosse, où elle s'arrête, ce qu'elle lance, et dans quel ordre extraire.
- Le PO, expert de la facturation, qui ne lit pas de code : onglet Règles. Il lit les règles métier en français, vérifie un exemple, donne son avis, répond aux questions.

## Design system

BL Demo, sans s'en écarter : AppShell avec Sidebar indigo et Topbar, cartes blanches sur fond lavande, tout ce qui se clique en pilule, Poppins pour les titres et Inter pour le texte, casse de phrase, formats français, pas d'emoji, pas de logo. Un statut est toujours un Badge ou un StatusDot, avec une icône et un mot.

Trois composants à ajouter dans l'esprit du système, avec ses tokens :

- un arbre repliable ;
- un bloc Gherkin, en police à chasse fixe, qui garde l'alignement des tableaux de données ;
- un graphe en couches.

La police à chasse fixe sert aussi aux identifiants PowerBuilder (`w_sejour.uf_calcul_supplements`) et aux noms de fichiers.

## Principes

- Un écran répond à une question, écrite en tête de chaque onglet ci-dessous. Ce qui n'y répond pas se déplie à la demande.
- Peu de chiffres à la fois : quatre à sept Stat par écran.
- Le même mot pour la même valeur partout, selon la section « Libellés ».
- Les liens croisés font la valeur de l'outil : d'une règle vers son code dans Repérage, d'un arrêt vers la fonctionnalité visée, d'une dépendance vers sa fiche.

## Navigation

- Sidebar : titre « Transposition », trois entrées, « Repérage », « Règles », « Dépendances ».
- Topbar : titre de l'écran et contexte ; à droite « Importer », « Exporter les saisies » (seul bouton principal, avec le nombre de saisies non exportées), la bascule de thème, l'Avatar de la personne qui saisit.
- La fonctionnalité choisie se garde d'un onglet à l'autre.

## Onglet Repérage

Question : « Cette partie du code est-elle grosse, où s'arrête-t-elle, que lance-t-elle ? » Lecture seule.

- Choix de l'arbre : les fonctionnalités qui ont un arbre, identifiant et titre, les sous-fonctionnalités sous leur mère. Une fonctionnalité sans arbre reste visible, marquée « Arbre non extrait ».
- Recherche d'une fonction dans tous les arbres. Les résultats sont groupés par arbre ; en choisir un ouvre l'arbre, déplie le chemin et sélectionne la fonction.
- Taille de l'arbre, sept Stat : fonctions, lignes de code, niveaux, DataWindows, appels non résolus, arrêts, appels en différé.
- L'arbre d'appels, repliable, une ligne par appel : nom de la fonction, marques, taille du sous-arbre en lignes et en fonctions, avec une barre proportionnelle aux lignes. Marques possibles : « Arrêt », « Renvoi », « Autre arbre » suivi de l'identifiant de la fonctionnalité, « En différé », « Socle ».
- Suivre un appel : un renvoi mène à l'endroit où la fonction est développée ; « Autre arbre » ouvre l'arbre de la fonctionnalité nommée ; un arrêt mène à la fonctionnalité visée. Un appel en différé se suit comme les autres.
- Fiche de la fonction sélectionnée, en panneau latéral :
  - identifiant complet, nature, fichier et lignes, DataWindows, appels non résolus ;
  - taille de son sous-arbre ;
  - « Appelée par » et « Appelle », cliquables, avec la ligne de l'appel ;
  - « Présente aussi dans », pour les autres arbres ;
  - si un arrêt la bloque : classe, raison, état proposé ou validé, confiance, fonctionnalité visée ;
  - si elle est lancée en différé : par quelle fonction, à quelle ligne.

États à dessiner :

- l'arbre de F07.1 de l'exemple, une fonction développée sélectionnée ;
- la fiche d'une fonction bloquée, `u_calcul_ghs.uf_calcule` ;
- la fiche d'une fonction lancée en différé qui est une sous-fonctionnalité, `w_sejour.ue_repartition_payeurs` ;
- une recherche dont les résultats sont dans plusieurs arbres, `f_lit_parametre` ;
- un arbre réel : 90 fonctions sur 9 niveaux ;
- une fonctionnalité sans arbre, F15.1.

## Onglet Règles

Question : « Que fait cette fonctionnalité, est-ce prouvé, le métier est-il d'accord ? » Seul onglet où l'on saisit.

Liste des fonctionnalités :

- identifiant, titre, sous-fonctionnalités sous leur mère ;
- par ligne : extraction, règles validées sur règles écrites, verdict des tests ;
- recherche, et filtres « Toutes », « Avec règles », « À valider ».

Fiche d'une fonctionnalité :

- En-tête : identifiant, titre, page du manuel, mère s'il y en a une.
- Stat : règles validées sur total, tests unitaires réussis sur total, tests d'intégration par verdict, extraction, dépendances (dépend de, requise par, manquantes), qui mènent à l'onglet Dépendances.
- Bascule « Français / Gherkin » pour tous les exemples de la fiche, Français par défaut.
- Une carte par règle métier :
  - l'énoncé en français, mis en avant, et l'identifiant de la règle en discret ;
  - le verdict de synthèse de ses exemples ;
  - l'avis du PO : choix « Validée » ou « À revoir », commentaire, auteur et date de l'avis ; une règle sans avis est « À valider » ;
  - ses exemples, repliables : titre, version française ou Gherkin selon la bascule, verdict, explication quand il y en a une, tests qui le prouvent ;
  - « Dans le code », replié : règles de code, fonction, lignes, lien vers Repérage.
- Couverture du découpage du code, en une ligne : « 6 morceaux de code gardés : 4 couverts par une règle, 1 technique, 1 sans test ; 2 coupés ».
- Questions pour le métier : texte, règles concernées, champ de réponse, auteur et date.
- Tests, repliés : identifiant, nature, libellé, verdict, explication.

États à dessiner :

- la fiche de F07.1.a en français ;
- la même en Gherkin : un scénario avec ses tableaux de données, et un plan de scénario avec ses exemples ;
- une règle « À revoir » avec son commentaire, une règle « Validée », une règle sans avis ;
- un exemple « Écart expliqué » et un exemple « Non vérifié » ;
- la fiche de F09.1 : un test en échec, une fonctionnalité extraite sans ses dépendances ;
- une fonctionnalité sans règle, F07.1 : un état vide qui dit pourquoi et renvoie à ses sous-fonctionnalités ;
- une fiche réelle : 14 règles, 35 exemples, 29 tests d'intégration.

## Onglet Dépendances

Question : « Dans quel ordre extraire, et qu'est-ce qui bloque ? » Lecture seule.

- Stat : fonctionnalités, extraites, extractibles, extraites sans leurs dépendances, hors de l'ordre.
- Une alerte par fonctionnalité extraite sans ses dépendances, avec ses manquantes.
- Graphe en couches : une colonne par rang, le socle au rang 0. Un nœud par fonctionnalité du manuel : identifiant, titre, extraction, marque « Extractible », nombre de sous-fonctionnalités. Une flèche par dépendance, pleine si elle est validée, pointillée si elle est proposée ; elle nomme l'objet PowerBuilder qui la porte.
- Sélection d'une fonctionnalité : ce dont elle dépend et ce qui la requiert ressortent. Un panneau liste « Dépend de », « Requise par », « Manquantes », « Objets hors manuel » et ses sous-fonctionnalités, et mène à Règles et à Repérage.
- Socle : les utilitaires partagés et le nombre de fonctionnalités qui atteignent chacun.
- « Hors de l'ordre » : une liste à part, chaque fonctionnalité avec sa cause.

États à dessiner :

- le graphe de l'exemple, trois rangs au-dessus du socle, F07.1 sélectionnée ;
- l'état réel de départ : 61 fonctionnalités, toutes hors de l'ordre, aucun rang. L'écran reste lisible et dit ce qui manque pour ordonner ;
- un état intermédiaire : une trentaine de fonctionnalités sur six rangs.

## Importer, exporter

- « Importer » ouvre un Dialog : coller un JSON ou déposer un fichier. L'application reconnaît un fichier de données ou un fichier de saisies et dit ce qu'elle a fait : « Données du 13/11/2026 : 7 fonctionnalités, 6 arbres », ou « 4 avis et 1 réponse fusionnés ». Un JSON invalide donne une erreur sous le champ.
- « Exporter les saisies » ouvre un Dialog : le nombre d'avis et de réponses, le JSON en lecture seule, « Copier » en bouton principal, « Télécharger » en secondaire.
- La Topbar rappelle les saisies non exportées : elles ne vivent que dans le navigateur.
- À la première saisie, un Dialog demande le nom de la personne ; il signe ses avis et ses réponses.
- Une saisie dont la règle n'est plus dans les données reste listée à part, et dans l'export.

## Libellés

Extraction :

- `extracted` : « Extraite », ton succès.
- `extractedSansDependances` : « Extraite sans ses dépendances », ton avertissement.
- `notExtracted` : « Non extraite », ton neutre.

Périmètre, champ `delimitation` :

- `retenue` : « Périmètre validé ».
- `candidate` : « Périmètre proposé ».
- `aucune` : « Périmètre non étudié ».

Verdict de synthèse, d'un exemple ou d'une fonctionnalité :

- `conforme` : « Conforme », succès.
- `ecartExplique` : « Écart expliqué », information.
- `echec` : « En échec », destructif.
- `nonVerifie` : « Non vérifié », neutre.

Verdict d'un test :

- `ok` : « Réussi ». `identique` : « Identique ».
- `ecartExplique` : « Écart expliqué ». `nonComparable` : « Non comparable ».
- `echec` : « En échec ». `ecart` : « Écart ». `erreur` : « Erreur ». `delai` : « Délai dépassé ».

Avis du PO :

- `validee` : « Validée », succès.
- `aRevoir` : « À revoir », avertissement.
- sans avis : « À valider », neutre.

Appel, champ `mode` :

- `developpement` : aucune marque.
- `reference` : « Renvoi ».
- `autreArbre` : « Autre arbre ».
- `arret` : « Arrêt ».
- `post: true`, en plus du mode : « En différé ».

Arrêt et dépendance :

- classe `technique` : « Technique » ; `autreFonctionnalite` : « Autre fonctionnalité ».
- état `candidate` : « Proposé » ; `retenue` : « Validé ».

Ordre d'extraction, champ `statut` :

- `ordonnee` : « Rang n ».
- `partielle` : « Rang n, partielle ».
- `signalee` : « Hors de l'ordre ».

Correspondance avec le manuel :

- `cli` : « Chemin établi ».
- `repli` : « Chemin non établi ».
- `sans-correspondance` : « Sans correspondance ».

Nature d'une fonction :

- `fonctionGlobale` : « Fonction globale ».
- `fonctionObjet` : « Fonction d'objet ».
- `evenement` : « Événement ».

## Volumes réels

- 61 fonctionnalités dans le manuel ; un titre fait jusqu'à 63 caractères.
- Un arbre réel : 90 fonctions, 9 niveaux, 2 696 lignes, 13 DataWindows, 192 appels non résolus, 11 appels en différé. La plus grosse fonction fait 433 lignes.
- Un identifiant de fonction fait jusqu'à 65 caractères, `uf_time_convertdatetimeinseconds.uf_time_convertdatetimeinseconds` ; un chemin de fichier jusqu'à 60.
- Une fonctionnalité réelle : 14 règles métier, 35 exemples, 14 tests unitaires, 29 tests d'intégration, 5 questions.
- Un Gherkin fait jusqu'à 24 lignes ; un tableau de données jusqu'à 12 colonnes.

## Glossaire

- Fonctionnalité : une ligne du manuel utilisateur, `F07.1`.
- Sous-fonctionnalité : un morceau d'une fonctionnalité, extrait et testé seul, `F07.1.a`. La fonctionnalité est sa mère.
- Signature mère : la fonction PowerBuilder d'où part le code d'une fonctionnalité, racine de son arbre.
- Arbre : les appels, de fonction en fonction, depuis la signature. Une fonction appelée à plusieurs endroits n'est développée qu'une fois ; ses autres appels sont des renvois.
- Arrêt : un objet PowerBuilder où l'arbre s'arrête, parce qu'il appartient à une autre fonctionnalité ou ne porte aucune règle de facturation. Une fonction de cet objet est bloquée. Un outil propose l'arrêt, le PO le valide.
- Appel en différé : PowerBuilder met l'appel en file (`post`) et l'exécute après le traitement en cours. Le code lancé ainsi fait partie de la fonctionnalité.
- Socle : les utilitaires partagés, extraits une fois pour toutes les fonctionnalités.
- Taille : les fonctions et les lignes de code atteintes depuis une fonction, arrêts exclus.
- Règle métier : un énoncé en français que le PO peut valider.
- Exemple : un cas concret d'une règle, écrit en français et en Gherkin, prouvé par des tests.
- Test unitaire : il appelle une fonction extraite. Test d'intégration : il rejoue un dossier de la base de recette et compare les lignes facturées.
- Dépendance : une fonctionnalité appelle le code d'une autre. Une dépendance manquante n'est pas extraite. Une fonctionnalité hors de l'ordre ne peut pas être placée dans l'ordre d'extraction.
- Saisie : un avis du PO sur une règle, ou sa réponse à une question.

## Données d'exemple

Le fichier de données au format de l'application, en YAML : cinq fonctionnalités fictives et deux sous-fonctionnalités. Il s'utilise tel quel dans les maquettes.

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

## Livrables

- Les trois onglets dans les états listés, en thème clair ; un état par onglet en thème sombre.
- Les trois dialogues : Importer, Exporter les saisies, nom de la personne qui saisit.
- Les trois composants ajoutés, avec leurs variantes : ligne d'arbre et ses marques, bloc Gherkin, nœud et flèche du graphe.
- Un prototype cliquable : navigation entre onglets, liens croisés, bascule Français / Gherkin, avis et commentaire.

## Hors périmètre

- Connexion, comptes, serveur, sauvegarde en ligne.
- Modification des données, hors avis et réponses.
- Écran de téléphone.
