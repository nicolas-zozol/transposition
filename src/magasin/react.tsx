import { ContexteMagasin } from './contexte'
import type { Magasin } from './magasin'

export function FournisseurMagasin({ magasin, children }: { magasin: Magasin; children: React.ReactNode }) {
  return <ContexteMagasin.Provider value={magasin}>{children}</ContexteMagasin.Provider>
}
