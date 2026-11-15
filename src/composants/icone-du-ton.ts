import type { IconeDef, Ton } from '@/domaine/libelles'

/** L'icône qu'un ton prend quand la marque demande « l'icône du ton ». */
const ICONE_DU_TON: Partial<Record<Ton, string>> = { success: 'check', warning: 'triangle-alert', destructive: 'ban', info: 'info' }

export function nomIcone(icone: IconeDef | false | undefined, ton: Ton): string | null {
  if (!icone) return null
  return icone === true ? ICONE_DU_TON[ton] || null : icone
}
