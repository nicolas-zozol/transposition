// Essai des jeux de volumes hors navigateur : cohérence interne et volumes annoncés.
// usage : node essai-volumes.js <dossier project> [--arbre]
const path = require('path');
const fs = require('fs');
const vm = require('vm');

const projet = process.argv[2];
const React = { createElement: (t, p, ...c) => ({ t, p, c }), Fragment: 'Fragment' };
const window = { React, BLDemo: { StatusDot: 'StatusDot', Badge: 'Badge' } };
const ctx = vm.createContext({ window, navigator: {}, setTimeout, console, URL, Blob });
for (const f of ['transposition-exemple.js', 'transposition-volumes.js', 'transposition.js']) {
  vm.runInContext(fs.readFileSync(path.join(projet, f), 'utf8'), ctx, { filename: f });
}
const T = window.Transposition, V = window.TranspositionVolumes, EX = window.TranspositionExemple;
let echecs = 0;
const ok = (cond, msg) => { if (!cond) { echecs++; console.log('ECHEC :', msg); } };
const egal = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), msg + ' : ' + JSON.stringify(a) + ' ≠ ' + JSON.stringify(b));

// 1. Le calcul de taille retrouve toutes les tailles de l'exemple fourni.
{
  const copie = JSON.parse(JSON.stringify(EX));
  V.mesurer(copie.fonctions, copie.arbres);
  let n = 0;
  const comparer = (a, b, ou) => {
    egal(a.taille, b.taille, 'taille ' + ou); n++;
    (a.appels || []).forEach((x, i) => { if (x.appels) comparer(x, b.appels[i], ou + ' > ' + x.fonction); else ok(!x.taille === !b.appels[i].taille, 'taille inattendue ' + ou + ' > ' + x.fonction); });
  };
  Object.keys(EX.arbres).forEach((sig) => comparer(copie.arbres[sig], EX.arbres[sig], sig));
  console.log('exemple : ' + n + ' tailles recalculées');
}

// 2. État de départ
const d = V.depart();
const manuel = d.fonctionnalites.filter((f) => !f.mere);
ok(manuel.length === 61, 'lignes du manuel : ' + manuel.length);
ok(new Set(d.fonctionnalites.map((f) => f.id)).size === d.fonctionnalites.length, 'identifiants de fonctionnalité uniques');
ok(manuel.every((f) => f.reperage.ordre.statut === 'signalee' && f.reperage.ordre.rang == null), 'toutes hors de l\'ordre');
const titres = d.fonctionnalites.map((f) => f.titre.length);
ok(Math.max(...titres) === 63, 'titre le plus long : ' + Math.max(...titres) + ' (' + d.fonctionnalites.find((f) => f.titre.length === Math.max(...titres)).titre + ')');
ok(d.dependances.aretes.length === 15 && d.dependances.aretes.every((a) => a.source === 'F22.1' && a.etat === 'candidate'), 'dépendances : ' + d.dependances.aretes.length);
ok(new Set(d.dependances.aretes.map((a) => a.cible)).size === 15, 'cibles distinctes');
ok(d.dependances.aretes.every((a) => manuel.some((f) => f.id === a.cible)), 'cibles dans le manuel');
ok(d.dependances.socle.length === 38, 'socle : ' + d.dependances.socle.length);
ok(new Set(d.dependances.socle.map((u) => u.objet)).size === 38, 'objets du socle distincts');
const corr = {};
manuel.forEach((f) => { corr[f.reperage.correspondance.statut] = (corr[f.reperage.correspondance.statut] || 0) + 1; });
console.log('correspondances :', JSON.stringify(corr));
ok(manuel.every((f) => (f.reperage.correspondance.statut === 'sans-correspondance') === !f.reperage.signature), 'signature absente sans correspondance');
ok(new Set(manuel.filter((f) => f.reperage.signature).map((f) => f.reperage.signature)).size === manuel.filter((f) => f.reperage.signature).length, 'signatures distinctes');

// 3. L'arbre de F22.1
const sig = 'w_facturation.ue_facturer_dossier';
const arbre = d.arbres[sig];
ok(Object.keys(d.arbres).length === 1, 'un seul arbre');
console.log('taille F22.1 :', JSON.stringify(arbre.taille));
egal([arbre.taille.fonctions, arbre.taille.lignes, arbre.taille.profondeur, arbre.taille.datawindows, arbre.taille.nonResolus, arbre.taille.posts], [90, 2696, 9, 13, 192, 11], 'volumes de l\'arbre');
const noeuds = [];
(function voir(liste, niveau, parent) { (liste || []).forEach((a) => { noeuds.push({ a, niveau, parent }); voir(a.appels, niveau + 1, a.fonction); }); })(arbre.appels, 1, sig);
const parMode = {};
noeuds.forEach((n) => { parMode[n.a.mode] = (parMode[n.a.mode] || 0) + 1; });
console.log('appels :', noeuds.length, JSON.stringify(parMode), '| différés', noeuds.filter((n) => n.a.post).length);
const renvois = {};
noeuds.filter((n) => n.a.mode === 'reference').forEach((n) => { renvois[n.a.fonction] = (renvois[n.a.fonction] || 0) + 1; });
console.log('fonctions à renvois :', Object.keys(renvois).length, '| renvois :', Object.values(renvois).reduce((x, y) => x + y, 0));
console.log(Object.entries(renvois).sort((x, y) => y[1] - x[1]).map(([k, v]) => k.split('.').pop() + ' ' + v).join(', '));
ok(Object.keys(renvois).length === 19, 'fonctions à plusieurs appelants : ' + Object.keys(renvois).length);
ok(Object.values(renvois).reduce((x, y) => x + y, 0) === 114, 'renvois : ' + Object.values(renvois).reduce((x, y) => x + y, 0));
const dev = Object.keys(d.fonctions).filter((id) => d.fonctions[id].lignes != null);
ok(dev.length === 90, 'fonctions développées : ' + dev.length);
ok(Math.max(...dev.map((id) => d.fonctions[id].lignes)) === 433, 'plus grosse fonction : ' + Math.max(...dev.map((id) => d.fonctions[id].lignes)));
const ids = Object.keys(d.fonctions);
ok(Math.max(...ids.map((id) => id.length)) === 65, 'identifiant le plus long : ' + Math.max(...ids.map((id) => id.length)));
ok(Math.max(...ids.map((id) => d.fonctions[id].fichier.length)) === 60, 'chemin le plus long : ' + Math.max(...ids.map((id) => d.fonctions[id].fichier.length)));
ok(noeuds.every((n) => d.fonctions[n.a.fonction]), 'chaque appel nomme une fonction du registre');
// lignes d'appel : dans le corps de l'appelant, croissantes
{
  const corps = (id) => d.fonctions[id];
  const verifier = (id, liste) => {
    let prec = 0;
    (liste || []).forEach((a) => {
      const f = corps(id);
      ok(a.ligne > f.debut && a.ligne < f.debut + f.lignes, 'ligne hors du corps : ' + id + ' -> ' + a.fonction + ' ' + a.ligne + ' [' + f.debut + ', ' + (f.debut + f.lignes) + ']');
      ok(a.ligne > prec, 'lignes non croissantes dans ' + id);
      prec = a.ligne;
      if (a.appels) verifier(a.fonction, a.appels);
    });
  };
  verifier(sig, arbre.appels);
}
// fonctions d'un même fichier : pas de chevauchement
{
  const parFichier = {};
  dev.forEach((id) => { (parFichier[d.fonctions[id].fichier] = parFichier[d.fonctions[id].fichier] || []).push(d.fonctions[id]); });
  Object.keys(parFichier).forEach((f) => {
    const l = parFichier[f].sort((x, y) => x.debut - y.debut);
    for (let i = 1; i < l.length; i++) ok(l[i].debut > l[i - 1].debut + l[i - 1].lignes, 'chevauchement dans ' + f);
  });
  console.log('fichiers :', Object.keys(parFichier).length, '| registre :', ids.length, 'fonctions');
}
// arrêts : objets jamais développés, jamais au socle ; chaque arrêt est appelé ; arêtes = arrêts vers d'autres fonctionnalités
{
  const socle = new Set(d.dependances.socle.map((u) => u.objet));
  const appeles = new Set(noeuds.filter((n) => n.a.mode === 'arret').map((n) => d.fonctions[n.a.fonction].objet));
  ok(arbre.arrets.length === arbre.taille.arrets, 'arrêts déclarés ' + arbre.arrets.length + ' / comptés ' + arbre.taille.arrets);
  arbre.arrets.forEach((x) => {
    ok(!socle.has(x.objet), 'arrêt au socle : ' + x.objet);
    ok(appeles.has(x.objet), 'arrêt jamais appelé : ' + x.objet);
    ok(!dev.some((id) => d.fonctions[id].objet === x.objet), 'objet d\'arrêt développé : ' + x.objet);
  });
  const paires = [];
  arbre.arrets.forEach((x) => (x.fonctionnalites || []).forEach((c) => paires.push(x.objet + '>' + c)));
  egal(paires.sort(), d.dependances.aretes.map((a) => a.objet + '>' + a.cible).sort(), 'arêtes = arrêts vers une fonctionnalité');
  const socleArbre = new Set(dev.map((id) => d.fonctions[id].objet).filter((o) => socle.has(o)));
  console.log('arrêts :', arbre.arrets.length, '| objets du socle dans l\'arbre :', socleArbre.size, '| niveau max', Math.max(...noeuds.map((n) => n.niveau)));
  const profonds = noeuds.filter((n) => n.niveau === 9).map((n) => n.a.fonction + ' (' + n.a.mode + ')');
  console.log('niveau 9 :', profonds.join(', '));
}
if (process.argv.includes('--arbre')) {
  (function ecrire(liste, niveau) { (liste || []).forEach((a) => { console.log('  '.repeat(niveau) + a.fonction + ' @' + a.ligne + ' ' + a.mode + (a.post ? ' post' : '') + (a.taille ? ' ' + JSON.stringify(a.taille) : '')); ecrire(a.appels, niveau + 1); }); })(arbre.appels, 1);
}

// 4. La fiche F04.1.a
{
  const f = d.fonctionnalites.find((x) => x.id === 'F04.1.a');
  const ex = f.regles.flatMap((r) => r.exemples);
  egal([f.regles.length, ex.length, f.tests.unitaires.total, f.tests.integration.total, f.questions.length], [14, 35, 14, 29, 5], 'volumes de la fiche');
  console.log('tests :', JSON.stringify(f.tests.unitaires), JSON.stringify(f.tests.integration), f.tests.verdict);
  const dc = f.decoupage;
  ok(dc.gardees === dc.couvertes + dc.techniques + dc.sansTest && dc.gardees + dc.coupees === 55, 'découpage : ' + JSON.stringify(dc));
  ok(dc.couvertes === f.regles.reduce((n, r) => n + r.code.length, 0), 'règles de code couvertes');
  const testsId = new Set(f.tests.liste.map((t) => t.id));
  ok(testsId.size === f.tests.liste.length, 'identifiants de test uniques');
  ex.forEach((e) => {
    (e.tests || []).forEach((id) => ok(testsId.has(id), 'test inconnu ' + id + ' dans ' + e.titre));
    ok(e.verdict === 'conforme' || !!e.explication, 'explication attendue : ' + e.titre);
    ok(e.verdict !== 'conforme' || !e.explication, 'explication superflue : ' + e.titre);
    ok(e.gherkin.endsWith('\n') && e.gherkin.split('\n')[0].endsWith(e.titre), 'gherkin : ' + e.titre);
  });
  const cites = new Set(ex.flatMap((e) => e.tests || []));
  console.log('tests cités par un exemple :', cites.size, '/', f.tests.liste.length, '| non cités :', f.tests.liste.filter((t) => !cites.has(t.id)).map((t) => t.id).join(', '));
  const verdicts = {};
  ex.forEach((e) => { verdicts[e.verdict] = (verdicts[e.verdict] || 0) + 1; });
  console.log('verdicts des exemples :', JSON.stringify(verdicts));
  const longueurs = ex.map((e) => e.gherkin.trimEnd().split('\n').length);
  ok(Math.max(...longueurs) === 24, 'Gherkin le plus long : ' + Math.max(...longueurs));
  const colonnes = ex.flatMap((e) => e.gherkin.split('\n').filter((l) => l.trim().startsWith('|')).map((l) => l.split('|').length - 2));
  ok(Math.max(...colonnes) === 12, 'tableau le plus large : ' + Math.max(...colonnes));
  // tableaux alignés : dans un bloc de lignes de tableau consécutives, les barres sont aux mêmes colonnes
  ex.forEach((e) => {
    let ref = null;
    e.gherkin.split('\n').forEach((l) => {
      if (!l.trim().startsWith('|')) { ref = null; return; }
      const pos = [...l].map((c, i) => (c === '|' ? i : -1)).filter((i) => i >= 0).join(',');
      if (ref == null) ref = pos; else ok(pos === ref, 'tableau non aligné : ' + e.titre);
    });
  });
  const largeur = Math.max(...ex.flatMap((e) => e.gherkin.split('\n').map((l) => l.length)));
  console.log('ligne Gherkin la plus large :', largeur, 'caractères');
  f.regles.forEach((r) => r.code.forEach((c) => ok(Number.isInteger(c.debut) && Number.isInteger(c.fin) && c.fin >= c.debut, 'emplacement ' + c.regle + ' ' + c.debut + '-' + c.fin)));
  Object.keys(d.saisies.regles).forEach((id) => ok(f.regles.some((r) => r.id === id), 'saisie sans règle ' + id));
  Object.keys(d.saisies.questions).forEach((id) => ok(f.questions.some((q) => q.id === id), 'saisie sans question ' + id));
}

// 5. État intermédiaire
const di = V.intermediaire();
{
  const man = di.fonctionnalites.filter((f) => !f.mere);
  const parId = {};
  di.fonctionnalites.forEach((f) => { parId[f.id] = f; });
  ok(man.length === 61, 'intermédiaire, lignes du manuel : ' + man.length);
  ok(new Set(di.fonctionnalites.map((f) => f.id)).size === di.fonctionnalites.length, 'intermédiaire, identifiants uniques');
  const ordonnees = man.filter((f) => f.reperage.ordre.statut !== 'signalee');
  const parRang = {};
  ordonnees.forEach((f) => { parRang[f.reperage.ordre.rang] = (parRang[f.reperage.ordre.rang] || 0) + 1; });
  console.log('intermédiaire :', ordonnees.length, 'ordonnées', JSON.stringify(parRang), '|', man.length - ordonnees.length, 'hors de l\'ordre |', di.dependances.aretes.length, 'arêtes |', Object.keys(di.arbres).length, 'arbres |', Object.keys(di.fonctions).length, 'fonctions |', di.fonctionnalites.length - man.length, 'sous-fonctionnalités');
  egal(parRang, { 1: 8, 2: 8, 3: 6, 4: 4, 5: 3, 6: 2 }, 'répartition par rang');
  const aretes = di.dependances.aretes;
  aretes.forEach((a) => {
    ok(parId[a.source] && parId[a.cible] && !parId[a.source].mere && !parId[a.cible].mere, 'arête hors manuel ' + a.source + '>' + a.cible);
    const s = parId[a.source].reperage.ordre, c = parId[a.cible].reperage.ordre;
    if (s.statut !== 'signalee') ok(c.statut !== 'signalee' && c.rang < s.rang, 'rang ' + a.source + ' (' + s.rang + ') > ' + a.cible + ' (' + c.rang + ')');
  });
  ordonnees.forEach((f) => {
    const o = f.reperage.ordre, cibles = aretes.filter((a) => a.source === f.id).map((a) => parId[a.cible].reperage.ordre.rang);
    ok(o.rang === 1 + Math.max(0, ...cibles), 'rang de ' + f.id);
    ok(o.extractible === !(o.manquantes && o.manquantes.length), 'extractible ' + f.id);
    if (f.extraction === 'extractedSansDependances') ok(o.manquantes && o.manquantes.length, 'extraite sans dépendances mais rien ne manque : ' + f.id);
    if (f.extraction === 'extracted') ok(!o.manquantes, 'extraite avec des manquantes : ' + f.id + ' ' + JSON.stringify(o.manquantes));
    ok(f.reperage.correspondance.statut === 'cli' && f.reperage.delimitation !== 'aucune', 'ordonnée sans chemin ou sans périmètre : ' + f.id);
  });
  const ext = {};
  man.forEach((f) => { ext[f.extraction] = (ext[f.extraction] || 0) + 1; });
  console.log('extraction :', JSON.stringify(ext), '| extractibles :', man.filter((f) => f.reperage.ordre.extractible && f.extraction === 'notExtracted').map((f) => f.id).join(' '));
  console.log('arêtes dessinées :', aretes.filter((a) => parId[a.source].reperage.ordre.rang && parId[a.cible].reperage.ordre.rang).length, '| sauts de rang :', aretes.filter((a) => parId[a.source].reperage.ordre.rang - parId[a.cible].reperage.ordre.rang > 1).length);
  // les arbres de l'exemple sont intacts
  Object.keys(EX.arbres).forEach((s) => egal(di.arbres[s], EX.arbres[s], 'arbre de l\'exemple ' + s));
  egal(di.arbres[sig].taille, d.arbres[sig].taille, 'taille de F22.1 inchangée');
  // tailles cohérentes dans le registre fusionné
  const copie = JSON.parse(JSON.stringify(di));
  V.mesurer(copie.fonctions, copie.arbres);
  Object.keys(di.arbres).forEach((s) => egal(copie.arbres[s].taille, di.arbres[s].taille, 'taille recalculée ' + s));
  // l'application lit les deux jeux sans erreur
  for (const jeu of ['depart', 'intermediaire']) {
    for (const onglet of ['reperage', 'regles', 'dependances']) {
      const m = T.creerMagasin({ jeu, onglet, fonctionnalite: onglet === 'regles' ? 'F04.1.a' : 'F22.1' });
      T.vues.coquille(m); T.vues.reperage(m); T.vues.regles(m); T.vues.dependances(m); T.vues.graphe(m, 1500);
    }
  }
  const m = T.creerMagasin({ jeu: 'depart', fonctionnalite: 'F22.1' });
  const v = T.vues.reperage(m);
  console.log('Repérage F22.1 :', v.stats.map((s) => String(s.valeur).replace(/ /g, ' ')).join(' | '), '|', v.lignes.length, 'lignes visibles');
  const profond = T.indexer(d).arbres[sig].noeuds.filter((n) => n.profondeur === 9);
  console.log('clés des nœuds de niveau 9 :', profond.map((n) => n.cle + ' ' + n.fonction).join(' ; '));
  const md = T.creerMagasin({ jeu: 'depart', onglet: 'dependances', fonctionnalite: 'F22.1' });
  const vd = T.vues.dependances(md);
  console.log('Dépendances départ :', vd.stats.map((s) => s.valeur + ' ' + s.libelle).join(' | '), '|', vd.videManque, '|', vd.videAretes);
  console.log('cause F22.1 :', vd.lignesHors.concat(T.vues.dependances((md.maj({ pageHors: 2 }), md)).lignesHors).find((l) => l.id === 'F22.1').cause);
  const mi = T.creerMagasin({ jeu: 'intermediaire', onglet: 'dependances', fonctionnalite: 'F07.1' });
  const vi = T.vues.dependances(mi);
  console.log('Dépendances intermédiaire :', vi.stats.map((s) => s.valeur + ' ' + s.libelle).join(' | '), '| alertes', vi.alertes.map((a) => a.id).join(','));
  const g = T.vues.graphe(mi, 1560).g;
  console.log('graphe :', g.largeur + 'x' + g.hauteur, '|', g.noeuds.length, 'nœuds |', g.traits.length, 'traits |', g.etiquettes.length, 'étiquettes');
}

console.log(echecs ? echecs + ' échec(s)' : 'volumes : tout passe');
process.exit(echecs ? 1 : 0);
