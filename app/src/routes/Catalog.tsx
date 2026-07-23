import { useMemo, useState } from 'react'
import { Clock, PackageSearch, Search } from 'lucide-react'
import { useServices } from '@/data'
import { useUiStore } from '@/lib/store'
import { PageHeader, EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Service } from '@/lib/types'

function fulfillmentLabel(hours: number): string {
  if (hours < 24) return `~${hours}h`
  return `~${Math.round(hours / 24)}d`
}

export default function Catalog() {
  const services = useServices()
  const openCreate = useUiStore((s) => s.openCreate)
  const [query, setQuery] = useState('')

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = services.filter(
      (s) => !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
    )
    const map = new Map<string, Service[]>()
    for (const s of filtered) {
      const list = map.get(s.category) ?? []
      list.push(s)
      map.set(s.category, list)
    }
    return [...map.entries()]
  }, [services, query])

  function requestService(s: Service) {
    openCreate({
      type: 'request',
      category: s.category,
      subject: s.name,
      description: `Service request from the catalog: ${s.name}.\n\n${s.description}`,
    })
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Service catalog" description="Request common IT services — each opens a tracked request ticket." />

      <div className="relative mb-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search services…" className="pl-9" aria-label="Search services" />
      </div>

      {grouped.length === 0 ? (
        <EmptyState icon={PackageSearch} title="No services found" description="No catalog services match your search. Try a different term." />
      ) : (
        <div className="space-y-8">
          {grouped.map(([category, items]) => (
            <section key={category}>
              <h2 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold">
                {category}
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">{items.length}</span>
              </h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4">
                {items.map((s) => (
                  <article
                    key={s.id}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                  >
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-heading text-base font-semibold leading-snug text-foreground">{s.name}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3.5" /> {fulfillmentLabel(s.fulfillmentHours)}
                      </span>
                      <Button size="sm" variant="secondary" onClick={() => requestService(s)}>Request</Button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
