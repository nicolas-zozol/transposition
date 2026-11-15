# Transposition : porter le prototype en React et shadcn/ui

Ce fichier est ton prompt de travail. Lis-le en entier, puis lis les sources dans l'ordre de la section « Plan de travail » avant d'écrire du code.

## Mission

Construis l'application web « Transposition » : une page unique, sans backend, en React, TypeScript, Tailwind CSS et shadcn/ui, au thème du design system BL Demo.

Le prototype de ce kit est validé. Ton travail est un portage : mêmes écrans, mêmes libellés, mêmes comportements, mêmes données. Tu ne reconçois rien. Quand tu hésites entre une idée à toi et ce que fait le prototype, fais ce que fait le prototype.

L'application sert une équipe qui transpose en Java une application de facturation clinique écrite en PowerBuilder. Elle a quatre onglets, dans cet ordre :

- Repérage : l'arbre d'appels d'une fonctionnalité, sa taille, ses arrêts, ses appels en différé. Lecture seule.
- Carte : le même arbre d'appels, dessiné en nœuds et en flèches de gauche à droite, pour une vue d'ensemble. Les trois premiers niveaux sont affichés ; un nœud replié porte la taille de sa branche et se déplie d'un clic. Lecture seule.
- Règles : les règles métier d'une fonctionnalité, leurs exemples, les tests. Le PO y donne son avis et répond aux questions. Seul onglet où l'on saisit.
- Dépendances : le graphe des fonctionnalités et l'ordre d'extraction. Lecture seule.

Le contexte complet, les utilisateurs et le glossaire sont dans `reference/application-validation.claude-design.md`. Ce document décrit trois onglets : la Carte lui est postérieure, et sa seule source est le prototype.

## Réglages

Quatre choix sont faits par défaut. Si l'un est faux pour ce dépôt, demande-le-moi avant de commencer.

- Dossier de l'application : `transposition/`, à créer à côté de ce kit. Le kit est en lecture seule : n'y modifie rien, copie ce dont tu as besoin.
- Gestionnaire de paquets : celui que le dépôt utilise déjà ; à défaut, npm. Les scripts de `package.json` tournent sous Windows (PowerShell) comme sous Linux : aucune commande propre à bash.
- Diffusion : un dossier `dist/` statique qui fonctionne servi en HTTP, à n'importe quel sous-chemin, **et** ouvert depuis le disque par double-clic (`file://`).
- Carte : dessinée avec React Flow (`@xyflow/react`), pour la seule carte. La section « Dessiner la carte avec React Flow » dit ce que la bibliothèque prend en charge et ce qui se porte du prototype. Si je te dis de ne pas ajouter cette dépendance, porte à la place la zone défilante de `prototype/CarteAppels.dc.html`.

Les conventions du dépôt (son `CLAUDE.md`, s'il existe) l'emportent sur ce prompt pour l'organisation du dépôt, les commits et la documentation.

Si le dépôt contient déjà une application shadcn/ui au thème BL Demo, ou un paquet de composants partagé, réutilise-le au lieu d'en créer un second, et dis-le-moi.

## Contenu du kit

| Dossier | Contenu | Rôle |
| --- | --- | --- |
| `reference/application-validation.donnees.md` | Le format du fichier de données et du fichier de saisies | Contrat : l'application lit ce format et rien d'autre |
| `reference/application-validation.claude-design.md` | Le prompt de design d'origine | Intention, utilisateurs, libellés, glossaire |
| `prototype/transposition.js` | Toute la logique du prototype : libellés, index, état, actions, vues, disposition de la carte, géométrie du graphe, découpe du Gherkin | À porter en TypeScript, pas à réinventer |
| `prototype/*.dc.html` | Les neuf gabarits : `Main` (coquille et dialogues), `Reperage`, `Carte`, `Regles`, `Dependances`, `ArbreAppels`, `CarteAppels`, `BlocGherkin`, `GrapheCouches` | Structure et styles exacts de chaque écran |
| `prototype/etats/` | Trente états d'écran : chacun monte `Main` avec des propriétés | La liste des états à reproduire |
| `prototype/planches/` | Les variantes des quatre composants ajoutés | Référence des variantes |
| `prototype/essais/` | Trois scripts Node qui vérifient la logique, la carte et les jeux de volumes | Le comportement attendu, à porter en tests |
| `prototype/transposition-exemple.js`, `transposition-volumes.js` | Les données du prototype et le générateur des jeux de volumes | Traçabilité seulement : **ne les porte pas**, utilise `donnees/` |
| `donnees/` | `exemple.json`, `volumes-depart.json`, `volumes-intermediaire.json` (fichiers de données), `saisies-exemple.json` (fichier de saisies) | Données de l'application et des tests |
| `captures/` | Une capture PNG par état, et `INDEX.md` qui donne les paramètres de chaque état | Le rendu attendu |
| `design-system/` | BL Demo : `README.md` (règles), `shadcn.md` (thème et réglages shadcn), `tokens.json`, polices, sources des composants | Le thème et les règles de forme |

Les gabarits `.dc.html` ne s'exécutent pas hors de leur canevas d'origine : ils se lisent. Les captures montrent leur rendu.

Les essais du prototype, eux, s'exécutent depuis la racine du kit : `node prototype/essais/essai-logique.js prototype`, `node prototype/essais/essai-carte-logique.js prototype` et `node prototype/essais/essai-volumes.js prototype`. Les trois finissent par « tout passe ».

## Ordre d'autorité

1. `reference/application-validation.donnees.md` : le format des données.
2. Le prototype, `prototype/` et `captures/` : comportement et rendu validés.
3. `design-system/shadcn.md` et `design-system/README.md` : thème, réglages des composants, ton et formes.
4. `reference/application-validation.claude-design.md` : l'intention d'origine. Le prototype s'en écarte sur quelques points, voulus, et lui ajoute l'onglet Carte ; quand ils diffèrent, le prototype l'emporte.

Si le prototype contredit le format de données, suis le format et signale-le-moi.

## Pile technique

- Vite, React, TypeScript en mode strict.
- Tailwind CSS v4 et shadcn/ui, installés selon la documentation officielle telle qu'elle est le jour où tu travailles : https://ui.shadcn.com/docs/installation/vite. Ne te fie pas à ta mémoire pour les commandes de la CLI : elles changent.
- `lucide-react` pour les icônes.
- Un magasin d'état unique : Zustand, ou `useReducer` et un contexte si tu préfères éviter la dépendance.
- `@tanstack/react-table` pour les deux tableaux, si tu suis la recette « Data Table » que recommande `design-system/shadcn.md`.
- `@xyflow/react` (React Flow) pour la carte des appels, et pour elle seule. Suis la documentation du jour, https://reactflow.dev : ne te fie pas à ta mémoire pour ses propriétés.
- Vitest pour le domaine et les vues ; Playwright pour un parcours de bout en bout et les captures.

N'ajoute aucune autre dépendance d'exécution sans me le demander. En particulier : pas de bibliothèque de disposition (dagre, elkjs, d3-hierarchy), pas de bibliothèque de routage, pas de bibliothèque de requêtes. L'arbre de Repérage et le graphe de Dépendances ne passent pas par React Flow : ils se portent tels quels, comme la disposition de la carte.

Rien ne se charge d'un CDN : polices et icônes sont dans le paquet.

## Thème et composants : BL Demo sur shadcn/ui

`design-system/shadcn.md` fait foi. Il donne trois choses, à appliquer à la lettre :

- le thème à coller dans le CSS global : blocs `:root`, `.dark` et `@theme inline` ;
- les réglages par composant shadcn : bouton en pilule, anneau de focus plein, variantes de Badge, deux formes de Tabs, entrée active de la Sidebar, lignes de tableau de 48 px ;
- la correspondance entre les composants BL Demo du prototype et ceux de shadcn.

Précisions pour ce projet :

- Thème sombre : la classe `.dark` sur `<html>`. Le prototype utilise `data-theme="dark"` ; c'est le même thème.
- Polices : copie `design-system/fonts/` dans l'application et déclare les familles « Inter » et « Poppins ». Les `@font-face` sont à la fin de `design-system/tokens-prototype.css`.
- Chasse fixe : `font-mono` de Tailwind, pile système. Elle sert aux identifiants PowerBuilder, aux chemins de fichiers, aux identifiants de règle et de test, au bloc Gherkin.
- Sans équivalent shadcn, à écrire en quelques lignes de Tailwind : `PointStatut` (StatusDot : une pastille et un mot), `Stat` (un libellé, une valeur), la barre du haut.
- Icônes : `lucide-react`, mêmes noms que dans le prototype (`network`, `list-checks`, `link`, `upload`, `download`, `moon`, `sun`…). Les quatre icônes que le prototype trace à la main sont des Lucide : `renvoi` = `CornerDownRight`, `branche` = `GitBranch`, `socle` = `Layers`, `carte` = `Workflow`.
- Un statut est toujours un Badge ou un PointStatut, avec une icône et un mot. Jamais la couleur seule.
- Ton de l'interface, selon `design-system/README.md` : français, vouvoiement, casse de phrase, « NOM Prénom », formats français, « — » pour une valeur absente, pas d'emoji, pas de logo.

Les gabarits du prototype portent des styles en ligne qui citent les variables du design system (`design-system/tokens-prototype.css`). Traduis-les en classes Tailwind, ne les recopie pas en ligne :

| Dans un gabarit | En Tailwind |
| --- | --- |
| `var(--space-4)`, `var(--space-5)`… | l'échelle d'espacement : `gap-4`, `p-5`… (base 4 px) |
| `var(--radius-sm)`, `-md`, `-lg`, `-xl`, `-full` | `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full` |
| `var(--card)`, `var(--muted-foreground)`, `var(--border)`, `var(--input)`… | les classes de couleur shadcn : `bg-card`, `text-muted-foreground`, `border-border`, `border-input`… |
| `var(--success)`, `var(--warning-soft)`, `var(--info)`… | les couleurs ajoutées par `shadcn.md` : `text-success`, `bg-warning-soft`, `text-info`… |
| `var(--shadow-xs)`, `-sm`, `-md` | `shadow-xs`, `shadow-sm`, `shadow-md` |
| `var(--focus-ring)` | l'anneau de focus de `shadcn.md` |
| `var(--font-display)`, `var(--font-sans)`, `var(--mono)` | `font-display`, `font-sans`, `font-mono` |
| `font: 600 15px/22px …` | garde les valeurs : `text-[15px]/[22px] font-semibold` |

## Lire le prototype

### La logique : `prototype/transposition.js`

Un seul fichier, 1 887 lignes, en ES5. Lis-le en entier : c'est la spécification exécutable.

| Lignes | Section | Destination |
| --- | --- | --- |
| 12–32 | Formats français : milliers, pluriels, dates | domaine |
| 57–152 | `LIB`, la table des libellés et de leurs tons ; `marque`, `point` ; noms de fonction | domaine, **mot pour mot** |
| 154–199 | Index des données : fonctionnalités, arbres aplatis en nœuds, présence, socle | domaine |
| 213–255 | Saisies : fusion, fichier d'export, orphelines | domaine |
| 257–542 | État et actions : `creerMagasin`. Les actions de la carte sont aux lignes 382–421 | le magasin |
| 558–627 | Vue de la coquille et des trois dialogues | écran |
| 629–926 | Vue Repérage : lignes de l'arbre, fiche, recherche ; le sélecteur d'arbre (`optionsArbres`, lignes 831–858), les mesures et l'état vide partagés avec la Carte | vue et écran |
| 928–1196 | Carte : gabarit, appels affichés, disposition (`disposerCarte`), vues `carte` et `carteAppels`, tracé des flèches et de la vue d'ensemble | vue, écran et `CarteAppels` |
| 1198–1438 | Vue Règles : liste, fiche, carte de règle, tests | vue et écran |
| 1440–1660 | Graphe : gabarit, géométrie, disposition, tracé des flèches | `GrapheCouches` |
| 1662–1815 | Vue Dépendances : cause, panneau, socle, tableau | vue et écran |
| 1817–1849 | Découpe d'un texte Gherkin en segments colorés | `BlocGherkin` |
| 201–211, 1851–fin | `jeu`, `attacher` : plomberie du canevas | **à ne pas porter** |

Chaque `T.vues.x(magasin)` rend un objet prêt à afficher : des valeurs déjà mises en forme et des gestionnaires. En React, garde cette séparation : des fonctions pures qui dérivent l'affichage de l'état, testées sans navigateur, et des composants qui relient les gestionnaires aux actions du magasin.

Le fichier appelle `React.createElement` à quelques endroits (icônes, rendu des cellules de tableau, tracé SVG des flèches) : en React, ce sont des composants ordinaires.

### Les gabarits : `prototype/*.dc.html`

Ils se lisent comme du HTML, avec cinq ajouts :

- `{{chemin.vers.valeur}}` : une valeur de l'objet rendu par la vue de l'écran.
- `<sc-if value="{{x}}">` : affiché si `x` est vrai. `<sc-for list="{{l}}" as="x">` : répété pour chaque élément.
- `<x-import component-from-global-scope="BLDemo.Button" …>` : un composant BL Demo. Remplace-le par le composant shadcn que donne `design-system/shadcn.md`. Les attributs en tirets sont les propriétés en camelCase : `on-click` vaut `onClick`, `icon-right` vaut `iconRight`. `dc-props="{{objet}}"` étale un objet de propriétés. Les propriétés de chaque composant BL Demo sont dans `design-system/components/index.d.ts` et son code dans `design-system/components/src/index.jsx`.
- `<dc-import name="ArbreAppels" …>` : un autre gabarit du dossier, monté comme composant.
- `style-hover="…"`, `style-focus-visible="…"` : les styles du survol et du focus clavier.

À ignorer : `<helmet>`, les attributs `hint-*`, `$preview`. À ignorer aussi, dans `Main.dc.html`, la fonction `etatDuChargement` et le contrôle qui l'appelle : ils disent pourquoi un script manque dans un cadre du canevas, ce qui n'a pas d'équivalent dans l'application. L'attribut `data-props` de la balise `<script>` liste les propriétés de l'écran et leurs valeurs par défaut.

### Les états : `prototype/etats/` et `captures/INDEX.md`

Chaque fichier de `etats/` monte `Main` avec des propriétés : c'est un état à reproduire. `captures/INDEX.md` les liste, avec leurs paramètres, leur taille et leurs captures. Les captures de plus de 2 000 px de haut sont découpées en parties.

## Architecture attendue

```
transposition/
  public/donnees.js        le fichier de données livré avec la page
  src/
    domaine/               TypeScript pur, sans React : types du format, libellés, formats, noms, index, saisies
    vues/                  fonctions pures : état et index vers objet affichable (reperage, carte, regles, dependances, graphe)
    magasin/               l'état, les actions, la persistance, l'URL
    composants/ui/         les composants shadcn, réglés selon shadcn.md
    composants/            ArbreAppels, CarteAppels, BlocGherkin, GrapheCouches, Marque, PointStatut, Stat…
    ecrans/                Coquille, Reperage, Carte, Regles, Dependances, et les trois dialogues
  essais/                  parcours Playwright et captures
```

- Types : transcris le « Modèle typé » du document de format, champ pour champ, avec les valeurs fermées en unions de chaînes.
- Vocabulaire : garde les mots français du format et du prototype dans le code du domaine (`fonctionnalite`, `regle`, `saisie`, `arbre`, `arret`). Aucune couche de traduction entre le JSON et le code.
- `domaine/` et `vues/` n'importent ni React ni le DOM.

## Écarts voulus par rapport au prototype

Le prototype vit dans un canevas de maquettes. L'application, elle, doit :

### Charger ses données

Au démarrage, dans cet ordre :

1. `window.TRANSPOSITION_DONNEES`, posé par un script `donnees.js` placé à côté de `index.html` ;
2. sinon `fetch('./donnees.json')` ;
3. sinon un état vide sobre, sur les quatre onglets, qui invite à « Importer ».

Le script `donnees.js` existe parce que `fetch` échoue en `file://`. Fournis un script Node du dépôt qui l'écrit à partir d'un fichier JSON, et génère `public/donnees.js` depuis `donnees/exemple.json`.

En développement seulement (`import.meta.env.DEV`), le paramètre `jeu=depart` ou `jeu=intermediaire` charge l'un des deux jeux de volumes, et la barre du haut ajoute « jeu de volumes fictif » comme dans le prototype. En production, un autre fichier se charge par « Importer ».

### Garder les saisies dans le navigateur

Le prototype garde tout en mémoire. L'application persiste dans `localStorage`, sous une seule clé versionnée : les saisies, la liste des saisies non exportées, le nom de la personne, le thème. Pas le fichier de données. La lecture est tolérante : un contenu illisible est ignoré, jamais une erreur à l'écran.

Au démarrage, pars des saisies du fichier de données, puis pose celles du navigateur :

- une saisie du navigateur **non exportée** l'emporte toujours : on ne perd jamais une saisie que la personne n'a pas encore sortie ;
- une saisie du navigateur déjà exportée suit la règle du format : celle du fichier la remplace quand sa date est égale ou postérieure.

### Porter l'état dans l'URL

- Le fragment porte ce qui se partage : `#onglet=regles&fonctionnalite=F07.1.a&fonction=w_sejour.ue_dernier_jour`. Lu au chargement, mis à jour à chaque navigation par `history.replaceState`, relu sur `hashchange`. Vérifie que rien ne lève d'erreur en `file://`.
- Les autres paramètres du prototype servent aux essais et aux captures. Ils sont lus une fois, au chargement : `mode`, `theme`, `filtre`, `recherche`, `occurrence`, `deplier`, `renvois`, `niveaux`, `zoom`, `dialogue`, `auteur`, `saisiesLocales`, `jeu`. Avec eux, chaque ligne de `captures/INDEX.md` se rejoue par une URL.
- Exception : les états du dialogue « Importer » qui portent un texte collé, une erreur ou un message (`importTexte`, `importErreur`, `importMessage`) se rejouent par des actions, dans un essai, et non par l'URL.

### Fonctionner depuis le disque

Le build s'ouvre par double-clic. Chrome et Edge refusent, en `file://`, un script de type module chargé par `src` : produis un `index.html` autonome, par exemple avec `vite-plugin-singlefile`, ou par tout moyen équivalent. Le chemin de base est relatif.

Je n'ai pas essayé cette recette sur ce projet : prouve-la par un essai Playwright qui ouvre `dist/index.html` en `file://`, voit l'exemple s'afficher et vérifie que Poppins et Inter sont chargées.

### Dessiner la carte avec React Flow

Dans le prototype, la carte est une zone qui défile, réduite ou agrandie par une transformation CSS, avec un glissement à la souris, un zoom par Ctrl + molette et une vue d'ensemble dessinée à la main (`prototype/CarteAppels.dc.html`). C'est une doublure : le canevas de maquettes n'a pas React Flow. Dans l'application, React Flow tient ce rôle.

React Flow prend en charge, et tu ne portes donc pas :

- le déplacement et le zoom de la vue : glisser, molette, pincement, clavier ;
- la vue d'ensemble : son composant `MiniMap`, déplaçable, avec une couleur par nature de nœud (les teintes `mini` de `CADRES_CARTE`), affichée seulement quand la carte déborde de sa zone ;
- le calcul de « Ajuster » et du recentrage sur un nœud.

Tu portes du prototype, sans le simplifier :

- la disposition : `disposerCarte`, fonction pure, qui donne sa position à chaque nœud. React Flow ne dispose rien ; ne lui ajoute ni dagre ni elkjs ;
- le choix des appels affichés : `carteOuverte`, `affichable`, `enfantsCarte`, et les actions du magasin (`basculerCarte`, `niveauCarte`, `deplierCarte`, `montrerRenvois`) ;
- le nœud, en type de nœud sur mesure : cadre selon la nature, nom, marques, détail, pastille, flèche de suivi. Ce sont de vrais boutons dans le nœud ;
- la flèche, en type d'arête sur mesure : un coude arrondi de 8 px dont le tronc part à 14 px du parent (`CARTE.tronc`), la pointe du côté de la fonction appelée, l'horloge « en différé » sur la branche qui arrive au nœud ;
- la barre de la carte, la légende et le pied : ce sont des composants de l'application, pas le panneau `Controls` de React Flow. Les boutons de zoom de la barre appellent l'instance de React Flow.

Réglages attendus :

- nœuds ni déplaçables ni reliables, arêtes ni sélectionnables ni atteignables au clavier ;
- zoom de 10 % à 150 % : le minimum par défaut de React Flow, 50 %, est trop haut pour voir un arbre entier ;
- la molette fait défiler la carte, Ctrl + molette et le pincement changent l'échelle, comme dans le prototype ;
- à l'ouverture d'un arbre : 100 %, la sélection centrée en hauteur, la signature calée à gauche. Pas de `fitView` au chargement ;
- déplier ou replier un nœud le laisse à la même place à l'écran : corrige la vue du déplacement que la disposition lui donne ;
- une sélection qui sort du champ, par exemple quand on suit un renvoi, est ramenée au centre ; une sélection déjà visible ne déplace rien ;
- la zone prend la hauteur de la carte à 100 %, plafonnée à la place qui reste dans la fenêtre, 360 px au moins ;
- thème : la carte suit le thème clair ou sombre de l'application, avec les couleurs du thème BL Demo, pas celles de React Flow ;
- l'attribution « React Flow » reste affichée. Sa documentation demande un abonnement pour la retirer : c'est à moi d'en décider.

Deux écarts sont permis : « Ajuster » peut être une action ponctuelle, sans état enfoncé ; les crans du zoom par bouton peuvent être ceux de React Flow.

L'état de la vue (position, échelle) reste dans le composant, pas dans le magasin. Les paramètres `zoom=ajuste` et `niveaux=1` ne servent qu'à rejouer les captures.

Je n'ai pas essayé React Flow sur ce projet : cette section dit le résultat attendu, pas la recette. Vérifie dans l'essai en `file://` que la carte s'affiche aussi depuis le disque.

## Comportements à conserver

La source est `prototype/transposition.js`. Cette liste nomme ce qui se perd facilement dans un portage.

### Général

1. L'application affiche, filtre et relie. Elle ne calcule ni taille, ni rang, ni dépendance manquante, ni verdict de fonctionnalité : elle les lit. Deux dérivations d'affichage seulement : le verdict d'une règle, synthèse de ceux de ses exemples selon la règle « Verdicts » du format, et les compteurs.
2. Les libellés et leurs tons viennent de `LIB`. Le même mot pour la même valeur, partout.
3. Formats : milliers séparés par une espace insécable (`2 696`), dates en `JJ/MM/AAAA`, « — » pour une valeur absente, accords au pluriel par `pl`. Un numéro de ligne de code ne prend pas de séparateur : « ligne 2140 ».
4. La fonctionnalité choisie se garde d'un onglet à l'autre. Sans choix : la première qui a un arbre, sinon la première du fichier.
4 bis. Sélecteur d'arbre, le même dans Repérage et dans la Carte (`optionsArbres`) : deux niveaux au plus. Pourquoi : dans le vrai projet, les sous-parties se comptent par milliers, et une liste qui les proposerait toutes ne servirait plus à se repérer.
   - Niveau 1 : toutes les fonctionnalités du manuel, dans l'ordre du fichier. Une fonctionnalité sans arbre y reste, suivie de « (arbre non extrait) ».
   - Niveau 2 : les sous-fonctionnalités directes de la seule fonctionnalité affichée, en retrait sous elle. Quand l'arbre affiché est une sous-fonctionnalité, ce sont celles de sa mère : elle-même et ses sœurs.
   - Les sous-fonctionnalités des autres fonctionnalités ne sont pas dans la liste. Rien n'est proposé sous le deuxième niveau. On y arrive par l'arbre de la mère, nœud « Autre arbre », ou par la recherche.
   - L'arbre affiché figure toujours dans la liste, pour dire où l'on est : s'il est plus bas que le deuxième niveau, il y est seul de son niveau, sous son ancêtre de niveau 2.
   - Une sous-fonctionnalité dont la mère manque dans le fichier reste au niveau 1.
   - Sur les données d'exemple : sept entrées quand F07.1, F07.1.a ou F07.1.b est affichée, cinq sinon. Sur les jeux de volumes, avec F22.1 : 61 entrées pour 62 et 64 fonctionnalités.
5. Chaque onglet écrit sa question en tête d'écran.

### Repérage

6. Nom d'une fonction (`nomFonction`, `nomDansArbre`) : une fonction globale répète son nom, on l'écrit une fois ; dans un arbre, le préfixe d'objet tombe quand l'objet est celui de la signature ; la racine garde le sien. Le préfixe est en gris, le nom en gras. Quand la place manque, le préfixe se coupe avant le nom.
7. Chaque appel est un nœud, identifié par sa position (`r.0.2`). Une fonction a plusieurs occurrences ; la sélection porte sur une occurrence.
8. Dépliage par défaut : tout l'arbre s'il compte 40 nœuds ou moins, sinon le premier niveau. Sélectionner une occurrence déplie son chemin. « Tout replier » laisse la racine ouverte.
9. Marques d'une ligne, dans cet ordre : « Renvoi », « Autre arbre » suivi de l'identifiant, « Arrêt », « En différé », « Socle ». Précision à droite : « signature mère », « technique », « vers F09.1 ».
10. Suivre un appel, par la flèche : un renvoi sélectionne l'endroit où la fonction est développée ; « Autre arbre » ouvre l'arbre de la fonctionnalité ; un arrêt ouvre l'arbre de la première fonctionnalité visée et y sélectionne la fonction. Pas de flèche pour un arrêt technique ou sans fonctionnalité visée.
11. Taille d'une ligne : la racine porte celle de l'arbre ; une fonction développée porte la sienne, ou une fonction et ses lignes si elle n'appelle rien ; « Autre arbre » porte celle de cet arbre ; un renvoi et un arrêt portent « — ». La barre est proportionnelle aux lignes de l'arbre, 2 % au moins.
12. Au-delà de 6 niveaux, les filets de niveau se resserrent.
13. Recherche : dès 2 caractères, sur l'identifiant complet, sans casse ; toutes les occurrences, groupées par arbre, 30 au plus par arbre. Choisir un résultat ouvre l'arbre, déplie le chemin, sélectionne l'occurrence et ferme les résultats. Échap ferme.
14. Fiche de la fonction : identifiant complet, nature, marques ; bloc « Signature mère de… » ; fichier ; emplacement, sous la forme « Ligne 2140, 412 lignes » ; DataWindows ; appels non résolus ; taille du sous-arbre, celle du développement pour un renvoi ; arrêt ; « Lancée en différé » ; « Appelée par », où seule la marque « En différé » se répète ; « Appelle » ; « Présente aussi dans ». Une liste de plus de 9 éléments en montre 8, puis « Voir les n autres ».
15. Fonctionnalité sans arbre : un état vide qui dit pourquoi, en quatre textes selon la correspondance et la signature.

### Carte

La carte montre l'arbre de Repérage sous une autre forme. Elle lit les mêmes données et n'en demande aucune de plus.

C1. Même fonctionnalité et même sélection que Repérage : sélectionner d'un côté sélectionne de l'autre. « Voir la carte », dans l'en-tête de l'arbre de Repérage, et « Voir dans Repérage », dans le pied de la carte, passent de l'un à l'autre.
C2. Un nœud par appel affiché, une colonne par niveau, la signature mère à gauche. Disposition par `disposerCarte` : un parent se centre sur ses appels ; deux branches voisines se rapprochent colonne par colonne, si bien qu'une feuille se loge à côté des descendants de sa voisine ; 8 px entre deux frères, 18 px entre deux branches.
C3. Au départ : trois niveaux d'appels dépliés (`NIVEAUX_CARTE`), renvois masqués. Le dépliage de la carte est distinct de celui de l'arbre de Repérage, et se garde par arbre.
C4. Pastille d'un nœud : le nombre de fonctions de sa branche, `taille.fonctions`, lu dans le fichier et jamais calculé. Repliée : fond lavande, chevron vers la droite. Dépliée : contour fin, chevron vers la gauche. Sans chevron et fixe quand il n'y a rien à déplier, par exemple des renvois masqués seulement. Sans nombre quand la branche ne compte qu'une fonction. Pour « Autre arbre », la taille de cet arbre, fixe.
C5. Un clic sur la pastille déplie d'un niveau ; un double-clic sur le nœud fait de même. Le nœud reste à la même place à l'écran, la carte grandit vers la droite.
C6. Nœud : en première ligne le nom, selon les règles de Repérage ; en seconde les marques, puis le détail : « signature mère », « technique », « vers F09.1 », les lignes de la branche, « n renvois » quand ils sont masqués. Le cadre dit la nature : développée, renvoi en pointillé, arrêt sur fond d'avertissement, autre arbre sur fond lavande. Dans un cadre teinté, les badges passent en contour.
C7. « En différé » qualifie l'appel : sur la carte, une horloge sur la flèche, pas un badge dans le nœud. La légende la nomme, le libellé accessible du nœud aussi (« …, appelée en différé »).
C8. Renvois : l'interrupteur « Renvois · n » les affiche. Masqués, la fonction qui appelle en garde le compte. Un renvoi sélectionné reste affiché.
C9. Niveaux : « Déplier d'un niveau » ouvre chaque nœud affiché encore replié ; « Replier d'un niveau » referme les parents des nœuds les plus profonds, jusqu'au niveau 1. Le nombre entre les deux boutons est le niveau le plus profond affiché. « Tout déplier ». « Revenir à 3 niveaux » remet le départ. Les branches dépliées à la main gardent leur avance.
C10. Sélection : un clic sur le nœud. Bordure indigo doublée ; le chemin depuis la signature passe en indigo, flèches de 2 px et liseré des ancêtres. Sélectionner déplie le chemin. Un repli qui cache la sélection la fait remonter au nœud qui la cache.
C11. Suivre, par la flèche du nœud : les règles du point 10, sans quitter la carte.
C12. Résumé, au mot près : « 90 appels affichés sur 116, hors renvois », « 116 appels, tous affichés, hors renvois », « 230 appels, tous affichés ».
C13. Pied : l'identifiant complet, la nature, les marques, « En différé » compris ; puis « Appelée par uf_calcule_sejour, ligne 1298 · branche de 30 fonctions, 581 lignes, 6 niveaux », « Point d'entrée de l'arbre · … » pour la signature, « … · hors de la taille : l'arbre s'arrête ici, vers F09.1 » pour un arrêt.
C14. Légende : les seules natures présentes dans l'arbre ; « Renvoi » quand ils sont affichés ; « Appel en différé » si l'arbre en lance.
C15. En tête, cinq mesures lues dans la taille de l'arbre : fonctions, lignes de code, niveaux, arrêts, appels en différé.
C16. Fonctionnalité sans arbre : l'état vide de Repérage, avec l'icône de la carte.

### Règles

16. Liste : identifiant, titre, extraction, « n/m règles validées » ou « Aucune règle », verdict des tests ; sous-fonctionnalités en retrait sous leur mère ; recherche sur l'identifiant et le titre ; filtres « Toutes », « Avec règles », « À valider », chacun avec son compte. Une mère que le filtre écarte reste visible, estompée, quand l'une de ses sous-fonctionnalités passe.
17. Fiche : en-tête, badges, Stat, bascule « Français / Gherkin » pour tous les exemples, Français par défaut ; alerte d'une fonctionnalité extraite sans ses dépendances ; phrase du découpage ; filtre des règles par avis.
18. Carte de règle : exemples dépliés quand la règle est sans avis ou « À revoir », repliés quand elle est « Validée ». Donner un avis ne replie pas les exemples sous les yeux de la personne. « Dans le code » est replié et mène à Repérage, sur la fonction.
19. Avis : « Validée » ou « À revoir ». Recliquer l'avis déjà donné ne fait rien. Changer d'avis garde le commentaire. Le champ de commentaire se montre pour « À revoir », pour un commentaire existant, ou à la demande ; un commentaire vidé disparaît de la saisie. Toute saisie prend le nom courant et la date du jour.
20. Réponse à une question : un champ libre. Une réponse vidée supprime la saisie.
21. Première saisie sans nom : le dialogue du nom s'ouvre, et la saisie en attente s'applique dès que le nom est enregistré. Entrée valide.
22. Fonctionnalité sans règle : un état vide en trois textes selon le cas, avec ses sous-fonctionnalités en liens.

### Dépendances

23. Cinq Stat ; une alerte par fonctionnalité extraite sans ses dépendances, avec ses manquantes en liens.
24. Graphe : porte `gabarit`, `geometrie`, `disposerGraphe`, `cheminArrondi` et `dessinerTraits` sans les simplifier. Ordre de chaque rang par barycentre, gabarit dense au-delà de 4 rangs ou de 5 lignes, gouttières qui prennent la place libre, socle puis nœuds qui se resserrent quand elle manque, courbes entre rangs voisins, couloirs pour les sauts de rang. Une flèche porte son étiquette quand elle touche la sélection, ou quand le graphe compte 12 flèches au plus et que le nom tient dans la gouttière. Le composant mesure sa largeur par `ResizeObserver` et se redispose. Sans socle, pas de colonne de rang 0.
25. Sélection : la fonctionnalité choisie, ou sa mère. Ses flèches et leurs étiquettes passent en indigo, ses voisines prennent un liseré. Le reste ne se met en retrait que si la sélection ou l'une de ses voisines est dans le graphe.
26. Panneau de la sélection : à côté du graphe seulement si le graphe garde sa largeur minimale (`largeurMinGraphe`), dessous sinon. Une liste de plus de 7 éléments en montre 6, puis « Voir les n autres ».
27. Aucune fonctionnalité dans l'ordre : un état vide qui dit ce qui manque pour ordonner.
28. Socle : trié par nombre de fonctionnalités, en colonnes ; en indigo, les utilitaires que la sélection atteint.
29. « Hors de l'ordre » : colonnes « Périmètre », « Correspondance » et « Autre cause » ; tri par colonne ; 25 lignes par page, pagination masquée s'il n'y a qu'une page ; cliquer une ligne la sélectionne.

### Saisies, import, export

30. Le bouton « Exporter les saisies » est le seul bouton principal de la barre du haut. Il porte le nombre de saisies non exportées : « Exporter les saisies · 3 ».
31. Export : le nombre d'avis et de réponses, l'état, le fichier de saisies en JSON en lecture seule, « Copier » en principal, « Télécharger » en secondaire. L'un comme l'autre marque toutes les saisies comme exportées.
32. Import : coller un JSON ou déposer un fichier. Un tableau `fonctionnalites` fait un fichier de données ; un objet `saisies` seul fait un fichier de saisies. Un fichier de données remplace les données et fusionne ses saisies. Fusion : une saisie importée remplace celle de même identifiant quand sa date est égale ou postérieure ; une saisie remplacée n'est plus « non exportée ».
33. Messages, au mot près :
    - « Données du 13/11/2026 : 62 fonctionnalités, 1 arbre. 8 avis et 2 réponses fusionnés. »
    - « 4 avis et 1 réponse fusionnés », ou « Aucune saisie plus récente : rien n'a changé. »
    - « Collez un JSON ou déposez un fichier. »
    - « JSON invalide. Vérifiez que le texte est complet : il commence par { et finit par }. », avec « près du caractère n » quand le moteur donne la position.
    - « Ce JSON n'est ni un fichier de données ni un fichier de saisies. »
    - « Version de format 2 non reconnue : cette application lit la version 1. »
34. Une saisie dont la règle ou la question n'est plus dans les données est gardée, listée à part sous la liste de Règles et dans l'export, et exportée.

### Accessibilité

35. L'arbre porte `role="tree"` et `treeitem`, `aria-level`, `aria-expanded`, `aria-selected` ; un nœud du graphe porte `aria-pressed`. Tout bouton sans texte a un libellé. Le focus clavier est visible partout. Les dialogues retiennent le focus et se ferment par Échap.
36. Un nœud de la carte est un groupe nommé par l'identifiant de la fonction. Il contient de vrais boutons : sélectionner (`aria-pressed`), déplier (`aria-expanded`, « Déplier uf_ligne_prestation : 3 appels, branche de 30 fonctions », puis « Replier uf_ligne_prestation »), suivre. Le focus d'un nœud hors champ l'amène à l'écran. La vue d'ensemble est décorative pour un lecteur d'écran.

## Parcours de bout en bout

À écrire en Playwright, sur les données d'exemple, avec la date du jour figée au 14/11/2026 (les comptes de l'étape 8 en dépendent) :

1. À l'ouverture : onglet Repérage. Avec `fonctionnalite=F07.1`, les Stat valent 12 fonctions, 1 100 lignes de code, 2 niveaux, 5 DataWindows, 17 appels non résolus, 3 arrêts, 2 appels en différé. Le sélecteur d'arbre propose sept entrées : les cinq fonctionnalités, et F07.1.a et F07.1.b en retrait sous F07.1.
2. Cliquer `uf_lire_dossier` : sa fiche s'affiche. « Voir la carte » : l'onglet Carte s'ouvre, `uf_lire_dossier` y est sélectionnée, le résumé dit « 8 appels, tous affichés, hors renvois » et le niveau vaut 2. Cliquer sa pastille, qui porte 3 : « 7 appels affichés sur 8, hors renvois ». Activer « Renvois · 1 » : « 7 appels affichés sur 9 ». « Revenir à 3 niveaux » : « 9 appels, tous affichés ». « Voir dans Repérage » : retour à l'arbre, même sélection.
3. Cliquer la flèche de `u_calcul_ghs.uf_calcule` : l'arbre de F09.1 s'ouvre, la fonction y est sélectionnée. Le sélecteur d'arbre ne propose plus que cinq entrées : les sous-fonctionnalités de F07.1 n'y sont plus.
4. Chercher `f_lit_parametre` : « 6 appels dans 5 arbres ». Choisir un résultat de F07.1.a : son arbre s'ouvre, la fonction est sélectionnée, les résultats sont fermés.
5. Onglet Règles, F07.1.a : « 1/3 » règles validées, « 2/2 » tests unitaires, 4 tests d'intégration ; filtres « Toutes · 7 », « Avec règles · 3 », « À valider · 2 ». Basculer en Gherkin : les tableaux de données sont alignés.
6. Cliquer « Validée » sur RM-CHAMBREPART-3 : le dialogue du nom s'ouvre. Saisir « MARTIN Paul », enregistrer : l'avis est posé, signé et daté du jour, et le bouton devient « Exporter les saisies · 1 ».
7. Exporter : le JSON contient l'avis. « Copier » : le bouton dit « Copié » et le compte disparaît.
8. Importer un texte invalide : l'erreur est sous le champ. Importer `donnees/saisies-exemple.json` : « 4 avis et 1 réponse fusionnés », et une saisie sans règle, RM-ANCIENNE-7, est listée à part.
9. Onglet Dépendances : 5 fonctionnalités, 1 extraite, 1 extractible, 1 extraite sans ses dépendances, 1 hors de l'ordre. Cliquer un nœud : le panneau suit.
10. Basculer le thème, recharger : le thème et les saisies sont toujours là.

## Plan de travail

Une phase se termine quand ses tests passent et que ses captures sont comparées. Fais un commit par phase au moins.

0. **Lecture.** Le format, le prompt de design, `design-system/README.md` et `shadcn.md`, `prototype/transposition.js` en entier, les neuf gabarits, `captures/INDEX.md` et les captures. Lance les trois essais du prototype.
1. **Socle.** Le projet, Tailwind, shadcn, le thème BL Demo, les polices, la coquille avec quatre onglets vides, les thèmes clair et sombre. La coquille se compare à `captures/Reperage-sans-arbre.png`.
2. **Domaine.** Types, libellés, formats, noms, index, saisies, chargement des données. Les tests Vitest reprennent les assertions de `prototype/essais/essai-logique.js`.
3. **Repérage.** `ArbreAppels`, la fiche, la recherche, les états vides. Sept états.
4. **Carte.** `disposerCarte` et ses tests d'abord, repris de `prototype/essais/essai-carte-logique.js` ; puis la vue, le nœud, la flèche, React Flow, la barre, la légende, le pied. Huit états.
5. **Règles et saisies.** La liste, la fiche, la carte de règle, `BlocGherkin`, les questions, les tests, le dialogue du nom, le magasin des saisies. Six états.
6. **Dépendances.** Les Stat, les alertes, `GrapheCouches`, le panneau, le socle, le tableau. Quatre états.
7. **Import, export, persistance, URL.** Les dialogues, `localStorage`, le fragment. Cinq états.
8. **Volumes et finitions.** Les jeux `depart` et `intermediaire`, la largeur de 1 280 px, le clavier, le parcours Playwright, l'essai en `file://`, un README.

Quand une question se pose : si elle bloque, pose-la-moi. Sinon note-la avec ta proposition, selon la convention du dépôt ou à défaut dans `transposition/QUESTIONS.md`, et continue avec ta proposition.

## Vérifier le rendu

Pour chaque état de `captures/INDEX.md` :

1. ouvre l'application dans le même état, par son URL, à la même largeur de fenêtre ;
2. prends une capture avec Playwright ;
3. lis ta capture et la capture de référence, et corrige ce qui diffère : structure, ordre, libellés, marques, alignements, espacements nettement différents.

L'identique au pixel n'est pas demandé : shadcn et Radix n'ont pas exactement les mesures de BL Demo. Ce qui est demandé : qu'une personne qui connaît le prototype ne voie pas la différence au premier regard.

Vérifie aussi les états à volumes réels : l'arbre de 90 fonctions, la fiche de 14 règles, le tableau de 61 lignes, le graphe à six rangs. À 1 280 px de large, aucune page ne défile en largeur ; seuls le graphe, la carte et le bloc Gherkin défilent dans leur cadre.

La carte du même arbre compte 91 nœuds à l'ouverture, 59 à deux niveaux, 21 au premier niveau, 117 une fois tout déplié et 231 avec les renvois. À 1 440 px de large, ses quatre colonnes de départ tiennent dans la largeur de la zone. Sur les captures de la carte, compare le contenu des nœuds, les flèches, la barre et le pied ; la position de la vue, la vue d'ensemble et les barres de défilement sont celles de la doublure du prototype et peuvent différer.

## Définition de fini

- Le build produit un `dist/` statique qui s'ouvre servi en HTTP à un sous-chemin et par double-clic.
- Vérification de types, lint et tests passent.
- Les 31 états d'écran de `captures/INDEX.md` (pages Prototype, Repérage, Carte, Règles, Dépendances, Dialogues) sont reproduits, thème sombre compris.
- Le parcours de bout en bout passe.
- L'application n'émet aucune requête réseau hors de son fichier de données, et rien vers un autre domaine.
- La console du navigateur est vide sur tout le parcours.
- Un README dit comment lancer, construire, tester, et comment remplacer le fichier de données.

À la fin, rends-moi un compte rendu court : ce qui est fait, ce qui s'écarte du prototype et pourquoi, les questions restées ouvertes.

## Hors périmètre

- Connexion, comptes, serveur, sauvegarde en ligne.
- Modification des données, hors avis et réponses.
- Écran de téléphone.
- Le convertisseur qui écrira le fichier de données à partir des sorties de la chaîne.
- Les planches de variantes : elles sont une référence, pas un écran à livrer.

## À ne pas faire

- Recalculer une taille, un rang, une dépendance manquante ou un verdict de fonctionnalité.
- Inventer un champ, un libellé, une couleur ou une icône.
- Remplacer l'arbre de Repérage ou le graphe de Dépendances par une bibliothèque.
- Proposer dans le sélecteur d'arbre toutes les sous-fonctionnalités, ou un troisième niveau.
- Confier la disposition de la carte à React Flow, à dagre ou à elkjs, ou masquer l'attribution de React Flow.
- Porter `transposition-volumes.js` : les jeux de volumes sont des fichiers JSON.
- Prendre le contenu des jeux de volumes pour du vrai : les volumes sont réels, le contenu est fictif.
- Modifier le kit.
