// Écrit le script donnees.js à partir d'un fichier de données JSON.
// donnees.js pose window.TRANSPOSITION_DONNEES : il se charge aussi depuis le disque (file://), où fetch échoue.
// usage : node scripts/ecrire-donnees.mjs <fichier de données .json> <donnees.js à écrire>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const [source, cible] = process.argv.slice(2)
if (!source || !cible) {
  console.error('usage : node scripts/ecrire-donnees.mjs <donnees.json> <donnees.js>')
  process.exit(2)
}
const donnees = JSON.parse(readFileSync(source, 'utf8'))
if (!donnees || !Array.isArray(donnees.fonctionnalites)) {
  console.error(source + " n'est pas un fichier de données : il lui manque le tableau « fonctionnalites ».")
  process.exit(1)
}
if (donnees.versionFormat !== 1) {
  console.error(source + ' : version de format ' + donnees.versionFormat + ' non reconnue, cette application lit la version 1.')
  process.exit(1)
}
const json = JSON.stringify(donnees).replace(/</g, '\\u003c')
mkdirSync(path.dirname(cible), { recursive: true })
writeFileSync(cible, '/* Données de Transposition, écrites par scripts/ecrire-donnees.mjs depuis ' + path.basename(source) + '. */\nwindow.TRANSPOSITION_DONNEES = ' + json + ';\n')
console.log(cible + ' écrit : ' + donnees.fonctionnalites.length + ' fonctionnalités, ' + Object.keys(donnees.arbres || {}).length + ' arbres, données du ' + donnees.produitLe + '.')
