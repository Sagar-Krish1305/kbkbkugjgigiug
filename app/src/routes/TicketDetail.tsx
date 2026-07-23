import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Ban,
  CircleDot,
  MessageSquarePlus,
  Send,
  UserCog,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  PRIORITIES,
  PRIORITY_LABEL,
  STATUS_LABEL,
  TICKET_STATUSES,
  TYPE_LABEL,
} from '@/lib/constants'
import { getAgent, getRequester, getService, useAgents, useTicket, useTicketEvents } from '@/data'
import { useDomainStore } from '@/lib/store'
import { PriorityBadge, SlaBadge, StatusBadge } from '@/components/badges'
import { PageHeader } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { EventKind, Priority, TicketStatus } from '@/lib/types'

const UNASSIGNED = 'unassigned'

const EVENT_ICON: Record<EventKind, typeof CircleDot> = {
  created: CircleDot,
  note: MessageSquarePlus,
  status: CircleDot,
  assignment: UserCog,
  priority: Ban,
}

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const ticket = useTicket(id)
  const events = useTicketEvents(id)
  const agents = useAgents()
  const addNote = useDomainStore((s) => s.addNote)
  const setStatus = useDomainStore((s) => s.setStatus)
  const setPriority = useDomainStore((s) => s.setPriority)
  const setAssignee = useDomainStore((s) => s.setAssignee)
  const [note, setNote] = useState('')

  if (!ticket) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <p className="font-heading text-lg font-semibold">Ticket not found</p>
        <p className="mt-1 text-sm text-muted-foreground">It may have been removed or the link is out of date.</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/tickets">Back to queue</Link></Button>
      </div>
    )
  }

  const requester = getRequester(ticket.requesterId)
  const service = getService(ticket.serviceId)

  function handlePostNote(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    addNote(ticket!.id, note.trim())
    setNote('')
    toast.success('Work note added')
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <button
        onClick={() => navigate('/tickets')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to queue
      </button>

      <PageHeader
        title={ticket.subject}
        description={`${ticket.ref} · ${TYPE_LABEL[ticket.type]}`}
        actions={<SlaBadge ticket={ticket} />}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-2 font-heading text-sm font-semibold text-muted-foreground">Description</h2>
            <p className="text-sm leading-relaxed text-foreground/90">
              {ticket.description || 'No description was provided.'}
            </p>
            {service && (
              <p className="mt-3 text-xs text-muted-foreground">
                Linked service: <span className="text-foreground">{service.name}</span>
              </p>
            )}
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 font-heading text-sm font-semibold text-muted-foreground">Work notes & activity</h2>
            <form onSubmit={handlePostNote} className="mb-5">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a work note visible to the desk team…"
                rows={3}
              />
              <div className="mt-2 flex justify-end">
                <Button type="submit" size="sm" disabled={!note.trim()} className="gap-1.5">
                  <Send className="size-3.5" /> Post note
                </Button>
              </div>
            </form>

            <ol className="space-y-4">
              {events.map((e) => {
                const author = getAgent(e.authorId)
                const Icon = EVENT_ICON[e.kind]
                const isNote = e.kind === 'note'
                return (
                  <li key={e.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="grid size-7 place-items-center rounded-full bg-muted text-muted-foreground">
                        <Icon className="size-3.5" aria-hidden />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pb-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium">{author?.name ?? 'System'}</span>
                        <time className="text-xs text-muted-foreground" title={format(new Date(e.createdAt), 'PPpp')}>
                          {formatDistanceToNow(new Date(e.createdAt), { addSuffix: true })}
                        </time>
                      </div>
                      <p className={isNote ? 'mt-1 rounded-md bg-muted/50 px-3 py-2 text-sm' : 'mt-0.5 text-sm text-muted-foreground'}>
                        {e.body}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
        </div>

        <aside className="space-y-4 rounded-lg border border-border bg-card p-5">
          <h2 className="font-heading text-sm font-semibold text-muted-foreground">Properties</h2>

          <Field label="Status">
            <Select value={ticket.status} onValueChange={(v) => { setStatus(ticket.id, v as TicketStatus); toast.success(`Status → ${STATUS_LABEL[v as TicketStatus]}`) }}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TICKET_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Priority">
            <Select value={ticket.priority} onValueChange={(v) => { setPriority(ticket.id, v as Priority); toast.success(`Priority → ${PRIORITY_LABEL[v as Priority]}`) }}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{PRIORITY_LABEL[p]}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Assignee">
            <Select
              value={ticket.assigneeId ?? UNASSIGNED}
              onValueChange={(v) => { setAssignee(ticket.id, v === UNASSIGNED ? null : v); toast.success('Assignee updated') }}
            >
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                {agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Separator />

          <ReadOnly label="Type" value={TYPE_LABEL[ticket.type]} />
          <ReadOnly label="Category" value={ticket.category} />
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Requester</span>
            <div className="flex items-center gap-2">
              <Avatar className="size-7"><AvatarFallback className="bg-muted text-[10px] font-semibold">{requester?.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback></Avatar>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{requester?.name}</div>
                <div className="truncate text-xs text-muted-foreground">{requester?.department}</div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <ReadOnly label="Created" value={format(new Date(ticket.createdAt), 'PPp')} />
          <ReadOnly label="Updated" value={format(new Date(ticket.updatedAt), 'PPp')} />
          <ReadOnly label="SLA due" value={format(new Date(ticket.slaDueAt), 'PPp')} />
        </aside>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}
