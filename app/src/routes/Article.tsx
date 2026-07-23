import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Eye, ThumbsUp } from 'lucide-react'
import { format } from 'date-fns'
import { useArticle } from '@/data'
import { useDomainStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function Article() {
  const { id } = useParams()
  const article = useArticle(id)
  const voteHelpful = useDomainStore((s) => s.voteHelpful)
  const registerView = useDomainStore((s) => s.registerView)
  const [voted, setVoted] = useState(false)

  // Count a view once when the article opens (external effect — allowed).
  useEffect(() => {
    if (id) registerView(id)
  }, [id, registerView])

  if (!article) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <p className="font-heading text-lg font-semibold">Article not found</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/knowledge">Back to knowledge base</Link></Button>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-[720px]">
      <Link to="/knowledge" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" /> Knowledge base
      </Link>

      <span className="text-xs font-medium text-primary">{article.category}</span>
      <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight text-balance">{article.title}</h1>
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span>Updated {format(new Date(article.updatedAt), 'PP')}</span>
        <span className="flex items-center gap-1"><Eye className="size-3.5" /> {article.views.toLocaleString()} views</span>
        <span className="flex items-center gap-1"><ThumbsUp className="size-3.5" /> {article.helpful.toLocaleString()}</span>
      </div>

      <Separator className="my-6" />

      <div className="space-y-4 text-[15px] leading-7 text-foreground/90">
        {article.body.split('\n\n').map((para, i) => (
          <p key={i} className="text-pretty">{para}</p>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-border bg-card p-5 text-center">
        {voted ? (
          <p className="text-sm text-muted-foreground">Thanks for your feedback — glad it helped.</p>
        ) : (
          <>
            <p className="text-sm font-medium">Was this article helpful?</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3 gap-1.5"
              onClick={() => { voteHelpful(article.id); setVoted(true) }}
            >
              <ThumbsUp className="size-4" /> Yes, it helped
            </Button>
          </>
        )}
      </div>
    </article>
  )
}
