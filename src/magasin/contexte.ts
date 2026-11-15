import { createContext, useContext, useSyncExternalStore } from 'react'
import type { Magasin } from './magasin'

export const ContexteMagasin = createContext<Magasin | null>(null)

/** Le magasin de l'application. Le composant se redessine à chaque action. */
export function useMagasin(): Magasin {
  const m = useContext(ContexteMagasin)
  if (!m) throw new Error('useMagasin : aucun magasin fourni')
  useSyncExternalStore(m.abonner, () => m.version)
  return m
}
