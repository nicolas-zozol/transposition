/* Le build s'ouvre par double-clic : dist/index.html en file://. Lancer `npm run build` avant cet essai. */

import { existsSync, readFileSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, test } from '@playwright/test'

const PAGE = path.resolve(import.meta.dirname, '../dist/index.html')

test.skip(!existsSync(PAGE), 'dist/index.html absent : lancer npm run build')

test("depuis le disque : l'exemple s'affiche, les polices sont chargées, la carte se dessine", async ({ page }) => {
  const journal: string[] = []
  const requetes: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') journal.push(m.type() + ' : ' + m.text())
  })
  page.on('pageerror', (e) => journal.push('erreur : ' + String(e)))
  page.on('request', (r) => requetes.push(r.url()))
  const adresse = pathToFileURL(PAGE).href
  await page.goto(adresse)
  await expect(page.locator('h1')).toHaveText('Repérage')
  await expect(page.getByText('Facturation clinique · données du')).toBeVisible()
  await expect(page.getByRole('tree', { name: "Arbre d'appels" })).toBeVisible()
  const polices = await page.evaluate(async () => {
    await document.fonts.ready
    return { inter: document.fonts.check('400 14px Inter'), poppins: document.fonts.check('600 18px Poppins'), chargees: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family + ' ' + f.weight) }
  })
  expect(polices.inter).toBe(true)
  expect(polices.poppins).toBe(true)
  expect(polices.chargees.length).toBeGreaterThanOrEqual(2)

  await page.getByRole('button', { name: 'Carte', exact: true }).click()
  await expect(page.locator('h1')).toHaveText('Carte')
  await expect(page.locator('.react-flow__node').first()).toBeVisible()
  await expect(page.getByText('React Flow')).toBeVisible()
  /* L'adresse suit la navigation, sans erreur en file://. */
  await expect.poll(() => page.evaluate(() => location.hash)).toContain('onglet=carte')

  /* Aucune requête hors de la page et de son fichier de données. */
  const autres = requetes.filter((u) => !u.startsWith('data:') && !u.startsWith('blob:') && u !== adresse && !u.endsWith('/dist/donnees.js'))
  expect(autres).toEqual([])
  expect(journal).toEqual([])
})

/* Servi en HTTP à un sous-chemin : la racine du dépôt est servie, l'application est sous /dist/. */
test.describe('servi en HTTP à un sous-chemin', () => {
  let serveur: Server
  let base = ''
  const RACINE = path.resolve(import.meta.dirname, '..')
  const TYPES: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json' }
  test.beforeAll(async () => {
    serveur = createServer((req, res) => {
      const demande = decodeURIComponent(new URL(req.url || '/', 'http://x').pathname)
      const chemin = path.join(RACINE, demande.endsWith('/') ? demande + 'index.html' : demande)
      if (!chemin.startsWith(RACINE + path.sep) || !existsSync(chemin)) {
        res.writeHead(404).end()
        return
      }
      res.writeHead(200, { 'content-type': TYPES[path.extname(chemin)] || 'application/octet-stream' }).end(readFileSync(chemin))
    })
    await new Promise<void>((ok) => serveur.listen(0, '127.0.0.1', ok))
    base = 'http://127.0.0.1:' + (serveur.address() as AddressInfo).port
  })
  test.afterAll(() => new Promise<void>((ok) => serveur.close(() => ok())))

  test("l'application et ses données se chargent sous /dist/, sans autre requête", async ({ page }) => {
    const journal: string[] = []
    const requetes: string[] = []
    page.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') journal.push(m.type() + ' : ' + m.text())
    })
    page.on('pageerror', (e) => journal.push('erreur : ' + String(e)))
    page.on('request', (r) => requetes.push(r.url()))
    await page.goto(base + '/dist/#onglet=regles&fonctionnalite=F07.1.a')
    await expect(page.locator('h1')).toHaveText('Règles')
    await expect(page.getByText('Facturation clinique · données du')).toBeVisible()
    await page.getByRole('button', { name: 'Carte', exact: true }).click()
    await expect(page.locator('.react-flow__node').first()).toBeVisible()
    const autres = requetes.filter((u) => !u.startsWith('data:') && !u.startsWith('blob:') && !u.startsWith(base + '/dist/'))
    expect(autres).toEqual([])
    expect(requetes.filter((u) => u.startsWith(base)).map((u) => new URL(u).pathname)).toEqual(['/dist/', '/dist/donnees.js'])
    expect(journal).toEqual([])
  })
})
