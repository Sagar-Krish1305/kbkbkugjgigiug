import { cn } from '@/lib/utils'
import {
  PRIORITY_LABEL,
  PRIORITY_STYLE,
  SLA_LABEL,
  SLA_STYLE,
  STATUS_LABEL,
  STATUS_STYLE,
  TYPE_LABEL,
} from '@/lib/constants'
import { formatSlaCountdown, getSlaState } from '@/lib/sla'
import type { Priority, Ticket, TicketStatus, TicketType } from '@/lib/types'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const PILL = 'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap'

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <span className={cn(PILL, STATUS_STYLE[status])}>{STATUS_LABEL[status]}</span>
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={cn(PILL, PRIORITY_STYLE[priority])}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {PRIORITY_LABEL[priority]}
    </span>
  )
}

export function TypeBadge({ type }: { type: TicketType }) {
  return <span className="text-xs font-medium text-muted-foreground">{TYPE_LABEL[type]}</span>
}

export function SlaBadge({ ticket }: { ticket: Ticket }) {
  const state = getSlaState(ticket)
  const countdown = formatSlaCountdown(ticket)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn(PILL, SLA_STYLE[state])}>{countdown}</span>
      </TooltipTrigger>
      <TooltipContent>
        SLA {SLA_LABEL[state]} · due {new Date(ticket.slaDueAt).toLocaleString()}
      </TooltipContent>
    </Tooltip>
  )
}
