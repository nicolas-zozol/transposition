import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Coquille } from '@/ecrans/Coquille'
import { chargerDonnees } from '@/magasin/chargement'
import { creerMagasin } from '@/magasin/magasin'
import { ecrireStock, lireStock, poserStock } from '@/magasin/persistance'
import { FournisseurMagasin } from '@/magasin/react'
import { lireParametres, suivreAdresse } from '@/magasin/url'

async function demarrer() {
  const options = lireParametres(location)
  const { donnees, jeu } = await chargerDonnees(options.jeu)
  const m = creerMagasin(donnees, { ...options, jeu })
  /* Les saisies, le nom et le thème gardés dans ce navigateur. Un paramètre de l'adresse l'emporte, pour rejouer un état. */
  const stock = lireStock()
  if (stock) poserStock(m, stock, { auteur: !!options.auteur, theme: !!options.theme })
  ecrireStock(m)
  m.abonner(() => ecrireStock(m))
  suivreAdresse(m)
  document.documentElement.classList.toggle('dark', m.etat.theme === 'dark')
  createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <FournisseurMagasin magasin={m}>
        <Coquille />
      </FournisseurMagasin>
    </StrictMode>
  )
}

void demarrer()
