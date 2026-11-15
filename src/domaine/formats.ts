/* Formats français : milliers, pluriels, dates. */

export const NBSP = ' '

export function nb(n: number | string | null | undefined): string {
  if (n == null || n === '') return '—'
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
}

export function pl(n: number, un: string, plusieurs: string): string {
  return n > 1 ? plusieurs : un
}

export function compte(n: number, un: string, plusieurs: string): string {
  return nb(n) + NBSP + pl(n, un, plusieurs)
}

export function dateFr(iso: string | null | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '')
  return m ? m[3] + '/' + m[2] + '/' + m[1] : '—'
}

export function aujourdhui(maintenant: Date = new Date()): string {
  const z = (n: number) => (n < 10 ? '0' : '') + n
  return maintenant.getFullYear() + '-' + z(maintenant.getMonth() + 1) + '-' + z(maintenant.getDate())
}

export function majuscule(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

export function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T
}

export function moyenne(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length
}
