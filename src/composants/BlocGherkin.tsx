import { gherkin, type CouleurSegment } from '@/domaine/gherkin'

const COULEURS: Record<CouleurSegment, string | undefined> = {
  inherit: undefined,
  motCle: 'var(--primary)',
  variable: 'var(--info)',
  separateur: 'var(--input)',
}

/** Un scénario Gherkin : mots-clés en indigo, variables en bleu, tableaux alignés, espaces gardés. */
export function BlocGherkin({ texte }: { texte: string }) {
  const lignes = gherkin(texte)
  return (
    <div role="group" aria-label="Scénario Gherkin" tabIndex={0} className="m-0 overflow-x-auto rounded-md border bg-background px-4 py-3 font-mono text-[13px]/5 text-foreground outline-none focus-anneau">
      {lignes.map((l) => (
        <div key={l.n} className="whitespace-pre">
          {l.segs.map((s, i) => (
            <span key={i} style={{ color: COULEURS[s.c], fontWeight: s.w }}>
              {s.t}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
