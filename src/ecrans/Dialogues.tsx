import { useState } from 'react'
import { cn } from 'cn'
import { Button } from '@/composants/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/composants/ui/dialog'
import { Input } from '@/composants/ui/input'
import { Label } from '@/composants/ui/label'
import { Textarea } from '@/composants/ui/textarea'
import { Icone } from '@/composants/Icone'
import { Marque, Stat } from '@/composants/Marques'
import type { VueCoquille } from '@/vues/coquille'

const surFermeture = (fermer: () => void) => (ouvert: boolean) => {
  if (!ouvert) fermer()
}

export function DialogueImporter({ v }: { v: VueCoquille }) {
  const d = v.importer
  const [survol, setSurvol] = useState(false)
  return (
    <Dialog open={d.ouvert} onOpenChange={surFermeture(v.fermerDialogue)}>
      <DialogContent className="max-w-[640px] sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Importer un fichier</DialogTitle>
          <DialogDescription>Un fichier de données remplace les données affichées. Un fichier de saisies fusionne ses avis et ses réponses avec les vôtres.</DialogDescription>
        </DialogHeader>
        {d.avant && (
          <>
            <label
              onDragOver={(ev) => {
                ev.preventDefault()
                setSurvol(true)
              }}
              onDragLeave={() => setSurvol(false)}
              onDrop={(ev) => {
                ev.preventDefault()
                setSurvol(false)
                const f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0]
                if (f) d.lireFichier(f)
              }}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed border-input bg-background px-4 py-5 text-center text-foreground transition-colors hover:bg-accent has-[input:focus-visible]:shadow-[var(--bl-focus-ring)]',
                survol && 'bg-accent'
              )}
            >
              <span className="inline-flex pb-1 text-primary">
                <Icone nom="upload" taille={20} />
              </span>
              <span className="text-sm font-semibold">Déposez un fichier JSON ici</span>
              <span className="text-[13px]/[18px] text-muted-foreground">{d.aideDepot}</span>
              <input
                type="file"
                accept=".json,application/json"
                className="sr-only"
                onChange={(ev) => {
                  const f = ev.target.files && ev.target.files[0]
                  if (f) d.lireFichier(f)
                  ev.target.value = ''
                }}
              />
            </label>
            <div className="grid gap-1.5">
              <Label htmlFor="tp-import-json" className="text-[13px]/[18px] font-medium">
                Ou collez le JSON
              </Label>
              <Textarea
                id="tp-import-json"
                rows={8}
                spellCheck={false}
                value={d.texte}
                onChange={(ev) => d.surSaisie(ev.target.value)}
                aria-invalid={d.aErreur || undefined}
                aria-describedby={d.aErreur ? 'tp-import-note' : undefined}
                placeholder="{ &quot;versionFormat&quot;: 1, … }"
                className="h-[168px] max-h-[50vh] min-h-[168px] resize-y field-sizing-fixed px-3 py-2 font-mono text-xs/[18px] md:text-xs/[18px]"
              />
              {d.aErreur && (
                <p id="tp-import-note" role="alert" className="m-0 flex items-center gap-1 text-xs/4 text-destructive">
                  <Icone nom="circle-alert" taille={14} />
                  <span>{d.erreur}</span>
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={v.fermerDialogue}>
                Annuler
              </Button>
              <Button disabled={d.inactif} onClick={d.lancer}>
                <Icone nom="upload" />
                Importer
              </Button>
            </DialogFooter>
          </>
        )}
        {d.apres && (
          <>
            <div role="status" className="flex items-center gap-2.5 rounded-md bg-success-soft px-4 py-3 text-sm font-medium text-success">
              <Icone nom="circle-check" />
              <span className="text-foreground">{d.message}</span>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={d.recommencer}>
                Importer un autre fichier
              </Button>
              <Button onClick={v.fermerDialogue}>Fermer</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function DialogueExporter({ v }: { v: VueCoquille }) {
  const d = v.exporter
  return (
    <Dialog open={d.ouvert} onOpenChange={surFermeture(v.fermerDialogue)}>
      <DialogContent className="max-w-[640px] sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Exporter les saisies</DialogTitle>
          <DialogDescription>Les saisies ne vivent que dans ce navigateur. Copiez ce JSON ou téléchargez-le pour le transmettre à l'équipe de transposition.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <Stat valeur={d.nbAvis} libelle={d.libAvis} />
          <Stat valeur={d.nbReponses} libelle={d.libReponses} />
          <span className="flex-1" />
          <Marque marque={d.etat} />
        </div>
        {d.aOrphelines && (
          <div className="grid gap-1.5 rounded-md bg-muted px-3 py-2.5">
            <span className="text-[13px]/[18px] font-medium">{d.titreOrphelines}</span>
            {d.orphelines.map((o) => (
              <span key={o.genre + o.id} className="flex flex-wrap gap-x-2 gap-y-1 text-[13px]/[18px]">
                <span className="text-muted-foreground">{o.genre}</span>
                <span className="font-mono text-xs/[18px]">{o.id}</span>
                <span>{o.detail}</span>
              </span>
            ))}
          </div>
        )}
        <div className="grid gap-1.5">
          <Label htmlFor="tp-export-json" className="text-[13px]/[18px] font-medium">
            Fichier de saisies
          </Label>
          <Textarea id="tp-export-json" rows={10} readOnly spellCheck={false} value={d.json} className="h-[220px] max-h-[50vh] min-h-[220px] resize-y field-sizing-fixed bg-background px-3 py-2 font-mono text-xs/[18px] md:text-xs/[18px]" />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={d.telecharger}>
            <Icone nom="download" />
            Télécharger
          </Button>
          <Button onClick={d.copier}>
            <Icone nom={d.iconeCopier} />
            {d.libCopier}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function DialogueNom({ v }: { v: VueCoquille }) {
  const d = v.nom
  return (
    <Dialog open={d.ouvert} onOpenChange={surFermeture(d.fermer)}>
      <DialogContent className="max-w-[440px] sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Qui saisit ?</DialogTitle>
          <DialogDescription>{d.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor="tp-nom" className="text-[13px]/[18px] font-medium">
            Nom et prénom
          </Label>
          <Input
            id="tp-nom"
            value={d.valeur}
            onChange={(ev) => d.surSaisie(ev.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter') {
                ev.preventDefault()
                d.valider()
              }
            }}
            placeholder="DURAND Claire"
            aria-describedby="tp-nom-note"
          />
          <p id="tp-nom-note" className="m-0 text-xs/4 text-muted-foreground">
            NOM en capitales, puis prénom.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={d.fermer}>
            Annuler
          </Button>
          <Button disabled={d.inactif} onClick={d.valider}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
