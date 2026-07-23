import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpDown, FilterX, Inbox, SearchX } from 'lucide-react'
import {
  PRIORITIES,
  PRIORITY_LABEL,
  STATUS_LABEL,
  TICKET_STATUSES,
  TYPE_LABEL,
} from '@/lib/constants'
import { getSlaState } from '@/lib/sla'
import { getAgent, getRequester, useAgents, useTickets } from '@/data'
import { useUiStore } from '@/lib/store'
import { PageHeader, EmptyState } from '@/components/empty-state'
import { PriorityBadge, SlaBadge, StatusBadge, TypeBadge } from '@/components/badges'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { Ticket } from '@/lib/types'

const SLA_RANK: Record<string, number> = { breached: 0, at_risk: 1, on_track: 2, met: 3 }

type SortKey = 'sla' | 'priority' | 'updated'
const PRIORITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 } as const

export default function Tickets() {
  const tickets = useTickets()
  const agents = useAgents()
  const navigate = useNavigate()
  const [sortKey, setSortKey] = useState<SortKey>('sla')

  const search = useUiStore((s) => s.search)
  const statusFilter = useUiStore((s) => s.statusFilter)
  const priorityFilter = useUiStore((s) => s.priorityFilter)
  const typeFilter = useUiStore((s) => s.typeFilter)
  const assigneeFilter = useUiStore((s) => s.assigneeFilter)
  const setStatusFilter = useUiStore((s) => s.setStatusFilter)
  const setPriorityFilter = useUiStore((s) => s.setPriorityFilter)
  const setTypeFilter = useUiStore((s) => s.setTypeFilter)
  const setAssigneeFilter = useUiStore((s) => s.setAssigneeFilter)
  const clearFilters = useUiStore((s) => s.clearFilters)

  const hasFilters =
    Boolean(search) ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    typeFilter !== 'all' ||
    assigneeFilter !== 'all'

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = tickets.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (assigneeFilter !== 'all') {
        if (assigneeFilter === 'unassigned' ? t.assigneeId !== null : t.assigneeId !== assigneeFilter) return false
      }
      if (q) {
        const requester = getRequester(t.requesterId)?.name.toLowerCase() ?? ''
        const hit = t.ref.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || requester.includes(q)
        if (!hit) return false
      }
      return true
    })
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      if (sortKey === 'priority') return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
      if (sortKey === 'updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      const ra = SLA_RANK[getSlaState(a)]
      const rb = SLA_RANK[getSlaState(b)]
      if (ra !== rb) return ra - rb
      return new Date(a.slaDueAt).getTime() - new Date(b.slaDueAt).getTime()
    })
    return sorted
  }, [tickets, search, statusFilter, priorityFilter, typeFilter, assigneeFilter, sortKey])

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Ticket queue"
        description="Every incident and service request, sorted by SLA urgency."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as never)}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {TICKET_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as never)}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{PRIORITY_LABEL[p]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as never)}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="incident">{TYPE_LABEL.incident}</SelectItem>
            <SelectItem value="request">{TYPE_LABEL.request}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Assignee" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All assignees</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-[150px]">
            <ArrowUpDown className="size-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sla">SLA urgency</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="updated">Recently updated</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {rows.length} {rows.length === 1 ? 'ticket' : 'tickets'}
          </span>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
              <FilterX className="size-4" /> Clear
            </Button>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={SearchX}
            title="No tickets match"
            description="No tickets match the current filters or search. Try widening your criteria."
            action={<Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>}
          />
        ) : (
          <EmptyState icon={Inbox} title="Your queue is clear" description="There are no tickets yet. Create one to get started." />
        )
      ) : (
        <TicketCardGrid rows={rows} onOpen={(id) => navigate(`/tickets/${id}`)} />
      )}
    </div>
  )
}

function TicketCardGrid({ rows, onOpen }: { rows: Ticket[]; onOpen: (id: string) => void }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
      {rows.map((t) => (
        <TicketCard key={t.id} ticket={t} onOpen={onOpen} />
      ))}
    </div>
  )
}

function TicketCard({ ticket, onOpen }: { ticket: Ticket; onOpen: (id: string) => void }) {
  const assignee = getAgent(ticket.assigneeId)
  const requester = getRequester(ticket.requesterId)
  return (
    <button
      type="button"
      onClick={() => onOpen(ticket.id)}
      className={cn(
        'group flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-left',
        'transition-colors hover:border-ring/40 hover:bg-accent/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-medium text-muted-foreground">{ticket.ref}</span>
        <SlaBadge ticket={ticket} />
      </div>

      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
        {ticket.subject}
      </h3>

      <div className="flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={ticket.priority} />
        <StatusBadge status={ticket.status} />
        <TypeBadge type={ticket.type} />
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="truncate text-xs text-muted-foreground">{requester?.name}</span>
        {assignee ? (
          <span className="flex items-center gap-1.5">
            <Avatar className="size-6">
              <AvatarFallback className="bg-muted text-[10px] font-semibold">{assignee.initials}</AvatarFallback>
            </Avatar>
            <span className="truncate text-xs font-medium text-foreground">{assignee.name}</span>
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Unassigned</span>
        )}
      </div>
    </button>
  )
}
