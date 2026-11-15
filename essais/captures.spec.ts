/* Rejoue les 31 états d'écran de captures/INDEX.md et en prend une capture, à la taille de la capture de référence,
   dans essais/captures-app/. Chaque état doit s'afficher sans erreur ni avertissement dans la console.
   La comparaison avec transposition-kit/captures/ se fait à l'œil : l'identique au pixel n'est pas demandé. */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from '@playwright/test'
import { adresse, ETATS, JSON_INVALIDE } from './etats.ts'

const SORTIE = path.resolve(import.meta.dirname, 'captures-app')
const EXEMPLE = readFileSync(path.resolve(import.meta.dirname, '../transposition-kit/donnees/exemple.json'), 'utf8')

for (const etat of ETATS) {
  test('état ' + etat.nom, async ({ page }) => {
    const journal: string[] = []
    page.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') journal.push(m.type() + ' : ' + m.text())
    })
    page.on('pageerror', (e) => journal.push('erreur : ' + String(e)))
    await page.setViewportSize({ width: etat.largeur, height: etat.hauteur })
    await page.goto(adresse(etat))
    await expect(page.locator('h1')).toBeVisible()
    if (etat.actions) {
      await page.locator('#tp-import-json').fill(etat.actions === 'importer-erreur' ? JSON_INVALIDE : EXEMPLE)
      await page.getByRole('dialog').getByRole('button', { name: 'Importer', exact: true }).click()
      await expect(page.getByRole('dialog').getByRole(etat.actions === 'importer-erreur' ? 'alert' : 'status')).toBeVisible()
    }
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(SORTIE, etat.nom + '.png') })
    expect(journal).toEqual([])
  })
}
