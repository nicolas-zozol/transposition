/* Bloc Gherkin : découpe une ligne en segments colorés, sans toucher aux espaces. */

export type CouleurSegment = 'inherit' | 'motCle' | 'variable' | 'separateur'

export interface Segment {
  t: string
  c: CouleurSegment
  w: 400 | 600
}

export interface LigneGherkin {
  n: number
  segs: Segment[]
}

const MOTS = ['Fonctionnalité:', 'Règle:', 'Contexte:', 'Plan du scénario:', 'Plan du Scénario:', 'Scénario:', 'Exemples:', 'Étant donné que', "Étant donné qu'", 'Étant donné', 'Soit', 'Quand', 'Lorsque', "Lorsqu'", 'Alors', 'Et que', "Et qu'", 'Et', 'Mais']

export function gherkin(texte: string | null | undefined): LigneGherkin[] {
  const lignes = String(texte == null ? '' : texte).replace(/\s+$/, '').split('\n')
  let enTableau = false
  return lignes.map((l, i) => {
    const x = /^(\s*)(.*)$/.exec(l) as RegExpExecArray
    const retrait = x[1]
    let reste = x[2]
    const segs: Segment[] = []
    if (retrait) segs.push({ t: retrait, c: 'inherit', w: 400 })
    if (reste.charAt(0) === '|') {
      const entete = !enTableau
      enTableau = true
      reste.split(/(\|)/).forEach((p) => {
        if (p === '') return
        segs.push(p === '|' ? { t: '|', c: 'separateur', w: 400 } : { t: p, c: 'inherit', w: entete ? 600 : 400 })
      })
    } else {
      enTableau = false
      let mot: string | null = null
      for (let k = 0; k < MOTS.length && !mot; k++) {
        const cand = MOTS[k]
        const fin = cand.slice(-1)
        if (reste.indexOf(cand) === 0 && (fin === ':' || fin === "'" || reste.length === cand.length || reste.charAt(cand.length) === ' ')) mot = cand
      }
      if (mot) {
        segs.push({ t: mot, c: 'motCle', w: 600 })
        reste = reste.slice(mot.length)
      }
      reste.split(/(<[^<>]+>)/).forEach((p) => {
        if (!p) return
        segs.push(/^<[^<>]+>$/.test(p) ? { t: p, c: 'variable', w: 600 } : { t: p, c: 'inherit', w: 400 })
      })
    }
    if (!segs.length) segs.push({ t: ' ', c: 'inherit', w: 400 })
    return { n: i + 1, segs }
  })
}
