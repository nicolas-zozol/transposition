/* Le démarrage : les saisies du fichier de données, puis celles du navigateur (localStorage), selon la règle de fusion. */

import { describe, expect, it } from 'vitest'
import { magasin } from '@/essais-unitaires/donnees'
import { poserStock, type Stock } from './persistance'

const stock = (s: Partial<Stock>): Stock => ({
  version: 1,
  saisies: { regles: {}, questions: {} },
  locales: { regles: {}, questions: {} },
  auteur: '',
  theme: 'light',
  ...s,
})

describe('poserStock', () => {
  it('une saisie du navigateur non exportée l’emporte toujours, même plus ancienne que celle du fichier', () => {
    const m = magasin()
    poserStock(
      m,
      stock({
        saisies: { regles: { 'RM-CHAMBREPART-2': { avis: 'validee', auteur: 'MARTIN Paul', date: '2026-11-01' } }, questions: {} },
        locales: { regles: { 'RM-CHAMBREPART-2': true }, questions: {} },
      })
    )
    expect(m.etat.saisies.regles['RM-CHAMBREPART-2']).toEqual({ avis: 'validee', auteur: 'MARTIN Paul', date: '2026-11-01' })
    expect(m.etat.locales.regles['RM-CHAMBREPART-2']).toBe(true)
  })

  it('une saisie déjà exportée cède à celle du fichier quand la date du fichier est égale ou postérieure', () => {
    const m = magasin()
    const fichier = m.etat.saisies.regles['RM-CHAMBREPART-2']
    poserStock(m, stock({ saisies: { regles: { 'RM-CHAMBREPART-2': { avis: 'validee', auteur: 'MARTIN Paul', date: '2026-11-14' } }, questions: {} } }))
    expect(m.etat.saisies.regles['RM-CHAMBREPART-2']).toEqual(fichier)
    poserStock(m, stock({ saisies: { regles: { 'RM-CHAMBREPART-2': { avis: 'validee', auteur: 'MARTIN Paul', date: '2026-11-13' } }, questions: {} } }))
    expect(m.etat.saisies.regles['RM-CHAMBREPART-2']).toEqual(fichier)
    expect(m.etat.locales.regles['RM-CHAMBREPART-2']).toBeUndefined()
  })

  it('une saisie déjà exportée et plus récente que celle du fichier reste ; une saisie absente du fichier s’ajoute', () => {
    const m = magasin()
    poserStock(
      m,
      stock({
        saisies: {
          regles: { 'RM-CHAMBREPART-2': { avis: 'validee', auteur: 'MARTIN Paul', date: '2026-11-15' } },
          questions: { 'Q-CHAMBREPART-2': { reponse: 'Non.', auteur: 'MARTIN Paul', date: '2026-11-10' } },
        },
      })
    )
    expect(m.etat.saisies.regles['RM-CHAMBREPART-2'].avis).toBe('validee')
    expect(m.etat.saisies.questions['Q-CHAMBREPART-2'].reponse).toBe('Non.')
  })

  it('le nom et le thème du navigateur, sauf quand l’adresse les impose', () => {
    const m = magasin()
    poserStock(m, stock({ auteur: 'MARTIN Paul', theme: 'dark' }))
    expect([m.etat.auteur, m.etat.theme]).toEqual(['MARTIN Paul', 'dark'])
    const n = magasin({ auteur: 'DURAND Claire', theme: 'light' })
    poserStock(n, stock({ auteur: 'MARTIN Paul', theme: 'dark' }), { auteur: true, theme: true })
    expect([n.etat.auteur, n.etat.theme]).toEqual(['DURAND Claire', 'light'])
  })
})
