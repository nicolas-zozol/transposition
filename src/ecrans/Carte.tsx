import { Button } from '@/composants/ui/button'
import { Card, CardContent } from '@/composants/ui/card'
import { CarteAppels } from '@/composants/CarteAppels'
import { Icone } from '@/composants/Icone'
import { EtatVide, Marque, Marques, Stat } from '@/composants/Marques'
import { SelecteurArbre } from '@/composants/SelecteurArbre'
import { useMagasin } from '@/magasin/contexte'
import { vueCarte } from '@/vues/carte'

export function Carte() {
  const m = useMagasin()
  const v = vueCarte(m)
  return (
    <div className="flex flex-col gap-4">
      <h2 className="m-0 font-display text-lg/[26px] font-semibold text-balance text-foreground">{v.question}</h2>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="max-w-[520px] min-w-0 flex-[1_1_320px]">
            <SelecteurArbre options={v.optionsArbres} valeur={v.fonctionnaliteId} surChoix={v.surChoixArbre} />
          </div>
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-0.5">
            {v.stats.map((s, i) => (
              <Stat key={i} valeur={s.valeur} libelle={s.libelle} />
            ))}
          </div>
        </CardContent>
      </Card>

      {v.aArbre ? (
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b py-3 pr-3 pl-5">
            <div className="grid min-w-0 flex-[1_1_380px] gap-0.5">
              <h3 className="m-0 font-display text-[15px]/[22px] font-semibold text-foreground">Carte des appels</h3>
              <p className="m-0 text-[13px]/[18px] text-pretty text-muted-foreground">Une flèche va d'une fonction à celle qu'elle appelle ; le nombre est la taille de la branche, en fonctions.</p>
            </div>
            <div role="group" aria-label="Légende" className="flex flex-wrap items-center gap-x-3.5 gap-y-1 pr-2">
              {v.legende.map((q) => (
                <span key={q.texte} className="inline-flex items-center gap-1.5 text-xs/4 whitespace-nowrap text-muted-foreground">
                  <span aria-hidden="true" className="box-border h-3 w-[18px] flex-none rounded" style={{ background: q.fond, border: '1px ' + q.trait + ' ' + q.bord }} />
                  {q.texte}
                </span>
              ))}
              {v.aDifferes && (
                <span className="inline-flex items-center gap-1.5 text-xs/4 whitespace-nowrap text-muted-foreground">
                  <span aria-hidden="true" className="grid size-4 flex-none place-items-center rounded-full bg-info-soft text-info">
                    <Icone nom="clock" taille={11} />
                  </span>
                  Appel en différé
                </span>
              )}
            </div>
          </div>
          <CarteAppels />
          {v.selection && (
            <div className="flex items-center gap-4 border-t py-2.5 pr-3 pl-5">
              <div className="grid min-w-0 flex-1 gap-0.5">
                <div className="flex h-6 min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap">
                  <span className="flex-none text-[13px]/[18px] font-medium text-muted-foreground">Sélection</span>
                  <span title={v.selection.id} className="min-w-0 flex-[0_1_auto] truncate font-mono text-[13px]/5 font-semibold text-foreground">
                    {v.selection.id}
                  </span>
                  <Marque marque={{ ton: 'neutral', icone: 'file-text', texte: v.selection.nature, variante: 'outline' }} className="flex-none" />
                  <Marques marques={v.selection.marques} className="flex-none" />
                </div>
                <p className="m-0 truncate text-[13px]/[18px] text-muted-foreground tabular-nums">{v.selection.resume}</p>
              </div>
              <div className="flex-none">
                <Button variant="outline" size="sm" onClick={v.allerReperage}>
                  Voir dans Repérage
                  <Icone nom="chevron-right" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card className="px-5">
          <EtatVide icone={<Icone nom="carte" taille={20} />} titre={v.vide.titre}>
            <p className="m-0 text-pretty">{v.vide.texte}</p>
            {v.vide.aSignature && (
              <p className="m-0 text-[13px]/[18px] text-muted-foreground">
                Signature mère : <span className="font-mono text-xs/[18px] text-foreground">{v.vide.signature}</span>
              </p>
            )}
            {v.vide.ordre && (
              <Button variant="outline" onClick={v.vide.allerDependances}>
                Voir dans Dépendances
                <Icone nom="chevron-right" />
              </Button>
            )}
          </EtatVide>
        </Card>
      )}
    </div>
  )
}
