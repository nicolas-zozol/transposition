import { cn } from 'cn'
import { Tabs, TabsList, TabsTrigger } from '@/composants/ui/tabs'

/** Des onglets qui filtrent ou basculent : « souligne » pour les files d'une liste, avec leur compte ; « segmente »
 *  pour deux modes. */
export function Onglets<V extends string>({
  items,
  valeur,
  surChoix,
  libelle,
  forme = 'souligne',
  className,
}: {
  items: Array<{ value: V; label: string; count?: number }>
  valeur: V
  surChoix: (v: V) => void
  libelle: string
  forme?: 'souligne' | 'segmente'
  className?: string
}) {
  return (
    <Tabs value={valeur} onValueChange={(x) => surChoix(x as V)} className={cn(forme === 'segmente' && 'w-fit')}>
      <TabsList variant={forme} aria-label={libelle} className={className}>
        {items.map((it) => (
          <TabsTrigger key={it.value} value={it.value}>
            {it.label}
            {it.count != null && <span className="-ml-0.5">· {it.count}</span>}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
