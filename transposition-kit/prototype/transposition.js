/* Transposition — logique partagée par les artboards : libellés, index des données, état, vues.
   Aucune interface ici : les gabarits .dc.html affichent les objets rendus par Transposition.vues.*.
   L'application n'écrit que les saisies ; tailles, ordre et dépendances manquantes viennent du fichier de données. */
(function () {
  'use strict';

  var React = window.React;
  var h = React ? React.createElement : function () { return null; };
  var T = (window.Transposition = {});
  var NBSP = ' ';

  /* ───────────── Formats français ───────────── */

  function nb(n) {
    if (n == null || n === '') return '—';
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  }
  function pl(n, un, plusieurs) { return n > 1 ? plusieurs : un; }
  function compte(n, un, plusieurs) { return nb(n) + NBSP + pl(n, un, plusieurs); }
  function dateFr(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    return m ? m[3] + '/' + m[2] + '/' + m[1] : '—';
  }
  function aujourdhui() {
    var d = new Date();
    var z = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
  }
  function majuscule(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function moyenne(xs) { return xs.reduce(function (a, b) { return a + b; }, 0) / xs.length; }
  T.nb = nb; T.pl = pl; T.compte = compte; T.dateFr = dateFr; T.aujourdhui = aujourdhui;

  /* ───────────── Icônes absentes du design system (tracé Feather, 24 px, trait 2) ───────────── */

  var TRACES = {
    renvoi: [['polyline', { points: '15 10 20 15 15 20' }], ['path', { d: 'M4 4v7a4 4 0 0 0 4 4h12' }]],
    branche: [['line', { x1: 6, y1: 3, x2: 6, y2: 15 }], ['circle', { cx: 18, cy: 6, r: 3 }], ['circle', { cx: 6, cy: 18, r: 3 }], ['path', { d: 'M18 9a9 9 0 0 1-9 9' }]],
    socle: [['polygon', { points: '12 2 2 7 12 12 22 7 12 2' }], ['polyline', { points: '2 17 12 22 22 17' }], ['polyline', { points: '2 12 12 17 22 12' }]],
    /* Lucide « workflow » : deux boîtes reliées. */
    carte: [['rect', { x: 3, y: 3, width: 8, height: 8, rx: 2 }], ['path', { d: 'M7 11v4a2 2 0 0 0 2 2h4' }], ['rect', { x: 13, y: 13, width: 8, height: 8, rx: 2 }]]
  };
  var cacheIcones = {};
  T.icone = function (nom, taille) {
    var t = TRACES[nom];
    if (!t) return nom; // icône embarquée dans le design system : son nom suffit
    var cle = nom + '/' + (taille || 14);
    if (!cacheIcones[cle]) {
      cacheIcones[cle] = h('svg', {
        className: 'bl-icon', width: taille || 14, height: taille || 14, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true
      }, t.map(function (p, i) { return h(p[0], Object.assign({ key: i }, p[1])); }));
    }
    return cacheIcones[cle];
  };

  /* ───────────── Libellés : le même mot pour la même valeur partout ───────────── */

  var LIB = (T.LIB = {
    extraction: {
      extracted: { texte: 'Extraite', ton: 'success', icone: true },
      extractedSansDependances: { texte: 'Extraite sans ses dépendances', ton: 'warning', icone: true },
      notExtracted: { texte: 'Non extraite', ton: 'neutral', icone: 'minus' }
    },
    perimetre: {
      retenue: { texte: 'Périmètre validé', ton: 'success', icone: true },
      candidate: { texte: 'Périmètre proposé', ton: 'info', icone: true },
      aucune: { texte: 'Périmètre non étudié', ton: 'neutral', icone: 'circle-help' }
    },
    verdict: {
      conforme: { texte: 'Conforme', ton: 'success', icone: true },
      ecartExplique: { texte: 'Écart expliqué', ton: 'info', icone: true },
      echec: { texte: 'En échec', ton: 'destructive', icone: true },
      nonVerifie: { texte: 'Non vérifié', ton: 'neutral', icone: 'circle-help' }
    },
    test: {
      ok: { texte: 'Réussi', ton: 'success', un: 'réussi', plusieurs: 'réussis' },
      identique: { texte: 'Identique', ton: 'success', un: 'identique', plusieurs: 'identiques' },
      ecartExplique: { texte: 'Écart expliqué', ton: 'info', un: 'écart expliqué', plusieurs: 'écarts expliqués' },
      nonComparable: { texte: 'Non comparable', ton: 'neutral', un: 'non comparable', plusieurs: 'non comparables' },
      echec: { texte: 'En échec', ton: 'destructive', un: 'en échec', plusieurs: 'en échec' },
      ecart: { texte: 'Écart', ton: 'destructive', un: 'écart', plusieurs: 'écarts' },
      erreur: { texte: 'Erreur', ton: 'destructive', un: 'erreur', plusieurs: 'erreurs' },
      delai: { texte: 'Délai dépassé', ton: 'destructive', un: 'délai dépassé', plusieurs: 'délais dépassés' }
    },
    avis: {
      validee: { texte: 'Validée', ton: 'success', icone: true },
      aRevoir: { texte: 'À revoir', ton: 'warning', icone: true },
      aucun: { texte: 'À valider', ton: 'neutral', icone: 'clock' }
    },
    mode: {
      reference: { texte: 'Renvoi', ton: 'neutral', icone: 'renvoi' },
      autreArbre: { texte: 'Autre arbre', ton: 'primary', icone: 'branche' },
      arret: { texte: 'Arrêt', ton: 'warning', icone: 'ban' }
    },
    post: { texte: 'En différé', ton: 'info', icone: 'clock' },
    socle: { texte: 'Socle', ton: 'neutral', icone: 'socle', variante: 'outline' },
    classeArret: {
      technique: { texte: 'Technique', ton: 'neutral', icone: 'settings' },
      autreFonctionnalite: { texte: 'Autre fonctionnalité', ton: 'primary', icone: 'branche' }
    },
    etat: {
      candidate: { texte: 'Proposé', ton: 'info', icone: true },
      retenue: { texte: 'Validé', ton: 'success', icone: true }
    },
    correspondance: {
      cli: { texte: 'Chemin établi', ton: 'success', icone: true },
      repli: { texte: 'Chemin non établi', ton: 'warning', icone: true },
      'sans-correspondance': { texte: 'Sans correspondance', ton: 'neutral', icone: 'circle-help' }
    },
    nature: { fonctionGlobale: 'Fonction globale', fonctionObjet: "Fonction d'objet", evenement: 'Événement' },
    natureTest: { unitaire: 'Unitaire', integration: 'Intégration' }
  });

  var SYNTHESE_VIDE = { texte: 'Sans test', ton: 'neutral', icone: 'minus' };

  function marque(def, texte) {
    def = def || { texte: '—', ton: 'neutral' };
    var icone = def.icone === true ? true : def.icone ? T.icone(def.icone, 14) : false;
    return { ton: def.ton || 'neutral', icone: icone, texte: texte || def.texte, variante: def.variante || 'soft' };
  }
  function point(def, texte) {
    def = def || { texte: '—', ton: 'neutral' };
    return { ton: def.ton || 'neutral', texte: texte || def.texte };
  }
  function libelleOrdre(o) {
    if (!o) return '';
    if (o.statut === 'signalee') return "Hors de l'ordre";
    if (o.statut === 'partielle') return 'Rang' + NBSP + o.rang + ', partielle';
    return 'Rang' + NBSP + o.rang;
  }
  function libelleConfiance(c) {
    if (c == null) return '—';
    return typeof c === 'number' ? c + NBSP + '%' : String(c);
  }
  T.libelleOrdre = libelleOrdre;

  /* Nom d'une fonction : l'objet en préfixe discret, la fonction en clair. Une fonction globale répète son nom : on l'écrit une fois. */
  function nomFonction(id) {
    var i = id.lastIndexOf('.');
    if (i < 0) return { prefixe: '', nom: id };
    var objet = id.slice(0, i), nom = id.slice(i + 1);
    return objet === nom ? { prefixe: '', nom: nom } : { prefixe: objet + '.', nom: nom };
  }
  T.nomFonction = nomFonction;
  /* Dans un arbre, une fonction du même objet que la signature se lit sans son préfixe ; la racine garde le sien. */
  function nomDansArbre(e, a, id, racine) {
    var nom = nomFonction(id);
    if (racine || !nom.prefixe) return nom;
    var objet = (e.donnees.fonctions[a.signature] || {}).objet;
    return objet && nom.prefixe === objet + '.' ? { prefixe: '', nom: nom.nom } : nom;
  }

  /* ───────────── Index des données ───────────── */

  function construireArbre(signature, arbre) {
    var a = { signature: signature, arbre: arbre, noeuds: [], parCle: {}, parFonction: {}, dev: {}, arrets: {} };
    (arbre.arrets || []).forEach(function (x) { a.arrets[x.objet] = x; });
    function ajouter(n) {
      a.noeuds.push(n);
      a.parCle[n.cle] = n;
      (a.parFonction[n.fonction] = a.parFonction[n.fonction] || []).push(n);
      if ((n.mode === 'racine' || n.mode === 'developpement') && !a.dev[n.fonction]) a.dev[n.fonction] = n;
    }
    a.racine = { cle: 'r', fonction: signature, ligne: null, mode: 'racine', post: false, profondeur: 0, parent: null, enfants: [], taille: arbre.taille || null };
    ajouter(a.racine);
    (function descendre(parent, appels) {
      (appels || []).forEach(function (x, i) {
        var n = { cle: parent.cle + '.' + i, fonction: x.fonction, ligne: x.ligne, mode: x.mode, post: !!x.post, profondeur: parent.profondeur + 1, parent: parent, enfants: [], taille: x.taille || null };
        parent.enfants.push(n);
        ajouter(n);
        if (x.appels && x.appels.length) descendre(n, x.appels);
      });
    })(a.racine, arbre.appels);
    return a;
  }

  T.indexer = function (d) {
    var ix = { liste: d.fonctionnalites || [], parId: {}, enfants: {}, parSignature: {}, arbres: {}, presence: {}, socle: {}, regles: {}, questions: {} };
    ix.liste.forEach(function (f) {
      ix.parId[f.id] = f;
      if (f.mere) (ix.enfants[f.mere] = ix.enfants[f.mere] || []).push(f);
      var s = f.reperage && f.reperage.signature;
      if (s && !ix.parSignature[s]) ix.parSignature[s] = f.id;
      (f.regles || []).forEach(function (r) { ix.regles[r.id] = { regle: r, fonctionnalite: f }; });
      (f.questions || []).forEach(function (q) { ix.questions[q.id] = { question: q, fonctionnalite: f }; });
    });
    Object.keys(d.arbres || {}).forEach(function (sig) { ix.arbres[sig] = construireArbre(sig, d.arbres[sig]); });
    Object.keys(ix.arbres).forEach(function (sig) {
      Object.keys(ix.arbres[sig].parFonction).forEach(function (fn) { (ix.presence[fn] = ix.presence[fn] || []).push(sig); });
    });
    ((d.dependances && d.dependances.socle) || []).forEach(function (u) { ix.socle[u.objet] = u; });
    return ix;
  };

  function arbreDe(ix, f) {
    var s = f && f.reperage && f.reperage.signature;
    return (s && ix.arbres[s]) || null;
  }

  /* ───────────── Jeux de données ───────────── */

  var VIDE = { versionFormat: 1, produitLe: '', application: '', fonctions: {}, arbres: {}, fonctionnalites: [], dependances: { socle: [], aretes: [] } };
  var cacheJeux = {};
  T.jeu = function (nom) {
    if (cacheJeux[nom]) return cacheJeux[nom];
    var d = null, V = window.TranspositionVolumes;
    if ((nom === 'depart' || nom === 'intermediaire') && V && typeof V[nom] === 'function') d = V[nom]();
    if (!d) d = window.TranspositionExemple || VIDE;
    return (cacheJeux[nom] = d);
  };

  /* ───────────── Saisies : fusion, export, orphelines ───────────── */

  function saisiesDe(d) {
    var s = (d && d.saisies) || {};
    return { regles: clone(s.regles || {}), questions: clone(s.questions || {}) };
  }
  /* Une saisie importée remplace la saisie de même identifiant quand sa date est égale ou postérieure. */
  function fusionner(e, importees) {
    var r = { avis: 0, reponses: 0 };
    importees = importees || {};
    Object.keys(importees.regles || {}).forEach(function (id) {
      var n = importees.regles[id], a = e.saisies.regles[id];
      if (!n || !n.avis) return;
      if (!a || String(n.date || '') >= String(a.date || '')) { e.saisies.regles[id] = clone(n); delete e.locales.regles[id]; r.avis++; }
    });
    Object.keys(importees.questions || {}).forEach(function (id) {
      var n = importees.questions[id], a = e.saisies.questions[id];
      if (!n || n.reponse == null) return;
      if (!a || String(n.date || '') >= String(a.date || '')) { e.saisies.questions[id] = clone(n); delete e.locales.questions[id]; r.reponses++; }
    });
    return r;
  }
  function phraseFusion(r) {
    var parts = [];
    if (r.avis) parts.push(r.avis + NBSP + 'avis');
    if (r.reponses) parts.push(compte(r.reponses, 'réponse', 'réponses'));
    if (!parts.length) return '';
    var accord = r.avis ? (r.avis + r.reponses > 1 ? 'fusionnés' : 'fusionné') : (r.reponses > 1 ? 'fusionnées' : 'fusionnée');
    return parts.join(' et ') + ' ' + accord;
  }
  T.fichierSaisies = function (e) {
    return { versionFormat: 1, saisies: { regles: e.saisies.regles, questions: e.saisies.questions } };
  };
  function orphelines(e) {
    var out = [];
    Object.keys(e.saisies.regles).forEach(function (id) {
      if (!e.index.regles[id]) out.push({ id: id, genre: 'Avis', detail: (LIB.avis[e.saisies.regles[id].avis] || LIB.avis.aucun).texte });
    });
    Object.keys(e.saisies.questions).forEach(function (id) {
      if (!e.index.questions[id]) out.push({ id: id, genre: 'Réponse', detail: e.saisies.questions[id].reponse });
    });
    return out;
  }

  /* ───────────── État ───────────── */

  function charger(m, d, opts) {
    var e = m.etat;
    e.donnees = d;
    e.index = T.indexer(d);
    e.saisies = saisiesDe(d);
    e.locales = { regles: {}, questions: {} };
    if (opts && opts.locales) {
      Object.keys(e.saisies.regles).forEach(function (k) { e.locales.regles[k] = true; if (!e.auteur) e.auteur = e.saisies.regles[k].auteur || ''; });
      Object.keys(e.saisies.questions).forEach(function (k) { e.locales.questions[k] = true; });
    }
  }

  function arbreCourant(e) {
    return arbreDe(e.index, e.index.parId[e.fonctionnaliteId]);
  }
  function estOuvert(e, a, n) {
    var o = e.ouverts[a.signature];
    if (o && o[n.cle] != null) return o[n.cle];
    return a.noeuds.length <= 40 ? true : n.profondeur < 1;
  }
  function selectionner(e, idFonction, cle) {
    var a = arbreCourant(e);
    if (!a) return false;
    var n = (cle && a.parCle[cle]) || a.dev[idFonction] || (a.parFonction[idFonction] || [])[0];
    if (!n) return false;
    e.cleSel = n.cle;
    /* Le chemin jusqu'à la sélection se déplie dans l'arbre de Repérage comme sur la carte. */
    var o = (e.ouverts[a.signature] = e.ouverts[a.signature] || {});
    var c = (e.carte[a.signature] = e.carte[a.signature] || {});
    for (var p = n.parent; p; p = p.parent) { o[p.cle] = true; c[p.cle] = true; }
    return true;
  }

  /* Carte : les trois premiers niveaux d'appels sont dépliés ; au-delà, un nœud se déplie à la demande. */
  var NIVEAUX_CARTE = 3;
  function carteOuverte(e, a, n) {
    var o = e.carte[a.signature];
    if (o && o[n.cle] != null) return o[n.cle];
    return n.profondeur < NIVEAUX_CARTE;
  }

  T.creerMagasin = function (options) {
    var o = options || {};
    var abonnes = [];
    var m = { etat: null };
    m.abonner = function (f) {
      abonnes.push(f);
      return function () { abonnes = abonnes.filter(function (x) { return x !== f; }); };
    };
    m.notifier = function () { abonnes.slice().forEach(function (f) { f(); }); };
    m.maj = function (partiel) { Object.keys(partiel).forEach(function (k) { m.etat[k] = partiel[k]; }); m.notifier(); };

    var e = (m.etat = {
      jeu: o.jeu === 'depart' || o.jeu === 'intermediaire' ? o.jeu : 'exemple',
      onglet: o.onglet === 'carte' || o.onglet === 'regles' || o.onglet === 'dependances' ? o.onglet : 'reperage',
      theme: o.theme === 'dark' ? 'dark' : 'light',
      fonctionnaliteId: null, cleSel: 'r', ouverts: {},
      carte: {}, carteRenvois: o.renvois === 'oui' || o.renvois === true,
      carteZoom: o.zoom === 'ajuste' ? 'ajuste' : Number(o.zoom) > 0 ? Number(o.zoom) : 1,
      recherche: o.recherche || '', rechercheOuverte: !!o.recherche,
      filtre: o.filtre === 'avecRegles' || o.filtre === 'aValider' ? o.filtre : 'toutes', rechercheFonc: '',
      mode: o.mode === 'gherkin' ? 'gherkin' : 'francais', sections: {}, filtreRegles: 'toutes',
      pageHors: 1, triHors: null, toutDeplie: o.deplier === 'tout',
      saisies: { regles: {}, questions: {} }, locales: { regles: {}, questions: {} },
      auteur: o.auteur || '', nomSaisi: o.auteur || '', enAttente: null,
      dialogue: o.dialogue === 'importer' || o.dialogue === 'exporter' || o.dialogue === 'nom' ? o.dialogue : null,
      importTexte: o.importTexte || '', importErreur: o.importErreur || '', importMessage: o.importMessage || '', importFichier: '', copie: false
    });
    if (e.dialogue === 'nom' && !e.auteur) e.enAttente = { genre: 'premiere' };
    /* o.donnees : un fichier de données passé tel quel, pour une planche de composants ; o.sansSelection : aucune fonctionnalité choisie. */
    charger(m, o.donnees || T.jeu(e.jeu), { locales: !!o.saisiesLocales });
    var ix = e.index;
    var depart = (o.fonctionnalite && ix.parId[o.fonctionnalite]) || ix.liste.filter(function (f) { return arbreDe(ix, f); })[0] || ix.liste[0] || null;
    e.fonctionnaliteId = depart && !o.sansSelection ? depart.id : null;
    if (o.fonction) selectionner(e, o.fonction, o.occurrence);
    if (o.deplier === 'tout') { var a0 = arbreCourant(e); if (a0) { var t0 = (e.ouverts[a0.signature] = {}), c0 = (e.carte[a0.signature] = {}); a0.noeuds.forEach(function (n) { if (n.enfants.length) { t0[n.cle] = true; c0[n.cle] = true; } }); } }
    /* o.niveaux : le nombre de niveaux que la carte déplie au départ, pour un état à montrer. Le chemin de la sélection reste ouvert. */
    if (Number(o.niveaux) >= 1) { var a1 = arbreCourant(e); if (a1) { var c1 = (e.carte[a1.signature] = e.carte[a1.signature] || {}); a1.noeuds.forEach(function (n) { if (n.enfants.length && c1[n.cle] == null) c1[n.cle] = n.profondeur < Number(o.niveaux); }); } }

    /* Navigation */
    m.allerOnglet = function (v) { m.maj({ onglet: v, rechercheOuverte: false }); };
    m.basculerTheme = function () { m.maj({ theme: e.theme === 'dark' ? 'light' : 'dark' }); };
    m.ouvrirFonctionnalite = function (id, opts) {
      if (!e.index.parId[id]) return;
      e.fonctionnaliteId = id;
      e.cleSel = 'r';
      e.rechercheOuverte = false;
      if (opts && opts.onglet) e.onglet = opts.onglet;
      if (opts && opts.fonction) selectionner(e, opts.fonction, opts.cle);
      m.notifier();
    };

    /* Repérage */
    m.selectionnerNoeud = function (n) { selectionner(e, n.fonction, n.cle); m.notifier(); };
    m.basculerNoeud = function (a, n) {
      var t = (e.ouverts[a.signature] = e.ouverts[a.signature] || {});
      t[n.cle] = !estOuvert(e, a, n);
      m.notifier();
    };
    m.toutBasculer = function (ouvert) {
      var a = arbreCourant(e);
      if (!a) return;
      var t = (e.ouverts[a.signature] = {});
      a.noeuds.forEach(function (n) { if (n.enfants.length) t[n.cle] = ouvert || n.mode === 'racine'; });
      m.notifier();
    };
    m.cibleSuivi = function (a, n) {
      var fn = e.donnees.fonctions[n.fonction] || {};
      if (n.mode === 'reference') { var d0 = a.dev[n.fonction]; return d0 && d0 !== n ? { genre: 'renvoi', noeud: d0 } : null; }
      if (n.mode === 'autreArbre') { var id = e.index.parSignature[n.fonction]; return id ? { genre: 'arbre', id: id } : null; }
      if (n.mode === 'arret') {
        var ar = a.arrets[fn.objet], cible = ar && ar.fonctionnalites && ar.fonctionnalites[0];
        return cible && e.index.parId[cible] ? { genre: 'arret', id: cible } : null;
      }
      return null;
    };
    m.suivre = function (a, n) {
      var c = m.cibleSuivi(a, n);
      if (!c) return;
      if (c.genre === 'renvoi') m.selectionnerNoeud(c.noeud);
      else m.ouvrirFonctionnalite(c.id, c.genre === 'arret' ? { fonction: n.fonction } : null);
    };

    /* Carte */
    /* Quand un repli cache la fonction sélectionnée, la sélection remonte au nœud qui la cache. */
    function rattraperSelection(a) {
      var n = a.parCle[e.cleSel], visible = n;
      if (!n) return;
      for (var p = n.parent; p; p = p.parent) if (!carteOuverte(e, a, p)) visible = p;
      e.cleSel = visible.cle;
    }
    m.basculerCarte = function (a, n) {
      var t = (e.carte[a.signature] = e.carte[a.signature] || {});
      t[n.cle] = !carteOuverte(e, a, n);
      rattraperSelection(a);
      m.notifier();
    };
    m.deplierCarte = function (tout) {
      var a = arbreCourant(e);
      if (!a) return;
      if (tout) { var t = (e.carte[a.signature] = {}); a.noeuds.forEach(function (n) { if (n.enfants.length) t[n.cle] = true; }); }
      else delete e.carte[a.signature];
      rattraperSelection(a);
      m.notifier();
    };
    /* Un niveau de plus : chaque nœud affiché encore replié se déplie. Un niveau de moins : les parents des nœuds
       les plus profonds se replient. Les branches dépliées à la main gardent leur avance. */
    m.niveauCarte = function (sens) {
      var a = arbreCourant(e);
      if (!a) return;
      var t = (e.carte[a.signature] = e.carte[a.signature] || {}), affiches = [], fond = 0;
      (function voir(n) {
        affiches.push(n);
        if (n.profondeur > fond) fond = n.profondeur;
        enfantsCarte(e, a, n).forEach(voir);
      })(a.racine);
      if (sens > 0) affiches.forEach(function (n) { if (n.enfants.length && !carteOuverte(e, a, n)) t[n.cle] = true; });
      else if (fond > 1) affiches.forEach(function (n) { if (n.profondeur === fond - 1 && n.enfants.length) t[n.cle] = false; });
      rattraperSelection(a);
      m.notifier();
    };
    m.montrerRenvois = function (oui) { m.maj({ carteRenvois: !!oui }); };
    m.zoomerCarte = function (z) { m.maj({ carteZoom: z }); };

    /* Saisies */
    function demanderNom(attente) {
      e.enAttente = attente || null;
      e.nomSaisi = e.auteur || '';
      e.dialogue = 'nom';
      m.notifier();
      focaliser('tp-nom');
    }
    m.choisirAvis = function (id, avis) {
      if (!e.auteur) return demanderNom({ genre: 'avis', id: id, valeur: avis });
      var s = e.saisies.regles[id];
      if (s && s.avis === avis) return;
      if (e.sections['ex:' + id] == null) e.sections['ex:' + id] = !s || s.avis === 'aRevoir';
      var n = { avis: avis };
      if (s && s.commentaire) n.commentaire = s.commentaire;
      n.auteur = e.auteur; n.date = aujourdhui();
      e.saisies.regles[id] = n;
      e.locales.regles[id] = true;
      m.notifier();
    };
    m.commenter = function (id, texte) {
      var s = e.saisies.regles[id];
      if (!s) return;
      if (!e.auteur) return demanderNom({ genre: 'commentaire', id: id, valeur: texte });
      e.sections['com:' + id] = true;
      var n = { avis: s.avis };
      if (texte) n.commentaire = texte;
      n.auteur = e.auteur; n.date = aujourdhui();
      e.saisies.regles[id] = n;
      e.locales.regles[id] = true;
      m.notifier();
    };
    m.repondre = function (id, texte) {
      if (!e.auteur) return demanderNom({ genre: 'reponse', id: id, valeur: texte });
      if (!texte) { delete e.saisies.questions[id]; delete e.locales.questions[id]; return m.notifier(); }
      e.saisies.questions[id] = { reponse: texte, auteur: e.auteur, date: aujourdhui() };
      e.locales.questions[id] = true;
      m.notifier();
    };

    /* Dialogues */
    m.ouvrirDialogue = function (nom) {
      if (nom === 'nom') return demanderNom(null);
      m.maj({ dialogue: nom, importErreur: '', importMessage: '', importTexte: nom === 'importer' ? '' : e.importTexte, importFichier: '', copie: false });
    };
    m.fermerDialogue = function () { m.maj({ dialogue: null, enAttente: null }); };
    m.validerNom = function () {
      var nom = String(e.nomSaisi || '').trim();
      if (!nom) return;
      var att = e.enAttente;
      e.auteur = nom; e.dialogue = null; e.enAttente = null;
      if (att && att.genre === 'avis') m.choisirAvis(att.id, att.valeur);
      else if (att && att.genre === 'commentaire') m.commenter(att.id, att.valeur);
      else if (att && att.genre === 'reponse') m.repondre(att.id, att.valeur);
      else m.notifier();
    };
    m.importer = function () {
      var txt = String(e.importTexte || '').trim(), obj;
      if (!txt) return m.maj({ importErreur: 'Collez un JSON ou déposez un fichier.', importMessage: '' });
      try { obj = JSON.parse(txt); } catch (err) {
        var pos = /position (\d+)/.exec(String((err && err.message) || ''));
        return m.maj({ importErreur: 'JSON invalide' + (pos ? ' près du caractère ' + (Number(pos[1]) + 1) : '') + '. Vérifiez que le texte est complet : il commence par { et finit par }.', importMessage: '' });
      }
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return m.maj({ importErreur: "Ce JSON n'est ni un fichier de données ni un fichier de saisies.", importMessage: '' });
      if (obj.versionFormat != null && obj.versionFormat !== 1) return m.maj({ importErreur: 'Version de format ' + obj.versionFormat + ' non reconnue : cette application lit la version 1.', importMessage: '' });
      if (Array.isArray(obj.fonctionnalites)) {
        var avant = e.saisies, locales = e.locales;
        obj.fonctions = obj.fonctions || {}; obj.arbres = obj.arbres || {}; obj.dependances = obj.dependances || { socle: [], aretes: [] };
        e.donnees = obj; e.index = T.indexer(obj); e.saisies = avant; e.locales = locales; e.jeu = 'exemple'; e.ouverts = {}; e.carte = {};
        var r1 = fusionner(e, obj.saisies);
        if (!e.index.parId[e.fonctionnaliteId]) { var f0 = e.index.liste.filter(function (f) { return arbreDe(e.index, f); })[0] || e.index.liste[0]; e.fonctionnaliteId = f0 ? f0.id : null; }
        e.cleSel = 'r';
        var p1 = phraseFusion(r1);
        return m.maj({ importErreur: '', importMessage: 'Données du ' + dateFr(obj.produitLe) + ' : ' + compte(obj.fonctionnalites.length, 'fonctionnalité', 'fonctionnalités') + ', ' + compte(Object.keys(obj.arbres).length, 'arbre', 'arbres') + (p1 ? '. ' + majuscule(p1) + '.' : '') });
      }
      if (obj.saisies && typeof obj.saisies === 'object') {
        var p2 = phraseFusion(fusionner(e, obj.saisies));
        return m.maj({ importErreur: '', importMessage: p2 ? majuscule(p2) : "Aucune saisie plus récente : rien n'a changé." });
      }
      m.maj({ importErreur: "Ce JSON n'est ni un fichier de données ni un fichier de saisies.", importMessage: '' });
    };
    m.lireFichier = function (fichier) {
      if (!fichier || typeof FileReader === 'undefined') return;
      var lecteur = new FileReader();
      lecteur.onload = function () { m.maj({ importTexte: String(lecteur.result || ''), importFichier: fichier.name || '', importErreur: '', importMessage: '' }); };
      lecteur.onerror = function () { m.maj({ importErreur: 'Le fichier ' + (fichier.name || '') + " n'a pas pu être lu.", importMessage: '' }); };
      lecteur.readAsText(fichier);
    };
    function marquerExportees() { e.locales = { regles: {}, questions: {} }; }
    m.copierExport = function () {
      var json = JSON.stringify(T.fichierSaisies(e), null, 2);
      var fini = function () { marquerExportees(); m.maj({ copie: true }); setTimeout(function () { if (e.copie) m.maj({ copie: false }); }, 2400); };
      var secours = function () {
        try { var z = document.getElementById('tp-export-json'); if (z) { z.focus(); z.select(); document.execCommand('copy'); } } catch (err) { /* la zone reste sélectionnée : Ctrl+C */ }
        fini();
      };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(json).then(fini, secours);
        else secours();
      } catch (err) { secours(); }
    };
    m.telechargerExport = function () {
      try {
        var json = JSON.stringify(T.fichierSaisies(e), null, 2);
        var url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
        var lien = document.createElement('a');
        lien.href = url; lien.download = 'saisies-' + aujourdhui() + '.json';
        document.body.appendChild(lien); lien.click(); lien.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      } catch (err) { /* sans téléchargement possible, « Copier » reste disponible */ }
      marquerExportees();
      m.notifier();
    };
    return m;
  };

  function focaliser(id) {
    if (typeof document === 'undefined') return;
    setTimeout(function () { var z = document.getElementById(id); if (z && z.focus) z.focus(); }, 60);
  }

  /* ───────────── Vues ───────────── */

  T.vues = {};

  var QUESTIONS = {
    reperage: "Cette partie du code est-elle grosse, où s'arrête-t-elle, que lance-t-elle ?",
    carte: 'Qui appelle quoi, et que cache chaque branche ?',
    regles: "Que fait cette fonctionnalité, est-ce prouvé, le métier est-il d'accord ?",
    dependances: "Dans quel ordre extraire, et qu'est-ce qui bloque ?"
  };
  var TITRES = { reperage: 'Repérage', carte: 'Carte', regles: 'Règles', dependances: 'Dépendances' };
  var PROPS_SIDEBAR = { style: { borderTopRightRadius: 'var(--radius-4xl)' } };
  var PROPS_PLEIN = { style: { display: 'flex', width: '100%' } };

  /* — Coquille : barre latérale, bandeau, dialogues — */
  T.vues.coquille = function (m) {
    var e = m.etat, d = e.donnees;
    var nAvis = Object.keys(e.saisies.regles).length, nRep = Object.keys(e.saisies.questions).length;
    var nLoc = Object.keys(e.locales.regles).length + Object.keys(e.locales.questions).length;
    var orph = orphelines(e);
    var apres = !!e.importMessage;
    return {
      nav: [
        { value: 'reperage', label: 'Repérage', icon: 'network' },
        { value: 'carte', label: 'Carte', icon: T.icone('carte', 20) },
        { value: 'regles', label: 'Règles', icon: 'list-checks' },
        { value: 'dependances', label: 'Dépendances', icon: 'link' }
      ],
      propsSidebar: PROPS_SIDEBAR,
      onglet: e.onglet,
      allerOnglet: m.allerOnglet,
      titre: TITRES[e.onglet],
      contexte: h(React.Fragment, null, (d.application || 'Application') + ' · données du ', h('strong', null, dateFr(d.produitLe)), e.jeu !== 'exemple' ? ' · jeu de volumes fictif' : null),
      estReperage: e.onglet === 'reperage', estCarte: e.onglet === 'carte', estRegles: e.onglet === 'regles', estDependances: e.onglet === 'dependances',
      libelleExporter: 'Exporter les saisies' + (nLoc ? ' · ' + nLoc : ''),
      infoExporter: nLoc ? compte(nLoc, 'saisie non exportée', 'saisies non exportées') + ' : elles ne vivent que dans ce navigateur.' : 'Toutes les saisies sont exportées.',
      ouvrirImporter: function () { m.ouvrirDialogue('importer'); },
      ouvrirExporter: function () { m.ouvrirDialogue('exporter'); },
      ouvrirNom: function () { m.ouvrirDialogue('nom'); },
      fermerDialogue: function () { m.fermerDialogue(); },
      basculerTheme: m.basculerTheme,
      iconeTheme: e.theme === 'dark' ? 'sun' : 'moon',
      libelleTheme: e.theme === 'dark' ? 'Thème clair' : 'Thème sombre',
      auteurConnu: !!e.auteur, auteurInconnu: !e.auteur, auteur: e.auteur,
      libelleAuteur: e.auteur ? e.auteur + ' : changer de nom' : 'Indiquer votre nom',
      importer: {
        ouvert: e.dialogue === 'importer',
        texte: e.importTexte,
        surSaisie: function (ev) { m.maj({ importTexte: ev.target.value, importErreur: '', importMessage: '', importFichier: '' }); },
        surSurvol: function (ev) { ev.preventDefault(); },
        surDepot: function (ev) { ev.preventDefault(); var fs = ev.dataTransfer && ev.dataTransfer.files; if (fs && fs[0]) m.lireFichier(fs[0]); },
        surFichier: function (ev) { var fs = ev.target.files; if (fs && fs[0]) m.lireFichier(fs[0]); ev.target.value = ''; },
        aideDepot: e.importFichier ? 'Fichier lu : ' + e.importFichier : 'ou cliquez pour choisir un fichier de données ou de saisies',
        erreur: e.importErreur, aErreur: !!e.importErreur, invalide: e.importErreur ? true : undefined,
        message: e.importMessage, aMessage: apres,
        avant: !apres, apres: apres,
        inactif: !String(e.importTexte || '').trim(),
        lancer: m.importer,
        recommencer: function () { m.ouvrirDialogue('importer'); }
      },
      exporter: {
        ouvert: e.dialogue === 'exporter',
        nbAvis: nb(nAvis), libAvis: 'avis',
        nbReponses: nb(nRep), libReponses: pl(nRep, 'réponse', 'réponses'),
        etat: nLoc ? marque({ ton: 'warning', icone: true }, compte(nLoc, 'non exportée', 'non exportées')) : marque({ ton: 'success', icone: true }, 'Tout est exporté'),
        json: JSON.stringify(T.fichierSaisies(e), null, 2),
        aOrphelines: orph.length > 0,
        titreOrphelines: compte(orph.length, 'saisie', 'saisies') + ' sans règle ni question dans les données : ' + pl(orph.length, 'elle reste', 'elles restent') + " dans l'export.",
        orphelines: orph,
        copier: m.copierExport, telecharger: m.telechargerExport,
        libCopier: e.copie ? 'Copié' : 'Copier', iconeCopier: e.copie ? 'check' : 'copy'
      },
      nom: {
        ouvert: e.dialogue === 'nom',
        description: e.enAttente ? 'Votre nom signe vos avis et vos réponses. Il est demandé à la première saisie et reste dans ce navigateur.' : 'Votre nom signe vos avis et vos réponses. Il reste dans ce navigateur.',
        valeur: e.nomSaisi,
        surSaisie: function (ev) { m.maj({ nomSaisi: ev.target.value }); },
        surTouche: function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); m.validerNom(); } },
        inactif: !String(e.nomSaisi || '').trim(),
        valider: m.validerNom,
        fermer: function () { m.fermerDialogue(); }
      }
    };
  };

  /* — Repérage — */

  function tailleNoeud(e, a, n) {
    var fn = e.donnees.fonctions[n.fonction] || {};
    if (n.mode === 'racine') return a.arbre.taille || null;
    if (n.mode === 'developpement') return n.taille || { fonctions: 1, lignes: fn.lignes != null ? fn.lignes : null };
    if (n.mode === 'autreArbre') { var b = e.index.arbres[n.fonction]; return (b && b.arbre.taille) || null; }
    return null;
  }
  function marquesNoeud(e, a, n) {
    var ix = e.index, fn = e.donnees.fonctions[n.fonction] || {}, out = [];
    if (n.mode === 'reference') out.push(marque(LIB.mode.reference));
    if (n.mode === 'autreArbre') out.push(marque(LIB.mode.autreArbre, 'Autre arbre' + (ix.parSignature[n.fonction] ? NBSP + ix.parSignature[n.fonction] : '')));
    if (n.mode === 'arret') out.push(marque(LIB.mode.arret));
    if (n.post) out.push(marque(LIB.post));
    if (fn.objet && ix.socle[fn.objet]) out.push(marque(LIB.socle));
    return out;
  }
  function precisionNoeud(e, a, n) {
    if (n.mode === 'racine') return 'signature mère';
    if (n.mode !== 'arret') return '';
    var fn = e.donnees.fonctions[n.fonction] || {}, ar = a.arrets[fn.objet];
    if (!ar) return '';
    if (ar.classe === 'technique') return 'technique';
    return ar.fonctionnalites && ar.fonctionnalites.length ? 'vers' + NBSP + ar.fonctionnalites.join(', ') : '';
  }
  function libelleSuivi(e, c) {
    if (!c) return '';
    if (c.genre === 'renvoi') return 'Aller à son développement';
    var f = e.index.parId[c.id];
    return "Ouvrir l'arbre de " + c.id + (f ? ', ' + f.titre : '');
  }

  function lignesArbre(m, a) {
    var e = m.etat, total = (a.arbre.taille && a.arbre.taille.lignes) || 0, out = [];
    /* Un arbre profond resserre ses filets de niveau : le nom de la fonction garde sa place. */
    var pasGuide = ((a.arbre.taille && a.arbre.taille.profondeur) || 0) > 6 ? '1px' : '5px';
    (function visiter(n) {
      var nom = nomDansArbre(e, a, n.fonction, n.mode === 'racine');
      var aEnfants = n.enfants.length > 0, ouverte = aEnfants && estOuvert(e, a, n);
      var t = tailleNoeud(e, a, n), cible = m.cibleSuivi(a, n), sel = n.cle === e.cleSel;
      var part = t && t.lignes != null && total ? Math.max(2, Math.round((t.lignes / total) * 100)) : 0;
      var guides = [];
      for (var i = 0; i < n.profondeur; i++) guides.push(i);
      out.push({
        cle: n.cle, id: n.fonction, prefixe: nom.prefixe, nom: nom.nom, niveau: n.profondeur + 1, guides: guides, pasGuide: pasGuide,
        aEnfants: aEnfants, sansEnfants: !aEnfants, ouverte: ouverte,
        chevron: ouverte ? 'chevron-down' : 'chevron-right',
        basculeLabel: (ouverte ? 'Replier ' : 'Déplier ') + nom.nom,
        basculer: function () { m.basculerNoeud(a, n); },
        selectionnee: sel, fond: sel ? 'var(--secondary)' : 'transparent',
        selectionner: function () { m.selectionnerNoeud(n); },
        marques: marquesNoeud(e, a, n), precision: precisionNoeud(e, a, n),
        suivre: cible ? function () { m.suivre(a, n); } : null, sansSuivre: !cible, suivreLabel: libelleSuivi(e, cible),
        lignes: t && t.lignes != null ? nb(t.lignes) : '—',
        fonctions: t && t.fonctions != null ? nb(t.fonctions) : '—',
        encre: t && t.lignes != null ? 'var(--foreground)' : 'var(--muted-foreground)',
        part: part + '%', barreVis: t && t.lignes != null ? 'visible' : 'hidden',
        partLabel: t && t.lignes != null ? part + " % des lignes de l'arbre" : 'Hors de la taille'
      });
      if (ouverte) n.enfants.forEach(visiter);
    })(a.racine);
    return out;
  }

  function appelVue(m, a, n, cote) {
    /* cote = 'appelant' : la ligne montre le parent de n ; 'appele' : elle montre n.
       Côté appelant, la fonction appelée est celle de la fiche : seule la marque propre à l'appel, « En différé », se répète. */
    var e = m.etat, montre = cote === 'appelant' ? n.parent : n, nom = nomDansArbre(e, a, montre.fonction, montre.mode === 'racine');
    var marques = cote === 'appelant' ? (n.post ? [marque(LIB.post)] : []) : marquesNoeud(e, a, n);
    return {
      prefixe: nom.prefixe, nom: nom.nom, id: montre.fonction,
      ligne: n.ligne != null ? 'ligne' + NBSP + n.ligne : '',
      marques: marques, aMarques: marques.length > 0,
      aller: function () { m.selectionnerNoeud(montre); }
    };
  }

  /* Une longue liste montre ses premiers éléments ; le reste se déplie à la demande. */
  function couper(m, cle, liste, limite) {
    var e = m.etat, ouverte = !!e.sections[cle], longue = liste.length > limite + 1;
    return {
      liste: longue && !ouverte ? liste.slice(0, limite) : liste,
      plus: {
        a: longue,
        texte: ouverte ? 'Réduire la liste' : 'Voir les ' + (liste.length - limite) + ' autres',
        icone: ouverte ? 'chevron-up' : 'chevron-down',
        basculer: function () { e.sections[cle] = !ouverte; m.notifier(); }
      }
    };
  }

  function ficheFonction(m, a, n) {
    var e = m.etat, ix = e.index, d = e.donnees, fn = d.fonctions[n.fonction] || {};
    var dev = n.mode === 'racine' ? n : a.dev[n.fonction] || null;
    var t = n.mode === 'reference' && dev ? tailleNoeud(e, a, dev) : tailleNoeud(e, a, n);
    var morceaux = [];
    if (t) {
      if (t.fonctions != null) morceaux.push(compte(t.fonctions, 'fonction', 'fonctions'));
      if (t.lignes != null) morceaux.push(compte(t.lignes, 'ligne', 'lignes'));
      if (t.profondeur != null) morceaux.push(compte(t.profondeur, 'niveau', 'niveaux'));
      if (t.datawindows) morceaux.push(compte(t.datawindows, 'DataWindow', 'DataWindows'));
      if (t.nonResolus) morceaux.push(compte(t.nonResolus, 'appel non résolu', 'appels non résolus'));
      if (t.arrets) morceaux.push(compte(t.arrets, 'arrêt', 'arrêts'));
      if (t.posts) morceaux.push(compte(t.posts, 'appel en différé', 'appels en différé'));
    }
    var idSig = ix.parSignature[n.fonction], fSig = idSig && ix.parId[idSig];
    var ar = n.mode === 'arret' ? a.arrets[fn.objet] : null;
    var differes = [];
    Object.keys(ix.arbres).forEach(function (sig) {
      var b = ix.arbres[sig];
      (b.parFonction[n.fonction] || []).forEach(function (x) {
        if (!x.post || !x.parent) return;
        var idArbre = ix.parSignature[sig], ici = b === a;
        differes.push({
          fonction: x.parent.fonction, ligne: 'ligne' + NBSP + x.ligne,
          lieu: ici ? '' : "dans l'arbre de " + (idArbre || sig),
          aller: function () { if (ici) m.selectionnerNoeud(x.parent); else if (idArbre) m.ouvrirFonctionnalite(idArbre, { fonction: x.parent.fonction }); }
        });
      });
    });
    var appeleePar = (a.parFonction[n.fonction] || []).filter(function (x) { return x.parent; }).map(function (x) { return appelVue(m, a, x, 'appelant'); });
    var appelle = dev ? dev.enfants.map(function (x) { return appelVue(m, a, x, 'appele'); }) : [];
    var appelleVide = '';
    if (!appelle.length) {
      if (n.mode === 'arret') appelleVide = "Non développée ici : l'arbre s'arrête à cet objet.";
      else if (n.mode === 'autreArbre') appelleVide = "Développée dans l'arbre de " + (idSig || 'sa fonctionnalité') + '.';
      else appelleVide = 'Aucun appel résolu.';
    }
    var ailleurs = (ix.presence[n.fonction] || []).filter(function (sig) { return sig !== a.signature && ix.parSignature[sig]; }).map(function (sig) {
      var id = ix.parSignature[sig], f = ix.parId[id];
      return { id: id, titre: f ? f.titre : '', ouvrir: function () { m.ouvrirFonctionnalite(id, { fonction: n.fonction }); } };
    });
    var marques = marquesNoeud(e, a, n);
    var nbAppeleePar = appeleePar.length, nbAppelle = appelle.length;
    var coupeAppeleePar = couper(m, 'par:' + a.signature + ':' + n.fonction, appeleePar, 8);
    var coupeAppelle = couper(m, 'vers:' + a.signature + ':' + n.fonction, appelle, 8);
    appeleePar = coupeAppeleePar.liste;
    appelle = coupeAppelle.liste;
    return {
      id: n.fonction, nature: LIB.nature[fn.nature] || 'Nature inconnue', marques: marques,
      fichier: fn.fichier || '—',
      emplacement: fn.debut != null ? 'Ligne' + NBSP + fn.debut + (fn.lignes != null ? ', ' + compte(fn.lignes, 'ligne', 'lignes') : '') : '—',
      datawindows: fn.datawindows || [], aDatawindows: !!(fn.datawindows && fn.datawindows.length), sansDatawindows: !(fn.datawindows && fn.datawindows.length),
      nonResolus: nb(fn.nonResolus || 0),
      tailles: morceaux, aTaille: morceaux.length > 0, sansTaille: !morceaux.length,
      tailleVide: n.mode === 'arret' ? "Hors de la taille : l'arbre s'arrête ici." : '—',
      aSignature: !!fSig,
      signatureTexte: fSig ? 'Signature mère de ' + idSig + ' ' + fSig.titre : '',
      signatureAilleurs: !!fSig && n.mode !== 'racine',
      ouvrirSignature: function () { if (idSig) m.ouvrirFonctionnalite(idSig); },
      signatureBouton: idSig ? "Ouvrir l'arbre de " + idSig : '',
      aArret: !!ar,
      arret: ar ? {
        objet: ar.objet,
        classe: marque(LIB.classeArret[ar.classe]),
        etat: marque(LIB.etat[ar.etat]),
        confiance: 'Confiance ' + libelleConfiance(ar.confiance),
        raison: ar.raison || '',
        visees: (ar.fonctionnalites || []).map(function (id) {
          var f = ix.parId[id];
          return { id: id, titre: f ? f.titre : 'hors des données', ouvrir: function () { if (f) m.ouvrirFonctionnalite(id, { fonction: n.fonction }); } };
        }),
        aVisees: !!(ar.fonctionnalites && ar.fonctionnalites.length)
      } : null,
      aDiffere: differes.length > 0, differes: differes,
      aAppeleePar: nbAppeleePar > 0, sansAppeleePar: !nbAppeleePar, appeleePar: appeleePar, plusAppeleePar: coupeAppeleePar.plus, nbAppeleePar: 'Appelée par · ' + nbAppeleePar,
      appeleeParVide: n.mode === 'racine' ? "Point d'entrée de l'arbre : aucune fonction de cet arbre ne l'appelle." : '—',
      aAppelle: nbAppelle > 0, sansAppelle: !nbAppelle, appelle: appelle, plusAppelle: coupeAppelle.plus, nbAppelle: 'Appelle · ' + nbAppelle, appelleVide: appelleVide,
      aAilleurs: ailleurs.length > 0, ailleurs: ailleurs
    };
  }

  function chercher(m, q) {
    var e = m.etat, ix = e.index;
    q = String(q || '').trim().toLowerCase();
    if (q.length < 2) return null;
    var groupes = [], total = 0;
    ix.liste.forEach(function (f) {
      var a = arbreDe(ix, f);
      if (!a) return;
      var items = a.noeuds.filter(function (n) { return n.fonction.toLowerCase().indexOf(q) >= 0; });
      if (!items.length) return;
      total += items.length;
      groupes.push({
        id: f.id, titre: f.titre, compte: compte(items.length, 'appel', 'appels'),
        items: items.slice(0, 30).map(function (n) {
          var nom = nomFonction(n.fonction), parent = n.parent ? nomFonction(n.parent.fonction) : null;
          return {
            prefixe: nom.prefixe, nom: nom.nom,
            contexte: n.parent ? 'ligne' + NBSP + n.ligne + ' · dans ' + parent.nom : 'signature mère',
            marques: marquesNoeud(e, a, n),
            choisir: function () { m.ouvrirFonctionnalite(f.id, { fonction: n.fonction, cle: n.cle }); }
          };
        })
      });
    });
    return { groupes: groupes, total: total };
  }

  /* Le sélecteur d'arbre, les mesures de la signature et l'état « arbre non extrait » servent à Repérage et à la Carte. */

  /* Le sélecteur s'arrête au deuxième niveau : dans un vrai projet, les sous-parties se comptent par milliers.
     Niveau 1 : toutes les fonctionnalités du manuel. Niveau 2 : les sous-fonctionnalités directes de la seule
     fonctionnalité affichée, sous elle. Plus bas, rien n'est proposé : on y arrive par l'arbre, nœud « Autre arbre »,
     ou par la recherche. L'arbre affiché reste toujours nommé, même plus bas, pour dire où l'on est. */
  function lignee(ix, f) {
    var out = [], vus = {};
    for (var x = f; x && !vus[x.id]; x = x.mere ? ix.parId[x.mere] : null) { vus[x.id] = true; out.unshift(x); }
    return out;
  }
  function optionsArbres(ix, affichee) {
    var chemin = lignee(ix, affichee), out = [];
    var option = function (x, niveau) {
      var retrait = '';
      for (var i = 1; i < niveau; i++) retrait += NBSP + NBSP + NBSP + NBSP;
      return { value: x.id, label: retrait + x.id + ' — ' + x.titre + (arbreDe(ix, x) ? '' : ' (arbre non extrait)') };
    };
    ix.liste.forEach(function (x) {
      if (x.mere && ix.parId[x.mere]) return;
      out.push(option(x, 1));
      if (chemin[0] !== x) return;
      (ix.enfants[x.id] || []).forEach(function (y) {
        out.push(option(y, 2));
        if (chemin.length > 2 && chemin[1] === y) out.push(option(affichee, 3));
      });
    });
    if (affichee && !out.some(function (o) { return o.value === affichee.id; })) out.push(option(affichee, 1));
    return out;
  }
  function mesuresArbre(t, cles) {
    var v = function (x) { return t && x != null ? nb(x) : '—'; };
    var n = function (x) { return t && x != null ? x : 2; };
    var toutes = {
      fonctions: ['fonction', 'fonctions'], lignes: ['ligne de code', 'lignes de code'], profondeur: ['niveau', 'niveaux'],
      datawindows: ['DataWindow', 'DataWindows'], nonResolus: ['appel non résolu', 'appels non résolus'],
      arrets: ['arrêt', 'arrêts'], posts: ['appel en différé', 'appels en différé']
    };
    return cles.map(function (k) { return { valeur: v(t && t[k]), libelle: pl(n(t && t[k]), toutes[k][0], toutes[k][1]) }; });
  }
  function arbreVide(m, f) {
    if (!f) return { titre: 'Aucune fonctionnalité', texte: 'Importez un fichier de données.', signature: '', aSignature: false, ordre: '', allerDependances: function () {} };
    var rep = f.reperage || {}, c = rep.correspondance, sig = rep.signature, texte;
    if (c && c.statut === 'repli') texte = 'Le chemin de ' + f.id + " vers le code n'est pas établi : la signature mère proposée reste à confirmer (confiance " + libelleConfiance(c.confiance) + "). Sans signature confirmée, pas d'arbre.";
    else if (c && c.statut === 'sans-correspondance') texte = "Aucune signature mère n'a été trouvée pour cette ligne du manuel.";
    else if (sig) texte = "La signature mère est connue, mais son arbre d'appels n'est pas encore extrait.";
    else texte = "Cette fonctionnalité n'a pas encore de signature mère : son arbre d'appels ne peut pas être extrait.";
    return {
      titre: 'Arbre non extrait', texte: texte, signature: sig || '', aSignature: !!sig,
      ordre: f.mere ? '' : libelleOrdre(rep.ordre),
      allerDependances: function () { m.allerOnglet('dependances'); }
    };
  }

  T.vues.reperage = function (m) {
    var e = m.etat, ix = e.index;
    var f = ix.parId[e.fonctionnaliteId] || null, a = f ? arbreDe(ix, f) : null;
    var rep = (f && f.reperage) || {}, t = a && a.arbre.taille;
    var res = e.rechercheOuverte ? chercher(m, e.recherche) : null;
    var badges = [];
    if (f) {
      if (!a) badges.push(marque({ ton: 'neutral', icone: 'minus' }, 'Arbre non extrait'));
      if (rep.correspondance) badges.push(marque(LIB.correspondance[rep.correspondance.statut]));
      badges.push(marque(LIB.perimetre[rep.delimitation || 'aucune']));
    }
    var stats = mesuresArbre(t, ['fonctions', 'lignes', 'profondeur', 'datawindows', 'nonResolus', 'arrets', 'posts']);
    stats.forEach(function (s) { s.libelle = majuscule(s.libelle); });
    var vide = f && !a ? arbreVide(m, f) : null;
    var noeud = a ? a.parCle[e.cleSel] || a.racine : null;
    return {
      question: QUESTIONS.reperage,
      optionsArbres: optionsArbres(ix, f),
      propsPlein: PROPS_PLEIN,
      fonctionnaliteId: e.fonctionnaliteId || '',
      surChoixArbre: function (ev) { m.ouvrirFonctionnalite(ev.target.value); },
      recherche: e.recherche,
      surRecherche: function (ev) { m.maj({ recherche: ev.target.value, rechercheOuverte: true }); },
      surFocusRecherche: function () { if (e.recherche && !e.rechercheOuverte) m.maj({ rechercheOuverte: true }); },
      surToucheRecherche: function (ev) { if (ev.key === 'Escape') m.maj({ rechercheOuverte: false }); },
      fermerRecherche: function () { m.maj({ rechercheOuverte: false }); },
      resultatsOuverts: !!res,
      groupes: res ? res.groupes : [],
      resumeResultats: res ? (res.total ? compte(res.total, 'appel', 'appels') + ' dans ' + compte(res.groupes.length, 'arbre', 'arbres') : 'Aucun résultat') : '',
      aucunResultat: !!res && !res.total,
      badges: badges,
      stats: stats,
      aArbre: !!a, sansArbre: !a,
      signature: a ? a.signature : '',
      lignes: a ? lignesArbre(m, a) : [],
      toutDeplier: function () { m.toutBasculer(true); },
      toutReplier: function () { m.toutBasculer(false); },
      allerCarte: function () { m.allerOnglet('carte'); },
      icCarte: T.icone('carte', 16),
      vide: vide || arbreVide(m, null),
      aFiche: !!noeud,
      fiche: noeud ? ficheFonction(m, a, noeud) : null
    };
  };

  /* — Carte : l'arbre d'appels en nœuds et en flèches, de gauche à droite — */

  var CARTE = { nw: 236, nh: 54, gx: 48, gy: 8, gyBranche: 18, pad: 20, tronc: 14 };
  var ZOOMS = [0.25, 0.33, 0.5, 0.67, 0.8, 1, 1.25, 1.5];
  var TRAIT_CARTE = 'color-mix(in oklab, var(--muted-foreground) 55%, var(--card))';
  /* Le cadre dit la nature du nœud, lisible même quand la carte est réduite ; le badge la redit en un mot. */
  var CADRES_CARTE = {
    developpement: { texte: 'Développée', fond: 'var(--card)', bord: 'var(--border)', trait: 'solid', mini: 'color-mix(in oklab, var(--muted-foreground) 50%, var(--card))' },
    reference: { texte: 'Renvoi', fond: 'transparent', bord: 'var(--input)', trait: 'dashed', mini: 'var(--input)' },
    arret: { texte: 'Arrêt', fond: 'var(--warning-soft)', bord: 'color-mix(in oklab, var(--warning) 45%, var(--border))', trait: 'solid', mini: 'var(--warning)' },
    autreArbre: { texte: 'Autre arbre', fond: 'var(--secondary)', bord: 'color-mix(in oklab, var(--primary) 40%, var(--border))', trait: 'solid', mini: 'color-mix(in oklab, var(--primary) 70%, var(--card))' }
  };
  CADRES_CARTE.racine = CADRES_CARTE.developpement;

  /* Les appels affichés sous un nœud : aucun s'il est replié ; les renvois seulement à la demande.
     Un renvoi sélectionné reste affiché, sans quoi la sélection venue de Repérage disparaîtrait. */
  function affichable(e, n) { return e.carteRenvois || n.mode !== 'reference' || n.cle === e.cleSel; }
  function enfantsCarte(e, a, n) {
    if (!n.enfants.length || !carteOuverte(e, a, n)) return [];
    return n.enfants.filter(function (x) { return affichable(e, x); });
  }

  /* Arbre rangé, de gauche à droite. Un parent se centre sur ses enfants ; deux branches voisines se rapprochent
     jusqu'à se toucher, colonne par colonne : une feuille se loge à côté des descendants de sa voisine.
     Fonction pure : la racine et les enfants affichés de chaque nœud donnent les positions. */
  function disposerCarte(racine, enfantsDe, G) {
    G = G || CARTE;
    var pos = {}, ordre = [], profondeur = 0;
    function placer(n, niveau) {
      var enfants = enfantsDe(n), p = (pos[n.cle] = { enfants: enfants, niveau: niveau, y: 0, dec: 0 });
      ordre.push(n);
      if (niveau > profondeur) profondeur = niveau;
      if (!enfants.length) return [[0, G.nh]];
      var fusion = [];
      enfants.forEach(function (c, i) {
        var cc = placer(c, niveau + 1), dec = 0, d;
        if (i) for (d = 0; d < cc.length && d < fusion.length; d++) dec = Math.max(dec, fusion[d][1] + (d ? G.gyBranche : G.gy) - cc[d][0]);
        pos[c.cle].dec = dec;
        for (d = 0; d < cc.length; d++) {
          if (!fusion[d]) fusion[d] = [cc[d][0] + dec, cc[d][1] + dec];
          else { fusion[d][0] = Math.min(fusion[d][0], cc[d][0] + dec); fusion[d][1] = Math.max(fusion[d][1], cc[d][1] + dec); }
        }
      });
      var premier = pos[enfants[0].cle], dernier = pos[enfants[enfants.length - 1].cle];
      p.y = (premier.dec + premier.y + dernier.dec + dernier.y) / 2;
      return [[p.y, p.y + G.nh]].concat(fusion);
    }
    var bas = 0;
    placer(racine, 0).forEach(function (c) { if (c[1] > bas) bas = c[1]; });
    (function poser(n, base) {
      var p = pos[n.cle];
      p.x = G.pad + p.niveau * (G.nw + G.gx);
      p.y = Math.round(G.pad + base + p.y);
      p.enfants.forEach(function (c) { poser(c, base + pos[c.cle].dec); });
    })(racine, 0);
    return { pos: pos, ordre: ordre, profondeur: profondeur, largeur: 2 * G.pad + (profondeur + 1) * G.nw + profondeur * G.gx, hauteur: Math.round(bas) + 2 * G.pad };
  }
  T.disposerCarte = disposerCarte;
  T.CARTE = CARTE;

  /* Ce que la carte montre de l'arbre, sans la dessiner : de quoi écrire le résumé et griser les boutons. */
  function etatCarte(e, a) {
    var affiches = -1, niveaux = 0, total = 0, niveauxMax = 0, renvois = 0, parDefaut = true;
    (function voir(n) {
      affiches++;
      if (n.profondeur > niveaux) niveaux = n.profondeur;
      enfantsCarte(e, a, n).forEach(voir);
    })(a.racine);
    a.noeuds.forEach(function (n) {
      if (n.mode === 'reference') renvois++;
      if (n.enfants.length && carteOuverte(e, a, n) !== n.profondeur < NIVEAUX_CARTE) parDefaut = false;
      if (!n.parent || !affichable(e, n)) return;
      total++;
      if (n.profondeur > niveauxMax) niveauxMax = n.profondeur;
    });
    return { affiches: affiches, total: total, niveaux: niveaux, niveauxMax: niveauxMax, renvois: renvois, parDefaut: parDefaut };
  }

  function resumeSelection(m, a, n) {
    var e = m.etat, fn = e.donnees.fonctions[n.fonction] || {};
    var dev = n.mode === 'racine' ? n : a.dev[n.fonction] || null;
    var t = n.mode === 'reference' && dev ? tailleNoeud(e, a, dev) : tailleNoeud(e, a, n);
    var morceaux = [];
    if (t) {
      if (t.fonctions != null) morceaux.push(compte(t.fonctions, 'fonction', 'fonctions'));
      if (t.lignes != null) morceaux.push(compte(t.lignes, 'ligne', 'lignes'));
      if (t.profondeur) morceaux.push(compte(t.profondeur, 'niveau', 'niveaux'));
    }
    var appel = '';
    if (n.parent) {
      var parent = nomDansArbre(e, a, n.parent.fonction, n.parent.mode === 'racine');
      appel = 'Appelée par ' + parent.nom + (n.ligne != null ? ', ligne' + NBSP + n.ligne : '');
    }
    var precision = n.mode === 'racine' ? '' : precisionNoeud(e, a, n);
    return {
      id: n.fonction, nature: LIB.nature[fn.nature] || 'Nature inconnue', marques: marquesNoeud(e, a, n),
      resume: [
        appel || "Point d'entrée de l'arbre",
        morceaux.length ? 'branche de ' + morceaux.join(', ') : (n.mode === 'arret' ? "hors de la taille : l'arbre s'arrête ici" + (precision ? ', ' + precision : '') : '')
      ].filter(Boolean).join(' · ')
    };
  }

  /* L'onglet : le choix de l'arbre, ses mesures, la légende et la fonction sélectionnée. */
  T.vues.carte = function (m) {
    var e = m.etat, ix = e.index;
    var f = ix.parId[e.fonctionnaliteId] || null, a = f ? arbreDe(ix, f) : null, t = a && a.arbre.taille;
    var sel = a ? a.parCle[e.cleSel] || a.racine : null;
    var presents = {}, differes = false;
    if (a) a.noeuds.forEach(function (n) { presents[n.mode === 'racine' ? 'developpement' : n.mode] = true; if (n.post) differes = true; });
    var legende = ['developpement', 'arret', 'autreArbre', 'reference'].filter(function (k) { return presents[k] && (k !== 'reference' || e.carteRenvois); }).map(function (k) {
      var K = CADRES_CARTE[k];
      return { texte: K.texte, cadre: 'background: ' + K.fond + '; border: 1px ' + K.trait + ' ' + (k === 'developpement' ? 'var(--input)' : K.bord) };
    });
    return {
      question: QUESTIONS.carte,
      optionsArbres: optionsArbres(ix, f),
      propsPlein: PROPS_PLEIN,
      fonctionnaliteId: e.fonctionnaliteId || '',
      surChoixArbre: function (ev) { m.ouvrirFonctionnalite(ev.target.value); },
      stats: mesuresArbre(t, ['fonctions', 'lignes', 'profondeur', 'arrets', 'posts']),
      aArbre: !!a, sansArbre: !a,
      vide: arbreVide(m, f && !a ? f : null),
      legende: legende, aDifferes: differes,
      aSelection: !!sel, selection: sel ? resumeSelection(m, a, sel) : null,
      allerReperage: function () { m.allerOnglet('reperage'); }
    };
  };

  /* La carte elle-même, calculée à la place que le composant mesure : options.largeur et options.plafond, en pixels. */
  T.vues.carteAppels = function (m, options) {
    var o = options || {}, e = m.etat, a = arbreCourant(e), G = CARTE;
    if (!a) return { aCarte: false, sansCarte: true, c: null, dessin: null, mini: null, resume: '', reglages: null, zoom: null };
    var L = disposerCarte(a.racine, function (n) { return enfantsCarte(e, a, n); }, G);
    var E = etatCarte(e, a);
    /* Une sélection vide ne surligne aucun nœud : c'est l'état d'une planche de variantes, jamais celui de l'application. */
    var sel = e.cleSel === '' ? null : a.parCle[e.cleSel] || a.racine, cleSel = sel ? sel.cle : '', chemin = {};
    for (var p = sel; p; p = p.parent) chemin[p.cle] = true;

    /* Échelle : un nombre, ou « ajuste » pour faire tenir toute la carte dans la zone. */
    var zw = Math.max(0, o.largeur || 0), cap = Math.max(0, o.plafond || 0);
    var ajuste = zw && cap ? Math.max(0.1, Math.min(1, (zw - 2) / L.largeur, (cap - 2) / L.hauteur)) : 1;
    var s = e.carteZoom === 'ajuste' ? ajuste : Number(e.carteZoom) || 1;
    var lwCarte = Math.floor(L.largeur * s), lh = Math.floor(L.hauteur * s);
    /* La vue d'ensemble n'apparaît que si la carte déborde franchement. Elle recouvre un coin de la zone :
       la carte défile alors un peu plus loin à droite, pour qu'aucun nœud ne reste dessous. */
    var defile = (zw > 0 && lwCarte > zw + 24) || (cap > 0 && lh > cap + 24);
    var k = Math.min(168 / L.largeur, 168 / L.hauteur);
    var mini = { k: k, largeur: Math.max(1, Math.round(L.largeur * k)), hauteur: Math.max(1, Math.round(L.hauteur * k)) };
    var lw = lwCarte + (defile ? mini.largeur + 44 : 0);
    var hauteurZone = cap ? Math.min(cap, lh + (zw && lw > zw ? 16 : 0)) : lh;

    var traits = [], forts = [];
    var noeuds = L.ordre.map(function (n) {
      var P = L.pos[n.cle], racine = n.mode === 'racine';
      var nom = nomDansArbre(e, a, n.fonction, racine);
      var t = tailleNoeud(e, a, n), cible = m.cibleSuivi(a, n);
      var affichables = n.enfants.filter(function (x) { return affichable(e, x); }).length;
      var masques = n.enfants.length - affichables;
      var ouverte = affichables > 0 && carteOuverte(e, a, n);
      var estSel = n.cle === cleSel, surChemin = !!chemin[n.cle];
      var K = CADRES_CARTE[n.mode] || CADRES_CARTE.developpement;
      var teinte = n.mode === 'arret' || n.mode === 'autreArbre';
      /* « En différé » qualifie l'appel : sur la carte, la marque se pose sur la flèche, pas dans le nœud. */
      var marques = marquesNoeud(e, a, n).filter(function (q) { return q.texte !== LIB.post.texte; });
      if (teinte) marques = marques.map(function (q) { return { ton: q.ton, icone: q.icone, texte: q.texte, variante: 'outline' }; });
      var morceaux = [];
      if (racine) morceaux.push('signature mère');
      else if (n.mode === 'arret') { var pr = precisionNoeud(e, a, n); if (pr) morceaux.push(pr); }
      if (t && t.lignes != null && n.mode !== 'autreArbre') morceaux.push(compte(t.lignes, 'ligne', 'lignes'));
      if (masques) morceaux.push(compte(masques, 'renvoi', 'renvois'));
      var nbFonctions = t && t.fonctions > 1 ? nb(t.fonctions) : '';
      var bord = estSel ? 'var(--primary)' : surChemin ? 'var(--ring)' : K.bord;

      P.enfants.forEach(function (c) {
        var C = L.pos[c.cle], fort = !!chemin[c.cle];
        /* Le tronc part près du parent : la branche qui arrive au nœud garde la place de la marque « en différé ». */
        var x1 = P.x + G.nw, y1 = P.y + G.nh / 2, x2 = C.x - 1, y2 = C.y + G.nh / 2, xm = x1 + G.tronc;
        (fort ? forts : traits).push({ d: cheminArrondi([[x1, y1], [xm, y1], [xm, y2], [x2, y2]], 8), fort: fort });
      });

      var pastille;
      if (affichables > 0 && !ouverte) pastille = 'background: var(--secondary); color: var(--secondary-foreground); border-color: transparent';
      else if (affichables > 0) pastille = 'background: transparent; color: var(--muted-foreground); border-color: var(--input)';
      else pastille = 'background: ' + (teinte ? 'var(--card)' : 'var(--muted)') + '; color: var(--foreground); border-color: transparent';
      pastille += '; padding: ' + (affichables > 0 ? (nbFonctions ? '0 3px 0 8px' : '0') : '0 7px');
      return {
        cle: n.cle, id: n.fonction, prefixe: nom.prefixe, nom: nom.nom, x: P.x, y: P.y, mode: n.mode,
        libelle: n.fonction + (n.post ? ', appelée en différé' : ''), differe: !!n.post,
        cadre:'left: ' + P.x + 'px; top: ' + P.y + 'px; width: ' + G.nw + 'px; height: ' + G.nh + 'px; background: ' + K.fond + '; border: 1px ' + K.trait + ' ' + bord + (estSel ? '; box-shadow: 0 0 0 1px var(--primary)' : ''),
        selectionnee: estSel,
        choisir: function () { m.selectionnerNoeud(n); },
        marques: marques, detail: morceaux.join(' · '),
        aBascule: affichables > 0, ouverte: ouverte, compte: nbFonctions, pastille: pastille,
        chevron: ouverte ? 'chevron-left' : 'chevron-right',
        basculeLabel: ouverte ? 'Replier ' + nom.nom : 'Déplier ' + nom.nom + ' : ' + compte(affichables, 'appel', 'appels') + (nbFonctions ? ', branche de ' + nbFonctions + ' fonctions' : ''),
        basculer: function () { m.basculerCarte(a, n); },
        aCompteFixe: !affichables && !!nbFonctions,
        compteTitre: nbFonctions ? 'Branche de ' + nbFonctions + ' fonctions' : '',
        suivre: cible ? function () { m.suivre(a, n); } : null, suivreLabel: libelleSuivi(e, cible)
      };
    });

    var horsRenvois = E.renvois && !e.carteRenvois ? ', hors renvois' : '';
    var resume;
    if (!E.total) resume = 'Aucun appel sous cette signature' + horsRenvois;
    else if (E.affiches >= E.total) resume = compte(E.total, 'appel affiché', 'appels, tous affichés') + horsRenvois;
    else resume = compte(E.affiches, 'appel affiché', 'appels affichés') + ' sur ' + nb(E.total) + horsRenvois;
    var toutAffiche = E.affiches >= E.total;

    var plusBas = ZOOMS.filter(function (z) { return z < s - 0.005; }).pop();
    var plusHaut = ZOOMS.filter(function (z) { return z > s + 0.005; })[0];
    return {
      aCarte: true, sansCarte: false,
      c: {
        signature: a.signature, selCle: cleSel, largeur: L.largeur, hauteur: L.hauteur, echelle: s, lw: lw, lwCarte: lwCarte, lh: lh,
        hauteurZone: hauteurZone, plafond: cap ? cap + 'px' : 'none', noeuds: noeuds, pos: L.pos,
        /* Ajustée, la carte se centre dans la zone ; sinon elle reste calée à gauche, pour que la signature ne bouge pas. */
        marge: e.carteZoom === 'ajuste' ? '0 auto' : '0',
        aMini: defile, mini: mini
      },
      dessin: dessinerCarte(L, traits.concat(forts)),
      mini: defile ? dessinerMini(L, G, k, cleSel) : null,
      resume: resume,
      /* Ce que la carte montre : les renvois, le niveau atteint, tout, ou le départ. */
      reglages: {
        aRenvois: E.renvois > 0, renvoisActifs: !!e.carteRenvois, libelleRenvois: 'Renvois · ' + nb(E.renvois),
        surRenvois: function (ev) { m.montrerRenvois(!!(ev && ev.target && ev.target.checked)); },
        niveau: String(E.niveaux),
        libelleNiveau: compte(E.niveaux, 'niveau affiché', 'niveaux affichés'),
        moins: function () { m.niveauCarte(-1); }, sansMoins: E.niveaux <= 1,
        plus: function () { m.niveauCarte(1); }, sansPlus: toutAffiche,
        toutDeplier: function () { m.deplierCarte(true); }, toutDeplie: toutAffiche,
        revenir: function () { m.deplierCarte(false); }, parDefaut: E.parDefaut,
        libelleRevenir: 'Revenir à ' + NIVEAUX_CARTE + ' niveaux'
      },
      zoom: {
        texte: Math.round(s * 100) + NBSP + '%',
        moins: function () { if (plusBas != null) m.zoomerCarte(plusBas); }, sansMoins: plusBas == null,
        plus: function () { if (plusHaut != null) m.zoomerCarte(plusHaut); }, sansPlus: plusHaut == null,
        cent: function () { m.zoomerCarte(1); },
        ajuster: function () { m.zoomerCarte('ajuste'); }, ajuste: e.carteZoom === 'ajuste',
        libelleCent: 'Zoom à ' + Math.round(s * 100) + NBSP + '%. Revenir à 100' + NBSP + '%'
      }
    };
  };

  /* Les flèches de la carte : un seul tracé SVG sous les nœuds. La pointe est du côté de la fonction appelée ;
     le chemin de la signature à la sélection passe en indigo. */
  function dessinerCarte(L, traits) {
    var pointe = function (id, couleur, taille) {
      return h('marker', { key: id, id: id, viewBox: '0 0 8 8', refX: 7, refY: 4, markerWidth: taille, markerHeight: taille, markerUnits: 'userSpaceOnUse', orient: 'auto' },
        h('path', { d: 'M0 0.5 L7.5 4 L0 7.5 Z', style: { fill: couleur } }));
    };
    return h('svg', { 'aria-hidden': true, width: L.largeur, height: L.hauteur, viewBox: '0 0 ' + L.largeur + ' ' + L.hauteur, style: { position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' } },
      h('defs', null, pointe('tp-carte-pointe', TRAIT_CARTE, 8), pointe('tp-carte-pointe-forte', 'var(--primary)', 9)),
      traits.map(function (t, i) {
        return h('path', { key: i, d: t.d, markerEnd: 'url(#' + (t.fort ? 'tp-carte-pointe-forte' : 'tp-carte-pointe') + ')', style: { fill: 'none', stroke: t.fort ? 'var(--primary)' : TRAIT_CARTE, strokeWidth: t.fort ? 2 : 1.5 } });
      }));
  }
  /* La vue d'ensemble : un rectangle par nœud, à la couleur de sa nature. */
  function dessinerMini(L, G, k, cleSel) {
    var hauteurMin = 1.6 / k;
    return h('svg', { 'aria-hidden': true, width: Math.max(1, Math.round(L.largeur * k)), height: Math.max(1, Math.round(L.hauteur * k)), viewBox: '0 0 ' + L.largeur + ' ' + L.hauteur, preserveAspectRatio: 'none', style: { display: 'block' } },
      L.ordre.map(function (n) {
        var P = L.pos[n.cle], K = CADRES_CARTE[n.mode] || CADRES_CARTE.developpement;
        return h('rect', { key: n.cle, x: P.x, y: P.y, width: G.nw, height: Math.max(G.nh, hauteurMin), rx: 10, style: { fill: n.cle === cleSel ? 'var(--primary)' : K.mini } });
      }));
  }

  /* — Règles — */

  function synthese(verdicts) {
    if (verdicts.indexOf('echec') >= 0) return 'echec';
    if (verdicts.indexOf('ecartExplique') >= 0) return 'ecartExplique';
    if (verdicts.indexOf('conforme') >= 0) return 'conforme';
    return 'nonVerifie';
  }
  function resumeRegles(e, f) {
    var r = { total: 0, validees: 0, aRevoir: 0, aValider: 0 };
    (f.regles || []).forEach(function (x) {
      var s = e.saisies.regles[x.id];
      r.total++;
      if (!s) r.aValider++; else if (s.avis === 'validee') r.validees++; else r.aRevoir++;
    });
    return r;
  }
  function signer(s) { return s && s.auteur ? s.auteur + ' · ' + dateFr(s.date) : ''; }
  function phraseDecoupage(dc) {
    var zero = function (x, texte) { return x ? x + NBSP + texte : 'aucun ' + texte; };
    return compte(dc.gardees, 'morceau de code gardé', 'morceaux de code gardés') + ' : ' +
      zero(dc.couvertes, pl(dc.couvertes, 'couvert', 'couverts') + ' par une règle') + ', ' +
      zero(dc.techniques, pl(dc.techniques, 'technique', 'techniques')) + ', ' +
      zero(dc.sansTest, 'sans test') + ' ; ' + zero(dc.coupees, pl(dc.coupees, 'coupé', 'coupés'));
  }

  function ligneListe(m, f, estContexte) {
    var e = m.etat, r = resumeRegles(e, f), sel = f.id === e.fonctionnaliteId;
    return {
      id: f.id, titre: f.titre, retrait: f.mere ? '36px' : '16px', sous: !!f.mere,
      selectionnee: sel, fond: sel ? 'var(--secondary)' : 'transparent', opacite: estContexte ? '0.7' : '1',
      choisir: function () { m.ouvrirFonctionnalite(f.id); },
      extraction: point(LIB.extraction[f.extraction]),
      reglesTexte: r.total ? r.validees + '/' + r.total + NBSP + pl(r.total, 'règle validée', 'règles validées') : 'Aucune règle',
      aVerdict: !!f.tests, verdict: f.tests ? marque(LIB.verdict[f.tests.verdict]) : marque(SYNTHESE_VIDE)
    };
  }

  function regleVue(m, f, r) {
    var e = m.etat, s = e.saisies.regles[r.id] || null;
    var exemples = r.exemples || [];
    var cleEx = 'ex:' + r.id, cleCode = 'code:' + r.id;
    var exOuverts = e.sections[cleEx] != null ? e.sections[cleEx] : e.toutDeplie || !s || s.avis === 'aRevoir';
    var codeOuvert = !!e.sections[cleCode];
    var cleCom = 'com:' + r.id;
    var champCommentaire = !!s && (s.avis === 'aRevoir' || !!s.commentaire || !!e.sections[cleCom]);
    var tests = {};
    ((f.tests && f.tests.liste) || []).forEach(function (t) { tests[t.id] = t; });
    return {
      id: r.id, enonce: r.enonce,
      verdict: marque(LIB.verdict[synthese(exemples.map(function (x) { return x.verdict; }))]),
      avis: marque(LIB.avis[s ? s.avis : 'aucun']),
      varValidee: s && s.avis === 'validee' ? 'secondary' : 'outline', iconeValidee: s && s.avis === 'validee' ? 'check' : undefined, presseValidee: !!(s && s.avis === 'validee'),
      varARevoir: s && s.avis === 'aRevoir' ? 'secondary' : 'outline', iconeARevoir: s && s.avis === 'aRevoir' ? 'check' : undefined, presseARevoir: !!(s && s.avis === 'aRevoir'),
      choisirValidee: function () { m.choisirAvis(r.id, 'validee'); },
      choisirARevoir: function () { m.choisirAvis(r.id, 'aRevoir'); },
      aAvis: !!s, sansAvis: !s,
      champCommentaire: champCommentaire, proposerCommentaire: !!s && !champCommentaire,
      ouvrirCommentaire: function () { e.sections[cleCom] = true; m.notifier(); focaliser('tp-com-' + r.id); },
      idCommentaire: 'tp-com-' + r.id,
      commentaire: (s && s.commentaire) || '',
      aideCommentaire: s && s.avis === 'aRevoir' ? 'Dites ce qui est à revoir.' : 'Facultatif.',
      surCommentaire: function (ev) { m.commenter(r.id, ev.target.value); },
      signature: signer(s),
      nbExemples: 'Exemples · ' + exemples.length,
      exemplesOuverts: exOuverts, chevronExemples: exOuverts ? 'chevron-down' : 'chevron-right',
      basculerExemples: function () { e.sections[cleEx] = !exOuverts; m.notifier(); },
      exemples: exemples.map(function (x) {
        var ts = (x.tests || []).map(function (id) {
          var t = tests[id], def = t ? LIB.test[t.verdict] : null;
          return { id: id, ton: def ? def.ton : 'neutral', texte: def ? def.texte : 'Absent des tests' };
        });
        var tonExp = x.verdict === 'echec' ? 'destructive' : x.verdict === 'ecartExplique' ? 'info' : 'neutre';
        return {
          titre: x.titre, francais: x.francais, gherkin: x.gherkin, verdict: marque(LIB.verdict[x.verdict]),
          aExplication: !!x.explication, explication: x.explication || '',
          fondExplication: tonExp === 'neutre' ? 'var(--muted)' : 'var(--' + tonExp + '-soft)',
          couleurExplication: tonExp === 'neutre' ? 'var(--foreground)' : 'var(--' + tonExp + ')',
          iconeExplication: x.verdict === 'echec' ? 'ban' : x.verdict === 'ecartExplique' ? 'info' : 'circle-help',
          tests: ts, aTests: ts.length > 0, sansTests: !ts.length
        };
      }),
      nbCode: 'Dans le code · ' + (r.code || []).length,
      aCode: !!(r.code && r.code.length),
      codeOuvert: codeOuvert, chevronCode: codeOuvert ? 'chevron-down' : 'chevron-right',
      basculerCode: function () { e.sections[cleCode] = !codeOuvert; m.notifier(); },
      code: (r.code || []).map(function (c) {
        var nom = nomFonction(c.fonction);
        return {
          regle: c.regle, prefixe: nom.prefixe, nom: nom.nom,
          lignes: 'lignes' + NBSP + c.debut + ' à ' + c.fin,
          voir: function () { m.ouvrirFonctionnalite(f.id, { onglet: 'reperage', fonction: c.fonction }); }
        };
      })
    };
  }

  function colonnesTests() {
    var B = window.BLDemo || {};
    return [
      { key: 'id', header: 'Test', sortable: true, muted: true, render: function (r) { return h('span', { style: { fontFamily: 'var(--tp-mono)', fontSize: 12 } }, r.id); } },
      { key: 'nature', header: 'Nature', sortable: true },
      { key: 'libelle', header: 'Libellé', strong: true, wrap: true },
      { key: 'verdict', header: 'Verdict', sortable: true, render: function (r) { return B.StatusDot ? h(B.StatusDot, { tone: r.ton }, r.verdict) : r.verdict; } },
      { key: 'explication', header: 'Explication', wrap: true, muted: true }
    ];
  }

  function ficheRegles(m, f) {
    var e = m.etat, ix = e.index, r = resumeRegles(e, f), tests = f.tests || null;
    var mere = f.mere ? ix.parId[f.mere] : null, enfants = ix.enfants[f.id] || [];
    var manuel = mere || f, ordre = (manuel.reperage && manuel.reperage.ordre) || null;
    var aretes = (e.donnees.dependances && e.donnees.dependances.aretes) || [];
    var dependDe = aretes.filter(function (x) { return x.source === manuel.id; }).length;
    var requisePar = aretes.filter(function (x) { return x.cible === manuel.id; }).length;
    var manquantes = (ordre && ordre.manquantes) || [];
    var integration = [];
    if (tests && tests.integration) {
      Object.keys(LIB.test).forEach(function (k) {
        var x = tests.integration[k];
        if (x) integration.push({ ton: LIB.test[k].ton, texte: x + NBSP + pl(x, LIB.test[k].un, LIB.test[k].plusieurs) });
      });
    }
    var regles = (f.regles || []).filter(function (x) {
      var s = e.saisies.regles[x.id];
      if (e.filtreRegles === 'aValider') return !s;
      if (e.filtreRegles === 'aRevoir') return s && s.avis === 'aRevoir';
      if (e.filtreRegles === 'validees') return s && s.avis === 'validee';
      return true;
    });
    var videTexte, videTitre = 'Aucune règle métier';
    if (enfants.length) videTexte = 'Les règles de ' + f.id + " s'écrivent dans ses sous-fonctionnalités, extraites et testées seules.";
    else if (f.extraction === 'notExtracted') videTexte = f.id + " n'est pas extraite : ses règles métier s'écriront après l'extraction.";
    else videTexte = "Aucune règle métier n'est écrite pour " + f.id + '.';
    var badges = [marque(LIB.extraction[f.extraction]), marque(LIB.perimetre[(f.reperage && f.reperage.delimitation) || 'aucune'])];
    if (!f.mere && ordre) badges.push(marque({ ton: ordre.statut === 'signalee' ? 'warning' : 'neutral', icone: ordre.statut === 'signalee' ? true : 'list-checks' }, libelleOrdre(ordre)));
    return {
      id: f.id, titre: f.titre,
      page: 'Page' + NBSP + f.page + ' du manuel',
      aMere: !!mere, mereTexte: mere ? mere.id + ' ' + mere.titre : '',
      ouvrirMere: function () { if (mere) m.ouvrirFonctionnalite(mere.id); },
      badges: badges,
      statRegles: r.total ? r.validees + '/' + r.total : '—', libRegles: pl(r.total || 2, 'Règle validée', 'Règles validées'),
      statUnitaires: tests ? (tests.unitaires.ok || 0) + '/' + tests.unitaires.total : '—', libUnitaires: pl(tests ? tests.unitaires.total : 2, 'Test unitaire réussi', 'Tests unitaires réussis'),
      statIntegration: tests ? nb(tests.integration.total) : '—', libIntegration: pl(tests ? tests.integration.total : 2, "Test d'intégration", "Tests d'intégration"),
      integration: integration, aIntegration: integration.length > 0,
      verdictTests: tests ? marque(LIB.verdict[tests.verdict]) : marque(SYNTHESE_VIDE),
      depDe: nb(dependDe), depPar: nb(requisePar), depManquantes: nb(manquantes.length),
      tonManquantes: manquantes.length ? 'warning' : undefined,
      depNote: mere ? 'Celles de sa mère ' + mere.id : '',
      aDepNote: !!mere,
      allerDependances: function () { m.ouvrirFonctionnalite(manuel.id, { onglet: 'dependances' }); },
      aAlerte: f.extraction === 'extractedSansDependances',
      alerte: 'Extraite sans ses dépendances. ' + pl(manquantes.length, 'Manquante', 'Manquantes') + ' : ' + manquantes.map(function (id) { var x = ix.parId[id]; return id + (x ? ' ' + x.titre : ''); }).join(', ') + '.',
      modeItems: [{ value: 'francais', label: 'Français' }, { value: 'gherkin', label: 'Gherkin' }],
      mode: e.mode, enFrancais: e.mode !== 'gherkin', enGherkin: e.mode === 'gherkin',
      surMode: function (v) { m.maj({ mode: v }); },
      aRegles: r.total > 0, sansRegles: !r.total,
      titreRegles: 'Règles métier',
      filtresRegles: [
        { value: 'toutes', label: 'Toutes', count: r.total },
        { value: 'aValider', label: 'À valider', count: r.aValider },
        { value: 'aRevoir', label: 'À revoir', count: r.aRevoir },
        { value: 'validees', label: 'Validées', count: r.validees }
      ],
      filtreRegles: e.filtreRegles,
      surFiltreRegles: function (v) { m.maj({ filtreRegles: v }); },
      regles: regles.map(function (x) { return regleVue(m, f, x); }),
      aucuneDansFiltre: r.total > 0 && !regles.length,
      aDecoupage: !!f.decoupage, decoupage: f.decoupage ? phraseDecoupage(f.decoupage) : '',
      vide: {
        titre: videTitre, texte: videTexte, aSous: enfants.length > 0,
        sous: enfants.map(function (x) {
          var rx = resumeRegles(e, x);
          return {
            id: x.id, titre: x.titre, extraction: point(LIB.extraction[x.extraction]),
            detail: rx.total ? compte(rx.total, 'règle', 'règles') + ', ' + rx.validees + NBSP + pl(rx.validees, 'validée', 'validées') : 'Aucune règle',
            ouvrir: function () { m.ouvrirFonctionnalite(x.id); }
          };
        }),
        aExtractible: !f.mere && !!(ordre && ordre.extractible) && f.extraction === 'notExtracted',
        allerDependances: function () { m.ouvrirFonctionnalite(manuel.id, { onglet: 'dependances' }); },
        allerReperage: function () { m.ouvrirFonctionnalite(f.id, { onglet: 'reperage' }); }
      },
      aQuestions: !!(f.questions && f.questions.length),
      titreQuestions: 'Questions pour le métier · ' + ((f.questions || []).length),
      questions: (f.questions || []).map(function (q) {
        var s = e.saisies.questions[q.id] || null;
        return {
          id: q.id, idChamp: 'tp-rep-' + q.id, texte: q.texte, regles: q.regles || [], aRegles: !!(q.regles && q.regles.length),
          reponse: (s && s.reponse) || '',
          surReponse: function (ev) { m.repondre(q.id, ev.target.value); },
          signature: signer(s), aSignature: !!s,
          etat: s ? marque({ ton: 'success', icone: true }, 'Répondue') : marque({ ton: 'neutral', icone: 'clock' }, 'Sans réponse')
        };
      }),
      aTests: !!(tests && tests.liste && tests.liste.length),
      titreTests: 'Tests · ' + ((tests && tests.liste) || []).length,
      colonnesTests: colonnesTests(),
      lignesTests: ((tests && tests.liste) || []).map(function (t) {
        var def = LIB.test[t.verdict] || { texte: t.verdict, ton: 'neutral' };
        return { id: t.id, nature: LIB.natureTest[t.nature] || t.nature, libelle: t.libelle, verdict: def.texte, ton: def.ton, explication: t.explication || '' };
      })
    };
  }

  T.vues.regles = function (m) {
    var e = m.etat, ix = e.index;
    var q = String(e.rechercheFonc || '').trim().toLowerCase();
    var garde = {}, compteurs = { toutes: 0, avecRegles: 0, aValider: 0 };
    ix.liste.forEach(function (f) {
      var r = resumeRegles(e, f);
      compteurs.toutes++;
      if (r.total) compteurs.avecRegles++;
      if (r.aValider) compteurs.aValider++;
      var ok = e.filtre === 'avecRegles' ? r.total > 0 : e.filtre === 'aValider' ? r.aValider > 0 : true;
      if (ok && q) ok = (f.id + ' ' + f.titre).toLowerCase().indexOf(q) >= 0;
      if (ok) garde[f.id] = 'oui';
    });
    ix.liste.forEach(function (f) { if (garde[f.id] === 'oui' && f.mere && !garde[f.mere]) garde[f.mere] = 'contexte'; });
    var liste = ix.liste.filter(function (f) { return garde[f.id]; }).map(function (f) { return ligneListe(m, f, garde[f.id] === 'contexte'); });
    var f = ix.parId[e.fonctionnaliteId] || null;
    var orph = orphelines(e);
    return {
      question: QUESTIONS.regles,
      rechercheFonc: e.rechercheFonc,
      surRechercheFonc: function (ev) { m.maj({ rechercheFonc: ev.target.value }); },
      filtres: [
        { value: 'toutes', label: 'Toutes', count: compteurs.toutes },
        { value: 'avecRegles', label: 'Avec règles', count: compteurs.avecRegles },
        { value: 'aValider', label: 'À valider', count: compteurs.aValider }
      ],
      filtre: e.filtre,
      surFiltre: function (v) { m.maj({ filtre: v }); },
      liste: liste, listeVide: !liste.length,
      aOrphelines: orph.length > 0,
      orphelinesTexte: compte(orph.length, 'saisie', 'saisies') + ' sans règle ni question dans les données : ' + orph.map(function (o) { return o.id; }).join(', ') + '. ' + pl(orph.length, 'Elle reste', 'Elles restent') + " dans l'export.",
      aFiche: !!f, sansFiche: !f,
      fiche: f ? ficheRegles(m, f) : null
    };
  };

  /* — Dépendances — */

  function cheminArrondi(pts, r) {
    var propres = pts.filter(function (p, i) { return i === 0 || p[0] !== pts[i - 1][0] || p[1] !== pts[i - 1][1]; });
    var fx = function (p) { return Math.round(p[0] * 10) / 10 + ' ' + Math.round(p[1] * 10) / 10; };
    var dist = function (p, q) { return Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]); };
    var d = 'M ' + fx(propres[0]);
    for (var i = 1; i < propres.length - 1; i++) {
      var p0 = propres[i - 1], p1 = propres[i], p2 = propres[i + 1];
      var d1 = dist(p0, p1), d2 = dist(p1, p2), rr = Math.min(r, d1 / 2, d2 / 2);
      var a = [p1[0] + ((p0[0] - p1[0]) * rr) / d1, p1[1] + ((p0[1] - p1[1]) * rr) / d1];
      var b = [p1[0] + ((p2[0] - p1[0]) * rr) / d2, p1[1] + ((p2[1] - p1[1]) * rr) / d2];
      d += ' L ' + fx(a) + ' Q ' + fx(p1) + ' ' + fx(b);
    }
    return d + ' L ' + fx(propres[propres.length - 1]);
  }

  /* Une flèche étrangère à la sélection reste lisible, en retrait. */
  var TRAIT_FAIBLE = 'color-mix(in oklab, var(--muted-foreground) 42%, var(--card))';

  /* Géométrie du graphe. Les gouttières prennent la place libre : assez larges, elles portent le nom de l'objet
     sur la flèche. Quand la place manque, le socle puis les nœuds se resserrent jusqu'à leur largeur minimale ;
     au-delà, le graphe défile. */
  function gabarit(nRangs, maxLignes) {
    var dense = nRangs > 4 || maxLignes > 5;
    return dense
      ? { dense: true, pad: 20, nw: 192, nh: 124, gy: 24, sw: 148, gxMin: 56, nwMin: 164, swMin: 132 }
      : { dense: false, pad: 20, nw: 200, nh: 124, gy: 28, sw: 156, gxMin: 76, nwMin: 200, swMin: 156 };
  }
  /* Sans socle, la colonne du rang 0 et sa gouttière disparaissent. */
  function largeurMinGraphe(nRangs, maxLignes, aSocle) {
    var G = gabarit(nRangs, maxLignes);
    return 2 * G.pad + (aSocle ? G.swMin + G.gxMin : 0) + nRangs * G.nwMin + (nRangs - 1) * G.gxMin;
  }
  function geometrie(nRangs, maxLignes, dispo, aSocle) {
    var G = gabarit(nRangs, maxLignes);
    if (!aSocle) G.sw = G.swMin = 0;
    var gouttieres = Math.max(1, nRangs - (aSocle ? 0 : 1));
    G.gx = Math.floor((dispo - 2 * G.pad - G.sw - nRangs * G.nw) / gouttieres);
    if (G.gx < G.gxMin) {
      G.gx = G.gxMin;
      var manque = 2 * G.pad + G.sw + nRangs * G.nw + gouttieres * G.gx - dispo;
      var surSocle = Math.min(manque, G.sw - G.swMin);
      G.sw -= surSocle;
      manque -= surSocle;
      if (manque > 0) G.nw = Math.max(G.nwMin, G.nw - Math.ceil(manque / nRangs));
    }
    G.gx = Math.min(132, G.gx);
    return G;
  }
  function rangsDuGraphe(ix) {
    var parRang = {};
    ix.liste.forEach(function (f) {
      var o = !f.mere && f.reperage && f.reperage.ordre;
      if (o && o.statut !== 'signalee' && o.rang != null) (parRang[o.rang] = parRang[o.rang] || []).push(f);
    });
    return parRang;
  }

  /* nu : le graphe seul, sans en-têtes de rang, pour montrer un nœud ou une flèche hors de son écran. */
  function disposerGraphe(m, selId, largeurDispo, nu) {
    var e = m.etat, ix = e.index, d = e.donnees;
    var aretes = (d.dependances && d.dependances.aretes) || [];
    var socle = ((d.dependances && d.dependances.socle) || []).slice().sort(function (x, y) { return y.fonctionnalites.length - x.fonctionnalites.length; });
    var parRang = rangsDuGraphe(ix);
    var rangs = Object.keys(parRang).map(Number).sort(function (x, y) { return x - y; });
    if (!rangs.length) return null;

    /* Ordre dans chaque rang : deux passes de barycentre pour rapprocher une fonctionnalité de ses voisines. */
    var pos = {};
    var ordonner = function (r, voisins) {
      var liste = parRang[r].map(function (f, i) {
        var ys = voisins(f).filter(function (id) { return pos[id] != null; }).map(function (id) { return pos[id]; });
        return { f: f, i: i, b: ys.length ? moyenne(ys) : 1e6 };
      });
      liste.sort(function (x, y) { return x.b - y.b || x.i - y.i; });
      parRang[r] = liste.map(function (x) { return x.f; });
      parRang[r].forEach(function (f, i) { pos[f.id] = i; });
    };
    rangs.forEach(function (r) { ordonner(r, function (f) { return aretes.filter(function (x) { return x.source === f.id; }).map(function (x) { return x.cible; }); }); });
    rangs.slice().reverse().forEach(function (r) { ordonner(r, function (f) { return aretes.filter(function (x) { return x.cible === f.id; }).map(function (x) { return x.source; }); }); });

    var maxLignes = Math.max.apply(null, rangs.map(function (r) { return parRang[r].length; }));
    var aSocle = socle.length > 0 && !nu;
    var G = geometrie(rangs.length, maxLignes, nu ? 1e5 : Math.max(640, largeurDispo || 1100), aSocle);
    if (nu) G.gx = 148;
    var PAD = G.pad, HAUT = nu ? 0 : 32;
    var x0 = PAD + (aSocle ? G.sw + G.gx : 0);
    var xCol = function (c) { return x0 + c * (G.nw + G.gx); };
    var yLigne = function (i) { return HAUT + G.gy + i * (G.nh + G.gy); };
    var yVoie = function (k) { return HAUT + G.gy + k * (G.nh + G.gy) - G.gy / 2; };
    var largeur = x0 + rangs.length * G.nw + (rangs.length - 1) * G.gx + PAD;
    var hautLignes = maxLignes * (G.nh + G.gy) - G.gy;
    var hautZone = aSocle ? Math.max(hautLignes, 200) : hautLignes;
    var hauteur = HAUT + G.gy + hautZone + G.gy + (nu ? 0 : PAD);

    var rect = {};
    rangs.forEach(function (r, c) { parRang[r].forEach(function (f, i) { rect[f.id] = { x: xCol(c), y: yLigne(i), c: c, i: i }; }); });
    var liens = aretes.filter(function (x) { return rect[x.source] && rect[x.cible]; }).map(function (x) { return { a: x, s: rect[x.source], t: rect[x.cible] }; });
    var sorties = {}, entrees = {}, voies = {}, gouttieres = {};
    liens.forEach(function (l) {
      (sorties[l.a.source] = sorties[l.a.source] || []).push(l);
      (entrees[l.a.cible] = entrees[l.a.cible] || []).push(l);
      l.saut = l.s.c - l.t.c > 1;
      if (l.saut) {
        var yMoy = (l.s.y + l.t.y) / 2 + G.nh / 2, meilleur = 0, ecart = Infinity;
        for (var k = 0; k <= maxLignes; k++) { var dk = Math.abs(yVoie(k) - yMoy); if (dk <= ecart) { ecart = dk; meilleur = k; } }
        l.voie = meilleur;
        (voies[meilleur] = voies[meilleur] || []).push(l);
        (gouttieres[l.s.c - 1] = gouttieres[l.s.c - 1] || []).push(l);
        (gouttieres[l.t.c] = gouttieres[l.t.c] || []).push(l);
      }
    });
    Object.keys(sorties).forEach(function (id) { sorties[id].sort(function (p, q) { return p.t.y - q.t.y || q.t.c - p.t.c; }); });
    Object.keys(entrees).forEach(function (id) { entrees[id].sort(function (p, q) { return p.s.y - q.s.y || p.s.c - q.s.c; }); });
    var decal = function (liste, l, pas, max) {
      var n = liste.length, p = n > 1 ? Math.min(pas, max / (n - 1)) : 0;
      return (liste.indexOf(l) - (n - 1) / 2) * p;
    };

    var lies = {};
    if (selId) aretes.forEach(function (x) { if (x.source === selId) lies[x.cible] = true; if (x.cible === selId) lies[x.source] = true; });
    /* La sélection ne met le reste en retrait que si elle se voit dans le graphe, elle ou l'une de ses voisines. */
    var focus = !!selId && (!!rect[selId] || Object.keys(lies).some(function (id) { return !!rect[id]; }));
    var toutes = liens.length <= 12;
    var traits = [], etiquettes = [];
    liens.forEach(function (l) {
      var x1 = l.s.x, y1 = l.s.y + G.nh / 2 + decal(sorties[l.a.source], l, 12, G.nh - 36);
      var x2 = l.t.x + G.nw + 3, y2 = l.t.y + G.nh / 2 + decal(entrees[l.a.cible], l, 12, G.nh - 36);
      var chemin, ex, ey;
      if (l.saut) {
        var yv = yVoie(l.voie) + decal(voies[l.voie], l, 5, G.gy - 10);
        /* Les montées se tiennent près des nœuds : le milieu de la gouttière reste aux étiquettes. */
        var g1 = l.s.x - 20 + decal(gouttieres[l.s.c - 1], l, 6, 16);
        var g2 = l.t.x + G.nw + 24 + decal(gouttieres[l.t.c], l, 6, 16);
        chemin = cheminArrondi([[x1, y1], [g1, y1], [g1, yv], [g2, yv], [g2, y2], [x2, y2]], 10);
        ex = (g1 + g2) / 2; ey = yv;
      } else {
        var xm = (x1 + x2) / 2;
        chemin = Math.abs(y1 - y2) < 0.5 ? 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2 : 'M ' + x1 + ' ' + y1 + ' C ' + xm + ' ' + y1 + ', ' + xm + ' ' + y2 + ', ' + x2 + ' ' + y2;
        ex = xm; ey = (y1 + y2) / 2;
      }
      var fort = !!selId && (l.a.source === selId || l.a.cible === selId), faible = focus && !fort;
      var couleur = fort ? 'var(--primary)' : faible ? TRAIT_FAIBLE : 'var(--muted-foreground)';
      traits.push({
        ordre: fort ? 2 : faible ? 0 : 1, d: chemin,
        style: { fill: 'none', stroke: couleur, strokeWidth: fort ? 2 : 1.5, strokeLinecap: 'round', strokeDasharray: l.a.etat === 'candidate' ? '5 5' : undefined },
        marqueur: 'url(#tp-pointe-' + (fort ? 'forte' : faible ? 'faible' : 'normale') + ')',
        titre: l.a.source + ' dépend de ' + l.a.cible + ' par ' + l.a.objet + ' (' + (LIB.etat[l.a.etat] || {}).texte + ')'
      });
      var tient = l.saut || Math.round(String(l.a.objet).length * 6.7) + 14 <= G.gx - 4;
      if (fort || (toutes && tient)) etiquettes.push({ x: Math.round(ex), y: Math.round(ey), texte: l.a.objet, couleur: fort ? 'var(--primary)' : 'var(--muted-foreground)', bordure: fort ? 'var(--ring)' : 'var(--border)' });
    });
    traits.sort(function (p, q) { return p.ordre - q.ordre; });

    var noeuds = [];
    rangs.forEach(function (r) {
      parRang[r].forEach(function (f) {
        var p = rect[f.id], o = f.reperage.ordre, sel = f.id === selId, lie = !!lies[f.id], estompe = focus && !sel && !lie;
        var enfants = ix.enfants[f.id] || [];
        noeuds.push({
          id: f.id, titre: f.titre,
          cadre: 'left: ' + p.x + 'px; top: ' + p.y + 'px; width: ' + G.nw + 'px; height: ' + G.nh + 'px; border-color: ' + (sel ? 'var(--primary)' : lie ? 'var(--ring)' : 'var(--border)') + '; box-shadow: ' + (sel ? '0 0 0 1px var(--primary), var(--shadow-sm)' : 'var(--shadow-xs)') + '; opacity: ' + (estompe ? 0.6 : 1),
          selectionnee: sel,
          extraction: point(LIB.extraction[f.extraction]),
          extractible: !!o.extractible && f.extraction === 'notExtracted',
          partielle: o.statut === 'partielle',
          aSous: enfants.length > 0, sous: String(enfants.length),
          sousTitre: compte(enfants.length, 'sous-fonctionnalité', 'sous-fonctionnalités'),
          pince: 2,
          choisir: function () { m.ouvrirFonctionnalite(f.id); }
        });
      });
    });

    var place = Math.max(0, Math.floor((hautZone - 72) / 26));
    var atteint = function (u) { return !!selId && u.fonctionnalites.indexOf(selId) >= 0; };
    var visibles = socle.slice(0, socle.length > place ? Math.max(0, place - 1) : place);
    var colonnes = nu ? [] : rangs.map(function (r, c) {
      return { cadre: 'left: ' + xCol(c) + 'px; width: ' + G.nw + 'px', titre: 'Rang' + NBSP + r, sous: compte(parRang[r].length, 'fonctionnalité', 'fonctionnalités') };
    });
    if (aSocle) colonnes.unshift({ cadre: 'left: ' + PAD + 'px; width: ' + G.sw + 'px', titre: 'Rang' + NBSP + '0', sous: 'Socle' });
    return {
      largeur: largeur, hauteur: hauteur, boite: '0 0 ' + largeur + ' ' + hauteur,
      colonnes: colonnes,
      aSocle: aSocle,
      socle: {
        cadre: 'left: ' + PAD + 'px; top: ' + yLigne(0) + 'px; width: ' + G.sw + 'px; height: ' + hautZone + 'px',
        compte: compte(socle.length, 'utilitaire partagé', 'utilitaires partagés'),
        items: visibles.map(function (u) { return { objet: u.objet, compte: nb(u.fonctionnalites.length), poids: atteint(u) ? 600 : 400, couleur: atteint(u) ? 'var(--primary)' : 'var(--foreground)' }; }),
        aReste: socle.length > visibles.length, reste: 'et ' + compte(socle.length - visibles.length, 'autre', 'autres')
      },
      traits: traits, etiquettes: etiquettes, noeuds: noeuds,
      aide: toutes ? '' : "Sélectionnez une fonctionnalité pour lire l'objet qui porte chacune de ses dépendances.",
      aAide: !toutes && !selId
    };
  }

  function selectionGraphe(e) {
    var choisie = e.index.parId[e.fonctionnaliteId] || null;
    return choisie ? (choisie.mere ? e.index.parId[choisie.mere] || null : choisie) : null;
  }

  /* Le graphe en couches : calculé à la largeur que le composant mesure. */
  T.vues.graphe = function (m, options) {
    var o = typeof options === 'number' ? { largeur: options } : options || {};
    var sel = selectionGraphe(m.etat);
    var g = disposerGraphe(m, sel ? sel.id : null, o.largeur, !!o.nu);
    return { aGraphe: !!g, sansGraphe: !g, g: g, dessin: g ? dessinerTraits(g) : null };
  };

  /* Les flèches : un seul tracé SVG sous les nœuds. Pleine = dépendance validée, pointillée = proposée. */
  function dessinerTraits(g) {
    var pointe = function (id, couleur, taille) {
      return h('marker', { key: id, id: id, viewBox: '0 0 8 8', refX: 7, refY: 4, markerWidth: taille, markerHeight: taille, markerUnits: 'userSpaceOnUse', orient: 'auto' },
        h('path', { d: 'M0 0.5 L7.5 4 L0 7.5 Z', style: { fill: couleur } }));
    };
    return h('svg', { 'aria-hidden': true, width: g.largeur, height: g.hauteur, viewBox: g.boite, style: { position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' } },
      h('defs', null, pointe('tp-pointe-normale', 'var(--muted-foreground)', 8), pointe('tp-pointe-forte', 'var(--primary)', 9), pointe('tp-pointe-faible', TRAIT_FAIBLE, 8)),
      g.traits.map(function (t, i) { return h('path', { key: i, d: t.d, markerEnd: t.marqueur, style: t.style }); }));
  }

  /* La cause d'une fonctionnalité hors de l'ordre, en une phrase. Dans le tableau, le périmètre et la correspondance
     ont leur colonne : sansStatuts ne garde que les autres causes. */
  function causeHorsOrdre(ix, f, sansStatuts) {
    var rep = f.reperage || {}, o = rep.ordre || {}, causes = o.causes || [], morceaux = [];
    if (!sansStatuts && (!causes.length || causes.indexOf(f.id) >= 0)) {
      if (rep.delimitation !== 'retenue') morceaux.push((LIB.perimetre[rep.delimitation || 'aucune'] || {}).texte.toLowerCase());
      if (rep.correspondance && rep.correspondance.statut !== 'cli') morceaux.push(LIB.correspondance[rep.correspondance.statut].texte.toLowerCase());
    }
    if (o.horsManuel && o.horsManuel.length) morceaux.push(pl(o.horsManuel.length, 'objet', 'objets') + ' hors manuel : ' + o.horsManuel.join(', '));
    var autres = causes.filter(function (id) { return id !== f.id; });
    if (autres.length) morceaux.push('atteint ' + (autres.length > 4 ? autres.slice(0, 4).join(', ') + ' et ' + (autres.length - 4) + ' autres' : autres.join(', ')) + ", hors de l'ordre");
    return majuscule(morceaux.join(' ; ')) || (sansStatuts ? '' : '—');
  }

  function panneauDependances(m, f) {
    var e = m.etat, ix = e.index, rep = f.reperage || {}, o = rep.ordre || {};
    var aretes = (e.donnees.dependances && e.donnees.dependances.aretes) || [];
    var lien = function (x, id) {
      var g = ix.parId[id];
      return {
        id: id, titre: g ? g.titre : 'hors des données', objet: x.objet,
        etat: marque(LIB.etat[x.etat]), confiance: 'confiance ' + libelleConfiance(x.confiance),
        extraction: g ? point(LIB.extraction[g.extraction]) : point(null),
        ouvrir: function () { if (g) m.ouvrirFonctionnalite(id); }
      };
    };
    var dependDe = aretes.filter(function (x) { return x.source === f.id; }).map(function (x) { return lien(x, x.cible); });
    var requisePar = aretes.filter(function (x) { return x.cible === f.id; }).map(function (x) { return lien(x, x.source); });
    var manquantes = (o.manquantes || []).map(function (id) { var g = ix.parId[id]; return { id: id, titre: g ? g.titre : '', extraction: g ? point(LIB.extraction[g.extraction]) : point(null), ouvrir: function () { if (g) m.ouvrirFonctionnalite(id); } }; });
    var enfants = (ix.enfants[f.id] || []).map(function (x) {
      return { id: x.id, titre: x.titre, extraction: point(LIB.extraction[x.extraction]), ouvrir: function () { m.ouvrirFonctionnalite(x.id, { onglet: 'regles' }); } };
    });
    var badges = [marque({ ton: o.statut === 'signalee' ? 'warning' : 'neutral', icone: o.statut === 'signalee' ? true : 'list-checks' }, libelleOrdre(o) || 'Sans ordre'), marque(LIB.extraction[f.extraction])];
    if (o.extractible && f.extraction === 'notExtracted') badges.push(marque({ ton: 'info', icone: true }, 'Extractible'));
    badges.push(marque(LIB.perimetre[rep.delimitation || 'aucune']));
    if (rep.correspondance) badges.push(marque(LIB.correspondance[rep.correspondance.statut]));
    var cDependDe = couper(m, 'dep:' + f.id, dependDe, 6), cRequisePar = couper(m, 'req:' + f.id, requisePar, 6), cManquantes = couper(m, 'manq:' + f.id, manquantes, 6);
    return {
      id: f.id, titre: f.titre, page: 'Page' + NBSP + f.page + ' du manuel', badges: badges,
      nbDependDe: 'Dépend de · ' + dependDe.length, dependDe: cDependDe.liste, plusDependDe: cDependDe.plus, sansDependDe: !dependDe.length,
      nbRequisePar: 'Requise par · ' + requisePar.length, requisePar: cRequisePar.liste, plusRequisePar: cRequisePar.plus, sansRequisePar: !requisePar.length,
      nbManquantes: 'Manquantes · ' + manquantes.length, manquantes: cManquantes.liste, plusManquantes: cManquantes.plus, sansManquantes: !manquantes.length,
      nbHorsManuel: 'Objets hors manuel · ' + (o.horsManuel || []).length, horsManuel: o.horsManuel || [], sansHorsManuel: !(o.horsManuel && o.horsManuel.length),
      nbSous: 'Sous-fonctionnalités · ' + enfants.length, sous: enfants, sansSous: !enfants.length,
      aCause: o.statut === 'signalee', cause: o.statut === 'signalee' ? causeHorsOrdre(ix, f) : '',
      allerRegles: function () { m.ouvrirFonctionnalite(f.id, { onglet: 'regles' }); },
      allerReperage: function () { m.ouvrirFonctionnalite(f.id, { onglet: 'reperage' }); }
    };
  }

  function colonnesHorsOrdre() {
    var B = window.BLDemo || {};
    var mono = { fontFamily: 'var(--tp-mono)', fontSize: 12 };
    return [
      { key: 'id', header: 'Fonctionnalité', sortable: true, width: 132, muted: true, render: function (r) { return h('span', { style: mono }, r.id); } },
      { key: 'titre', header: 'Titre', sortable: true, strong: true, wrap: true },
      { key: 'perimetre', header: 'Périmètre', sortable: true, render: function (r) { return B.StatusDot ? h(B.StatusDot, { tone: r.tonPerimetre }, r.perimetre) : r.perimetre; } },
      { key: 'chemin', header: 'Correspondance', sortable: true, render: function (r) { return B.StatusDot ? h(B.StatusDot, { tone: r.tonChemin }, r.chemin) : r.chemin; } },
      { key: 'cause', header: 'Autre cause', sortable: true, wrap: true, render: function (r) { return r.cause || h('span', { style: { color: 'var(--muted-foreground)' } }, '—'); } }
    ];
  }

  T.vues.dependances = function (m) {
    var e = m.etat, ix = e.index, d = e.donnees;
    var manuel = ix.liste.filter(function (f) { return !f.mere; });
    var sel = selectionGraphe(e);
    var ordonnees = 0;
    var n = { extraites: 0, extractibles: 0, sansDep: 0, hors: 0 };
    var alertes = [], hors = [], perim = { aucune: 0, candidate: 0, retenue: 0 }, chemins = { repli: 0, 'sans-correspondance': 0 };
    manuel.forEach(function (f) {
      var rep = f.reperage || {}, o = rep.ordre || {};
      if (f.extraction === 'extracted') n.extraites++;
      if (f.extraction === 'extractedSansDependances') {
        n.sansDep++;
        alertes.push({
          id: f.id, titre: f.titre,
          manquantes: (o.manquantes || []).map(function (id) { var g = ix.parId[id]; return { id: id, titre: g ? g.titre : '', ouvrir: function () { m.ouvrirFonctionnalite(id); } }; }),
          nbManquantes: pl((o.manquantes || []).length, 'il manque', 'il manque'),
          ouvrir: function () { m.ouvrirFonctionnalite(f.id); }
        });
      }
      if (o.extractible && f.extraction === 'notExtracted') n.extractibles++;
      if (o.statut && o.statut !== 'signalee' && o.rang != null) ordonnees++;
      if (o.statut === 'signalee') {
        n.hors++;
        perim[rep.delimitation || 'aucune']++;
        if (rep.correspondance && chemins[rep.correspondance.statut] != null) chemins[rep.correspondance.statut]++;
        var c = rep.correspondance ? LIB.correspondance[rep.correspondance.statut] : { texte: '—', ton: 'neutral' };
        var p = LIB.perimetre[rep.delimitation || 'aucune'];
        hors.push({ id: f.id, titre: f.titre, perimetre: p.texte, tonPerimetre: p.ton, chemin: c.texte, tonChemin: c.ton, cause: causeHorsOrdre(ix, f, true) });
      }
    });
    var socle =((d.dependances && d.dependances.socle) || []).slice().sort(function (x, y) { return y.fonctionnalites.length - x.fonctionnalites.length || (x.objet < y.objet ? -1 : 1); });
    var maxSocle = socle.length ? socle[0].fonctionnalites.length : 1;
    var manque = [];
    if (perim.aucune) manque.push(compte(perim.aucune, 'périmètre non étudié', 'périmètres non étudiés'));
    if (perim.candidate) manque.push(compte(perim.candidate, 'périmètre proposé à valider', 'périmètres proposés à valider'));
    if (chemins.repli) manque.push(compte(chemins.repli, 'chemin non établi', 'chemins non établis'));
    if (chemins['sans-correspondance']) manque.push(compte(chemins['sans-correspondance'], 'ligne sans correspondance', 'lignes sans correspondance'));
    var nbAretes = ((d.dependances && d.dependances.aretes) || []).length;
    var tri = e.triHors || null;
    if (tri) {
      hors.sort(function (x, y) {
        var r = String(x[tri.key] == null ? '' : x[tri.key]).localeCompare(String(y[tri.key] == null ? '' : y[tri.key]), 'fr', { numeric: true });
        return tri.dir === 'desc' ? -r : r;
      });
    }
    var PAR_PAGE = 25, pages = Math.max(1, Math.ceil(hors.length / PAR_PAGE)), page = Math.min(Math.max(1, e.pageHors || 1), pages);
    var nbHors = hors.length;
    hors = hors.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);
    /* Le panneau de la sélection ne tient à côté du graphe que si le graphe garde sa largeur minimale. */
    var parRang = rangsDuGraphe(ix), nRangs = Object.keys(parRang).length;
    var maxLignes = nRangs ? Math.max.apply(null, Object.keys(parRang).map(function (r) { return parRang[r].length; })) : 0;
    return {
      question: QUESTIONS.dependances,
      baseGraphe: nRangs ? largeurMinGraphe(nRangs, maxLignes, socle.length > 0) + 2 + 'px' : '100%',
      stats: [
        { valeur: nb(manuel.length), libelle: pl(manuel.length, 'Fonctionnalité', 'Fonctionnalités') },
        { valeur: nb(n.extraites), libelle: pl(n.extraites, 'Extraite', 'Extraites') },
        { valeur: nb(n.extractibles), libelle: pl(n.extractibles, 'Extractible', 'Extractibles'), ton: n.extractibles ? 'info' : undefined },
        { valeur: nb(n.sansDep), libelle: pl(n.sansDep, 'Extraite sans ses dépendances', 'Extraites sans leurs dépendances'), ton: n.sansDep ? 'warning' : undefined },
        { valeur: nb(n.hors), libelle: "Hors de l'ordre" }
      ],
      triHors: tri, surTriHors: function (t) { m.maj({ triHors: t || null, pageHors: 1 }); },
      pageHors: page, pagesHors: pages, plusieursPagesHors: pages > 1, totalHors: nbHors, parPageHors: PAR_PAGE,
      surPageHors: function (p) { m.maj({ pageHors: p }); },
      alertes: alertes,
      aGraphe: ordonnees > 0, sansGraphe: !ordonnees,
      videTitre: "Aucune fonctionnalité n'est encore dans l'ordre d'extraction",
      videTexte: "Une fonctionnalité prend un rang quand son périmètre est validé et que tout ce qu'elle atteint reste dans le manuel.",
      videManque: manque.length ? 'Il manque : ' + manque.join(', ') + '.' : '',
      videAretes: nbAretes ? compte(nbAretes, 'dépendance déjà relevée', 'dépendances déjà relevées') + ', ' + compte(socle.length, 'objet', 'objets') + ' au socle.' : '',
      aSelection: !!sel, sansSelection: !sel,
      panneau: sel ? panneauDependances(m, sel) : null,
      titreSocle: 'Socle · ' + socle.length,
      socle: socle.map(function (u) {
        var touche = !!sel && u.fonctionnalites.indexOf(sel.id) >= 0;
        return {
          objet: u.objet, compte: nb(u.fonctionnalites.length),
          lecture: u.objet + ' : ' + compte(u.fonctionnalites.length, 'fonctionnalité', 'fonctionnalités'),
          part: Math.max(4, Math.round((u.fonctionnalites.length / maxSocle) * 100)) + '%',
          couleur: touche ? 'var(--primary)' : 'var(--foreground)', poids: touche ? 600 : 400,
          titre: u.fonctionnalites.join(', ')
        };
      }),
      socleNote: sel ? 'En indigo : les utilitaires que ' + sel.id + ' atteint.' : '',
      aSocleNote: !!sel,
      aHors: nbHors > 0, sansHors: !nbHors,
      titreHors: "Hors de l'ordre · " + nbHors,
      colonnesHors: colonnesHorsOrdre(),
      lignesHors: hors,
      choisirHors: function (r) { m.ouvrirFonctionnalite(r.id); }
    };
  };

  /* ───────────── Bloc Gherkin : découpe une ligne en segments colorés, sans toucher aux espaces ───────────── */

  var MOTS = ['Fonctionnalité:', 'Règle:', 'Contexte:', 'Plan du scénario:', 'Plan du Scénario:', 'Scénario:', 'Exemples:', 'Étant donné que', "Étant donné qu'", 'Étant donné', 'Soit', 'Quand', 'Lorsque', "Lorsqu'", 'Alors', 'Et que', "Et qu'", 'Et', 'Mais'];
  T.gherkin = function (texte) {
    var lignes = String(texte == null ? '' : texte).replace(/\s+$/, '').split('\n');
    var enTableau = false;
    return lignes.map(function (l, i) {
      var x = /^(\s*)(.*)$/.exec(l), retrait = x[1], reste = x[2], segs = [];
      if (retrait) segs.push({ t: retrait, c: 'inherit', w: 400 });
      if (reste.charAt(0) === '|') {
        var entete = !enTableau;
        enTableau = true;
        reste.split(/(\|)/).forEach(function (p) {
          if (p === '') return;
          segs.push(p === '|' ? { t: '|', c: 'var(--input)', w: 400 } : { t: p, c: 'inherit', w: entete ? 600 : 400 });
        });
      } else {
        enTableau = false;
        var mot = null;
        for (var k = 0; k < MOTS.length && !mot; k++) {
          var cand = MOTS[k], fin = cand.slice(-1);
          if (reste.indexOf(cand) === 0 && (fin === ':' || fin === "'" || reste.length === cand.length || reste.charAt(cand.length) === ' ')) mot = cand;
        }
        if (mot) { segs.push({ t: mot, c: 'var(--primary)', w: 600 }); reste = reste.slice(mot.length); }
        reste.split(/(<[^<>]+>)/).forEach(function (p) {
          if (!p) return;
          segs.push(/^<[^<>]+>$/.test(p) ? { t: p, c: 'var(--info)', w: 600 } : { t: p, c: 'inherit', w: 400 });
        });
      }
      if (!segs.length) segs.push({ t: ' ', c: 'inherit', w: 400 });
      return { n: i + 1, segs: segs };
    });
  };

  /* ───────────── Raccord entre un artboard et son état ───────────── */

  var CLES = ['jeu', 'onglet', 'theme', 'fonctionnalite', 'fonction', 'occurrence', 'recherche', 'mode', 'filtre', 'dialogue', 'auteur', 'saisiesLocales', 'importTexte', 'importErreur', 'importMessage', 'deplier', 'renvois', 'zoom', 'niveaux'];
  T.attacher = function (logique, nomVue) {
    var lien = { magasin: null, propre: false, off: null, cle: null, monte: false };
    function detacher() { if (lien.off) { lien.off(); lien.off = null; } }
    function abonner() { if (lien.propre && lien.monte && !lien.off) lien.off = lien.magasin.abonner(function () { logique.forceUpdate(); }); }
    function preparer() {
      var p = logique.props || {};
      if (p.magasin) {
        if (lien.magasin !== p.magasin) { detacher(); lien.magasin = p.magasin; lien.propre = false; }
        return;
      }
      var o = {};
      CLES.forEach(function (k) { if (p[k] != null && p[k] !== '') o[k] = p[k]; });
      var cle = JSON.stringify(o);
      if (!lien.magasin || !lien.propre || cle !== lien.cle) {
        detacher();
        lien.magasin = T.creerMagasin(o); lien.propre = true; lien.cle = cle;
        abonner();
      }
    }
    lien.monter = function () { lien.monte = true; preparer(); abonner(); };
    lien.demonter = function () { lien.monte = false; detacher(); };
    lien.vue = function (extra) {
      preparer();
      var v = nomVue ? T.vues[nomVue](lien.magasin, extra) : {};
      v.magasin = lien.magasin;
      v.theme = lien.magasin.etat.theme;
      v.marge = lien.propre && nomVue !== 'coquille' ? 'var(--space-6)' : '0';
      return v;
    };
    return lien;
  };

  T.MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";
})();
