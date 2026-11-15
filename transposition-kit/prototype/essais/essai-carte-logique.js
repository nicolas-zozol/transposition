// Essai de la carte des appels hors navigateur : disposition, repli, renvois, niveaux, sélection.
// usage : node essai-carte-logique.js <dossier project>
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
const T = window.Transposition, G = T.CARTE;
let echecs = 0;
const ok = (cond, msg) => { if (!cond) { echecs++; console.log('ECHEC :', msg); } };
const txt = (x) => String(x).replace(/[  ]/g, ' ');
const SIG = 'w_facturation.ue_facturer_dossier';
const vue = (m, o) => T.vues.carteAppels(m, o || { largeur: 1150, plafond: 490 });
const noeud = (v, id) => v.c.noeuds.find((n) => n.id === id);

/* Invariants de la disposition, vrais quel que soit l'état de dépliage. */
function invariants(m, nom) {
  const a = m.etat.index.arbres[m.etat.index.parId[m.etat.fonctionnaliteId].reperage.signature];
  const v = vue(m), pos = v.c.pos, parCle = {};
  v.c.noeuds.forEach((n) => { parCle[n.cle] = n; });
  let soucis = 0;
  const colonnes = {};
  v.c.noeuds.forEach((n) => {
    const p = pos[n.cle];
    // 1. la colonne suit le niveau
    if (p.x !== G.pad + p.niveau * (G.nw + G.gx)) soucis++;
    (colonnes[p.niveau] = colonnes[p.niveau] || []).push(p);
    // 2. un parent est centré sur son premier et son dernier enfant, et ses enfants gardent l'ordre des appels
    if (p.enfants.length) {
      const ys = p.enfants.map((c) => pos[c.cle].y);
      if (Math.abs(p.y - (ys[0] + ys[ys.length - 1]) / 2) > 1) soucis++;
      for (let i = 1; i < ys.length; i++) if (ys[i] < ys[i - 1] + G.nh + G.gy - 1) soucis++;
    }
    // 4. tout tient dans la carte
    if (p.y < G.pad - 1 || p.y + G.nh > v.c.hauteur - G.pad + 1 || p.x + G.nw > v.c.largeur - G.pad + 1) soucis++;
  });
  // 3. deux nœuds d'une même colonne ne se touchent jamais
  Object.keys(colonnes).forEach((k) => {
    const ps = colonnes[k].slice().sort((x, y) => x.y - y.y);
    for (let i = 1; i < ps.length; i++) if (ps[i].y < ps[i - 1].y + G.nh + G.gy - 1) soucis++;
  });
  // 5. l'ordre de parcours est celui de l'arbre : dans une colonne, les y croissent avec l'ordre des appels
  Object.keys(colonnes).forEach((k) => { for (let i = 1; i < colonnes[k].length; i++) if (colonnes[k][i].y <= colonnes[k][i - 1].y) soucis++; });
  // 6. une flèche par nœud affiché, sauf la signature
  if (v.dessin.c[1].length !== v.c.noeuds.length - 1) soucis++;
  ok(soucis === 0, nom + ' : ' + soucis + ' invariant(s) de disposition rompu(s)');
  return v;
}

// 1. Exemple : F07.1, deux niveaux, tout affiché
let m = T.creerMagasin({ fonctionnalite: 'F07.1' });
let v = invariants(m, 'F07.1');
ok(v.c.noeuds.length === 9, 'F07.1 : 9 nœuds sans le renvoi, ' + v.c.noeuds.length);
ok(txt(v.resume) === '8 appels, tous affichés, hors renvois', 'résumé F07.1 : ' + txt(v.resume));
ok(v.reglages.niveau === '2' && v.reglages.sansPlus && v.reglages.toutDeplie && v.reglages.parDefaut, 'réglages F07.1');
ok(v.c.largeur === 2 * G.pad + 3 * G.nw + 2 * G.gx && v.c.hauteur === 2 * G.pad + 7 * G.nh + 6 * G.gy, 'dimensions F07.1 : ' + v.c.largeur + 'x' + v.c.hauteur);
let n = noeud(v, 'w_sejour.uf_lire_dossier');
ok(n.aBascule && n.ouverte && n.compte === '3' && txt(n.detail) === '125 lignes · 1 renvoi', 'uf_lire_dossier : ' + n.compte + ' | ' + txt(n.detail));
n = noeud(v, 'w_sejour.uf_calcul_supplements');
ok(!n.aBascule && n.aCompteFixe && n.compte === '7' && n.suivre && n.marques[0].variante === 'outline' && /F07\.1\.a/.test(n.marques[0].texte), 'autre arbre : pastille fixe, suivi');
n = noeud(v, 'w_sejour.ue_repartition_payeurs');
ok(n.differe && n.marques.length === 1 && /appelée en différé/.test(n.libelle), 'appel en différé : marque sur la flèche, pas dans le nœud');
n = noeud(v, 'u_calcul_ghs.uf_calcule');
ok(txt(n.detail) === 'vers F09.1' && n.suivre && !n.aBascule && !n.aCompteFixe, 'arrêt vers F09.1 : ' + txt(n.detail));
n = noeud(v, 'w_sejour.ue_recalcul_sejour');
ok(n.selectionnee && txt(n.detail) === 'signature mère · 1 100 lignes' && n.compte === '12', 'signature : ' + txt(n.detail));
console.log('F07.1 :', v.c.noeuds.map((x) => x.nom + (x.compte ? ' [' + x.compte + ']' : '')).join(', '));

// 2. Renvois : masqués par défaut, affichés à la demande, et le renvoi sélectionné reste visible
m.montrerRenvois(true);
v = invariants(m, 'F07.1 avec renvois');
ok(v.c.noeuds.length === 10 && txt(v.resume) === '9 appels, tous affichés', 'renvois affichés : ' + v.c.noeuds.length + ' | ' + txt(v.resume));
ok(txt(noeud(v, 'w_sejour.uf_lire_dossier').detail) === '125 lignes', 'le compte de renvois disparaît quand ils sont affichés');
m = T.creerMagasin({ fonctionnalite: 'F07.1', fonction: 'f_lit_parametre.f_lit_parametre', occurrence: 'r.2.1' });
v = vue(m);
ok(v.c.noeuds.length === 10 && v.c.noeuds.filter((x) => x.selectionnee)[0].cle === 'r.2.1', 'un renvoi sélectionné reste affiché, renvois masqués');

// 3. Arbre réel : trois niveaux au départ
m = T.creerMagasin({ jeu: 'depart', fonctionnalite: 'F22.1' });
const a = m.etat.index.arbres[SIG];
v = invariants(m, 'F22.1 au départ');
ok(v.c.noeuds.length === 91 && txt(v.resume) === '90 appels affichés sur 116, hors renvois' && v.reglages.niveau === '3', 'départ : ' + v.c.noeuds.length + ' | ' + txt(v.resume));
ok(v.c.noeuds.every((x) => x.cle.split('.').length - 1 <= 3), 'aucun nœud au-delà du niveau 3');
ok(v.c.largeur === 2 * G.pad + 4 * G.nw + 3 * G.gx, 'quatre colonnes : ' + v.c.largeur);
ok(v.c.aMini && v.c.echelle === 1 && v.c.hauteurZone === 490, 'la carte déborde : vue d\'ensemble, zone au plafond');
const replies = v.c.noeuds.filter((x) => x.aBascule && !x.ouverte);
ok(replies.length === 5 && replies.map((x) => x.compte).join(',') === '3,2,5,30,', 'cinq nœuds repliés au niveau 3, avec la taille de leur branche : ' + replies.map((x) => x.nom + ' ' + x.compte).join(', '));
ok(/^Déplier uf_ligne_prestation : \d+ appels, branche de 30 fonctions$/.test(txt(replies[3].basculeLabel)), 'libellé de la pastille : ' + txt(replies[3].basculeLabel));
console.log('F22.1 :', v.c.largeur + 'x' + v.c.hauteur, '|', txt(v.resume), '| repliés :', replies.map((x) => x.nom + ' ' + x.compte).join(', '));
// La pastille reprend la taille du fichier, jamais un calcul de l'application. Une branche d'une seule fonction
// (elle n'appelle que des arrêts ou des renvois) n'a pas de nombre : la pastille ne garde que son chevron.
a.noeuds.filter((x) => x.taille).forEach((x) => { const y = v.c.noeuds.find((z) => z.cle === x.cle); if (y) ok(txt(y.compte) === (x.taille.fonctions > 1 ? txt(T.nb(x.taille.fonctions)) : ''), 'pastille de ' + x.fonction + ' : ' + y.compte); });

// 4. Déplier un nœud, puis le replier
const cible = replies[0];
cible.basculer();
v = invariants(m, 'F22.1, un nœud déplié');
ok(v.c.noeuds.length > 91 && v.reglages.niveau === '4' && !v.reglages.parDefaut, 'déplier ajoute un niveau : ' + v.c.noeuds.length);
noeud(v, cible.id).basculer();
v = vue(m);
ok(v.c.noeuds.length === 91 && v.reglages.parDefaut, 'replier revient au départ');

// 5. Niveaux : un de moins, un de plus, tout, retour
v.reglages.moins();
v = invariants(m, 'F22.1 à deux niveaux');
ok(v.reglages.niveau === '2' && v.c.noeuds.every((x) => x.cle.split('.').length - 1 <= 2), 'deux niveaux');
v.reglages.moins();
v = invariants(m, 'F22.1 à un niveau');
ok(v.reglages.niveau === '1' && v.c.noeuds.length === 21 && v.reglages.sansMoins, 'un niveau : la signature et ses 20 appels, ' + v.c.noeuds.length);
ok(v.c.hauteur === 2 * G.pad + 20 * G.nh + 19 * G.gy, 'un niveau : une rangée par appel');
v.reglages.plus(); v = vue(m); v.reglages.plus();
v = vue(m);
ok(v.c.noeuds.length === 91 && v.reglages.niveau === '3', 'deux niveaux de plus : 91 nœuds, ' + v.c.noeuds.length);
v.reglages.toutDeplier();
v = invariants(m, 'F22.1 tout déplié');
ok(v.c.noeuds.length === 117 && txt(v.resume) === '116 appels, tous affichés, hors renvois' && v.reglages.toutDeplie && v.reglages.sansPlus, 'tout déplié : ' + v.c.noeuds.length + ' | ' + txt(v.resume));
m.montrerRenvois(true);
v = invariants(m, 'F22.1 tout déplié avec renvois');
ok(v.c.noeuds.length === 231 && txt(v.resume) === '230 appels, tous affichés' && v.reglages.niveau === '9', 'avec renvois : ' + v.c.noeuds.length + ' | ' + txt(v.resume));
console.log('tout déplié avec renvois :', v.c.largeur + 'x' + v.c.hauteur, '|', v.c.noeuds.length, 'nœuds');
v.reglages.revenir();
v = vue(m);
ok(v.c.noeuds.length === 164 && v.reglages.parDefaut, 'revenir à 3 niveaux, renvois affichés : ' + v.c.noeuds.length);
m.montrerRenvois(false);

// 6. Sélection : le chemin se déplie ; un repli qui la cache la fait remonter
m = T.creerMagasin({ jeu: 'depart', fonctionnalite: 'F22.1', fonction: 'u_facture.uf_ecart_arrondi', occurrence: 'r.9.2.3.3.3.0.0.0' });
v = invariants(m, 'F22.1, branche dépliée');
n = noeud(v, 'u_facture.uf_ecart_arrondi');
ok(n && n.selectionnee && v.reglages.niveau === '8', 'la sélection de niveau 8 est affichée : niveau ' + v.reglages.niveau);
ok(v.c.largeur === 2 * G.pad + 9 * G.nw + 8 * G.gx, 'neuf colonnes : ' + v.c.largeur);
const forts = v.dessin.c[1].filter((t) => t.p.style.strokeWidth === 2).length;
ok(forts === 8, 'huit flèches en indigo de la signature à la sélection : ' + forts);
noeud(v, 'u_facture.uf_ajoute_ligne').basculer();
v = vue(m);
ok(m.etat.cleSel === 'r.9.2.3.3' && noeud(v, 'u_facture.uf_ajoute_ligne').selectionnee, 'replier un ancêtre : la sélection remonte à lui, ' + m.etat.cleSel);
// sélectionner depuis Repérage déplie aussi la carte
m = T.creerMagasin({ jeu: 'depart', fonctionnalite: 'F22.1' });
m.selectionnerNoeud(m.etat.index.arbres[SIG].parCle['r.9.2.3.3.3.0']);
v = vue(m);
ok(noeud(v, 'u_facture.uf_total_facture').selectionnee, 'une sélection faite dans Repérage se retrouve sur la carte');

// 7. Échelle : ajustée, la carte tient dans la zone ; les crans ; le plafond
m = T.creerMagasin({ jeu: 'depart', fonctionnalite: 'F22.1', zoom: 'ajuste' });
v = vue(m, { largeur: 1150, plafond: 490 });
ok(v.c.lw <= 1150 && v.c.lh <= 490 && !v.c.aMini && v.zoom.ajuste && v.c.marge === '0 auto', 'ajustée : ' + v.c.lw + 'x' + v.c.lh + ' à ' + txt(v.zoom.texte));
v.zoom.plus(); v = vue(m);
ok(txt(v.zoom.texte) === '25 %', 'cran au-dessus de l\'ajustement : ' + txt(v.zoom.texte));
v.zoom.cent(); v = vue(m);
ok(txt(v.zoom.texte) === '100 %' && v.c.marge === '0', 'retour à 100 %');
m = T.creerMagasin({ fonctionnalite: 'F07.1' });
v = vue(m, { largeur: 1150, plafond: 490 });
ok(!v.c.aMini && v.c.hauteurZone === v.c.lh, 'petite carte : pas de vue d\'ensemble, la zone prend sa hauteur');

// 8. Suivre : un renvoi mène à son développement, un arrêt à l'arbre visé
m = T.creerMagasin({ fonctionnalite: 'F07.1', renvois: 'oui' });
v = vue(m);
v.c.noeuds.find((x) => x.cle === 'r.2.1').suivre();
ok(m.etat.cleSel === 'r.1', 'suivre un renvoi sélectionne le développement : ' + m.etat.cleSel);
noeud(vue(m), 'u_calcul_ghs.uf_calcule').suivre();
ok(m.etat.fonctionnaliteId === 'F09.1' && m.etat.onglet === 'reperage', 'suivre un arrêt ouvre F09.1 sans changer d\'onglet : ' + m.etat.fonctionnaliteId);

// 9. L'onglet : navigation, légende, pied, état vide
m = T.creerMagasin({ onglet: 'carte', fonctionnalite: 'F07.1' });
let coq = T.vues.coquille(m);
ok(coq.nav.map((x) => x.value).join(',') === 'reperage,carte,regles,dependances' && coq.estCarte && coq.titre === 'Carte', 'la carte est le deuxième onglet');
let c = T.vues.carte(m);
ok(c.legende.map((x) => x.texte).join(',') === 'Développée,Arrêt,Autre arbre' && c.aDifferes, 'légende F07.1 : ' + c.legende.map((x) => x.texte).join(','));
ok(c.stats.map((s) => txt(s.valeur) + ' ' + s.libelle).join(' | ') === '12 fonctions | 1 100 lignes de code | 2 niveaux | 3 arrêts | 2 appels en différé', 'mesures : ' + c.stats.map((s) => txt(s.valeur) + ' ' + s.libelle).join(' | '));
ok(/^Point d'entrée de l'arbre · branche de 12 fonctions, 1 100 lignes, 2 niveaux$/.test(txt(c.selection.resume)), 'pied : ' + txt(c.selection.resume));
m.montrerRenvois(true);
ok(T.vues.carte(m).legende.map((x) => x.texte).join(',') === 'Développée,Arrêt,Autre arbre,Renvoi', 'la légende suit le réglage des renvois');
m = T.creerMagasin({ onglet: 'carte', fonctionnalite: 'F15.1' });
c = T.vues.carte(m);
ok(c.sansArbre && c.vide.titre === 'Arbre non extrait' && !vue(m).aCarte, 'fonctionnalité sans arbre : état vide');
ok(T.vues.reperage(T.creerMagasin({ fonctionnalite: 'F07.1' })).allerCarte, 'Repérage propose « Voir la carte »');

// 10. La disposition seule, sur un arbre fait à la main : une feuille se loge à côté des descendants de sa voisine
const f = (cle, enfants) => ({ cle, enfants: enfants || [] });
const arbre = f('r', [f('a', [f('a1'), f('a2'), f('a3')]), f('b'), f('c', [f('c1')])]);
const L = T.disposerCarte(arbre, (x) => x.enfants);
const y = (k) => L.pos[k].y;
ok(y('a') === y('a2') && y('b') === y('a') + G.nh + G.gy && y('b') < y('a3') + G.nh, 'la feuille b suit a de près, à côté des enfants de a : ' + ['a', 'a2', 'a3', 'b'].map((k) => k + '=' + y(k)).join(' '));
ok(y('c1') >= y('a3') + G.nh + G.gyBranche && y('c') === y('c1') && y('r') === (y('a') + y('c')) / 2, 'c1 passe sous a3 avec l\'écart entre branches ; la racine se centre');
ok(L.profondeur === 2 && L.ordre.map((x) => x.cle).join('') === 'raa1a2a3bcc1', 'ordre de parcours : ' + L.ordre.map((x) => x.cle).join(' '));

console.log(echecs ? 'carte : ' + echecs + ' échec(s)' : 'carte : tout passe');
process.exit(echecs ? 1 : 0);
