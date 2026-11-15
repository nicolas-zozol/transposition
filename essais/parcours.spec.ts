/* Le parcours de bout en bout de PROMPT.md, sur les données d'exemple, date du jour figée au 14/11/2026. */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'

const SAISIES = readFileSync(path.resolve(import.meta.dirname, '../transposition-kit/donnees/saisies-exemple.json'), 'utf8')

test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

const choixArbre = (page: Page) => page.getByRole('combobox', { name: 'Arbre affiché' })
async function entreesDuSelecteur(page: Page) {
  await choixArbre(page).click()
  const n = await page.getByRole('option').count()
  await page.keyboard.press('Escape')
  return n
}
const resume = (page: Page) => page.getByRole('status').filter({ hasText: /appel/ })

test('parcours de bout en bout', async ({ page }) => {
  const journal: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') journal.push(m.type() + ' : ' + m.text())
  })
  page.on('pageerror', (e) => journal.push('erreur : ' + String(e)))
  await page.clock.setFixedTime(new Date('2026-11-14T10:00:00'))
  await page.setViewportSize({ width: 1440, height: 900 })

  await test.step('1. Ouverture : Repérage, F07.1', async () => {
    await page.goto('/#fonctionnalite=F07.1')
    await expect(page.locator('h1')).toHaveText('Repérage')
    const mesures = page.locator('section[data-slot=card]').first()
    for (const [valeur, libelle] of [
      ['12', 'Fonctions'],
      ['1 100', 'Lignes de code'],
      ['2', 'Niveaux'],
      ['5', 'DataWindows'],
      ['17', 'Appels non résolus'],
      ['3', 'Arrêts'],
      ['2', 'Appels en différé'],
    ])
      await expect(mesures.getByText(libelle, { exact: true }).locator('..')).toHaveText(new RegExp('^' + valeur.replace(' ', '\\s') + libelle + '$'))
    expect(await entreesDuSelecteur(page)).toBe(7)
  })

  await test.step('2. Une fonction, la carte, la pastille, les renvois, le retour', async () => {
    await page.locator('[role=treeitem] button[title="w_sejour.uf_lire_dossier"]').click()
    await expect(page.getByText('Fiche de la fonction').locator('..')).toContainText('w_sejour.uf_lire_dossier')
    await page.getByRole('button', { name: 'Voir la carte' }).click()
    await expect(page.locator('h1')).toHaveText('Carte')
    await expect(page.locator('.react-flow__node button[aria-pressed=true]')).toHaveAttribute('title', 'w_sejour.uf_lire_dossier')
    await expect(resume(page)).toHaveText('8 appels, tous affichés, hors renvois')
    await expect(page.getByText('2 niveaux affichés')).toBeAttached()
    const pastille = page.getByRole('button', { name: 'Replier uf_lire_dossier' })
    await expect(pastille).toHaveText('3')
    await pastille.click()
    await expect(resume(page)).toHaveText('7 appels affichés sur 8, hors renvois')
    await page.getByRole('switch').click()
    await expect(page.getByText('Renvois · 1')).toBeVisible()
    await expect(resume(page)).toHaveText('7 appels affichés sur 9')
    await page.getByRole('button', { name: 'Revenir à 3 niveaux' }).click()
    await expect(resume(page)).toHaveText('9 appels, tous affichés')
    await page.getByRole('button', { name: 'Voir dans Repérage' }).click()
    await expect(page.locator('h1')).toHaveText('Repérage')
    await expect(page.locator('[role=treeitem][aria-selected=true] button[title]')).toHaveAttribute('title', 'w_sejour.uf_lire_dossier')
  })

  await test.step("3. Suivre un arrêt jusqu'à l'arbre de F09.1", async () => {
    await page.getByRole('button', { name: "Ouvrir l'arbre de F09.1, Calcul des GHS" }).first().click()
    await expect(choixArbre(page)).toContainText('F09.1 — Calcul des GHS')
    await expect(page.locator('[role=treeitem][aria-selected=true] button[title]')).toHaveAttribute('title', 'u_calcul_ghs.uf_calcule')
    expect(await entreesDuSelecteur(page)).toBe(5)
  })

  await test.step('4. Recherche dans tous les arbres', async () => {
    await page.getByRole('textbox', { name: 'Rechercher une fonction dans tous les arbres' }).fill('f_lit_parametre')
    const resultats = page.getByRole('group', { name: 'Résultats de la recherche' })
    await expect(resultats).toContainText('6 appels dans 5 arbres')
    await resultats.getByRole('button', { name: /dans ue_dernier_jour/ }).click()
    await expect(resultats).toHaveCount(0)
    await expect(choixArbre(page)).toContainText('F07.1.a')
    await expect(page.locator('[role=treeitem][aria-selected=true] button[title]')).toHaveAttribute('title', 'f_lit_parametre.f_lit_parametre')
  })

  await test.step('5. Règles de F07.1.a, en Gherkin', async () => {
    await page.getByRole('button', { name: 'Règles', exact: true }).click()
    await expect(page.locator('h1')).toHaveText('Règles')
    await expect(page.getByText('Règles validées', { exact: true }).locator('..')).toHaveText('1/3Règles validées')
    await expect(page.getByText('Tests unitaires réussis', { exact: true }).locator('..')).toHaveText('2/2Tests unitaires réussis')
    await expect(page.getByText("Tests d'intégration", { exact: true }).locator('..')).toHaveText("4Tests d'intégration")
    const files = page.getByRole('tablist', { name: 'Filtrer les fonctionnalités' })
    await expect(files.getByRole('tab')).toHaveText(['Toutes· 7', 'Avec règles· 3', 'À valider· 2'])
    await page.getByRole('tab', { name: 'Gherkin' }).click()
    const bloc = page.getByRole('group', { name: 'Scénario Gherkin' }).nth(1)
    const lignes = (await bloc.innerText()).split('\n').filter((l) => l.trim().startsWith('|'))
    expect(lignes.length).toBeGreaterThan(1)
    const barres = lignes.map((l) => [...l].map((c, i) => (c === '|' ? i : -1)).filter((i) => i >= 0).join(','))
    expect(new Set(barres).size).toBe(1)
    await page.getByRole('tab', { name: 'Français' }).click()
  })

  await test.step('6. Un avis : le nom d’abord, puis la saisie signée', async () => {
    const carte = page.locator('section[data-slot=card]').filter({ hasText: 'RM-CHAMBREPART-3' })
    await carte.getByRole('button', { name: 'Validée' }).click()
    await expect(page.getByRole('dialog', { name: 'Qui saisit ?' })).toBeVisible()
    await page.locator('#tp-nom').fill('MARTIN Paul')
    await page.getByRole('button', { name: 'Enregistrer' }).click()
    await expect(carte.getByText('MARTIN Paul · 14/11/2026')).toBeVisible()
    await expect(carte.getByRole('button', { name: 'Validée' })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('button', { name: 'Exporter les saisies · 1' })).toBeVisible()
  })

  await test.step('7. Export, puis copie', async () => {
    await page.getByRole('button', { name: 'Exporter les saisies · 1' }).click()
    const json = JSON.parse(await page.locator('#tp-export-json').inputValue())
    expect(json.saisies.regles['RM-CHAMBREPART-3']).toEqual({ avis: 'validee', auteur: 'MARTIN Paul', date: '2026-11-14' })
    await page.getByRole('button', { name: 'Copier' }).click()
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Copié' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Exporter les saisies', exact: true })).toBeVisible()
  })

  await test.step('8. Import : un texte invalide, puis le fichier de saisies', async () => {
    await page.getByRole('button', { name: 'Importer' }).click()
    const dialogue = page.getByRole('dialog', { name: 'Importer un fichier' })
    await page.locator('#tp-import-json').fill('{ pas du json')
    await dialogue.getByRole('button', { name: 'Importer', exact: true }).click()
    await expect(dialogue.getByRole('alert')).toContainText('JSON invalide')
    await page.locator('#tp-import-json').fill(SAISIES)
    await dialogue.getByRole('button', { name: 'Importer', exact: true }).click()
    await expect(dialogue.getByRole('status')).toHaveText('4 avis et 1 réponse fusionnés')
    await dialogue.getByRole('button', { name: 'Fermer' }).first().click()
    await expect(page.getByText(/RM-ANCIENNE-7/)).toBeVisible()
    /* Mon avis du 14/11 était exporté ; celui du fichier, daté du 16/11, le remplace. */
    const carte = page.locator('section[data-slot=card]').filter({ hasText: 'RM-CHAMBREPART-3' })
    await expect(carte.getByRole('button', { name: 'À revoir' })).toHaveAttribute('aria-pressed', 'true')
    await expect(carte.getByText('MARTIN Paul · 16/11/2026')).toBeVisible()
  })

  await test.step('9. Dépendances', async () => {
    await page.getByRole('button', { name: 'Dépendances', exact: true }).click()
    await expect(page.locator('h1')).toHaveText('Dépendances')
    const mesures = page.locator('section[data-slot=card]').first()
    await expect(mesures).toContainText('5Fonctionnalités')
    await expect(mesures).toContainText('1Extraite')
    await expect(mesures).toContainText('1Extractible')
    await expect(mesures).toContainText('1Extraite sans ses dépendances')
    await expect(mesures).toContainText("1Hors de l'ordre")
    await page.getByRole('group', { name: "Ordre d'extraction : une colonne par rang" }).getByRole('button', { name: /F09\.1/ }).click()
    await expect(page.getByRole('heading', { name: 'Calcul des GHS', level: 3 })).toBeVisible()
  })

  await test.step('10. Thème et saisies gardés après rechargement', async () => {
    await page.getByRole('button', { name: 'Thème sombre' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.reload()
    await expect(page.locator('h1')).toHaveText('Dépendances')
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.getByRole('button', { name: 'Règles', exact: true }).click()
    await page.getByRole('button', { name: /F07\.1\.a/ }).first().click()
    const carte = page.locator('section[data-slot=card]').filter({ hasText: 'RM-CHAMBREPART-3' })
    await expect(carte.getByRole('button', { name: 'À revoir' })).toHaveAttribute('aria-pressed', 'true')
    await expect(carte.getByText('Aucun dossier de recette')).toBeVisible()
    await expect(page.getByRole('button', { name: 'MARTIN Paul : changer de nom' })).toBeVisible()
  })

  expect(journal).toEqual([])
})
