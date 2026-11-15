/* Les fichiers de données du kit, lus depuis le disque pour les tests. */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { FichierDeDonnees } from '@/domaine/format'
import { creerMagasin, type Options } from '@/magasin/magasin'

const DOSSIER = path.resolve(import.meta.dirname, '../../transposition-kit/donnees')
const cache: Record<string, FichierDeDonnees> = {}

export type NomJeu = 'exemple' | 'depart' | 'intermediaire'
const FICHIERS: Record<NomJeu, string> = { exemple: 'exemple.json', depart: 'volumes-depart.json', intermediaire: 'volumes-intermediaire.json' }

export function lireJeu(nom: NomJeu): FichierDeDonnees {
  if (!cache[nom]) cache[nom] = JSON.parse(readFileSync(path.join(DOSSIER, FICHIERS[nom]), 'utf8')) as FichierDeDonnees
  return JSON.parse(JSON.stringify(cache[nom])) as FichierDeDonnees
}

export function lireTexte(nom: string): string {
  return readFileSync(path.join(DOSSIER, nom), 'utf8')
}

/** Un magasin comme l'application en crée un : le jeu nommé dans les options, l'exemple sinon. */
export function magasin(options: Options = {}) {
  const jeu = (options.jeu === 'depart' || options.jeu === 'intermediaire' ? options.jeu : 'exemple') as NomJeu
  return creerMagasin(lireJeu(jeu), options)
}

/** Les espaces insécables deviennent des espaces simples, pour comparer des libellés. */
export const txt = (x: unknown) => String(x).replace(/[  ]/g, ' ')
