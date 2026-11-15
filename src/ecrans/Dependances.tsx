import { Button } from '@/composants/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/composants/ui/card'
import { GrapheCouches } from '@/composants/GrapheCouches'
import { Icone } from '@/composants/Icone'
import { Code, EtatVide, Marque, Marques, PointStatut, Stat } from '@/composants/Marques'
import { Tableau, type Colonne } from '@/composants/Tableau'
import { useMagasin } from '@/magasin/contexte'
import { vueDependances, type LigneHors, type PanneauDependances, type VueDependances } from '@/vues/dependances'

export function Dependances() {
  const m = useMagasin()
  const v = vueDependances(m)
  return (
    <div className="flex flex-col gap-4">
      <h2 className="m-0 font-display text-lg/[26px] font-semibold text-balance text-foreground">{v.question}</h2>

      <Card>
        <CardContent className="flex flex-wrap gap-x-10 gap-y-4">
          {v.stats.map((s, i) => (
            <Stat key={i} disposition="empile" valeur={s.valeur} libelle={s.libelle} ton={s.ton} />
          ))}
        </CardContent>
      </Card>

      {v.alertes.map((a) => (
        <div key={a.id} role="status" className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-[color-mix(in_oklab,var(--warning)_30%,transparent)] bg-warning-soft px-5 py-2.5 text-warning">
          <Icone nom="triangle-alert" />
          <span className="text-foreground">
            <strong className="font-semibold">
              {a.id} {a.titre}
            </strong>{' '}
            est extraite sans ses dépendances. Il manque :
          </span>
          {a.manquantes.map((x) => (
            <Button key={x.id} variant="outline" size="sm" onClick={x.ouvrir}>
              {x.id} {x.titre}
              <Icone nom="chevron-right" />
            </Button>
          ))}
        </div>
      ))}

      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0" style={{ flex: '999 1 ' + (v.baseGraphe ? v.baseGraphe + 'px' : '100%') }}>
          <Card>
            <div className="flex min-h-[30px] flex-wrap items-center gap-x-6 gap-y-2 border-b px-5 py-3.5">
              <div className="grid min-w-0 flex-[1_1_320px] gap-0.5">
                <h3 className="m-0 font-display text-[15px]/[22px] font-semibold text-foreground">Ordre d'extraction</h3>
                {v.aGraphe && <p className="m-0 text-[13px]/[18px] text-muted-foreground">Une colonne par rang. Une flèche va d'une fonctionnalité à celle dont elle dépend, et nomme l'objet qui porte la dépendance.</p>}
              </div>
              {v.aGraphe && (
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs/4 text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <span aria-hidden="true" className="w-7 border-t-2 border-muted-foreground" />
                    Dépendance validée
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span aria-hidden="true" className="w-7 border-t-2 border-dashed border-muted-foreground" />
                    Dépendance proposée
                  </span>
                </div>
              )}
            </div>
            {v.aGraphe ? (
              <GrapheCouches />
            ) : (
              <EtatVide icone={<Icone nom="link" taille={20} />} titre={v.videTitre} className="max-w-[760px] px-5 pt-8 pb-10">
                <p className="m-0 text-pretty">{v.videTexte}</p>
                {v.videManque && <p className="m-0 font-semibold text-pretty">{v.videManque}</p>}
                {v.videAretes && <p className="m-0 text-pretty text-muted-foreground">{v.videAretes}</p>}
              </EtatVide>
            )}
          </Card>
        </div>
        {v.panneau && <Panneau p={v.panneau} />}
      </div>

      <Card>
        <CardHeader>
          <div className="grid min-w-0 flex-1 gap-0.5">
            <CardTitle>{v.titreSocle}</CardTitle>
            <CardDescription>Les utilitaires partagés, extraits une fois pour toutes les fonctionnalités, et le nombre de fonctionnalités qui atteignent chacun.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2">
          <div className="columns-[264px] gap-x-10">
            {v.socle.map((u) => (
              <div key={u.objet} title={u.titre} className="flex min-h-8 break-inside-avoid items-center gap-3">
                <span className={'min-w-0 flex-1 truncate font-mono text-[13px]/[18px] ' + (u.touche ? 'font-semibold text-primary' : 'text-foreground')}>{u.objet}</span>
                <span aria-hidden="true" className="h-1.5 w-14 flex-none overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-[inherit] bg-primary" style={{ width: u.part + '%' }} />
                </span>
                <span className="w-6 flex-none text-right text-[13px]/[18px] text-muted-foreground tabular-nums">{u.compte}</span>
                <span className="sr-only">{u.lecture}</span>
              </div>
            ))}
          </div>
          {v.socleNote && <p className="m-0 text-xs/4 text-muted-foreground">{v.socleNote}</p>}
        </CardContent>
      </Card>

      <HorsOrdre v={v} />
    </div>
  )
}

function Section({ titre, children, vide }: { titre: string; children: React.ReactNode; vide: boolean }) {
  return (
    <section className="grid min-w-0 content-start gap-0.5">
      <h4 className="m-0 mb-1 text-[13px]/[18px] font-semibold">{titre}</h4>
      {vide && <span className="text-muted-foreground">—</span>}
      {children}
    </section>
  )
}

function Lien({ id, titre, ouvrir, children }: { id: string; titre: string; ouvrir: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={ouvrir} className="-mx-2 grid w-[calc(100%+16px)] cursor-pointer gap-1 rounded-md px-2 py-1.5 text-left outline-none hover:bg-accent focus-anneau">
      <span className="flex items-baseline gap-1.5">
        <span className="flex-none font-mono text-xs/4 font-medium text-muted-foreground">{id}</span>
        <span className="text-[13px]/[18px] font-semibold">{titre}</span>
      </span>
      {children}
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

function Panneau({ p }: { p: PanneauDependances }) {
  const dependance = (x: PanneauDependances['dependDe'][number]) => (
    <Lien key={x.id + x.objet} id={x.id} titre={x.titre} ouvrir={x.ouvrir}>
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-mono text-xs/4">{x.objet}</span>
        <Marque marque={x.etat} />
        <span className="text-xs/4 text-muted-foreground">{x.confiance}</span>
      </span>
    </Lien>
  )
  return (
    <div className="min-w-[300px] flex-[1_1_320px]">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
            <div className="grid min-w-0 flex-[1_1_300px] gap-1.5">
              <span className="font-mono text-xs/4 font-medium text-muted-foreground">{p.id}</span>
              <h3 className="m-0 font-display text-[15px]/[22px] font-semibold text-balance text-foreground">{p.titre}</h3>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <Marques marques={p.badges} />
              </div>
              {p.cause && (
                <p className="m-0 pt-0.5 text-[13px]/[18px]">
                  <span className="text-muted-foreground">Cause : </span>
                  {p.cause}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={p.allerRegles}>
                Voir les règles
                <Icone nom="chevron-right" />
              </Button>
              <Button variant="outline" size="sm" onClick={p.allerReperage}>
                Voir l'arbre
                <Icone nom="chevron-right" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(236px,100%),1fr))] gap-x-6 gap-y-4 border-t pt-4">
            <Section titre={p.nbDependDe} vide={!p.dependDe.length}>
              {p.dependDe.map(dependance)}
              <Plus p={p.plusDependDe} />
            </Section>
            <Section titre={p.nbRequisePar} vide={!p.requisePar.length}>
              {p.requisePar.map(dependance)}
              <Plus p={p.plusRequisePar} />
            </Section>
            <Section titre={p.nbManquantes} vide={!p.manquantes.length}>
              {p.manquantes.map((x) => (
                <Lien key={x.id} id={x.id} titre={x.titre} ouvrir={x.ouvrir}>
                  <span className="flex">
                    <PointStatut ton={x.extraction.ton}>{x.extraction.texte}</PointStatut>
                  </span>
                </Lien>
              ))}
              <Plus p={p.plusManquantes} />
            </Section>
            <div className="grid min-w-0 content-start gap-4">
              <section className="grid min-w-0 content-start gap-1.5">
                <h4 className="m-0 text-[13px]/[18px] font-semibold">{p.nbHorsManuel}</h4>
                {!p.horsManuel.length && <span className="text-muted-foreground">—</span>}
                {p.horsManuel.map((o) => (
                  <Code key={o} className="w-fit max-w-full wrap-anywhere">
                    {o}
                  </Code>
                ))}
              </section>
              <Section titre={p.nbSous} vide={!p.sous.length}>
                {p.sous.map((x) => (
                  <Lien key={x.id} id={x.id} titre={x.titre} ouvrir={x.ouvrir}>
                    <span className="flex">
                      <PointStatut ton={x.extraction.ton}>{x.extraction.texte}</PointStatut>
                    </span>
                  </Lien>
                ))}
              </Section>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const COLONNES_HORS: Colonne<LigneHors>[] = [
  { cle: 'id', titre: 'Fonctionnalité', triable: true, largeur: 132, attenue: true, rendu: (l) => <span className="font-mono text-xs">{l.id}</span> },
  { cle: 'titre', titre: 'Titre', triable: true, fort: true, retour: true },
  { cle: 'perimetre', titre: 'Périmètre', triable: true, rendu: (l) => <PointStatut ton={l.tonPerimetre}>{l.perimetre}</PointStatut> },
  { cle: 'chemin', titre: 'Correspondance', triable: true, rendu: (l) => <PointStatut ton={l.tonChemin}>{l.chemin}</PointStatut> },
  { cle: 'cause', titre: 'Autre cause', triable: true, retour: true, rendu: (l) => l.cause || <span className="text-muted-foreground">—</span> },
]

function HorsOrdre({ v }: { v: VueDependances }) {
  const de = Math.min(v.totalHors, (v.pageHors - 1) * v.parPageHors + 1)
  const a = Math.min(v.totalHors, v.pageHors * v.parPageHors)
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="grid min-w-0 flex-1 gap-0.5">
          <CardTitle>{v.titreHors}</CardTitle>
          <CardDescription>Ces fonctionnalités ne peuvent pas être placées dans l'ordre d'extraction : leur périmètre, leur correspondance avec le manuel ou une autre cause l'empêche.</CardDescription>
        </div>
      </CardHeader>
      <Tableau
        colonnes={COLONNES_HORS}
        lignes={v.lignesHors}
        legende="Fonctionnalités hors de l'ordre"
        vide="Toutes les fonctionnalités sont dans l'ordre d'extraction."
        tri={v.triHors}
        surTri={v.surTriHors}
        surLigne={(l) => v.choisirHors(l.id)}
      />
      {v.pagesHors > 1 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t px-5 py-2.5 text-[13px]/[18px] text-muted-foreground">
          <span>
            {de}-{a} sur {v.totalHors}
          </span>
          <span className="flex-1" />
          <span>
            Page {v.pageHors} sur {v.pagesHors}
          </span>
          <span className="inline-flex gap-1">
            <Button variant="secondary" size="icon-sm" aria-label="Première page" disabled={v.pageHors <= 1} onClick={() => v.surPageHors(1)}>
              <Icone nom="chevrons-left" taille={14} />
            </Button>
            <Button variant="secondary" size="icon-sm" aria-label="Page précédente" disabled={v.pageHors <= 1} onClick={() => v.surPageHors(v.pageHors - 1)}>
              <Icone nom="chevron-left" taille={14} />
            </Button>
            <Button variant="secondary" size="icon-sm" aria-label="Page suivante" disabled={v.pageHors >= v.pagesHors} onClick={() => v.surPageHors(v.pageHors + 1)}>
              <Icone nom="chevron-right" taille={14} />
            </Button>
            <Button variant="secondary" size="icon-sm" aria-label="Dernière page" disabled={v.pageHors >= v.pagesHors} onClick={() => v.surPageHors(v.pagesHors)}>
              <Icone nom="chevrons-right" taille={14} />
            </Button>
          </span>
        </div>
      )}
    </Card>
  )
}
