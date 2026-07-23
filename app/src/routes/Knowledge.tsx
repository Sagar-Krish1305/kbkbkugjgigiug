import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, FileQuestion, Search, ThumbsUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useArticles } from '@/data'
import { PageHeader, EmptyState } from '@/components/empty-state'
import { Input } from '@/components/ui/input'
import type { Article } from '@/lib/types'

export default function Knowledge() {
  const articles = useArticles()
  const [query, setQuery] = useState('')

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = articles.filter(
      (a) => !q || a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.body.toLowerCase().includes(q),
    )
    const map = new Map<string, Article[]>()
    for (const a of filtered) {
      const list = map.get(a.category) ?? []
      list.push(a)
      map.set(a.category, list)
    }
    return [...map.entries()]
  }, [articles, query])

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader title="Knowledge base" description="Self-service guides and fixes for the most common requests." />

      <div className="relative mb-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles…" className="pl-9" aria-label="Search articles" />
      </div>

      {grouped.length === 0 ? (
        <EmptyState icon={FileQuestion} title="No articles match" description="Nothing matched your search. Try a broader term." />
      ) : (
        <div className="space-y-8">
          {grouped.map(([category, items]) => (
            <section key={category}>
              <h2 className="mb-3 font-heading text-sm font-semibold">{category}</h2>
              <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                {items.map((a) => (
                  <Link
                    key={a.id}
                    to={`/knowledge/${a.id}`}
                    className="flex flex-col gap-1 px-4 py-3.5 transition-colors hover:bg-muted/50"
                  >
                    <span className="font-medium">{a.title}</span>
                    <span className="text-sm text-muted-foreground">{a.summary}</span>
                    <span className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="size-3.5" /> {a.views.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="size-3.5" /> {a.helpful.toLocaleString()}</span>
                      <span>Updated {formatDistanceToNow(new Date(a.updatedAt), { addSuffix: true })}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
