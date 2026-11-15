/* La souris et le clavier, que les captures (rejouées par l'adresse) n'exercent pas ; puis la largeur de 1 280 px. */

import { expect, test, type Locator, type Page } from '@playwright/test'
import { adresse, ETATS } from './etats.ts'

function suivreLeJournal(page: Page) {
  const journal: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') journal.push(m.type() + ' : ' + m.text())
  })
  page.on('pageerror', (e) => journal.push('erreur : ' + String(e)))
  return journal
}

const vue = (page: Page) =>
  page.locator('.react-flow__viewport').evaluate((e) => {
    const m = new DOMMatrix(getComputedStyle(e).transform)
    return { x: m.e, y: m.f, s: m.a }
  })

/* Un point de la zone où rien n'est dessiné : c'est là que la vue se saisit. */
async function pointVide(page: Page, zone: Locator) {
  const b = (await zone.boundingBox())!
  const p = await page.evaluate((b) => {
    for (let y = b.y + b.height - 40; y > b.y + 20; y -= 17)
      for (let x = b.x + 20; x < b.x + b.width - 220; x += 23) {
        const el = document.elementFromPoint(x, y)
        if (el && el.classList.contains('react-flow__pane')) return { x, y }
      }
    return null
  }, b)
  expect(p, 'un point vide dans la zone de la carte').not.toBeNull()
  return p!
}

const noeud = (page: Page, id: string) => page.locator('.react-flow__node').filter({ has: page.locator(`button[title="${id}"]`) })

test.describe('carte à la souris', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('choisir, replier sur place, glisser, molette, Ctrl + molette, boutons de zoom', async ({ page }) => {
    const journal = suivreLeJournal(page)
    await page.goto('/#onglet=carte&fonctionnalite=F07.1')
    const zone = page.getByRole('group', { name: /^Carte des appels de / })
    await expect(zone.locator('.react-flow__node').first()).toBeVisible()

    /* Un clic sur le nœud le sélectionne ; le pied le nomme. */
    await noeud(page, 'w_sejour.uf_lire_dossier').locator('button[aria-pressed]').click()
    await expect(noeud(page, 'w_sejour.uf_lire_dossier').locator('button[aria-pressed]')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText('Sélection', { exact: true }).locator('..')).toContainText('w_sejour.uf_lire_dossier')

    /* Replier puis déplier : le nœud reste à la même place à l'écran. */
    const avant = (await noeud(page, 'w_sejour.uf_lire_dossier').boundingBox())!
    await page.getByRole('button', { name: 'Replier uf_lire_dossier' }).click()
    await expect(page.getByRole('button', { name: /^Déplier uf_lire_dossier/ })).toHaveAttribute('aria-expanded', 'false')
    const replie = (await noeud(page, 'w_sejour.uf_lire_dossier').boundingBox())!
    expect(Math.abs(replie.x - avant.x)).toBeLessThan(1.5)
    expect(Math.abs(replie.y - avant.y)).toBeLessThan(1.5)
    /* Le double-clic sur le nœud bascule aussi. */
    await noeud(page, 'w_sejour.uf_lire_dossier').locator('button[aria-pressed]').dblclick()
    await expect(page.getByRole('button', { name: 'Replier uf_lire_dossier' })).toHaveAttribute('aria-expanded', 'true')
    const deplie = (await noeud(page, 'w_sejour.uf_lire_dossier').boundingBox())!
    expect(Math.abs(deplie.y - avant.y)).toBeLessThan(1.5)

    /* Glisser déplace la vue. */
    const v0 = await vue(page)
    const p = await pointVide(page, zone)
    await page.mouse.move(p.x, p.y)
    await page.mouse.down()
    await page.mouse.move(p.x - 60, p.y - 40, { steps: 6 })
    await page.mouse.move(p.x - 120, p.y - 80, { steps: 6 })
    await page.mouse.up()
    const v1 = await vue(page)
    expect(v1.x - v0.x).toBeCloseTo(-120, -1)
    expect(v1.y - v0.y).toBeCloseTo(-80, -1)
    expect(v1.s).toBe(v0.s)

    /* La molette fait défiler la carte, pas la page ; l'échelle ne change pas. */
    const defilement = await page.evaluate(() => scrollY)
    await page.mouse.move(p.x, p.y)
    await page.mouse.wheel(0, 200)
    await expect.poll(async () => (await vue(page)).y).toBeLessThan(v1.y - 20)
    expect((await vue(page)).s).toBe(v0.s)
    expect(await page.evaluate(() => scrollY)).toBe(defilement)

    /* Ctrl + molette change l'échelle, dans les bornes de 10 à 150 %. */
    await page.keyboard.down('Control')
    await page.mouse.wheel(0, -600)
    await page.keyboard.up('Control')
    await expect.poll(async () => (await vue(page)).s).toBeGreaterThan(v0.s)
    expect((await vue(page)).s).toBeLessThanOrEqual(1.5)
    await page.keyboard.down('Control')
    for (let i = 0; i < 12; i++) await page.mouse.wheel(0, 1000)
    await page.keyboard.up('Control')
    await expect.poll(async () => (await vue(page)).s).toBeLessThan(0.5)
    expect((await vue(page)).s).toBeGreaterThanOrEqual(0.1 - 1e-6)

    /* Les boutons de la barre : 100 %, zoom avant jusqu'au plafond, Ajuster. */
    await page.getByRole('button', { name: /^Zoom à / }).click()
    await expect.poll(async () => (await vue(page)).s).toBeCloseTo(1, 3)
    await expect(page.getByRole('button', { name: /^Zoom à / })).toHaveText('100 %')
    const plus = page.getByRole('button', { name: 'Zoom avant' })
    for (let i = 0; i < 10 && (await plus.isEnabled()); i++) {
      await plus.click()
      await page.waitForTimeout(250)
    }
    await expect(plus).toBeDisabled()
    expect((await vue(page)).s).toBeCloseTo(1.5, 3)
    await page.getByRole('button', { name: 'Ajuster' }).click()
    await expect.poll(async () => (await vue(page)).s).toBeLessThanOrEqual(1)

    expect(journal).toEqual([])
  })

  test('suivre un renvoi ramène la sélection dans le champ ; le focus d’un nœud hors champ l’amène à l’écran', async ({ page }) => {
    const journal = suivreLeJournal(page)
    await page.goto('/#onglet=carte&fonctionnalite=F07.1&renvois=oui')
    const zone = page.getByRole('group', { name: /^Carte des appels de / })
    await expect(zone.locator('.react-flow__node').first()).toBeVisible()

    /* Un renvoi porte une flèche de suivi : elle sélectionne l'endroit où la fonction est développée. */
    const suivre = zone.getByRole('button', { name: 'Aller à son développement' }).first()
    await expect(suivre).toBeVisible()
    await suivre.click()
    const choisi = zone.locator('button[aria-pressed=true]')
    await expect(choisi).toHaveCount(1)
    const z = (await zone.boundingBox())!
    await expect
      .poll(async () => {
        const b = (await choisi.boundingBox())!
        return b.y >= z.y && b.y + b.height <= z.y + z.height && b.x >= z.x && b.x + b.width <= z.x + z.width
      })
      .toBe(true)

    /* On emmène la vue loin, puis on donne le focus à un nœud : la vue le ramène. */
    const p = await pointVide(page, zone)
    await page.mouse.move(p.x, p.y)
    await page.mouse.down()
    await page.mouse.move(p.x + 900, p.y + 500, { steps: 10 })
    await page.mouse.up()
    const cible = noeud(page, 'w_sejour.uf_lire_dossier').locator('button[aria-pressed]')
    await cible.focus()
    await expect
      .poll(async () => {
        const b = (await cible.boundingBox())!
        return b.y >= z.y && b.y + b.height <= z.y + z.height && b.x >= z.x && b.x + b.width <= z.x + z.width
      })
      .toBe(true)
    expect(journal).toEqual([])
  })
})

test('carte réelle à 1 440 px : 91 nœuds, et les quatre colonnes de départ tiennent dans la largeur de la zone', async ({ page }) => {
  const journal = suivreLeJournal(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#jeu=depart&onglet=carte&fonctionnalite=F22.1')
  const zone = page.getByRole('group', { name: /^Carte des appels de / })
  await expect(zone.locator('.react-flow__node')).toHaveCount(91)
  await expect(page.getByRole('button', { name: /^Zoom à / })).toHaveText('100 %')
  const mesure = await zone.evaluate((z) => {
    const r = z.getBoundingClientRect()
    const noeuds = [...z.querySelectorAll('.react-flow__node')].map((n) => n.getBoundingClientRect())
    return { gauche: r.left, droite: r.right, min: Math.min(...noeuds.map((n) => n.left)), max: Math.max(...noeuds.map((n) => n.right)), colonnes: new Set(noeuds.map((n) => Math.round(n.left))).size }
  })
  expect(mesure.colonnes).toBe(4)
  expect(mesure.min).toBeGreaterThanOrEqual(mesure.gauche)
  expect(mesure.max).toBeLessThanOrEqual(mesure.droite)
  expect(journal).toEqual([])
})

test.describe('clavier', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  /* Tab traverse chaque onglet ; chaque élément atteint montre un anneau de focus. */
  for (const onglet of ['reperage', 'carte', 'regles', 'dependances']) {
    test('focus visible partout : ' + onglet, async ({ page }) => {
      const journal = suivreLeJournal(page)
      await page.goto('/#onglet=' + onglet + '&fonctionnalite=F07.1.a&auteur=DURAND Claire')
      await expect(page.locator('h1')).toBeVisible()
      const sansAnneau: string[] = []
      const vus = new Set<string>()
      for (let i = 0; i < 60; i++) {
        await page.keyboard.press('Tab')
        const el = await page.evaluate(() => {
          const a = document.activeElement as HTMLElement | null
          if (!a || a === document.body) return null
          const s = getComputedStyle(a)
          const anneau = (s.boxShadow !== 'none' && s.boxShadow !== '') || (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0)
          const nom = a.getAttribute('aria-label') || a.getAttribute('title') || (a.textContent || '').trim().slice(0, 40) || a.tagName
          return { nom: a.tagName.toLowerCase() + ' « ' + nom + ' »', anneau, matches: a.matches(':focus-visible') }
        })
        if (!el) continue
        if (vus.has(el.nom)) continue
        vus.add(el.nom)
        if (!el.anneau) sansAnneau.push(el.nom)
      }
      expect(vus.size).toBeGreaterThan(5)
      expect(sansAnneau).toEqual([])
      expect(journal).toEqual([])
    })
  }

  test('recherche : Échap ferme les résultats ; dialogues : le focus reste dedans, Échap ferme', async ({ page }) => {
    const journal = suivreLeJournal(page)
    await page.goto('/#onglet=reperage&fonctionnalite=F07.1')
    const recherche = page.getByRole('textbox', { name: 'Rechercher une fonction dans tous les arbres' })
    await recherche.fill('f_lit')
    const resultats = page.getByRole('group', { name: 'Résultats de la recherche' })
    await expect(resultats).toBeVisible()
    await recherche.press('Escape')
    await expect(resultats).toHaveCount(0)

    const importer = page.getByRole('button', { name: 'Importer' })
    await importer.focus()
    await page.keyboard.press('Enter')
    const dialogue = page.getByRole('dialog', { name: 'Importer un fichier' })
    await expect(dialogue).toBeVisible()
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role=dialog]'))).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(dialogue).toHaveCount(0)
    await expect(importer).toBeFocused()
    expect(journal).toEqual([])
  })

  test('le nom : Entrée valide, et la saisie en attente s’applique', async ({ page }) => {
    const journal = suivreLeJournal(page)
    await page.goto('/#onglet=regles&fonctionnalite=F07.1.a')
    const carte = page.locator('section[data-slot=card]').filter({ hasText: 'RM-CHAMBREPART-3' })
    await carte.getByRole('button', { name: 'Validée' }).click()
    await expect(page.getByRole('dialog', { name: 'Qui saisit ?' })).toBeVisible()
    await page.locator('#tp-nom').fill('BERNARD Lucie')
    await page.locator('#tp-nom').press('Enter')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(carte.getByRole('button', { name: 'Validée' })).toHaveAttribute('aria-pressed', 'true')
    await expect(carte.getByText(/BERNARD Lucie · /)).toBeVisible()
    expect(journal).toEqual([])
  })
})

test.describe('1 280 px de large', () => {
  /* Aucune page ne défile en largeur ; seuls le graphe, la carte et le bloc Gherkin défilent dans leur cadre. */
  for (const e of ETATS.filter((e) => !e.actions)) {
    test(e.nom, async ({ page }) => {
      const journal = suivreLeJournal(page)
      await page.setViewportSize({ width: 1280, height: 900 })
      await page.goto(adresse(e))
      await expect(page.locator('h1')).toBeVisible()
      await page.waitForTimeout(300)
      const mesure = await page.evaluate(() => {
        const racine = document.documentElement
        const defilants = [...document.querySelectorAll<HTMLElement>('body *')]
          .filter((el) => {
            const s = getComputedStyle(el)
            return (s.overflowX === 'auto' || s.overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 1
          })
          .map((el) => {
            if (el.closest('[aria-label="Scénario Gherkin"]')) return 'gherkin'
            if (el.querySelector('[role=group][aria-label^="Ordre d\'extraction"]')) return 'graphe'
            if (el.closest('.react-flow')) return 'carte'
            return el.tagName.toLowerCase() + '.' + el.className.toString().split(' ').slice(0, 4).join('.')
          })
        return { largeur: racine.scrollWidth, fenetre: racine.clientWidth, defilants }
      })
      expect(mesure.largeur, 'la page ne défile pas en largeur').toBeLessThanOrEqual(mesure.fenetre)
      expect(mesure.defilants.filter((d) => !['gherkin', 'graphe', 'carte'].includes(d))).toEqual([])
      expect(journal).toEqual([])
    })
  }
})
