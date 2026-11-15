/* Tracé d'une ligne brisée aux coins arrondis, pour les flèches de la carte et du graphe. */

export type Pt = [number, number]

export function cheminArrondi(pts: Pt[], r: number): string {
  const propres = pts.filter((p, i) => i === 0 || p[0] !== pts[i - 1][0] || p[1] !== pts[i - 1][1])
  const fx = (p: Pt) => Math.round(p[0] * 10) / 10 + ' ' + Math.round(p[1] * 10) / 10
  const dist = (p: Pt, q: Pt) => Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1])
  let d = 'M ' + fx(propres[0])
  for (let i = 1; i < propres.length - 1; i++) {
    const p0 = propres[i - 1]
    const p1 = propres[i]
    const p2 = propres[i + 1]
    const d1 = dist(p0, p1)
    const d2 = dist(p1, p2)
    const rr = Math.min(r, d1 / 2, d2 / 2)
    const a: Pt = [p1[0] + ((p0[0] - p1[0]) * rr) / d1, p1[1] + ((p0[1] - p1[1]) * rr) / d1]
    const b: Pt = [p1[0] + ((p2[0] - p1[0]) * rr) / d2, p1[1] + ((p2[1] - p1[1]) * rr) / d2]
    d += ' L ' + fx(a) + ' Q ' + fx(p1) + ' ' + fx(b)
  }
  return d + ' L ' + fx(propres[propres.length - 1])
}
