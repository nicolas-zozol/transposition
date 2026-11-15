# Captures de référence

Une capture par état du prototype validé, au format PNG, à l'échelle 1. Les captures de plus de 2000 px de haut sont découpées en parties, de haut en bas.

- « Paramètres » : les propriétés passées à l'écran `Main` du prototype pour obtenir l'état. L'application les lit dans son URL (voir `PROMPT.md`).
- Un paramètre absent de la ligne vaut, dans la capture : onglet `reperage`, fonctionnalité `F07.1`, mode `francais`, thème `light`, jeu `exemple`, aucun nom saisi.
- `saisiesLocales=oui` : les saisies du fichier de données comptent comme non exportées, et leur auteur devient la personne qui saisit.
- `occurrence` : la clé du nœud sélectionné dans l'arbre, sa position depuis la racine.
- Onglet Carte : `renvois=oui` affiche les renvois ; `niveaux=1` ne déplie que ce nombre de niveaux au départ, le chemin de la sélection restant ouvert ; `zoom=ajuste` fait tenir toute la carte dans sa zone. Sans eux : renvois masqués, trois niveaux, 100 %.
- Les écrans de 900 px de haut sont des fenêtres d'application : leur contenu défile à l'intérieur. Les autres montrent tout le contenu.

## Prototype

| État | Source dans `prototype/` | Paramètres | Taille | Captures |
| --- | --- | --- | --- | --- |
| Prototype cliquable | `Main.dc.html` | valeurs par défaut | 1440 × 900 | `Main.png` |

## Repérage

| État | Source dans `prototype/` | Paramètres | Taille | Captures |
| --- | --- | --- | --- | --- |
| Arbre de F07.1, une fonction développée sélectionnée | `etats/Reperage-arbre.dc.html` | `onglet=reperage`, `fonctionnalite=F07.1`, `fonction=w_sejour.uf_lire_dossier` | 1440 × 900 | `Reperage-arbre.png` |
| Fiche d'une fonction bloquée | `etats/Reperage-fonction-bloquee.dc.html` | `onglet=reperage`, `fonctionnalite=F07.1`, `fonction=u_calcul_ghs.uf_calcule` | 1440 × 1160 | `Reperage-fonction-bloquee.png` |
| Fiche d'une fonction lancée en différé, sous-fonctionnalité | `etats/Reperage-fonction-differee.dc.html` | `onglet=reperage`, `fonctionnalite=F07.1`, `fonction=w_sejour.ue_repartition_payeurs` | 1440 × 1160 | `Reperage-fonction-differee.png` |
| Recherche dans plusieurs arbres | `etats/Reperage-recherche.dc.html` | `onglet=reperage`, `fonctionnalite=F07.1`, `recherche=f_lit_parametre` | 1440 × 900 | `Reperage-recherche.png` |
| Fonctionnalité sans arbre, F15.1 | `etats/Reperage-sans-arbre.dc.html` | `onglet=reperage`, `fonctionnalite=F15.1` | 1440 × 900 | `Reperage-sans-arbre.png` |
| Thème sombre | `etats/Reperage-sombre.dc.html` | `onglet=reperage`, `theme=dark`, `fonctionnalite=F07.1`, `fonction=w_sejour.uf_calcul_supplements` | 1440 × 1160 | `Reperage-sombre.png` |
| Arbre réel : 90 fonctions sur 9 niveaux, un renvoi de niveau 9 sélectionné | `etats/Reperage-arbre-reel.dc.html` | `jeu=depart`, `onglet=reperage`, `fonctionnalite=F22.1`, `fonction=uf_time_convertdatetimeinseconds.uf_time_convertdatetimeinseconds`, `occurrence=r.9.2.3.0.0.0.0.0.0` | 1440 × 2340 | `Reperage-arbre-reel__1-sur-2.png`<br>`Reperage-arbre-reel__2-sur-2.png` |

## Carte

| État | Source dans `prototype/` | Paramètres | Taille | Captures |
| --- | --- | --- | --- | --- |
| Carte de F07.1, une fonction sélectionnée | `etats/Carte-exemple.dc.html` | `onglet=carte`, `fonctionnalite=F07.1`, `fonction=w_sejour.uf_lire_dossier` | 1440 × 900 | `Carte-exemple.png` |
| Renvois affichés, un renvoi sélectionné | `etats/Carte-renvois.dc.html` | `onglet=carte`, `fonctionnalite=F07.1`, `renvois=oui`, `fonction=f_lit_parametre.f_lit_parametre`, `occurrence=r.2.1` | 1440 × 900 | `Carte-renvois.png` |
| Fonctionnalité sans arbre, F15.1 | `etats/Carte-sans-arbre.dc.html` | `onglet=carte`, `fonctionnalite=F15.1` | 1440 × 900 | `Carte-sans-arbre.png` |
| Arbre réel : les trois premiers niveaux, 90 appels sur 116 | `etats/Carte-reel.dc.html` | `jeu=depart`, `onglet=carte`, `fonctionnalite=F22.1` | 1440 × 900 | `Carte-reel.png` |
| Thème sombre | `etats/Carte-sombre.dc.html` | `theme=dark`, `jeu=depart`, `onglet=carte`, `fonctionnalite=F22.1`, `fonction=w_facturation.uf_ligne_prestation` | 1440 × 900 | `Carte-sombre.png` |
| Arbre réel : une branche dépliée jusqu'au niveau 8 | `etats/Carte-reel-branche.dc.html` | `jeu=depart`, `onglet=carte`, `fonctionnalite=F22.1`, `fonction=u_facture.uf_ecart_arrondi`, `occurrence=r.9.2.3.3.3.0.0.0` | 1920 × 1080 | `Carte-reel-branche.png` |
| La même branche, carte ajustée à la zone | `etats/Carte-reel-ajustee.dc.html` | `jeu=depart`, `onglet=carte`, `fonctionnalite=F22.1`, `niveaux=1`, `fonction=u_facture.uf_ecart_arrondi`, `occurrence=r.9.2.3.3.3.0.0.0`, `zoom=ajuste` | 1920 × 1080 | `Carte-reel-ajustee.png` |
| Arbre réel replié au premier niveau : la taille de chaque branche | `etats/Carte-reel-niveau-1.dc.html` | `jeu=depart`, `onglet=carte`, `fonctionnalite=F22.1`, `niveaux=1`, `zoom=ajuste` | 1440 × 1640 | `Carte-reel-niveau-1.png` |

## Règles

| État | Source dans `prototype/` | Paramètres | Taille | Captures |
| --- | --- | --- | --- | --- |
| Fiche de F07.1.a en français | `etats/Regles-francais.dc.html` | `onglet=regles`, `fonctionnalite=F07.1.a`, `auteur=DURAND Claire`, `saisiesLocales=oui` | 1440 × 2520 | `Regles-francais__1-sur-2.png`<br>`Regles-francais__2-sur-2.png` |
| Fiche de F07.1.a en Gherkin | `etats/Regles-gherkin.dc.html` | `onglet=regles`, `fonctionnalite=F07.1.a`, `mode=gherkin`, `deplier=tout`, `auteur=DURAND Claire`, `saisiesLocales=oui` | 1440 × 3320 | `Regles-gherkin__1-sur-3.png`<br>`Regles-gherkin__2-sur-3.png`<br>`Regles-gherkin__3-sur-3.png` |
| F09.1 : un test en échec, extraite sans ses dépendances | `etats/Regles-echec.dc.html` | `onglet=regles`, `fonctionnalite=F09.1`, `auteur=DURAND Claire`, `saisiesLocales=oui` | 1440 × 1840 | `Regles-echec.png` |
| F07.1 : fonctionnalité sans règle | `etats/Regles-sans-regle.dc.html` | `onglet=regles`, `fonctionnalite=F07.1`, `auteur=DURAND Claire`, `saisiesLocales=oui` | 1440 × 900 | `Regles-sans-regle.png` |
| Thème sombre | `etats/Regles-sombre.dc.html` | `onglet=regles`, `theme=dark`, `fonctionnalite=F07.1.a`, `mode=gherkin`, `filtre=avecRegles`, `auteur=DURAND Claire`, `saisiesLocales=oui` | 1440 × 3000 | `Regles-sombre__1-sur-2.png`<br>`Regles-sombre__2-sur-2.png` |
| Fiche réelle : 14 règles, 35 exemples, 29 tests d'intégration | `etats/Regles-fiche-reelle.dc.html` | `jeu=depart`, `onglet=regles`, `fonctionnalite=F04.1.a`, `auteur=DURAND Claire`, `saisiesLocales=oui` | 1440 × 8980 | `Regles-fiche-reelle__1-sur-6.png`<br>`Regles-fiche-reelle__2-sur-6.png`<br>`Regles-fiche-reelle__3-sur-6.png`<br>`Regles-fiche-reelle__4-sur-6.png`<br>`Regles-fiche-reelle__5-sur-6.png`<br>`Regles-fiche-reelle__6-sur-6.png` |

## Dépendances

| État | Source dans `prototype/` | Paramètres | Taille | Captures |
| --- | --- | --- | --- | --- |
| Graphe de l'exemple, F07.1 sélectionnée | `etats/Dependances-exemple.dc.html` | `onglet=dependances`, `fonctionnalite=F07.1` | 1440 × 1600 | `Dependances-exemple.png` |
| Thème sombre | `etats/Dependances-sombre.dc.html` | `onglet=dependances`, `theme=dark`, `fonctionnalite=F09.1` | 1440 × 1500 | `Dependances-sombre.png` |
| État réel de départ : 61 fonctionnalités, toutes hors de l'ordre | `etats/Dependances-depart.dc.html` | `jeu=depart`, `onglet=dependances`, `fonctionnalite=F22.1` | 1440 × 3080 | `Dependances-depart__1-sur-3.png`<br>`Dependances-depart__2-sur-3.png`<br>`Dependances-depart__3-sur-3.png` |
| État intermédiaire : 31 fonctionnalités sur six rangs | `etats/Dependances-intermediaire.dc.html` | `jeu=intermediaire`, `onglet=dependances`, `fonctionnalite=F07.1` | 1920 × 3660 | `Dependances-intermediaire__1-sur-3.png`<br>`Dependances-intermediaire__2-sur-3.png`<br>`Dependances-intermediaire__3-sur-3.png` |

## Dialogues

| État | Source dans `prototype/` | Paramètres | Taille | Captures |
| --- | --- | --- | --- | --- |
| Importer | `etats/Dialogue-importer.dc.html` | `onglet=regles`, `fonctionnalite=F07.1.a`, `dialogue=importer`, `auteur=DURAND Claire`, `saisiesLocales=oui` | 1440 × 900 | `Dialogue-importer.png` |
| Importer : JSON invalide | `etats/Dialogue-importer-erreur.dc.html` | `onglet=regles`, `fonctionnalite=F07.1.a`, `dialogue=importer`, `importTexte=(valeur dans le fichier)`, `importErreur=(valeur dans le fichier)`, `auteur=DURAND Claire`, `saisiesLocales=oui` | 1440 × 900 | `Dialogue-importer-erreur.png` |
| Importer : ce que l'application a fait | `etats/Dialogue-importer-resultat.dc.html` | `onglet=regles`, `fonctionnalite=F07.1.a`, `dialogue=importer`, `importMessage=Données du 13/11/2026 : 7 fonctionnalités, 6 arbres. 4 avis et 1 réponse fusionnés.`, `auteur=DURAND Claire` | 1440 × 900 | `Dialogue-importer-resultat.png` |
| Exporter les saisies | `etats/Dialogue-exporter.dc.html` | `onglet=regles`, `fonctionnalite=F07.1.a`, `dialogue=exporter`, `auteur=DURAND Claire`, `saisiesLocales=oui` | 1440 × 900 | `Dialogue-exporter.png` |
| Nom de la personne qui saisit | `etats/Dialogue-nom.dc.html` | `onglet=regles`, `fonctionnalite=F07.1.a`, `dialogue=nom` | 1440 × 900 | `Dialogue-nom.png` |

## Composants

| État | Source dans `prototype/` | Paramètres | Taille | Captures |
| --- | --- | --- | --- | --- |
| Variantes : ligne d'arbre et marques | `planches/Planche-arbre.dc.html` | composant ou contenu seul | 1200 × 1752 | `Planche-arbre.png` |
| Variantes : bloc Gherkin | `planches/Planche-gherkin.dc.html` | composant ou contenu seul | 1200 × 1660 | `Planche-gherkin.png` |
| Variantes : nœud et flèche du graphe | `planches/Planche-graphe.dc.html` | composant ou contenu seul | 1280 × 1686 | `Planche-graphe.png` |
| Variantes : nœud, pastille et flèche de la carte | `planches/Planche-carte.dc.html` | composant ou contenu seul | 1240 × 2010 | `Planche-carte__1-sur-2.png`<br>`Planche-carte__2-sur-2.png` |
| Arbre repliable | `ArbreAppels.dc.html` | composant ou contenu seul | 820 × 480 | `ArbreAppels.png` |
| Bloc Gherkin | `BlocGherkin.dc.html` | composant ou contenu seul | 760 × 300 | `BlocGherkin.png` |
| Graphe en couches | `GrapheCouches.dc.html` | composant ou contenu seul | 1200 × 440 | `GrapheCouches.png` |
| Contenu de l'onglet Repérage | `Reperage.dc.html` | composant ou contenu seul | 1152 × 1240 | `Reperage.png` |
| Contenu de l'onglet Règles | `Regles.dc.html` | composant ou contenu seul | 1152 × 2480 | `Regles__1-sur-2.png`<br>`Regles__2-sur-2.png` |
| Contenu de l'onglet Dépendances | `Dependances.dc.html` | composant ou contenu seul | 1152 × 1560 | `Dependances.png` |
| Contenu de l'onglet Carte | `Carte.dc.html` | composant ou contenu seul | 1200 × 860 | `Carte.png` |
| Carte des appels | `CarteAppels.dc.html` | composant ou contenu seul | 1200 × 580 | `CarteAppels.png` |

