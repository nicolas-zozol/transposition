import { defineConfig, devices } from '@playwright/test'

/* Le parcours de bout en bout et les captures tournent sur le serveur de développement : les jeux de volumes
   (jeu=depart, jeu=intermediaire) ne se chargent qu'en développement. L'essai en file:// ouvre dist/index.html. */
const PORT = 5174

export default defineConfig({
  testDir: 'essais',
  timeout: 60_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:' + PORT,
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    ...devices['Desktop Chrome'],
    deviceScaleFactor: 1,
  },
  webServer: {
    command: 'npm run donnees && npx vite --host 127.0.0.1 --port ' + PORT + ' --strictPort',
    url: 'http://127.0.0.1:' + PORT,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
