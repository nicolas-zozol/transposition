// Essai de la logique partagée hors navigateur.
// usage : node essai-logique.js <dossier project>
const path = require('path');
const fs = require('fs');
const vm = require('vm');

const projet = process.argv[2];
const React = { createElement: (t, p, ...c) => ({ t, p, c }), Fragment: 'Fragment' };
const window = { React, BLDemo: { StatusDot: 'StatusDot', Badge: 'Badge' } };
const ctx = vm.createContext({ window, navigator: {}, setTimeout, console, URL, Blob });
for (const f of ['transposition-exemple.js', 'transposition-volumes.js', 'transposition.js']) {
  const p = path.join(projet, f);
  if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f });
}
const T = window.Transposition;
let echecs = 0;
const ok = (cond, msg) => { if (!cond) { echecs++; console.log('ECHEC :', msg); } };
const txt = (x) => String(x).replace(/ /g, ' ');

// 1. Repérage, arbre de F07.1
let m = T.creerMagasin({ fonctionnalite: 'F07.1' });
let v = T.vues.reperage(m);
ok(v.stats.map((s) => txt(s.valeur)).join('|') === '12|1 100|2|5|17|3|2', 'stats F07.1 : ' + v.stats.map((s) => txt(s.valeur)).join('|'));
ok(v.lignes.length === 10, 'lignes F07.1 : ' + v.lignes.length);
console.log(v.lignes.map((l) => '  '.repeat(l.niveau - 1) + l.prefixe + l.nom + '  [' + l.marques.map((x) => txt(x.texte)).join(', ') + '] ' + txt(l.precision) + '  ' + txt(l.lignes) + ' l / ' + l.fonctions + ' fn / ' + l.part + (l.suivre ? '  -> ' + txt(l.suivreLabel) : '')).join('\n'));
ok(v.fiche.id === 'w_sejour.ue_recalcul_sejour', 'fiche racine');
console.log('fiche racine :', txt(v.fiche.taille), '|', txt(v.fiche.emplacement), '|', v.fiche.signatureTexte);

// 2. Fiche d'une fonction bloquée
m = T.creerMagasin({ fonctionnalite: 'F07.1', fonction: 'u_calcul_ghs.uf_calcule' });
v = T.vues.reperage(m);
ok(v.fiche.aArret && v.fiche.arret.visees[0].id === 'F09.1', 'arrêt vers F09.1');
console.log('arrêt :', v.fiche.arret.classe.texte, v.fiche.arret.etat.texte, txt(v.fiche.arret.confiance), '|', v.fiche.arret.raison, '|', v.fiche.appelleVide, '| ailleurs', v.fiche.ailleurs.map((x) => x.id).join(','), '| appelée par', v.fiche.appeleePar.map((x) => x.nom + ' ' + txt(x.ligne)).join(','));
v.lignes.find((l) => l.id === 'u_calcul_ghs.uf_calcule').suivre();
v = T.vues.reperage(m);
ok(m.etat.fonctionnaliteId === 'F09.1' && v.fiche.id === 'u_calcul_ghs.uf_calcule', 'suivre un arrêt ouvre F09.1 sur la fonction : ' + m.etat.fonctionnaliteId + ' ' + v.fiche.id);

// 3. Fonction lancée en différé, sous-fonctionnalité
m = T.creerMagasin({ fonctionnalite: 'F07.1', fonction: 'w_sejour.ue_repartition_payeurs' });
v = T.vues.reperage(m);
ok(v.fiche.aDiffere && v.fiche.differes[0].fonction === 'w_sejour.ue_recalcul_sejour', 'différé par la racine');
console.log('différé :', v.fiche.differes.map((x) => x.fonction + ' ' + txt(x.ligne) + ' ' + x.lieu).join(' ; '), '|', v.fiche.signatureTexte, '|', txt(v.fiche.taille), '|', v.fiche.marques.map((x) => txt(x.texte)).join(','));

// 4. Recherche
m = T.creerMagasin({ fonctionnalite: 'F07.1', recherche: 'f_lit_parametre' });
v = T.vues.reperage(m);
ok(v.resultatsOuverts && v.groupes.length === 5, 'recherche dans 5 arbres : ' + v.groupes.length);
console.log('recherche :', txt(v.resumeResultats), '|', v.groupes.map((g) => g.id + ' ' + txt(g.compte) + ' (' + g.items.map((i) => txt(i.contexte)).join(' / ') + ')').join(' ; '));
v.groupes[2].items[0].choisir();
v = T.vues.reperage(m);
ok(m.etat.fonctionnaliteId === 'F07.1.a' && v.fiche.id === 'f_lit_parametre.f_lit_parametre' && !v.resultatsOuverts, 'choisir un résultat ouvre son arbre');

// 5. Sans arbre
m = T.creerMagasin({ fonctionnalite: 'F15.1' });
v = T.vues.reperage(m);
ok(v.sansArbre && v.vide.titre === 'Arbre non extrait', 'F15.1 sans arbre');
console.log('vide :', v.vide.texte, '|', v.vide.signature, '|', v.vide.ordre, '|', v.badges.map((b) => b.texte).join(','));

// 6. Règles
m = T.creerMagasin({ onglet: 'regles', fonctionnalite: 'F07.1.a' });
v = T.vues.regles(m);
console.log('liste :', v.liste.map((l) => l.id + ' ' + l.extraction.texte + ' ' + txt(l.reglesTexte) + ' ' + l.verdict.texte).join(' ; '));
console.log('filtres :', v.filtres.map((f) => f.label + ' ' + f.count).join(', '));
let f = v.fiche;
console.log('fiche :', f.id, f.titre, '|', txt(f.page), '|', f.mereTexte, '|', f.statRegles, f.libRegles, '|', f.statUnitaires, '|', f.statIntegration, f.integration.map((x) => txt(x.texte)).join(', '), '|', f.depNote, f.depDe, f.depPar, f.depManquantes);
console.log('découpage :', txt(f.decoupage));
console.log('règles :', f.regles.map((r) => r.id + ' ' + r.verdict.texte + ' / ' + r.avis.texte + ' / ex ouverts ' + r.exemplesOuverts + ' / ' + r.signature + ' / ' + r.exemples.map((x) => x.verdict.texte + '[' + x.tests.map((t) => t.id + ':' + t.texte).join(',') + ']').join(' ')).join('\n         '));
ok(f.regles.length === 3 && f.regles[1].avis.texte === 'À revoir' && f.regles[2].avis.texte === 'À valider', 'avis des règles');
f.regles[2].choisirValidee();
ok(m.etat.dialogue === 'nom', 'première saisie : demande le nom');
m.maj({ nomSaisi: 'MARTIN Paul' });
m.validerNom();
v = T.vues.regles(m);
ok(v.fiche.regles[2].avis.texte === 'Validée' && m.etat.saisies.regles['RM-CHAMBREPART-3'].auteur === 'MARTIN Paul', 'avis signé après le nom');
let c = T.vues.coquille(m);
ok(c.libelleExporter === 'Exporter les saisies · 1', 'compteur : ' + c.libelleExporter);
v.fiche.questions[1].surReponse({ target: { value: 'Non.' } });
c = T.vues.coquille(m);
ok(c.libelleExporter === 'Exporter les saisies · 2' && c.exporter.nbAvis === '5' && c.exporter.nbReponses === '2', 'export : ' + c.libelleExporter + ' ' + c.exporter.nbAvis + ' ' + c.exporter.nbReponses);
const exportJson = c.exporter.json;
ok(JSON.parse(exportJson).versionFormat === 1 && !('fonctionnalites' in JSON.parse(exportJson)), 'export : saisies seules');

// 7. F09.1 et F07.1
m = T.creerMagasin({ onglet: 'regles', fonctionnalite: 'F09.1' });
f = T.vues.regles(m).fiche;
console.log('F09.1 :', f.aAlerte, txt(f.alerte), '|', f.statUnitaires, '|', f.verdictTests.texte, '|', f.depDe, f.depPar, f.depManquantes, '|', f.badges.map((b) => txt(b.texte)).join(','), '|', txt(f.decoupage));
m = T.creerMagasin({ onglet: 'regles', fonctionnalite: 'F07.1' });
f = T.vues.regles(m).fiche;
ok(f.sansRegles && f.vide.sous.length === 2, 'F07.1 vide avec 2 sous-fonctionnalités');
console.log('F07.1 :', f.vide.texte, '|', f.vide.sous.map((s) => s.id + ' ' + txt(s.detail) + ' ' + s.extraction.texte).join(' ; '));

// 8. Import
m = T.creerMagasin({});
m.ouvrirDialogue('importer');
m.maj({ importTexte: '{ pas du json' });
m.importer();
ok(/^JSON invalide/.test(m.etat.importErreur), 'JSON invalide : ' + m.etat.importErreur);
m.maj({ importTexte: exportJson });
m.importer();
console.log('import saisies :', txt(m.etat.importMessage));
m.maj({ importTexte: JSON.stringify(window.TranspositionExemple) });
m.importer();
console.log('import données :', txt(m.etat.importMessage));
m.maj({ importTexte: '{"saisies":{"regles":{"RM-DISPARUE-1":{"avis":"validee","auteur":"X","date":"2026-11-15"}}}}' });
m.importer();
c = T.vues.coquille(m);
console.log('import orpheline :', txt(m.etat.importMessage), '|', c.exporter.aOrphelines, txt(c.exporter.titreOrphelines));

// 9. Dépendances
m = T.creerMagasin({ onglet: 'dependances', fonctionnalite: 'F07.1' });
v = T.vues.dependances(m);
console.log('stats :', v.stats.map((s) => s.valeur + ' ' + s.libelle).join(' | '));
console.log('alertes :', v.alertes.map((a) => a.id + ' -> ' + a.manquantes.map((x) => x.id).join(',')).join(' ; '));
const g = T.vues.graphe(m, 1150).g;
console.log('graphe :', g.largeur + 'x' + g.hauteur, '| colonnes', g.colonnes.map((k) => txt(k.titre) + ' ' + txt(k.sous)).join(', '));
console.log(g.noeuds.map((n) => '  ' + n.id + ' ' + n.cadre.replace(/; border.*$/, '') + ' ' + n.extraction.texte + (n.extractible ? ' [Extractible]' : '') + (n.aSous ? ' ' + txt(n.sous) : '')).join('\n'));
console.log(g.traits.map((t) => '  ' + t.d + '  ' + t.marqueur + '  ' + t.titre + (t.style.strokeDasharray ? '  pointillée' : '  pleine')).join('\n'));
console.log('étiquettes :', g.etiquettes.map((x) => x.texte + '@' + x.x + ',' + x.y).join(' '));
console.log('socle graphe :', g.socle.compte, g.socle.items.map((x) => x.objet + ' ' + x.compte + ' ' + x.poids).join(', '));
const p = v.panneau;
console.log('panneau :', p.id, p.badges.map((b) => txt(b.texte)).join(','), '|', p.dependDe.map((x) => x.id + ' ' + x.objet + ' ' + x.etat.texte + ' ' + txt(x.confiance)).join(' ; '), '|', p.requisePar.length, '|', p.manquantes.map((x) => x.id).join(','), '|', p.sous.map((x) => x.id).join(','));
console.log('hors ordre :', v.lignesHors.map((r) => r.id + ' ' + r.perimetre + ' / ' + r.chemin + ' / ' + r.cause).join(' ; '));
console.log('socle :', v.socle.map((u) => u.objet + ' ' + txt(u.compte) + ' ' + u.part).join(', '));

// 10. Gherkin
const gh = T.gherkin(window.TranspositionExemple.fonctionnalites[2].regles[1].exemples[0].gherkin);
console.log(gh.map((l) => l.segs.map((s) => (s.w === 600 ? '«' + s.t + '»' : s.t)).join('')).join('\n'));

// 11. Sélecteur d'arbre : deux niveaux au plus. « > » marque le niveau 2, « >> » l'arbre affiché quand il est plus bas.
const selecteur = (vue) => vue.optionsArbres.map((o) => (/^ {8}/.test(o.label) ? '>>' : /^ {4}/.test(o.label) ? '>' : '') + o.value).join(' ');
const essaiSelecteur = (options, attendu, nom) => {
  const mag = T.creerMagasin(options);
  const r = selecteur(T.vues.reperage(mag)), c = selecteur(T.vues.carte(mag));
  ok(r === attendu && c === attendu, nom + ' : ' + r + (c === r ? '' : ' | carte : ' + c));
  ok(T.vues.reperage(mag).optionsArbres.some((o) => o.value === mag.etat.fonctionnaliteId), nom + ' : l\'arbre affiché figure dans la liste');
};
essaiSelecteur({ fonctionnalite: 'F07.1' }, 'F03.1 F07.1 >F07.1.a >F07.1.b F09.1 F12.1 F15.1', 'sélecteur sur une mère : ses sous-fonctionnalités sous elle');
essaiSelecteur({ fonctionnalite: 'F03.1' }, 'F03.1 F07.1 F09.1 F12.1 F15.1', 'sélecteur ailleurs : le niveau 1 seul');
essaiSelecteur({ fonctionnalite: 'F07.1.a' }, 'F03.1 F07.1 >F07.1.a >F07.1.b F09.1 F12.1 F15.1', 'sélecteur sur une sous-fonctionnalité : sa mère et ses sœurs');
m = T.creerMagasin({ fonctionnalite: 'F03.1' });
T.vues.reperage(m).surChoixArbre({ target: { value: 'F07.1' } });
ok(selecteur(T.vues.reperage(m)) === 'F03.1 F07.1 >F07.1.a >F07.1.b F09.1 F12.1 F15.1', 'choisir une mère fait apparaître ses sous-fonctionnalités : ' + selecteur(T.vues.reperage(m)));
ok(T.vues.reperage(m).optionsArbres[5].label === 'F12.1 — Prise en charge par la mutuelle' && /\(arbre non extrait\)$/.test(T.vues.reperage(m).optionsArbres[6].label), 'libellés du sélecteur : ' + T.vues.reperage(m).optionsArbres.slice(5).map((o) => o.label).join(' | '));
const profond = {
  versionFormat: 1, fonctions: {}, arbres: {}, dependances: { socle: [], aretes: [] },
  fonctionnalites: [
    { id: 'A.1', titre: 'Un' }, { id: 'A.1.a', mere: 'A.1', titre: 'Un a' }, { id: 'A.1.a.i', mere: 'A.1.a', titre: 'Un a i' }, { id: 'A.1.a.ii', mere: 'A.1.a', titre: 'Un a ii' },
    { id: 'A.1.b', mere: 'A.1', titre: 'Un b' }, { id: 'A.2', titre: 'Deux' }, { id: 'A.2.a', mere: 'A.2', titre: 'Deux a' }, { id: 'X.9.a', mere: 'X.9', titre: 'Mère absente du fichier' }
  ]
};
essaiSelecteur({ donnees: profond, fonctionnalite: 'A.1' }, 'A.1 >A.1.a >A.1.b A.2 X.9.a', 'trois niveaux, sur la mère : le troisième n\'est pas proposé');
essaiSelecteur({ donnees: profond, fonctionnalite: 'A.1.a' }, 'A.1 >A.1.a >A.1.b A.2 X.9.a', 'trois niveaux, sur le deuxième : le troisième n\'est pas proposé');
essaiSelecteur({ donnees: profond, fonctionnalite: 'A.1.a.ii' }, 'A.1 >A.1.a >>A.1.a.ii >A.1.b A.2 X.9.a', 'trois niveaux, sur le troisième : lui seul est nommé');
essaiSelecteur({ donnees: profond, fonctionnalite: 'A.2' }, 'A.1 A.2 >A.2.a X.9.a', 'trois niveaux, sur une autre mère');
essaiSelecteur({ donnees: profond, fonctionnalite: 'X.9.a' }, 'A.1 A.2 X.9.a', 'une sous-fonctionnalité dont la mère manque reste au niveau 1');
for (const jeu of ['depart', 'intermediaire']) {
  const mag = T.creerMagasin({ jeu, fonctionnalite: 'F22.1' });
  const liste = T.vues.reperage(mag).optionsArbres, n1 = mag.etat.index.liste.filter((x) => !x.mere).length;
  ok(liste.length === n1 + (mag.etat.index.enfants['F22.1'] || []).length && liste.length <= mag.etat.index.liste.length, 'sélecteur du jeu ' + jeu + ' : ' + liste.length + ' entrées pour ' + mag.etat.index.liste.length + ' fonctionnalités');
  console.log('sélecteur', jeu, ':', liste.length, 'entrées sur', mag.etat.index.liste.length, 'fonctionnalités, dont', n1, 'au niveau 1');
}

console.log(echecs ? echecs + ' échec(s)' : 'logique : tout passe');
process.exit(echecs ? 1 : 0);
