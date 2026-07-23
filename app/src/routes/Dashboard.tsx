import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Inbox, TicketX, TrendingUp } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { format, isToday, subDays } from 'date-fns'
import {
  PRIORITIES,
  PRIORITY_CHART,
  PRIORITY_LABEL,
  STATUS_CHART,
  STATUS_LABEL,
  TICKET_STATUSES,
} from '@/lib/constants'
import { getSlaState } from '@/lib/sla'
import { useTickets, useEvents, getAgent } from '@/data'
import { useUiStore } from '@/lib/store'
import { PageHeader } from '@/components/empty-state'
import { cn } from '@/lib/utils'
import type { TicketStatus } from '@/lib/types'

const OPEN_STATUSES = new Set<TicketStatus>(['open', 'in_progress', 'pending'])

function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
  onClick,
}: {
  label: string
  value: number
  icon: typeof Inbox
  tone: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
    >
      <span className={cn('grid size-10 shrink-0 place-items-center rounded-md', tone)}>
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <div className="font-heading text-2xl font-semibold tabular-nums leading-none">{value}</div>
        <div className="mt-1 truncate text-sm text-muted-foreground">{label}</div>
      </div>
    </button>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="mb-4 font-heading text-sm font-semibold text-muted-foreground">{title}</h2>
      {children}
    </section>
  )
}

export default function Dashboard() {
  const tickets = useTickets()
  const events = useEvents()
  const navigate = useNavigate()
  const setStatusFilter = useUiStore((s) => s.setStatusFilter)
  const clearFilters = useUiStore((s) => s.clearFilters)

  const stats = useMemo(() => {
    let open = 0
    let atRisk = 0
    let breached = 0
    let resolvedToday = 0
    for (const t of tickets) {
      const sla = getSlaState(t)
      if (OPEN_STATUSES.has(t.status)) open += 1
      if (sla === 'at_risk') atRisk += 1
      if (sla === 'breached') breached += 1
      if (t.resolvedAt && isToday(new Date(t.resolvedAt))) resolvedToday += 1
    }
    return { open, atRisk, breached, resolvedToday }
  }, [tickets])

  const byStatus = useMemo(
    () =>
      TICKET_STATUSES.map((s) => ({
        key: s,
        name: STATUS_LABEL[s],
        value: tickets.filter((t) => t.status === s).length,
      })).filter((d) => d.value > 0),
    [tickets],
  )

  const byPriority = useMemo(
    () =>
      PRIORITIES.map((p) => ({
        key: p,
        name: PRIORITY_LABEL[p],
        value: tickets.filter((t) => t.priority === p && OPEN_STATUSES.has(t.status)).length,
      })),
    [tickets],
  )

  const slaTrend = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i))
    return days.map((day) => {
      const dayEnd = new Date(day)
      dayEnd.setHours(23, 59, 59, 999)
      const now = dayEnd.getTime()
      const active = tickets.filter((t) => new Date(t.createdAt).getTime() <= now)
      const met = active.filter((t) => {
        const s = getSlaState(t, now)
        return s === 'on_track' || s === 'met'
      }).length
      const pct = active.length ? Math.round((met / active.length) * 100) : 100
      return { day: format(day, 'EEE'), compliance: pct }
    })
  }, [tickets])

  const recent = useMemo(
    () => [...events].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8),
    [events],
  )

  function goToStatus(status: TicketStatus) {
    clearFilters()
    setStatusFilter(status)
    navigate('/tickets')
  }

  const hasTickets = tickets.length > 0

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Shift overview" description="Live health of the service desk queue right now." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Open tickets" value={stats.open} icon={Inbox} tone="bg-primary/15 text-primary" onClick={() => goToStatus('open')} />
        <KpiCard label="SLA at risk" value={stats.atRisk} icon={AlertTriangle} tone="bg-accent/15 text-accent" onClick={() => goToStatus('in_progress')} />
        <KpiCard label="SLA breached" value={stats.breached} icon={TicketX} tone="bg-destructive/15 text-destructive" onClick={() => goToStatus('open')} />
        <KpiCard label="Resolved today" value={stats.resolvedToday} icon={CheckCircle2} tone="bg-[oklch(0.70_0.15_155)]/15 text-[oklch(0.75_0.15_155)]" onClick={() => goToStatus('resolved')} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Tickets by status">
          {byStatus.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={2} stroke="none">
                  {byStatus.map((d) => (
                    <Cell key={d.key} fill={STATUS_CHART[d.key]} />
                  ))}
                </Pie>
                <ReTooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ZeroWidget label="No tickets yet" />
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {byStatus.map((d) => (
              <span key={d.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2 rounded-full" style={{ background: STATUS_CHART[d.key] }} />
                {d.name} · {d.value}
              </span>
            ))}
          </div>
        </Panel>

        <Panel title="Open queue by priority">
          <ResponsiveContainer width="100%" height={264}>
            <BarChart data={byPriority} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid horizontal={false} stroke="var(--border)" />
              <XAxis type="number" allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis type="category" dataKey="name" width={62} stroke="var(--muted-foreground)" fontSize={12} />
              <ReTooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'var(--muted)' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={22}>
                {byPriority.map((d) => (
                  <Cell key={d.key} fill={PRIORITY_CHART[d.key]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="SLA compliance · last 7 days">
          <ResponsiveContainer width="100%" height={264}>
            <LineChart data={slaTrend} margin={{ left: -16, right: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} unit="%" />
              <ReTooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Compliance']} />
              <Line type="monotone" dataKey="compliance" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--chart-1)' }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <section className="mt-4 rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 flex items-center gap-2 font-heading text-sm font-semibold text-muted-foreground">
          <TrendingUp className="size-4" /> Recent activity
        </h2>
        {hasTickets ? (
          <ul className="divide-y divide-border">
            {recent.map((e) => {
              const ticket = tickets.find((t) => t.id === e.ticketId)
              const author = getAgent(e.authorId)
              return (
                <li key={e.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                    {author?.initials ?? '—'}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium text-foreground">{ticket?.ref}</span>{' '}
                    <span className="text-muted-foreground">{e.body.toLowerCase()}</span>
                  </span>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {format(new Date(e.createdAt), 'MMM d, HH:mm')}
                  </time>
                </li>
              )
            })}
          </ul>
        ) : (
          <ZeroWidget label="No activity yet — create your first ticket." />
        )}
      </section>
    </div>
  )
}

const TOOLTIP_STYLE = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '0.5rem',
  color: 'var(--popover-foreground)',
  fontSize: '12px',
} as const

function ZeroWidget({ label }: { label: string }) {
  return (
    <div className="grid h-40 place-items-center text-sm text-muted-foreground">{label}</div>
  )
}
