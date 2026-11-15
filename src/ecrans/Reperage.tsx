import { Button } from '@/composants/ui/button'
import { Card, CardContent } from '@/composants/ui/card'
import { Input } from '@/composants/ui/input'
import { ArbreAppels } from '@/composants/ArbreAppels'
import { Icone } from '@/composants/Icone'
import { Code, EtatVide, Marque, Marques, Stat } from '@/composants/Marques'
import { SelecteurArbre } from '@/composants/SelecteurArbre'
import { useMagasin } from '@/magasin/contexte'
import { vueReperage, type FicheFonction } from '@/vues/reperage'

export function Reperage() {
  const m = useMagasin()
  const v = vueReperage(m)
  return (
    <div className="flex flex-col gap-4">
      <h2 className="m-0 font-display text-lg/[26px] font-semibold text-balance text-foreground">{v.question}</h2>

      <Card>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="max-w-[520px] min-w-0 flex-[1_1_360px]">
              <SelecteurArbre options={v.optionsArbres} valeur={v.fonctionnaliteId} surChoix={v.surChoixArbre} />
            </div>
            <div className="relative max-w-[420px] min-w-0 flex-[1_1_340px]">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                <Icone nom="search" />
              </span>
              <Input
                value={v.recherche}
                onChange={(ev) => v.surRecherche(ev.target.value)}
                onFocus={v.surFocusRecherche}
                onKeyDown={(ev) => {
                  if (ev.key === 'Escape') v.fermerRecherche()
                }}
                placeholder="Rechercher une fonction dans tous les arbres…"
                aria-label="Rechercher une fonction dans tous les arbres"
                className="pl-9"
              />
              {v.resultatsOuverts && (
                <>
                  <button type="button" aria-label="Fermer les résultats" onClick={v.fermerRecherche} className="fixed inset-0 z-40 cursor-default" />
                  <div role="group" aria-label="Résultats de la recherche" className="absolute top-[calc(100%+6px)] left-0 z-50 max-h-[440px] w-[600px] max-w-[86vw] overflow-auto rounded-lg border bg-popover pb-2 text-popover-foreground shadow-md">
                    <div className="flex items-center gap-3 border-b py-2 pr-2 pl-4">
                      <span className="flex-1 text-[13px]/[18px] font-medium text-muted-foreground">{v.resumeResultats}</span>
                      <Button variant="ghost" size="icon-sm" aria-label="Fermer les résultats" onClick={v.fermerRecherche}>
                        <Icone nom="x" taille={14} />
                      </Button>
                    </div>
                    {v.groupes.map((g) => (
                      <div key={g.id}>
                        <div className="flex items-baseline gap-2 px-4 pt-3 pb-1">
                          <span className="font-mono text-xs/4 font-medium text-muted-foreground">{g.id}</span>
                          <span className="min-w-0 flex-1 truncate text-[13px]/[18px] font-semibold">{g.titre}</span>
                          <span className="text-xs/4 text-muted-foreground">{g.compte}</span>
                        </div>
                        {g.items.map((r, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={r.choisir}
                            className="flex min-h-9 w-full cursor-pointer flex-wrap items-center gap-x-2 gap-y-1 px-4 py-1 text-left outline-none hover:bg-accent focus-anneau-dedans"
                          >
                            <span className="min-w-0 flex-[1_1_160px] truncate font-mono text-[13px]/[18px] text-muted-foreground">
                              <span>{r.prefixe}</span>
                              <span className="font-semibold text-foreground">{r.nom}</span>
                            </span>
                            <Marques marques={r.marques} />
                            <span className="flex-none text-xs/4 text-muted-foreground">{r.contexte}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                    {v.aucunResultat && <p className="m-0 px-4 pt-5 pb-3 text-muted-foreground">Aucune fonction ne contient « {v.recherche} ». Vérifiez l'orthographe ou cherchez un nom d'objet.</p>}
                  </div>
                </>
              )}
            </div>
            <div className="ml-auto flex flex-wrap gap-1.5">
              <Marques marques={v.badges} />
            </div>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            {v.stats.map((s, i) => (
              <Stat key={i} disposition="empile" valeur={s.valeur} libelle={s.libelle} />
            ))}
          </div>
        </CardContent>
      </Card>

      {v.aArbre ? (
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-[999_1_520px]">
            <Card>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b py-3.5 pr-3 pl-5">
                <div className="grid min-w-0 flex-[1_1_240px] gap-0.5">
                  <h3 className="m-0 font-display text-[15px]/[22px] font-semibold text-foreground">Arbre d'appels</h3>
                  <p className="m-0 font-mono text-xs/[18px] wrap-anywhere text-muted-foreground">{v.signature}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button variant="ghost" size="sm" onClick={v.toutDeplier}>
                    Tout déplier
                  </Button>
                  <Button variant="ghost" size="sm" onClick={v.toutReplier}>
                    Tout replier
                  </Button>
                  <Button variant="outline" size="sm" onClick={v.allerCarte}>
                    <Icone nom="carte" taille={14} />
                    Voir la carte
                  </Button>
                </div>
              </div>
              <ArbreAppels lignes={v.lignes} />
            </Card>
          </div>
          {v.fiche && <Fiche f={v.fiche} />}
        </div>
      ) : (
        <Card className="px-5">
          <EtatVide icone={<Icone nom="network" taille={20} />} titre={v.vide.titre}>
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

function LigneAppel({ x }: { x: FicheFonction['appelle'][number] }) {
  return (
    <button
      type="button"
      onClick={x.aller}
      title={x.id}
      className="-mx-2 flex min-h-8 w-[calc(100%+16px)] cursor-pointer flex-wrap items-center gap-x-2 gap-y-0.5 rounded-md px-2 py-1 text-left outline-none hover:bg-accent focus-anneau"
    >
      <span className="min-w-0 flex-1 truncate font-mono text-[13px]/[18px] text-muted-foreground">
        <span>{x.prefixe}</span>
        <span className="font-semibold text-foreground">{x.nom}</span>
      </span>
      <span className="flex-none text-xs/4 text-muted-foreground tabular-nums">{x.ligne}</span>
      {x.marques.length > 0 && (
        <span className="flex flex-[1_1_100%] flex-wrap gap-x-1.5 gap-y-1 pb-0.5">
          <Marques marques={x.marques} />
        </span>
      )}
    </button>
  )
}

function Plus({ p }: { p: { a: boolean; texte: string; icone: string; basculer: () => void } }) {
  if (!p.a) return null
  return (
    <div className="pt-1">
      <Button variant="ghost" size="sm" onClick={p.basculer}>
        {p.texte}
        <Icone nom={p.icone} />
      </Button>
    </div>
  )
}

const DT = 'text-[13px]/[18px] font-medium text-muted-foreground'

function Fiche({ f }: { f: FicheFonction }) {
  return (
    <div className="sticky top-0 max-h-[calc(100vh-96px)] max-w-[480px] min-w-[300px] flex-[1_1_340px] overflow-y-auto rounded-xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2">
            <h3 className="m-0 font-display text-[15px]/[22px] font-semibold text-foreground">Fiche de la fonction</h3>
            <p className="m-0 font-mono text-[13px]/5 font-semibold wrap-anywhere text-foreground">{f.id}</p>
            <div className="flex flex-wrap gap-1.5">
              <Marque marque={{ ton: 'neutral', icone: 'file-text', texte: f.nature, variante: 'outline' }} />
              <Marques marques={f.marques} />
            </div>
          </div>

          {f.aSignature && (
            <div className="flex flex-wrap items-center gap-2 rounded-md bg-secondary px-3 py-2.5 text-[13px]/[18px] font-medium text-secondary-foreground">
              <span className="flex-[1_1_160px]">{f.signatureTexte}</span>
              {f.signatureAilleurs && (
                <Button variant="outline" size="sm" onClick={f.ouvrirSignature}>
                  {f.signatureBouton}
                  <Icone nom="chevron-right" />
                </Button>
              )}
            </div>
          )}

          <dl className="m-0 grid grid-cols-[132px_minmax(0,1fr)] gap-x-3 gap-y-2">
            <dt className={'col-span-2 ' + DT}>Fichier</dt>
            <dd className="col-span-2 -mt-1.5 mb-0 ml-0 font-mono text-xs/[18px] wrap-anywhere">{f.fichier}</dd>
            <dt className={DT}>Emplacement</dt>
            <dd className="m-0 text-[13px]/[18px]">{f.emplacement}</dd>
            <dt className={DT}>DataWindows</dt>
            <dd className="m-0 flex flex-wrap gap-x-1.5 gap-y-1 text-[13px]/[18px]">
              {f.datawindows.length ? f.datawindows.map((dw) => <Code key={dw}>{dw}</Code>) : <span className="text-muted-foreground">—</span>}
            </dd>
            <dt className={DT}>Appels non résolus</dt>
            <dd className="m-0 text-[13px]/[18px] tabular-nums">{f.nonResolus}</dd>
            <dt className={DT}>Taille du sous-arbre</dt>
            <dd className="m-0 text-[13px]/[18px]">
              {f.tailles.length ? (
                <span className="flex flex-wrap gap-x-3 gap-y-0.5">
                  {f.tailles.map((t) => (
                    <span key={t} className="whitespace-nowrap">
                      {t}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="text-muted-foreground">{f.tailleVide}</span>
              )}
            </dd>
          </dl>

          {f.arret && (
            <section className="grid gap-2 border-t pt-4">
              <h4 className="m-0 text-[13px]/[18px] font-semibold">
                Arrêt sur <span className="font-mono">{f.arret.objet}</span>
              </h4>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <Marque marque={f.arret.classe} />
                <Marque marque={f.arret.etat} />
                <span className="text-[13px]/[18px] text-muted-foreground">{f.arret.confiance}</span>
              </div>
              <p className="m-0 text-pretty">{f.arret.raison}</p>
              {f.arret.visees.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  <span className="text-[13px]/[18px] font-medium text-muted-foreground">Fonctionnalité visée</span>
                  {f.arret.visees.map((x) => (
                    <Button key={x.id} variant="outline" size="sm" onClick={x.ouvrir}>
                      {x.id} {x.titre}
                      <Icone nom="chevron-right" />
                    </Button>
                  ))}
                </div>
              )}
            </section>
          )}

          {f.differes.length > 0 && (
            <section className="grid gap-1.5 border-t pt-4">
              <h4 className="m-0 text-[13px]/[18px] font-semibold">Lancée en différé</h4>
              {f.differes.map((x, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={x.aller}
                  className="-mx-2 flex min-h-8 w-[calc(100%+16px)] cursor-pointer flex-wrap items-center gap-x-2 gap-y-0.5 rounded-md px-2 py-1 text-left outline-none hover:bg-accent focus-anneau"
                >
                  <span className="inline-flex text-info">
                    <Icone nom="clock" taille={14} />
                  </span>
                  <span className="text-[13px]/[18px] text-muted-foreground">par</span>
                  <span className="min-w-0 flex-[1_1_120px] font-mono text-[13px]/[18px] font-semibold wrap-anywhere">{x.fonction}</span>
                  <span className="flex-none text-xs/4 text-muted-foreground tabular-nums">{x.ligne}</span>
                  {x.lieu && <span className="flex-[1_1_100%] text-xs/4 text-muted-foreground">{x.lieu}</span>}
                </button>
              ))}
            </section>
          )}

          <section className="grid gap-0.5 border-t pt-4">
            <h4 className="m-0 mb-1 text-[13px]/[18px] font-semibold">{f.nbAppeleePar}</h4>
            {!f.appeleePar.length && <p className="m-0 text-[13px]/[18px] text-muted-foreground">{f.appeleeParVide}</p>}
            {f.appeleePar.map((x, i) => (
              <LigneAppel key={i} x={x} />
            ))}
            <Plus p={f.plusAppeleePar} />
          </section>

          <section className="grid gap-0.5 border-t pt-4">
            <h4 className="m-0 mb-1 text-[13px]/[18px] font-semibold">{f.nbAppelle}</h4>
            {!f.appelle.length && <p className="m-0 text-[13px]/[18px] text-muted-foreground">{f.appelleVide}</p>}
            {f.appelle.map((x, i) => (
              <LigneAppel key={i} x={x} />
            ))}
            <Plus p={f.plusAppelle} />
          </section>

          {f.ailleurs.length > 0 && (
            <section className="grid gap-2 border-t pt-4">
              <h4 className="m-0 text-[13px]/[18px] font-semibold">Présente aussi dans</h4>
              <div className="flex flex-wrap gap-1.5">
                {f.ailleurs.map((x) => (
                  <Button key={x.id} variant="outline" size="sm" title={x.titre} onClick={x.ouvrir}>
                    {x.id}
                  </Button>
                ))}
              </div>
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
