/* Le fichier de données, au démarrage, dans cet ordre :
   1. window.TRANSPOSITION_DONNEES, posé par le script donnees.js placé à côté de index.html ;
   2. sinon fetch('./donnees.json') ;
   3. sinon rien : l'application montre un état vide qui invite à « Importer ».
   En développement seulement, jeu=depart ou jeu=intermediaire charge l'un des deux jeux de volumes du kit. */

import type { FichierDeDonnees } from '@/domaine/format'
import type { Jeu } from './etat'

declare global {
  interface Window {
    TRANSPOSITION_DONNEES?: unknown
  }
}

const estDonnees = (x: unknown): x is FichierDeDonnees => !!x && typeof x === 'object' && Array.isArray((x as { fonctionnalites?: unknown }).fonctionnalites)

export async function chargerDonnees(jeu: string | undefined): Promise<{ donnees: FichierDeDonnees | null; jeu: Jeu }> {
  if (import.meta.env.DEV && (jeu === 'depart' || jeu === 'intermediaire')) {
    try {
      const r = await fetch('/transposition-kit/donnees/volumes-' + jeu + '.json')
      if (r.ok) return { donnees: (await r.json()) as FichierDeDonnees, jeu }
    } catch {
      /* le jeu de volumes n'est pas servi : on prend les données livrées */
    }
  }
  if (estDonnees(window.TRANSPOSITION_DONNEES)) return { donnees: window.TRANSPOSITION_DONNEES, jeu: 'exemple' }
  try {
    const r = await fetch('./donnees.json')
    if (r.ok) {
      const x = (await r.json()) as unknown
      if (estDonnees(x)) return { donnees: x, jeu: 'exemple' }
    }
  } catch {
    /* en file://, fetch échoue : seul donnees.js fonctionne */
  }
  return { donnees: null, jeu: 'exemple' }
}
