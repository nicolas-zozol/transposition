import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/composants/ui/select'
import type { OptionArbre } from '@/vues/commun'

/** Le choix de l'arbre affiché, en pilule : les fonctionnalités du manuel, et sous celle affichée ses sous-fonctionnalités. */
export function SelecteurArbre({ options, valeur, surChoix }: { options: OptionArbre[]; valeur: string; surChoix: (id: string) => void }) {
  const choisie = options.find((o) => o.value === valeur)
  return (
    <Select value={valeur || undefined} onValueChange={surChoix}>
      <SelectTrigger aria-label="Arbre affiché" className="h-9 w-full min-w-0 rounded-full pr-3 pl-4 font-medium text-foreground data-[size=default]:h-9 [&>span]:truncate">
        <SelectValue placeholder="Choisir un arbre">{choisie ? choisie.label.replace(/^ +/, '') : undefined}</SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-[min(440px,var(--radix-select-content-available-height))]">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="cursor-pointer whitespace-pre">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
