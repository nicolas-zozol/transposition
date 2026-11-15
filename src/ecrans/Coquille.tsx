import { useEffect } from 'react'
import { Button } from '@/composants/ui/button'
import { Card } from '@/composants/ui/card'
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/composants/ui/sidebar'
import { Icone } from '@/composants/Icone'
import { Avatar, EtatVide } from '@/composants/Marques'
import { useMagasin } from '@/magasin/contexte'
import { vueCoquille } from '@/vues/coquille'
import { DialogueExporter, DialogueImporter, DialogueNom } from './Dialogues'
import { Carte } from './Carte'
import { Dependances } from './Dependances'
import { Regles } from './Regles'
import { Reperage } from './Reperage'

export function Coquille() {
  const m = useMagasin()
  const v = vueCoquille(m)
  const e = m.etat

  /* Le thème sombre : la classe .dark sur <html>. */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', e.theme === 'dark')
  }, [e.theme])

  /* Un champ demandé par une action (un commentaire qu'on ouvre) prend le focus au rendu suivant. */
  useEffect(() => {
    const id = m.prendreFocus()
    if (!id) return
    const t = setTimeout(() => document.getElementById(id)?.focus(), 30)
    return () => clearTimeout(t)
  })

  return (
    <SidebarProvider style={{ '--sidebar-width': '15rem', '--sidebar-width-icon': '3.5rem' } as React.CSSProperties} className="h-svh min-h-0 overflow-hidden">
      <Sidebar collapsible="icon" className="border-r-0">
        <SidebarHeader className="flex-row items-center gap-2 p-3 pb-0">
          <SidebarTrigger className="size-10 flex-none rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:shadow-[var(--bl-focus-ring-sidebar)] [&_svg]:size-5" />
          <span className="truncate font-display text-base font-semibold group-data-[collapsible=icon]:hidden">Transposition</span>
        </SidebarHeader>
        <SidebarContent className="p-3 group-data-[collapsible=icon]:px-2">
          <nav aria-label="Navigation principale">
            <SidebarMenu className="gap-0.5">
              {v.nav.map((it) => (
                <SidebarMenuItem key={it.value}>
                  <SidebarMenuButton
                    isActive={it.value === v.onglet}
                    aria-current={it.value === v.onglet ? 'page' : undefined}
                    tooltip={it.label}
                    onClick={() => v.allerOnglet(it.value)}
                    className="h-10 cursor-pointer gap-3 px-2.5 text-sidebar-foreground group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center [&>svg]:size-5"
                  >
                    <Icone nom={it.icone} taille={20} />
                    <span>{it.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </nav>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-h-0 min-w-0 bg-background">
        <header className="flex min-h-16 flex-none items-center gap-4 px-6 py-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <h1 className="m-0 font-display text-2xl/8 font-semibold tracking-[-0.01em] text-primary">{v.titre}</h1>
            {v.contexte && (
              <span className="text-[13px]/[18px] text-muted-foreground">
                {v.contexte.application} · données du <strong className="font-semibold text-foreground">{v.contexte.date}</strong>
                {v.contexte.fictif ? ' · jeu de volumes fictif' : null}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={v.ouvrirImporter}>
              <Icone nom="upload" />
              Importer
            </Button>
            <Button title={v.infoExporter} onClick={v.ouvrirExporter}>
              <Icone nom="download" />
              {v.libelleExporter}
            </Button>
            <Button variant="ghost" size="icon" aria-label={v.libelleTheme} title={v.libelleTheme} onClick={v.basculerTheme}>
              <Icone nom={v.iconeTheme} />
            </Button>
            {v.auteurConnu ? (
              <button type="button" onClick={v.ouvrirNom} aria-label={v.libelleAuteur} title={v.libelleAuteur} className="inline-flex cursor-pointer rounded-full outline-none focus-anneau">
                <Avatar nom={v.auteur} />
              </button>
            ) : (
              <Button variant="ghost" size="icon" aria-label="Indiquer votre nom" title="Indiquer votre nom" onClick={v.ouvrirNom}>
                <Icone nom="user" />
              </Button>
            )}
          </div>
        </header>

        <div data-zone="contenu" className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-6 pt-2 pb-6">
          {v.sansDonnees ? (
            <SansDonnees question={v.titre} ouvrirImporter={v.ouvrirImporter} />
          ) : (
            <>
              {v.onglet === 'reperage' && <Reperage />}
              {v.onglet === 'carte' && <Carte />}
              {v.onglet === 'regles' && <Regles />}
              {v.onglet === 'dependances' && <Dependances />}
            </>
          )}
        </div>
      </SidebarInset>

      <DialogueImporter v={v} />
      <DialogueExporter v={v} />
      <DialogueNom v={v} />
    </SidebarProvider>
  )
}

/** Sans fichier de données : un état vide sobre, sur les quatre onglets, qui invite à « Importer ». */
function SansDonnees({ ouvrirImporter }: { question: string; ouvrirImporter: () => void }) {
  return (
    <Card className="px-5">
      <EtatVide icone={<Icone nom="upload" taille={20} />} titre="Aucune donnée chargée">
        <p className="m-0 text-pretty">Cette page n'a pas trouvé de fichier de données à côté d'elle. Importez un fichier de données au format de l'application pour voir les arbres, les règles et les dépendances.</p>
        <Button onClick={ouvrirImporter}>
          <Icone nom="upload" />
          Importer
        </Button>
      </EtatVide>
    </Card>
  )
}
