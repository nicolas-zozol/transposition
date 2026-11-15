import { useState } from 'react'
import { cn } from 'cn'
import { Button } from '@/composants/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/composants/ui/card'
import { Input } from '@/composants/ui/input'
import { Label } from '@/composants/ui/label'
import { Textarea } from '@/composants/ui/textarea'
import { BlocGherkin } from '@/composants/BlocGherkin'
import { Icone } from '@/composants/Icone'
import { Code, EtatVide, Marque, Marques, PointStatut, Stat } from '@/composants/Marques'
import { Onglets } from '@/composants/Onglets'
import { Tableau, type Colonne } from '@/composants/Tableau'
import type { Ton } from '@/domaine/libelles'
import { useMagasin } from '@/magasin/contexte'
import { vueRegles, type FicheRegles, type VueRegle } from '@/vues/regles'

export function Regles() {
  const m = useMagasin()
  const v = vueRegles(m)
  return (
    <div className="flex flex-col gap-4">
      <h2 className="m-0 font-display text-lg/[26px] font-semibold text-balance text-foreground">{v.question}</h2>
      <div className="flex flex-wrap items-start gap-4">
        <div className="sticky top-0 max-w-[380px] min-w-[300px] flex-[1_1_320px]">
          <Card>
            <div className="grid gap-1 px-4 pt-4">
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                  <Icone nom="search" />
                </span>
                <Input value={v.rechercheFonc} onChange={(ev) => v.surRechercheFonc(ev.target.value)} placeholder="Rechercher une fonctionnalité…" aria-label="Rechercher une fonctionnalité" className="pl-9" />
              </div>
              <Onglets items={v.filtres} valeur={v.filtre} surChoix={v.surFiltre} libelle="Filtrer les fonctionnalités" className="gap-5" />
            </div>
            <div className="max-h-[calc(100vh-300px)] min-h-40 overflow-y-auto rounded-b-xl">
              {v.liste.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={l.choisir}
                  aria-current={l.selectionnee || undefined}
                  className={cn(
                    'grid w-full cursor-pointer gap-1.5 border-b py-3 pr-4 text-left outline-none hover:bg-[color-mix(in_oklab,var(--muted)_70%,transparent)] focus-anneau-dedans',
                    l.sous ? 'pl-9' : 'pl-4',
                    l.selectionnee && 'bg-secondary hover:bg-secondary',
                    l.estompee && 'opacity-70'
                  )}
                >
                  <span className="flex items-baseline gap-2">
                    <span className="flex-none font-mono text-xs/4 font-medium text-muted-foreground">{l.id}</span>
                    <span className="text-sm font-semibold text-pretty text-foreground">{l.titre}</span>
                  </span>
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <PointStatut ton={l.extraction.ton}>{l.extraction.texte}</PointStatut>
                    <span className="text-[13px]/[18px] text-muted-foreground">{l.reglesTexte}</span>
                    {l.verdict && <Marque marque={l.verdict} />}
                  </span>
                </button>
              ))}
              {!v.liste.length && <p className="m-0 px-4 py-6 text-center text-muted-foreground">Aucune fonctionnalité ne correspond. Changez de filtre ou de recherche.</p>}
              {v.orphelinesTexte && <p className="m-0 px-4 py-3 text-[13px]/[18px] text-muted-foreground">{v.orphelinesTexte}</p>}
            </div>
          </Card>
        </div>
        {v.fiche && <Fiche f={v.fiche} />}
      </div>
    </div>
  )
}

function Fiche({ f }: { f: FicheRegles }) {
  return (
    <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
            <div className="grid min-w-0 flex-[1_1_320px] gap-1.5">
              <span className="font-mono text-xs/4 font-medium text-muted-foreground">{f.id}</span>
              <h3 className="m-0 font-display text-lg/[26px] font-semibold text-balance text-foreground">{f.titre}</h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]/[18px] text-muted-foreground">
                <span>{f.page}</span>
                {f.mereTexte && (
                  <>
                    <span>Sous-fonctionnalité de</span>
                    <Button variant="link" className="text-[13px]/[18px]" onClick={f.ouvrirMere}>
                      {f.mereTexte}
                    </Button>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <Marques marques={f.badges} />
              </div>
            </div>
            <Onglets items={f.modeItems} valeur={f.mode} surChoix={f.surMode} libelle="Lecture des exemples" forme="segmente" />
          </div>

          {f.aAlerte && (
            <div role="status" className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md bg-warning-soft px-4 py-2.5 text-sm font-medium text-warning">
              <Icone nom="triangle-alert" />
              <span className="flex-[1_1_240px] font-normal text-foreground">{f.alerte}</span>
              <Button variant="outline" size="sm" onClick={f.allerDependances}>
                Voir dans Dépendances
                <Icone nom="chevron-right" />
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-start gap-x-10 gap-y-4 border-t pt-4">
            <Stat disposition="empile" valeur={f.statRegles} libelle={f.libRegles} />
            <Stat disposition="empile" valeur={f.statUnitaires} libelle={f.libUnitaires} />
            <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
              <Stat disposition="empile" valeur={f.statIntegration} libelle={f.libIntegration} />
              {f.integration.length > 0 && (
                <div className="flex max-w-[260px] flex-wrap gap-x-3 gap-y-0.5 pb-[5px]">
                  {f.integration.map((x) => (
                    <PointStatut key={x.texte} ton={x.ton}>
                      {x.texte}
                    </PointStatut>
                  ))}
                </div>
              )}
            </div>
            <span className="flex-1" />
            <div className="grid gap-1">
              <div className="flex flex-wrap items-start gap-x-6 gap-y-4">
                <Stat disposition="empile" valeur={f.depDe} libelle="Dépend de" />
                <Stat disposition="empile" valeur={f.depPar} libelle="Requise par" />
                <Stat disposition="empile" valeur={f.depManquantes} libelle="Manquantes" ton={f.manquantesEnAlerte ? 'warning' : undefined} />
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px]/[18px] text-muted-foreground">
                {f.depNote && <span>{f.depNote}</span>}
                <Button variant="link" className="text-[13px]/[18px]" onClick={f.allerDependances}>
                  Voir les dépendances
                  <Icone nom="arrow-right" taille={14} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {f.aRegles ? (
        <>
          <div className="grid gap-1 pt-2">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5">
              <h3 className="m-0 font-display text-[15px]/[22px] font-semibold text-foreground">Règles métier</h3>
              {f.decoupage && <span className="text-[13px]/[18px] text-muted-foreground">{f.decoupage}</span>}
            </div>
            <Onglets items={f.filtresRegles} valeur={f.filtreRegles} surChoix={f.surFiltreRegles} libelle="Filtrer les règles par avis" />
          </div>
          {f.regles.map((r) => (
            <CarteRegle key={r.id} r={r} gherkin={f.mode === 'gherkin'} />
          ))}
          {f.aucuneDansFiltre && (
            <Card>
              <CardContent>
                <p className="m-0 py-4 text-center text-muted-foreground">Aucune règle dans cette file. Choisissez « Toutes » pour les relire.</p>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="px-5">
          <EtatVide icone={<Icone nom="list-checks" taille={20} />} titre={f.vide.titre}>
            <p className="m-0 max-w-[64ch] text-pretty">{f.vide.texte}</p>
            {f.vide.sous.length > 0 && (
              <div className="grid w-full max-w-[720px] gap-2">
                {f.vide.sous.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={s.ouvrir}
                    className="flex min-h-12 w-full cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border py-2 pr-3 pl-4 text-left outline-none hover:bg-accent focus-anneau"
                  >
                    <span className="font-mono text-xs/4 font-medium text-muted-foreground">{s.id}</span>
                    <span className="flex-[1_1_200px] text-sm font-semibold">{s.titre}</span>
                    <PointStatut ton={s.extraction.ton}>{s.extraction.texte}</PointStatut>
                    <span className="text-[13px]/[18px] text-muted-foreground">{s.detail}</span>
                    <span className="inline-flex text-muted-foreground">
                      <Icone nom="chevron-right" />
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" onClick={f.vide.allerReperage}>
                Voir son arbre dans Repérage
                <Icone nom="chevron-right" />
              </Button>
              <Button variant="outline" onClick={f.vide.allerDependances}>
                Voir dans Dépendances
                <Icone nom="chevron-right" />
              </Button>
            </div>
          </EtatVide>
        </Card>
      )}

      {f.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{f.titreQuestions}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            {f.questions.map((q) => (
              <div key={q.id} className="grid gap-2">
                <div className="flex items-start gap-3">
                  <p className="m-0 flex-1 text-sm font-semibold text-pretty">{q.texte}</p>
                  <Marque marque={q.etat} />
                </div>
                {q.regles.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <span className="text-xs/4 font-medium text-muted-foreground">Règles concernées</span>
                    {q.regles.map((idr) => (
                      <Code key={idr}>{idr}</Code>
                    ))}
                  </div>
                )}
                <Label htmlFor={q.idChamp} className="text-[13px]/[18px] font-medium">
                  Réponse
                </Label>
                <Textarea id={q.idChamp} rows={2} value={q.reponse} onChange={(ev) => q.surReponse(ev.target.value)} placeholder="Votre réponse…" className="min-h-[60px] resize-y" />
                {q.signature && <p className="m-0 text-xs/4 text-muted-foreground">{q.signature}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {f.lignesTests.length > 0 && <CarteTests titre={f.titreTests} lignes={f.lignesTests} />}
    </div>
  )
}

function Bascule({ ouvert, surClic, children }: { ouvert: boolean; surClic: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={surClic}
      aria-expanded={ouvert}
      className="-ml-1.5 inline-flex h-7 w-fit cursor-pointer items-center gap-1.5 rounded-full pr-2.5 pl-1.5 text-[13px]/[18px] font-semibold text-foreground outline-none hover:bg-accent focus-anneau"
    >
      <Icone nom={ouvert ? 'chevron-down' : 'chevron-right'} />
      <span>{children}</span>
    </button>
  )
}

const FONDS_EXPLICATION = { destructive: 'bg-destructive-soft text-destructive', info: 'bg-info-soft text-info', neutre: 'bg-muted text-foreground' }

function CarteRegle({ r, gherkin }: { r: VueRegle; gherkin: boolean }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="grid min-w-0 flex-1 gap-1">
            <span className="font-mono text-xs/4 font-medium text-muted-foreground">{r.id}</span>
            <h4 className="m-0 font-display text-[15px]/[22px] font-semibold text-pretty text-foreground">{r.enonce}</h4>
          </div>
          <Marque marque={r.verdict} />
        </div>

        <div className="grid gap-2.5 border-t pt-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-[13px]/[18px] font-semibold">Avis du métier</span>
            <Marque marque={r.avis} />
            {r.signature && <span className="text-xs/4 text-muted-foreground">{r.signature}</span>}
            <span className="flex-1" />
            <div role="group" aria-label="Votre avis" className="flex gap-2">
              <Button size="sm" variant={r.valideeChoisie ? 'secondary' : 'outline'} aria-pressed={r.valideeChoisie} onClick={r.choisirValidee}>
                {r.valideeChoisie && <Icone nom="check" taille={14} />}
                Validée
              </Button>
              <Button size="sm" variant={r.aRevoirChoisi ? 'secondary' : 'outline'} aria-pressed={r.aRevoirChoisi} onClick={r.choisirARevoir}>
                {r.aRevoirChoisi && <Icone nom="check" taille={14} />}
                À revoir
              </Button>
            </div>
          </div>
          {r.proposerCommentaire && (
            <div className="flex">
              <Button variant="ghost" size="sm" className="-ml-3" onClick={r.ouvrirCommentaire}>
                <Icone nom="message-circle" taille={14} />
                Ajouter un commentaire
              </Button>
            </div>
          )}
          {r.champCommentaire && <Commentaire r={r} />}
        </div>

        <div className="grid gap-3 border-t pt-3">
          <Bascule ouvert={r.exemplesOuverts} surClic={r.basculerExemples}>
            {r.nbExemples}
          </Bascule>
          {r.exemplesOuverts &&
            r.exemples.map((x, i) => (
              <div key={i} className="grid gap-2 pl-[22px]">
                <div className="flex items-center gap-3">
                  <span className="min-w-0 flex-1 text-sm font-semibold">{x.titre}</span>
                  <Marque marque={x.verdict} />
                </div>
                {gherkin ? <BlocGherkin texte={x.gherkin} /> : <p className="m-0 max-w-[76ch] text-pretty">{x.francais}</p>}
                {x.explication && (
                  <div className={cn('flex items-start gap-2 rounded-md px-3 py-2 text-[13px]/[18px]', FONDS_EXPLICATION[x.tonExplication])}>
                    <span className="inline-flex flex-none pt-0.5">
                      <Icone nom={x.iconeExplication} taille={14} />
                    </span>
                    <span className="text-foreground">{x.explication}</span>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  <span className="text-xs/4 font-medium text-muted-foreground">Prouvé par</span>
                  {x.tests.map((t) => (
                    <span key={t.id} className="inline-flex h-6 items-center gap-2 rounded-md border px-2">
                      <span className="font-mono text-xs/4">{t.id}</span>
                      <PointStatut ton={t.ton}>{t.texte}</PointStatut>
                    </span>
                  ))}
                  {!x.tests.length && <span className="text-[13px]/[18px] text-muted-foreground">aucun test</span>}
                </div>
              </div>
            ))}
        </div>

        {r.aCode && (
          <div className="grid gap-2 border-t pt-3">
            <Bascule ouvert={r.codeOuvert} surClic={r.basculerCode}>
              {r.nbCode}
            </Bascule>
            {r.codeOuvert &&
              r.code.map((c, i) => (
                <div key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pl-[22px]">
                  <Code>{c.regle}</Code>
                  <span className="min-w-0 font-mono text-[13px]/[18px] wrap-anywhere text-muted-foreground">
                    <span>{c.prefixe}</span>
                    <span className="font-semibold text-foreground">{c.nom}</span>
                  </span>
                  <span className="text-[13px]/[18px] text-muted-foreground tabular-nums">{c.lignes}</span>
                  <span className="flex-1" />
                  <Button variant="outline" size="sm" onClick={c.voir}>
                    Voir dans Repérage
                    <Icone nom="chevron-right" />
                  </Button>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Commentaire({ r }: { r: VueRegle }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={r.idCommentaire} className="text-[13px]/[18px] font-medium">
        Commentaire
      </Label>
      <Textarea
        id={r.idCommentaire}
        rows={2}
        value={r.commentaire}
        onChange={(ev) => r.surCommentaire(ev.target.value)}
        placeholder="Ce qui manque, ce qui a changé, ce qu'il faut vérifier…"
        className="min-h-[60px] resize-y"
      />
      <p className="m-0 text-xs/4 text-muted-foreground">{r.aideCommentaire}</p>
    </div>
  )
}

interface LigneTest {
  id: string
  nature: string
  libelle: string
  verdict: string
  ton: Ton
  explication: string
}

const COLONNES_TESTS: Colonne<LigneTest>[] = [
  { cle: 'id', titre: 'Test', triable: true, attenue: true, rendu: (l) => <span className="font-mono text-xs">{l.id}</span> },
  { cle: 'nature', titre: 'Nature', triable: true },
  { cle: 'libelle', titre: 'Libellé', fort: true, retour: true },
  { cle: 'verdict', titre: 'Verdict', triable: true, rendu: (l) => <PointStatut ton={l.ton}>{l.verdict}</PointStatut> },
  { cle: 'explication', titre: 'Explication', retour: true, attenue: true },
]

function CarteTests({ titre, lignes }: { titre: string; lignes: LigneTest[] }) {
  const [ouvert, setOuvert] = useState(false)
  return (
    <Card>
      <CardHeader className={cn(!ouvert && 'pb-4')}>
        <div className="grid min-w-0 flex-1 gap-0.5">
          <CardTitle>{titre}</CardTitle>
        </div>
        <button
          type="button"
          aria-expanded={ouvert}
          aria-label={ouvert ? 'Replier' : 'Déplier'}
          onClick={() => setOuvert(!ouvert)}
          className="grid size-8 cursor-pointer place-items-center rounded-full text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-anneau"
        >
          <Icone nom={ouvert ? 'chevron-up' : 'chevron-down'} />
        </button>
      </CardHeader>
      {ouvert && (
        <div className="border-t">
          <Tableau colonnes={COLONNES_TESTS} lignes={lignes} legende="Tests de la fonctionnalité" />
        </div>
      )}
    </Card>
  )
}
